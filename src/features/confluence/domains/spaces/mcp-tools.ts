/**
 * Spaces Domain MCP Tool Configurations
 *
 * Defines MCP tool configurations for space operations using domain schemas
 */

import {
  GetSpaceByIdRequestSchema,
  GetSpaceByKeyRequestSchema,
  GetSpacesRequestSchema,
} from "./models/space-schemas.model";

/**
 * Spaces MCP tool configurations
 */
export const spacesMCPTools = {
  getSpaces: {
    name: "confluence_get_spaces",
    description: "List accessible Confluence spaces",
    inputSchema: GetSpacesRequestSchema,
  },
  getSpaceByKey: {
    name: "confluence_get_space_by_key",
    description: "Get specific space by key",
    inputSchema: GetSpaceByKeyRequestSchema,
  },
  getSpaceById: {
    name: "confluence_get_space_by_id",
    description: "Get specific space by ID",
    inputSchema: GetSpaceByIdRequestSchema,
  },
} as const;

/**
 * Spaces tool names
 */
export const SPACES_TOOL_NAMES = {
  GET_SPACES: "confluence_get_spaces",
  GET_SPACE_BY_KEY: "confluence_get_space_by_key",
  GET_SPACE_BY_ID: "confluence_get_space_by_id",
} as const;
