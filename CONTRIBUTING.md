# Contributing to Confluence MCP Server

Thank you for your interest in contributing to the Confluence MCP Server! We welcome contributions from the community and are excited to work with you.

## 🚀 Quick Start for Contributors

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **Bun**: Version 1.0.0 or higher (preferred package manager)
- **Git**: For version control
- **Confluence Access**: For testing (optional but recommended)

### Development Setup

1. **Fork and Clone**

   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/mcp-confluence.git
   cd mcp-confluence
   ```

2. **Install Dependencies**

   ```bash
   # Install all dependencies
   bun install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env with your Confluence credentials (optional for development)
   # CONFLUENCE_HOST_URL=https://your-domain.atlassian.net
   # CONFLUENCE_USER_EMAIL=your-email@example.com
   # CONFLUENCE_API_TOKEN=your-api-token
   ```

4. **Verify Setup**

   ```bash
   # Run type checking
   bun typecheck

   # Run linting
   bun check

   # Run tests
   bun test

   # Start development server
   bun dev
   ```

## 📋 Development Workflow

### Branch Strategy

We use a **feature branch workflow**:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/description`: New features
- `fix/description`: Bug fixes
- `docs/description`: Documentation updates

### Creating a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create and switch to a new feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to your fork
git push origin feature/your-feature-name
```

## 📝 Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Good commit messages
git commit -m "feat(api): add confluence page search functionality"
git commit -m "fix(client): handle API rate limiting properly"
git commit -m "docs: update installation instructions"
git commit -m "test(handlers): add unit tests for search handler"

# Bad commit messages
git commit -m "fix stuff"
git commit -m "update code"
git commit -m "changes"
```

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/features/confluence/api/confluence.client.test.ts

# Run tests with coverage
bun test --coverage
```

### Writing Tests

We use **Bun's built-in test runner** with the following patterns:

#### Unit Tests

```typescript
// src/features/confluence/utils/cql-query-builder.test.ts
import { describe, it, expect } from "bun:test";
import { CqlQueryBuilder } from "./cql-query-builder";

describe("CqlQueryBuilder", () => {
  it("should build basic text query", () => {
    const query = CqlQueryBuilder.buildTextQuery("test");
    expect(query).toBe('text~"test"');
  });

  it("should handle space filtering", () => {
    const query = CqlQueryBuilder.buildQuery({
      text: "test",
      spaceKey: "DEV",
    });
    expect(query).toBe('text~"test" AND space.key="DEV"');
  });
});
```

#### Integration Tests

```typescript
// src/features/confluence/api/confluence.client.integration.test.ts
import { describe, it, expect, beforeAll } from "bun:test";
import { ConfluenceClient } from "./confluence.client.impl";

describe("ConfluenceClient Integration", () => {
  let client: ConfluenceClient;

  beforeAll(() => {
    client = new ConfluenceClient({
      hostUrl: process.env.CONFLUENCE_HOST_URL!,
      userEmail: process.env.CONFLUENCE_USER_EMAIL!,
      apiToken: process.env.CONFLUENCE_API_TOKEN!,
    });
  });

  it("should fetch spaces successfully", async () => {
    const spaces = await client.getSpaces();
    expect(spaces).toBeDefined();
    expect(Array.isArray(spaces.results)).toBe(true);
  });
});
```

### Test Requirements

- **Unit tests**: Required for all utility functions and business logic
- **Integration tests**: Required for API clients and external integrations
- **Handler tests**: Required for all MCP tool handlers
- **Coverage**: Aim for 80%+ code coverage on new code

## 🎨 Code Style Guidelines

### TypeScript Standards

We follow strict TypeScript practices:

```typescript
// ✅ Good: Explicit types and proper error handling
interface ConfluencePageRequest {
  pageId: string;
  includeContent?: boolean;
  expand?: string[];
}

export async function getPage(
  request: ConfluencePageRequest
): Promise<ConfluencePage> {
  try {
    const response = await apiClient.get(`/pages/${request.pageId}`);
    return response.data;
  } catch (error) {
    throw new ConfluenceApiError(
      `Failed to fetch page ${request.pageId}`,
      error
    );
  }
}

// ❌ Bad: Implicit any and poor error handling
export async function getPage(pageId) {
  const response = await apiClient.get(`/pages/${pageId}`);
  return response.data;
}
```

### File Naming Conventions

- **Components**: `confluence-search-pages.handler.ts`
- **Types**: `confluence.types.ts`
- **Tests**: `confluence.client.test.ts`
- **Utilities**: `cql-query-builder.util.ts`
- **Errors**: `confluence.error.ts`

### Code Formatting

We use **Biome** for consistent formatting:

```bash
# Format all files
bun format

