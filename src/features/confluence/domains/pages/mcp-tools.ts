/**
 * Pages Domain MCP Tool Configurations
 *
 * Defines MCP tool configurations for page operations using domain schemas
 */

import {
  CreatePageRequestSchema,
  GetChildPagesRequestSchema,
  GetPageRequestSchema,
  GetPagesBySpaceRequestSchema,
  UpdatePageRequestSchema,
} from "./models/page-schemas.model";

/**
 * Pages MCP tool configurations
 */
export const pagesMCPTools = {
  getPage: {
    name: "confluence_get_page",
    description: "Get detailed information about a specific page",
    inputSchema: GetPageRequestSchema,
  },
  createPage: {
    name: "confluence_create_page",
    description: "Create a new page in Confluence",
    inputSchema: CreatePageRequestSchema,
  },
  updatePage: {
    name: "confluence_update_page",
    description: "Update an existing page in Confluence",
    inputSchema: UpdatePageRequestSchema,
  },
  getPagesBySpace: {
    name: "confluence_get_pages_by_space",
    description: "List pages in a specific space",
    inputSchema: GetPagesBySpaceRequestSchema,
  },
  getChildPages: {
    name: "confluence_get_child_pages",
    description: "Get child pages of a parent page",
    inputSchema: GetChildPagesRequestSchema,
  },
} as const;

/**
 * Pages tool names
 */
export const PAGES_TOOL_NAMES = {
  GET_PAGE: "confluence_get_page",
  CREATE_PAGE: "confluence_create_page",
  UPDATE_PAGE: "confluence_update_page",
  GET_PAGES_BY_SPACE: "confluence_get_pages_by_space",
  GET_CHILD_PAGES: "confluence_get_child_pages",
} as const;
