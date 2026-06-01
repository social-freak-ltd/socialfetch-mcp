<p align="center">
  <img src="https://api.socialfetch.dev/mcp/icon.svg" alt="Social Fetch MCP" width="96" height="96" />
</p>

<h1 align="center">Social Fetch MCP</h1>

<p align="center">
  Let your coding agent fetch real social media and web data while it builds.
</p>

<p align="center">
  <a href="https://www.socialfetch.dev/docs/integrations/mcp">Documentation</a>
  |
  <a href="https://www.socialfetch.dev/docs/api">API reference</a>
  |
  <a href="https://www.socialfetch.dev/docs/credits">Credits &amp; billing</a>
</p>

<p align="center">
  <strong>Server URL:</strong> <code>https://api.socialfetch.dev/mcp</code>
</p>

## What Is This?

Social Fetch MCP connects Cursor, VS Code, Claude, Windsurf, and other MCP clients to the Social Fetch API. Once installed, your agent can look up creators, fetch posts, search platforms, read web pages, check your balance, and read the Social Fetch docs from inside your editor.

Use it when you want your agent to answer questions like:

- "Find this TikTok creator and add their latest videos to my app."
- "Pull the transcript for this YouTube video and summarize the sponsorships."
- "Fetch this Instagram post, inspect the response shape, and wire it into my backend."
- "Read the Social Fetch docs and choose the right endpoint for Reddit search."

The MCP server itself is hosted by Social Fetch:

```text
https://api.socialfetch.dev/mcp
```

There is no local server to clone, build, or run from this repository. Clients connect to the hosted Streamable HTTP endpoint and authenticate with OAuth in the browser.

## Why Use It?

Agents are better when they can work with the same API your app uses. This gives them a direct, authenticated route to Social Fetch instead of making you bounce between docs, dashboards, scripts, and pasted JSON.

- **Less setup:** call Social Fetch tools directly from your agent.
- **Better answers:** the agent can search and read the live docs before choosing an endpoint.
- **Real data in the loop:** test with TikTok, Instagram, YouTube, X/Twitter, Reddit, Spotify, web, and more from inside your editor.
- **No API keys in editor config:** sign in once with OAuth.
- **Same API everywhere:** MCP tools map to the public REST API, SDK, and docs.

## What You Can Fetch

Social Fetch MCP exposes endpoint tools for:

- TikTok, Instagram, YouTube, X/Twitter, Telegram, Facebook, Threads, LinkedIn, Reddit, and Spotify data.
- Profiles, posts, videos, comments, transcripts, search results, and platform-specific metadata.
- Web markdown generation and AI-assisted web page questions.
- Account identity and credit balance.
- Social Fetch docs through `docs_search` and `docs_read`.

Endpoint tools are metered like the REST API. Docs tools, `auth_whoami`, and `billing_balance_get` do not consume lookup credits.

## Requirements