# Check formatting and linting
bun check

# Fix auto-fixable issues
bun check --apply
```

## 🏗️ Architecture Guidelines

### Project Structure

Follow the established architecture:

```
src/
├── core/                    # Framework utilities
│   ├── errors/             # Error handling
│   ├── logging/            # Logging utilities
│   ├── responses/          # Response utilities
│   ├── server/             # MCP server setup
│   ├── tools/              # Base tool patterns
│   └── utils/              # General utilities
├── features/
│   └── confluence/         # Confluence-specific implementation
│       ├── api/           # API client & models
│       ├── formatters/    # Response formatters
│       ├── tools/         # MCP tools
│       │   ├── handlers/  # Tool handlers
│       │   └── utils/     # Tool utilities
│       └── utils/         # Confluence utilities
└── test/                  # Test utilities and fixtures
```

### Adding New Features

1. **Create feature branch**: `feature/your-feature-name`
2. **Add types**: Define TypeScript interfaces in `*.types.ts`
3. **Implement logic**: Add core functionality
4. **Add tests**: Unit and integration tests
5. **Update documentation**: README.md and inline docs
6. **Submit PR**: Follow the PR template

### MCP Tool Development

When adding new MCP tools:

```typescript
// src/features/confluence/tools/handlers/confluence-new-tool.handler.ts
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfluenceToolHandler } from "../confluence-tool.handler";

export class ConfluenceNewToolHandler extends ConfluenceToolHandler {
  getToolDefinition(): Tool {
    return {
      name: "confluence_new_tool",
      description: "Description of what this tool does",
      inputSchema: {
        type: "object",
        properties: {
          // Define parameters
        },
        required: ["requiredParam"],
      },
    };
  }

  async execute(args: any): Promise<any> {
    // Implement tool logic
    // Use this.confluenceClient for API calls
    // Use this.logger for logging
    // Return formatted response
  }
}
```

## 🔍 Code Review Process

### Before Submitting a PR

- [ ] All tests pass (`bun test`)
- [ ] Code is properly formatted (`bun check`)
- [ ] TypeScript compiles without errors (`bun typecheck`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format

### PR Requirements

1. **Clear Description**: Explain what the PR does and why
2. **Linked Issues**: Reference related issues with `Fixes #123`
3. **Screenshots**: For UI changes (if applicable)
4. **Breaking Changes**: Clearly document any breaking changes
5. **Testing**: Describe how the changes were tested

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass
```

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues**: Check if the bug is already reported
2. **Reproduce the issue**: Ensure it's reproducible
3. **Gather information**: Collect relevant details

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**

1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**

- OS: [e.g., macOS 14.0]
- Node.js: [e.g., 18.17.0]
- Bun: [e.g., 1.0.0]
- Project version: [e.g., 0.1.0]

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Before Requesting

1. **Check existing requests**: Look for similar feature requests
2. **Consider scope**: Ensure it fits the project's goals
3. **Think about implementation**: Consider how it might work

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other approaches you've considered

**Additional Context**
Any other relevant information
```

## 📚 Documentation

### Documentation Standards

- **Clear and concise**: Write for developers of all skill levels
- **Code examples**: Include practical examples
- **Up-to-date**: Keep documentation current with code changes
- **Consistent formatting**: Follow established patterns

### Types of Documentation

1. **API Documentation**: JSDoc comments for all public APIs
2. **User Documentation**: README.md and usage guides
3. **Developer Documentation**: Architecture and contribution guides
4. **Inline Comments**: For complex logic and business rules

## 🏆 Recognition

We appreciate all contributions! Contributors will be:

- **Listed in CONTRIBUTORS.md**: All contributors are recognized
- **Mentioned in release notes**: Significant contributions are highlighted
- **Invited to discussions**: Active contributors can join planning discussions

## 📞 Getting Help

### Community Support

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bug reports and feature requests
- **Code Review**: For feedback on your contributions

### Maintainer Contact

For urgent issues or questions about contributing:

- **GitHub**: [@Dsazz](https://github.com/Dsazz)
- **Email**: dev.stanislav.stepanenko@gmail.com

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Thank you for contributing to Confluence MCP Server! 🙏</sub>
</div>
