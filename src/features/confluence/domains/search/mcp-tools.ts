/**
 * Search Domain MCP Tool Configurations
 *
 * Defines MCP tool configurations for search operations using domain schemas
 */

import { SearchContentRequestSchema } from "./models/search-schemas.model";

/**
 * Search MCP tool configurations
 */
export const searchMCPTools = {
  search: {
    name: "confluence_search",
    description:
      "Search for pages and content using CQL (Confluence Query Language)",
    inputSchema: SearchContentRequestSchema,
  },
} as const;

/**
 * Search tool names
 */
export const SEARCH_TOOL_NAMES = {
  SEARCH: "confluence_search",
} as const;
