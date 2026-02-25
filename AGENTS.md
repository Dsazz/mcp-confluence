# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a **Confluence MCP Server** (`@dsazz/mcp-confluence`) — a TypeScript stdio-based MCP server that provides 9 tools for interacting with Atlassian Confluence Cloud. It uses **Bun** as its runtime and package manager.

### Key commands

All standard dev commands are in `package.json` scripts. Quick reference:

| Task | Command |
|---|---|
| Install deps | `bun install` |
| Lint | `bun run lint` |
| Format | `bun format` |
| Check (lint+format) | `bun run check` |
| Type check | `bun run typecheck` |
| Test | `bun test` |
| Build | `bun run build` |
| Dev (watch mode) | `bun dev` |
| MCP Inspector UI | `bun run inspect` |

### Testing without Confluence credentials

- **Unit tests** (1866+) run without any credentials and cover all business logic.
- **Integration tests** (6 in `src/test/integration/`) require `CONFLUENCE_HOST_URL`, `CONFLUENCE_USER_EMAIL`, and `CONFLUENCE_API_TOKEN` env vars. They will fail with `ConfigurationError` if these are not set — this is expected.
- To run only unit tests, exclude the integration directory: `bun test --grep "^(?!.*Integration)"` or run specific test files.

### Running the MCP server locally

The server uses stdio transport (not HTTP). To test it manually:

```bash
CONFLUENCE_HOST_URL="https://test.atlassian.net" \
CONFLUENCE_USER_EMAIL="test@example.com" \
CONFLUENCE_API_TOKEN="test-token" \
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | bun run src/index.ts
```

The server will respond with a JSON-RPC response on stdout; logs go to stderr.

### Non-obvious notes

- Bun must be installed separately (`curl -fsSL https://bun.sh/install | bash`). It is not a Node.js dependency.
- The `.env` file is loaded by `dotenv` at bootstrap. Copy `.env.example` to `.env` for local dev. Dummy values are fine for running unit tests and verifying server startup.
- The lockfile is `bun.lock` (not `bun.lockb`). Always use `bun install` (never npm/yarn/pnpm).
- `bun run inspect` launches the MCP Inspector on ports 5175 and 3002. It requires a prior `bun run build` (the inspect script runs the built `dist/index.js`).
- The project uses **Biome** (not ESLint/Prettier) for linting and formatting.
- The Confluence API may return 403 from cloud VMs due to IP-based access restrictions on the Confluence instance. This does not affect unit tests or server startup — only live API calls. The MCP server will still start, register tools, and return properly formatted error responses.
