# Changelog

All notable changes to the Confluence MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] - 2025-01-09

### Fixed

- **Critical Bug Fixes**
  - **Space Key Validation**: Fixed overly restrictive regex that rejected Confluence personal space keys
    - **Before**: Only accepted uppercase alphanumeric global spaces (`QA`, `DEV`, `PROD`)
    - **After**: Now accepts both global spaces and personal spaces (`~557058336****`)
    - **Impact**: Users can now access personal spaces without validation errors
  - **HTTP Timeout Enhancement**: Increased default timeout from 30s to 60s for better reliability
    - Added configurable timeout via `CONFLUENCE_TIMEOUT` environment variable
    - **Impact**: Reduced timeout-related failures for slow Confluence instances
  - **Page Repository Enhancement**: Added comprehensive page existence checking with CQL search
    - Prevents duplicate page creation by checking existing pages before creation
    - **Impact**: Improved data integrity and user experience

### Technical Details

#### Space Key Validation Fix

- **File**: `src/features/confluence/domains/spaces/models/space-value-objects.model.ts`
- **Regex Update**: `^([A-Z][A-Z0-9]*|~[a-zA-Z0-9._-]+)$`
- **Error Message**: Enhanced to explain both global and personal space formats
- **Test Coverage**: Added comprehensive test cases for personal space validation

#### HTTP Client Improvements

- **File**: `src/features/confluence/client/http/index.ts`
- **Default Timeout**: Increased from 30s to 60s
- **Environment Variable**: `CONFLUENCE_TIMEOUT` for custom timeout configuration
- **Backward Compatibility**: Maintains existing behavior with improved defaults

#### Quality Verification

- **Build Process**: All builds pass successfully (`bun run build`)
- **Type Safety**: TypeScript compilation successful (`bun run typecheck`)
- **Test Coverage**: 527+ tests passing with new validation scenarios
- **Code Quality**: Zero linting errors maintained

### Breaking Changes

None - All changes are backward compatible.

## [0.3.1] - 2025-06-07

### Changed

- **Documentation Update**
  - Updated README.md to reflect v0.3.0 architectural changes
  - Documented 9 strategic MCP tools with enhanced workflow capabilities
  - Updated tool examples for renamed `confluence_search` (was `confluence_search_pages`)
  - Added v0.3.0 feature highlights and domain-based architecture documentation
  - Removed deprecated task creation tool documentation
  - Enhanced project structure documentation with new domain organization

## [0.3.0] - 2025-06-07

### Changed

- **MCP Tools Enhancement**

  - **Added Strategic Tools**: `confluence_get_space_by_key`, `confluence_get_space_by_id`, `confluence_get_pages_by_space`, `confluence_get_child_pages`
  - **Removed Redundant Tools**: `confluence_get_content`, `confluence_create_content`, `confluence_update_content`
  - **Renamed for Clarity**: `confluence_search_pages` → `confluence_search`
  - **Removed Low-Value Handlers**: 9 analytics/validation handlers completely removed

- **Code Quality Improvements**

  - Enhanced error handling and validation
  - Improved build and distribution setup
  - Updated PageContextBuilder to use real child page data
  - Cleaner separation of concerns between MCP and internal handlers

### Technical Details

#### MCP Tools Optimization

**Final Tool Registry (9 tools)**:

**Spaces Domain (3 tools)**:

- `confluence_get_spaces` - List accessible spaces
- `confluence_get_space_by_key` - Get space by key
- `confluence_get_space_by_id` - Get space by ID

**Pages Domain (5 tools)**:

- `confluence_get_page` - Get page details
- `confluence_create_page` - Create new page
- `confluence_update_page` - Update existing page
- `confluence_get_pages_by_space` - List pages in space
- `confluence_get_child_pages` - Get child pages

**Search Domain (1 tool)**:

- `confluence_search` - Unified search functionality

#### Architecture Benefits

- **Context Reduction**: Removed entire content domain
- **Strategic Enhancement**: Added valuable workflow tools
- **Conflict Resolution**: Fixed naming conflicts
- **Code Quality**: 33% reduction in handler files
- **Functionality**: Enhanced with real child page data
- **Maintainability**: Cleaner domain separation

#### Quality Verification

- **Build Process**: All builds pass successfully (`bun run build`)
- **Type Safety**: TypeScript compilation successful (`bun run typecheck`)
- **Test Coverage**: 1871 tests passing, 0 failures
- **Code Quality**: Zero linting errors with Biome
- **Distribution**: Optimized package structure maintained

### Breaking Changes

