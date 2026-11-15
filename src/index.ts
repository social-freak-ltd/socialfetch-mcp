#!/usr/bin/env node
/**
 * Social Fetch MCP over stdio.
 *
 * Runs locally and speaks MCP on stdin/stdout. Every tool, resource and prompt comes from
 * the hosted Social Fetch MCP server, which this process calls with your
 * SOCIALFETCH_API_KEY as `x-api-key`. Tool lists and schemas therefore always match the
 * hosted server and the REST API, and credits are charged to the key's workspace.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	type CallToolResult,
	GetPromptRequestSchema,
	ListPromptsRequestSchema,
	ListResourcesRequestSchema,
	ListResourceTemplatesRequestSchema,
	ListToolsRequestSchema,
	ReadResourceRequestSchema,
	type ServerCapabilities,
} from "@modelcontextprotocol/sdk/types.js";

const VERSION = "1.0.1";
const DEFAULT_MCP_URL = "https://api.socialfetch.dev/mcp";
const KEY_HELP =
	"Set SOCIALFETCH_API_KEY to a Social Fetch API key (sfk_…). Create one at https://app.socialfetch.dev in API Keys.";

const apiKey = process.env.SOCIALFETCH_API_KEY?.trim() ?? "";
// Optional override for testing against a local or staging API.
const mcpUrl = new URL(process.env.SOCIALFETCH_MCP_URL?.trim() || DEFAULT_MCP_URL);

/** stdout carries the protocol, so every diagnostic goes to stderr. */
function log(message: string): void {
	process.stderr.write(`[socialfetch-mcp] ${message}\n`);
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

let upstream: Client | undefined;
let connecting: Promise<Client> | undefined;

/** Connects to the hosted server once; a failed attempt is retried on the next request. */
function getUpstream(): Promise<Client> {
	if (upstream) return Promise.resolve(upstream);
	if (!apiKey) return Promise.reject(new Error(`SOCIALFETCH_API_KEY is not set. ${KEY_HELP}`));
	connecting ??= (async () => {
		const client = new Client({ name: "socialfetch-mcp-stdio", version: VERSION });
		const transport = new StreamableHTTPClientTransport(mcpUrl, {
			requestInit: {
				headers: {
					"x-api-key": apiKey,
					"user-agent": `socialfetch-mcp-stdio/${VERSION}`,
				},
			},
		});
		try {
			await client.connect(transport);
		} catch (error) {
			await client.close().catch(() => {});
			throw new Error(`Could not connect to ${mcpUrl.href}: ${errorMessage(error)}`);
		}
		client.onclose = () => {
			upstream = undefined;
		};
		upstream = client;
		return client;
	})().finally(() => {
		connecting = undefined;
	});
	return connecting;
}

function toolError(text: string): CallToolResult {
	return { isError: true, content: [{ type: "text", text }] };
}

async function main(): Promise<void> {
	// Connect before answering `initialize` so the hosted server's instructions and
	// capabilities reach the client. Without a key or network, start anyway and explain
	// the problem on each request.
	let first: Client | undefined;
	try {
		first = await getUpstream();
	} catch (error) {
		log(errorMessage(error));
	}

	const upstreamCaps = first?.getServerCapabilities() ?? {};
	const capabilities: ServerCapabilities = { tools: {} };
	if (upstreamCaps.resources) capabilities.resources = {};
	if (upstreamCaps.prompts) capabilities.prompts = {};

	const server = new Server(
		{ name: "socialfetch", title: "Social Fetch", version: VERSION },
		{ capabilities, instructions: first?.getInstructions() },
	);

	server.setRequestHandler(ListToolsRequestSchema, async (request) => {
		const client = await getUpstream();
		return client.listTools(request.params);
	});

	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		let client: Client;
		try {
			client = await getUpstream();
		} catch (error) {
			return toolError(errorMessage(error));
		}
		try {
			// Pass the hosted result through untouched: it is the same { data, meta } envelope
			// as REST, and tool errors already arrive as isError results.
			return (await client.callTool(request.params)) as CallToolResult;
		} catch (error) {
			return toolError(`Social Fetch request failed: ${errorMessage(error)}`);
		}
	});

	if (capabilities.resources) {
		server.setRequestHandler(ListResourcesRequestSchema, async (request) =>
			(await getUpstream()).listResources(request.params),
		);
		server.setRequestHandler(ListResourceTemplatesRequestSchema, async (request) =>
			(await getUpstream()).listResourceTemplates(request.params),
		);
		server.setRequestHandler(ReadResourceRequestSchema, async (request) =>
			(await getUpstream()).readResource(request.params),
		);
	}

	if (capabilities.prompts) {
		server.setRequestHandler(ListPromptsRequestSchema, async (request) =>
			(await getUpstream()).listPrompts(request.params),
		);
		server.setRequestHandler(GetPromptRequestSchema, async (request) =>
			(await getUpstream()).getPrompt(request.params),
		);
	}

	const shutdown = async () => {
		await server.close().catch(() => {});
		await upstream?.close().catch(() => {});
		process.exit(0);
	};
	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
	process.stdin.on("close", shutdown);

	await server.connect(new StdioServerTransport());
	log(`ready (upstream ${mcpUrl.href}${first ? "" : ", not connected yet"})`);
}

main().catch((error) => {
	log(`fatal: ${errorMessage(error)}`);
	process.exit(1);
});
