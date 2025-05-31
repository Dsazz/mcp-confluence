<div align="center">

# 🌐 Confluence MCP Server

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![Confluence](https://img.shields.io/badge/Confluence-172B4D?style=for-the-badge&logo=Confluence&logoColor=white)](https://www.atlassian.com/software/confluence)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Model_Context_Protocol-blue?style=for-the-badge)](https://modelcontextprotocol.io)

<p align="center">
  <b>A powerful Model Context Protocol (MCP) server that brings Atlassian Confluence integration directly to any editor or application that supports MCP</b>
</p>

</div>

---

## ✨ Features

- 📚 **Access Confluence Directly From Cursor**

  - Browse your Confluence spaces without leaving your IDE
  - Get detailed page information with formatted content
  - Convert Confluence pages into actionable local tasks

- 🔍 **Powerful Search Capabilities**

  - Search pages using text queries or advanced CQL (Confluence Query Language)
  - Support for space filtering, content type filtering, and result ordering
  - Rich markdown formatting with page previews and direct links

- 📝 **Smart Content Processing**
  - Automatic conversion of Confluence's storage format to readable markdown
  - Support for formatted text, tables, macros, and attachments
  - Intelligent task extraction from page content

## 🚀 Quick Start

### Installation

The easiest way to use this MCP server is to install it directly via npm/bunx. No local setup required!

#### For Claude Desktop

Add this configuration to your Claude Desktop MCP settings:

```json
{
  "mcpServers": {
    "Confluence Tools": {
      "command": "bunx",
      "args": ["-y", "@dsazz/mcp-confluence@latest"],
      "env": {
        "CONFLUENCE_HOST_URL": "https://your-domain.atlassian.net",
        "CONFLUENCE_USER_EMAIL": "your-email@example.com",
        "CONFLUENCE_API_TOKEN": "your-confluence-api-token"
      }
    }
  }
}
```

#### For Cursor IDE

Add this configuration to your Cursor IDE MCP settings:

```json
{
  "mcpServers": {
    "Confluence Tools": {
      "command": "bunx",
      "args": ["-y", "@dsazz/mcp-confluence@latest"],
      "env": {
        "CONFLUENCE_HOST_URL": "https://your-domain.atlassian.net",
        "CONFLUENCE_USER_EMAIL": "your-email@example.com",
        "CONFLUENCE_API_TOKEN": "your-confluence-api-token"
      }
    }
  }
}
```

#### For Any MCP Client

Use this configuration pattern for any MCP-compatible client:

```json
{
  "mcpServers": {
    "Confluence Tools": {
      "command": "bunx",
      "args": ["-y", "@dsazz/mcp-confluence@latest"],
      "env": {
        "CONFLUENCE_HOST_URL": "https://your-domain.atlassian.net",
        "CONFLUENCE_USER_EMAIL": "your-email@example.com",
        "CONFLUENCE_API_TOKEN": "your-confluence-api-token"
      }
    }
  }
}
```

> **🔑 Getting Your Confluence API Token**
>
> 1. Go to [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
> 2. Click "Create API token"
> 3. Give it a name (e.g., "MCP Confluence")
> 4. Copy the token and use it in your configuration
> 5. **Important**: Use the token exactly as provided (no quotes needed in the env section)

### Alternative: Using npx instead of bunx

If you prefer npx over bunx, you can also use:

```json
{
  "mcpServers": {
    "Confluence Tools": {
      "command": "npx",
      "args": ["-y", "@dsazz/mcp-confluence@latest"],
      "env": {
        "CONFLUENCE_HOST_URL": "https://your-domain.atlassian.net",
        "CONFLUENCE_USER_EMAIL": "your-email@example.com",
        "CONFLUENCE_API_TOKEN": "your-confluence-api-token"
      }
    }
  }
}
```

### Testing Your Setup

After adding the configuration:

1. Restart your MCP client (Claude Desktop, Cursor, etc.)
2. Try this command to test the connection:
   ```
   Show me my Confluence spaces.
   ```

That's it! You're ready to use Confluence directly from your MCP client.

---

## 🛠️ Development Setup

<details>
<summary>Click here if you want to develop or customize this MCP server</summary>

### Development Installation

For development or customization:

```bash
# Clone the repository
git clone https://github.com/Dsazz/mcp-confluence.git
cd mcp-confluence

# Install dependencies
bun install

# Build the project
bun run build

# Set up environment variables
cp .env.example .env
# Edit .env with your Confluence credentials
```

### Configuration

Create a `.env` file with the following variables:

```ini
CONFLUENCE_HOST_URL=https://your-domain.atlassian.net
CONFLUENCE_USER_EMAIL=your-email@example.com
CONFLUENCE_API_TOKEN=your-confluence-api-token
NODE_ENV=development
```

### Development Tools

#### Code Quality Tools

The project uses [Biome](https://biomejs.dev/) for code formatting and linting, replacing the previous ESLint setup. Biome provides:

- Fast, unified formatting and linting
- TypeScript-first tooling
- Zero configuration needed
- Consistent code style enforcement

To format and lint your code:

```bash
# Format code
bun format

# Check code for issues
bun check

# Type check
bun typecheck
```

#### MCP Inspector

The MCP Inspector is a powerful tool for testing and debugging your MCP server.

```bash
# Run the inspector (no separate build step needed)
bun run inspect
```

The inspector automatically:

- Loads environment variables from `.env`
- Cleans up occupied ports (5175, 3002)
- Builds the project when needed
- Starts the MCP server with your configuration
- Launches the inspector UI

Visit the inspector at http://localhost:5175?proxyPort=3002

The inspector UI allows you to:

- View all available MCP capabilities
- Execute tools and examine responses
- Analyze the JSON communication
- Test with different parameters

For more details, see the [MCP Inspector GitHub repository](https://github.com/modelcontextprotocol/inspector).

</details>

## 🧰 Available Tools

### Confluence Tools

| Tool                      | Description                                                 | Parameters                         | Returns                           |
| ------------------------- | ----------------------------------------------------------- | ---------------------------------- | --------------------------------- |
| `confluence_get_spaces`   | List accessible Confluence spaces with optional filtering   | See space parameters below         | Markdown-formatted list of spaces |
| `confluence_get_page`     | Get detailed information about a specific page with content | `pageId`, optional content flags   | Markdown-formatted page details   |
| `confluence_search_pages` | Search pages using text queries or CQL                      | See search parameters below        | Markdown-formatted search results |
| `confluence_create_task`  | Create a local task from Confluence page content            | `pageId`, optional task properties | Markdown-formatted task           |

#### Space Parameters

The `confluence_get_spaces` tool supports these parameters:

**Basic Options**:

- `type`: String (`"global"` or `"personal"`, optional) - Filter by space type
- `limit`: Number (1-100, default: 25) - Maximum number of spaces to return
- `start`: Number (default: 0) - Pagination offset for large result sets

**Examples**:

```
# Basic usage - get all accessible spaces
confluence_get_spaces

# Get only global spaces
confluence_get_spaces type:"global" limit:10

# Pagination example
confluence_get_spaces start:25 limit:25
```

#### Page Parameters

The `confluence_get_page` tool supports these parameters:

**Required**:

- `pageId`: String - The ID of the page to retrieve

**Content Options**:

- `includeContent`: Boolean (default: true) - Include full page content
- `includeComments`: Boolean (default: false) - Include comment count
- `expand`: String (optional) - Additional fields to expand (comma-separated)

**Examples**:

```
# Basic usage with content
confluence_get_page 12345

# Get page without content
confluence_get_page 12345 includeContent:false

# Get page with comments and extra data
confluence_get_page 12345 includeComments:true expand:"version,space"
```

#### Search Parameters

The `confluence_search_pages` tool supports both simple and advanced search:

**Basic Search**:

- `query`: String - Text search query (searches titles and content)
- `spaceKey`: String (optional) - Limit search to specific space
- `type`: String (`"page"` or `"blogpost"`, optional) - Content type filter

**Advanced Search (CQL)**:

- `query`: String - Full CQL query for advanced searches
- Examples: `text~"specific phrase"`, `type=page AND space.key="DEV"`

**Result Options**:

- `limit`: Number (1-100, default: 25) - Maximum number of results
- `start`: Number (default: 0) - Pagination offset
- `orderBy`: String (`"relevance"`, `"created"`, `"modified"`, `"title"`) - Sort order

**Examples**:

```
# Simple text search
confluence_search_pages query:"project documentation"

# Search in specific space
confluence_search_pages query:"API guide" spaceKey:"DEV"

# Advanced CQL search
confluence_search_pages query:'text~"user guide" AND type=page'

# Search with custom ordering
confluence_search_pages query:"meeting notes" orderBy:"modified" limit:10
```

#### Task Creation Parameters

The `confluence_create_task` tool supports these parameters:

**Required**:

- `pageId`: String - The ID of the page to create a task from

**Customization Options**:

- `taskName`: String (optional) - Custom task name (auto-generated from page title if not provided)
- `description`: String (optional) - Custom task description (auto-generated from page content if not provided)
- `priority`: String (`"low"`, `"medium"`, `"high"`, default: `"medium"`) - Task priority level
- `dueDate`: String (optional) - Due date in ISO format (YYYY-MM-DD)
- `tags`: Array of strings (optional) - Custom tags (auto-generated from page labels if not provided)

**Examples**:

```
# Basic task creation
confluence_create_task 12345

# Custom task with priority
confluence_create_task 12345 taskName:"Review API documentation" priority:"high"

# Task with due date and tags
confluence_create_task 12345 dueDate:"2024-12-31" tags:["documentation", "review"]
```

## 📁 Project Structure

```
 src/
  ├── core/          # Core functionality and configurations
  │   ├── errors/         # Error handling utilities
  │   ├── logging/        # Logging infrastructure
  │   ├── responses/      # Response formatting
  │   ├── server/         # MCP server setup
  │   ├── tools/          # Base tool patterns
  │   └── utils/          # General utilities
  ├── features/      # Feature implementations
  │   └── confluence/     # Confluence integration
  │       ├── api/         # Confluence API client
  │       │   ├── client.impl.ts           # Main client orchestrator
  │       │   ├── http-client.factory.ts   # Client factory (V1 + V2)
  │       │   ├── http-client-v1.impl.ts   # V1 API client (search)
  │       │   ├── http-client-v2.impl.ts   # V2 API client (CRUD)
  │       │   ├── operation.router.ts      # Smart operation routing
  │       │   └── ...                      # Models, types, utilities
  │       ├── formatters/  # Response formatters
  │       ├── tools/       # MCP tool implementations
  │       │   ├── handlers/   # Tool handlers
  │       │   │   ├── get-spaces.handler.ts
  │       │   │   ├── get-page.handler.ts
  │       │   │   ├── search-pages.handler.ts
  │       │   │   ├── create-page.handler.ts
  │       │   │   └── update-page.handler.ts
  │       │   ├── tools.factory.ts     # Tool factory
  │       │   └── tools.schemas.ts     # Tool schemas
  │       └── formatters/  # Response formatters
  └── test/          # Test suite
      ├── integration/     # Integration tests
      ├── unit/           # Unit tests
      └── utils/          # Test utilities
```

### Architecture Overview

The Confluence MCP Server uses a **dual-client architecture** for optimal API version management:

- **V1 Client** (`http-client-v1.impl.ts`): Handles search operations and CQL queries
- **V2 Client** (`http-client-v2.impl.ts`): Manages CRUD operations for spaces and pages
- **Operation Router** (`operation.router.ts`): Intelligently routes requests to the appropriate API version
- **Factory Pattern** (`http-client.factory.ts`): Provides clean dependency injection for clients

This architecture ensures:

- **Optimal Performance**: Each operation uses the most suitable API version
- **Future Compatibility**: Easy to add new API versions or deprecate old ones
- **Clean Separation**: Clear boundaries between different API capabilities
- **Type Safety**: Full TypeScript support across all client implementations

### NPM Scripts

| Command         | Description                                        |
| --------------- | -------------------------------------------------- |
| `bun dev`       | Run the server in development mode with hot reload |
| `bun build`     | Build the project for production                   |
| `bun start`     | Start the production server                        |
| `bun format`    | Format code using Biome                            |
| `bun lint`      | Lint code using Biome                              |
| `bun check`     | Run Biome checks on code                           |
| `bun typecheck` | Run TypeScript type checking                       |
| `bun test`      | Run tests                                          |
| `bun inspect`   | Start the MCP Inspector for debugging              |

## 🔧 Troubleshooting

### NPM Installation Issues

#### Package Not Found

If you get a "package not found" error:

```bash
# Make sure you're using the correct scoped package name
bunx @dsazz/mcp-confluence@latest

# Or try with explicit npm registry
npm install -g @dsazz/mcp-confluence --registry https://registry.npmjs.org
```

#### Environment Variables Not Found

If the server fails to start with environment variable errors:

1. **For bunx usage**: Create a `.env` file in your working directory:

   ```bash
   # Create .env file in your current directory
   echo "CONFLUENCE_HOST_URL=https://your-domain.atlassian.net" > .env
   echo "CONFLUENCE_USER_EMAIL=your-email@example.com" >> .env
   echo "CONFLUENCE_API_TOKEN=your-api-token" >> .env
   ```

2. **For MCP configuration**: Set environment variables in your MCP config:
   ```json
   {
     "mcpServers": {
       "Confluence Tools": {
         "command": "bunx",
         "args": ["-y", "@dsazz/mcp-confluence@latest"],
         "env": {
           "CONFLUENCE_HOST_URL": "https://your-domain.atlassian.net",
           "CONFLUENCE_USER_EMAIL": "your-email@example.com",
           "CONFLUENCE_API_TOKEN": "your-api-token"
         }
       }
     }
   }
   ```

### API Connection Issues

#### Invalid Credentials

- Verify your Confluence API token is correct
- Ensure your email matches your Atlassian account
- Check that your Confluence URL is correct (include https://)

#### Network/Firewall Issues

- Ensure your network allows connections to your Confluence instance
- Check if your organization requires VPN access
- Verify firewall settings allow outbound HTTPS connections

### Development Issues

#### Build Failures

```bash
# Clear dependencies and reinstall
rm -rf node_modules bun.lockb
bun install

# Clean build
rm -rf dist
bun run build
```

#### TypeScript Errors

```bash
# Run type checking
bun run typecheck

# Check for linting issues
bun run check
```

## 📝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development workflow
- Branching strategy
- Commit message format
- Pull request process
- Code style guidelines

## 📘 Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io/specification/)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [Confluence REST API](https://developer.atlassian.com/cloud/confluence/rest/v2/)

## 📄 License

[MIT](LICENSE) © Stanislav Stepanenko

---

<div align="center">
  <sub>Built with ❤️ for a better developer experience</sub>
</div>