- A [Social Fetch](https://www.socialfetch.dev) account.
- Credits for metered API routes.
- An MCP client with remote Streamable HTTP support and OAuth, such as Cursor, VS Code, Claude Code, Claude Desktop, or MCP Inspector.

## One-Click Install

- <a href="cursor://anysphere.cursor-deeplink/mcp/install?name=socialfetch&amp;config=eyJ1cmwiOiJodHRwczovL2FwaS5zb2NpYWxmZXRjaC5kZXYvbWNwIn0%3D"><img src="https://www.socialfetch.dev/integrations/mcp/cursor.svg" width="20" height="20" alt="" valign="middle" /> Install in Cursor</a>
- <a href="vscode:mcp/install?%7B%22name%22%3A%22socialfetch%22%2C%22url%22%3A%22https%3A%2F%2Fapi.socialfetch.dev%2Fmcp%22%2C%22type%22%3A%22http%22%7D"><img src="https://www.socialfetch.dev/integrations/mcp/vscode.svg" width="20" height="20" alt="" valign="middle" /> Install in VS Code</a>
- <a href="cursor://anysphere.cursor-deeplink/mcp/install?name=socialfetch&amp;config=eyJ1cmwiOiJodHRwczovL2FwaS5zb2NpYWxmZXRjaC5kZXYvbWNwIn0%3D" title="Windsurf uses the same MCP install flow as Cursor"><img src="https://www.socialfetch.dev/integrations/mcp/windsurf.svg" width="20" height="20" alt="" valign="middle" /> Install in Windsurf</a>
- [Open the hosted install page](https://www.socialfetch.dev/docs/integrations/mcp)

Complete the **OAuth** browser flow after installing. If a one-click link does nothing - your editor is not installed, blocks custom URL schemes, or has no handler - use the manual setup below.

## Manual Setup

### Cursor

Add this to `~/.cursor/mcp.json` or a project `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "socialfetch": {
      "url": "https://api.socialfetch.dev/mcp"
    }
  }
}
```

Restart Cursor, open MCP settings, and complete the OAuth browser flow when prompted.

### VS Code

Add this to `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "socialfetch": {
        "url": "https://api.socialfetch.dev/mcp"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add --transport http socialfetch https://api.socialfetch.dev/mcp
```

Then run `/mcp` and authenticate Social Fetch to finish the OAuth flow.

### Claude Desktop

Add a custom remote MCP connector with this URL:

```text
https://api.socialfetch.dev/mcp
```

Authorize Social Fetch when Claude prompts you.

### stdio-only Clients

If your client only supports stdio MCP servers, bridge to the hosted server with `mcp-remote`:

```bash
npx mcp-remote https://api.socialfetch.dev/mcp
```

Point your client at the stdio process that command starts.

## Authentication

Social Fetch MCP uses OAuth 2.1. Your MCP client handles the flow:

1. The client opens Social Fetch sign-in in your browser.
2. You sign in or create an account and approve access.
3. The client receives an access token and sends it with each MCP request.

Do not paste a Social Fetch API key into MCP config. Credits are charged to the signed-in account, just like REST API requests.

## Tools

`tools/list` exposes endpoint tools plus docs tools.

Endpoint tool names match API operation IDs with dots replaced by underscores:

| Tool name | API operation |
| --- | --- |
| `tiktok_profile_get` | `tiktok.profile.get` |
| `instagram_post_get` | `instagram.post.get` |
| `web_markdown_generate` | `web.markdown.generate` |
| `auth_whoami` | `auth.whoami` |
| `billing_balance_get` | `billing.balance.get` |

Each endpoint tool's arguments mirror the matching API route parameters. See the [API reference](https://www.socialfetch.dev/docs/api) for the full endpoint catalog, argument schemas, response shapes, and pricing.

Two docs tools are also available:

| Tool name | Purpose |
| --- | --- |
| `docs_search` | Search Social Fetch docs across API, SDK, auth, errors, credits, and integrations. |
| `docs_read` | Read a full docs page as markdown by pathname, such as `/docs/sdk`. |

Recommended agent prompt:

> Use the Social Fetch MCP docs to add TikTok profile lookup to this app with the TypeScript SDK.

## Example: TikTok Profile

In Cursor, MCP Inspector, or another MCP client, call `tiktok_profile_get` with:

```json
{ "handle": "nike" }
```

The result contains the same `data` and `meta` envelope returned by the REST API. Check `meta.creditsCharged` and `meta.requestId` after metered calls.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `401` on every call | Reconnect the server and complete OAuth again. Your token may be missing or expired. |
| OAuth redirect loop | Finish signing in at Social Fetch, then approve access to return to your client. |
| `402` responses | Your account is out of credits for the metered route. Top up in [Credits & billing](https://www.socialfetch.dev/docs/credits). |
| No tools listed | Reconnect the server. If it persists, restart your MCP client. |
| Client only supports stdio | Use `npx mcp-remote https://api.socialfetch.dev/mcp`. |

## Repository Contents

- `server.json` - MCP Registry metadata for the hosted remote server.
- `examples/` - Copy-paste MCP client configuration snippets.
- `assets/socialfetch-mark.svg` - Local copy of the Social Fetch mark (also served at `https://api.socialfetch.dev/mcp/icon.svg`).

The implementation lives in Social Fetch's private API service, not in this public listing repository.

## Related

- [Social Fetch MCP docs](https://www.socialfetch.dev/docs/integrations/mcp)
- [Social Fetch API reference](https://www.socialfetch.dev/docs/api)
- [TypeScript SDK](https://github.com/social-freak-ltd/socialfetch-sdk)
- [n8n community node](https://github.com/social-freak-ltd/n8n-nodes-socialfetch)

## License

MIT (c) Social Freak Ltd