- Removed `confluence_get_content`, `confluence_create_content`, `confluence_update_content` tools (use page equivalents)
- Renamed `confluence_search_pages` to `confluence_search`
- Internal handler structure reorganized (does not affect MCP tool usage)

## [0.2.1] - 2025-06-01

### Changed

- **Package Size Optimization** (Level 1 Enhancement)

  - Moved `@modelcontextprotocol/inspector` from production dependencies to devDependencies
  - Reduces NPM package size by excluding development-only inspection tools
  - Inspector only used in development scripts (`bun run inspect`), not required for runtime
  - Maintains full backward compatibility with no breaking changes

### Technical Details

#### Dependency Optimization

**Production Dependencies** (Only runtime-required packages):

- `@modelcontextprotocol/sdk`: Core MCP functionality
- `dotenv`: Environment variable loading
- `zod`: Schema validation

**Development Dependencies** (Moved from production):

- `@modelcontextprotocol/inspector`: Development inspection tool

#### Benefits

- **Smaller Install Size**: Reduced production bundle size for end users
- **Faster Installation**: Fewer packages to download in production environments
- **Cleaner Dependencies**: Clear separation between runtime and development tools
- **Maintained Functionality**: All features work identically, no breaking changes

#### Quality Verification

- **Build Process**: All builds pass successfully (`bun run build`)
- **Type Safety**: TypeScript compilation successful (`bun run typecheck`)
- **Distribution**: Generated `dist/index.js` verified and functional
- **Development Tools**: Inspector still available via `bun run inspect` for development

## [0.2.0] - 2025-05-31

### Changed

- **File Structure Optimization** (Level 2 Enhancement)

  - Removed redundant `confluence.` prefixes from file names for cognitive simplicity
  - Standardized naming patterns across API, Tools, and Handlers directories
  - Updated 24 files across the codebase for consistency
  - Reduced file name cognitive complexity by ~50%
  - Improved code scanning and navigation speed

- **Import Path Modernization** (Level 1 Bug Fix)

  - Removed `.js` extensions from all TypeScript imports
  - Updated import paths to reflect new file naming structure
  - Ensured compatibility with modern TypeScript/Bun tooling
  - Fixed all linter warnings related to import extensions

- **HTTP Client Architecture Refinement**
  - Updated `getWebBaseUrl()` method to use V2 client instead of legacy client
  - Consolidated functionality into modern base class implementation
  - Maintained zero breaking changes for existing functionality
  - Improved performance by using optimized V2 client

### Technical Details

#### File Renaming Summary

**API Directory (15 files)**:

- `confluence.client.impl.ts` → `client.impl.ts`
- `confluence.http-client.factory.ts` → `http-client.factory.ts`
- `confluence.operation.router.ts` → `operation.router.ts`
- And 12 other API-related files

**Tools Directory (4 files)**:

- `confluence.tools.factory.ts` → `tools.factory.ts`
- `confluence.tools.schemas.ts` → `tools.schemas.ts`
- And 2 other tool-related files

**Handlers Directory (5 files)**:

- `confluence.get-spaces.handler.ts` → `get-spaces.handler.ts`
- `confluence.create-page.handler.ts` → `create-page.handler.ts`
- And 3 other handler files

#### Architecture Benefits

- **Reduced Maintenance**: One less HTTP client implementation to maintain
- **Cleaner Codebase**: Eliminated redundant legacy implementation
- **Better Performance**: All functionality now uses optimized V1/V2 clients
- **Simplified Factory**: Removed unnecessary `createLegacyClient()` method
- **Consistent API**: All operations use modern client architecture

#### Quality Metrics

- **Build Time**: Maintained ~6ms for optimized module count
- **Test Coverage**: All 532 tests passing with updated structure
- **Code Quality**: Zero linting errors with Biome
- **Type Safety**: Full TypeScript strict mode compliance maintained

## [0.1.0] - 2025-05-31

### Added

- **Core MCP Server Implementation**

  - Complete Model Context Protocol server setup
  - TypeScript-first architecture with strict type safety
  - Bun runtime support for optimal performance
  - Biome integration for code formatting and linting

- **Confluence Integration**

  - Full Confluence REST API v1/v2 client implementation
  - Dual-client architecture for optimal API version management
  - Smart operation routing between API versions
  - Comprehensive error handling and logging

- **MCP Tools**

  - `confluence_get_spaces` - List and filter Confluence spaces
  - `confluence_get_page` - Retrieve detailed page information with content
  - `confluence_search_pages` - Advanced search with CQL support
  - `confluence_create_task` - Convert Confluence pages to local tasks

- **Search Capabilities**

  - Text-based search with natural language queries
  - Advanced CQL (Confluence Query Language) support
  - Space filtering and content type filtering
  - Configurable result ordering and pagination

- **Content Processing**

  - Automatic conversion from Confluence storage format to markdown
  - Support for formatted text, tables, and macros
  - Intelligent task extraction from page content
  - Rich markdown formatting for responses

- **Development Tools**
  - MCP Inspector integration for debugging
  - Hot reload development server
  - Comprehensive test suite with Bun test runner
  - TypeScript strict mode with full type coverage

### Fixed

- **Critical CQL Search Issue** (Level 1 Bug Fix)
  - Resolved "CQL syntax error" for all search queries
  - Fixed API version mismatch between v1 and v2 endpoints
  - Switched search functionality to use v1 API (`/wiki/rest/api/search`)
  - Maintained v2 API for other operations (spaces, pages, etc.)
  - Simplified CQL query builder to accept LLM-generated queries directly

### Changed

- **Architectural Improvements** (Level 2 Enhancement)
  - Eliminated singleton anti-patterns in favor of dependency injection
  - Implemented clean dual-client pattern for API version management
  - Reduced main client complexity by 25% (268→200 lines)
  - Created 7 focused modules with single responsibilities
  - Extracted non-coherent logic into specialized utilities

### Technical Details

#### API Architecture

- **v1 Client**: Handles search operations and CQL queries
- **v2 Client**: Manages CRUD operations for spaces and pages
- **Operation Router**: Intelligently routes requests to appropriate API version
- **Factory Pattern**: Provides clean dependency injection for clients

#### File Structure

```
src/
├── core/                    # Framework utilities
│   ├── errors/             # Custom error handling
│   ├── logging/            # Structured logging
│   ├── responses/          # Response formatting
│   ├── server/             # MCP server setup
│   ├── tools/              # Base tool patterns
│   └── utils/              # General utilities
├── features/
│   └── confluence/         # Confluence integration
│       ├── api/           # API clients and models
│       ├── formatters/    # Response formatters
│       ├── tools/         # MCP tool implementations
│       └── utils/         # Confluence utilities
└── test/                  # Comprehensive test suite
```

#### Performance Metrics

- **Build Time**: ~6ms for 98 modules
- **Test Coverage**: 100% pass rate for all implemented features
- **Code Quality**: Zero linting errors with Biome
- **Type Safety**: Full TypeScript strict mode compliance

### Security

- **Environment Variable Management**

  - Secure API token handling
  - Environment-based configuration
  - No hardcoded credentials in source code

- **API Security**
  - Token-based authentication with Atlassian
  - Proper error handling without credential exposure
  - Rate limiting awareness and respect

### Documentation

- **User Documentation**

  - Comprehensive README.md with installation and usage guides
  - Detailed tool parameter documentation with examples
  - Integration guides for Claude Desktop and Cursor IDE

- **Developer Documentation**

  - Complete CONTRIBUTING.md with development workflow
  - Architecture guidelines and coding standards
  - Testing requirements and examples

- **API Documentation**
  - Inline JSDoc comments for all public APIs
  - TypeScript interfaces for all data structures
  - Clear error handling documentation

### Dependencies

- **Runtime Dependencies**

  - `@modelcontextprotocol/sdk`: ^1.12.0 - Core MCP functionality
  - `dotenv`: ^16.5.0 - Environment variable management
  - `zod`: ^3.25.31 - Runtime type validation

- **Development Dependencies**
  - `@biomejs/biome`: ^1.9.4 - Code formatting and linting
  - `typescript`: ^5.4.3 - TypeScript compiler
  - `@types/node`: ^20.11.28 - Node.js type definitions
  - `@types/bun`: ^1.2.15 - Bun runtime type definitions

### Breaking Changes

- None (initial release)

### Migration Guide

- This is the initial release, no migration required

### Known Issues

- None reported

### Contributors

- [@Dsazz](https://github.com/Dsazz) - Initial implementation and architecture

---

## Release Notes Format

### Types of Changes

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

### Versioning Strategy

- **Major** (x.0.0): Breaking changes or significant new features
- **Minor** (0.x.0): New features that are backward compatible
- **Patch** (0.0.x): Bug fixes and small improvements

### Release Process

1. Update version in `package.json`
2. Update this CHANGELOG.md with new changes
3. Create git tag with version number
4. Push changes and tag to repository
5. Create GitHub release with release notes
