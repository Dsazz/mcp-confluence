/**
 * Confluence Tool Parameter Schemas
 *
 * Zod schemas for validating Confluence tool parameters
 */

import { z } from "zod";

/**
 * Schema for page ID parameter
 */
export const pageIdSchema = z.string().describe("The ID of the page");

/**
 * Schema for space key parameter
 */
export const spaceKeySchema = z.string().describe("The key of the space");

/**
 * Schema for get spaces parameters
 */
export const getSpacesSchema = z.object({
  type: z
    .enum(["global", "personal"])
    .optional()
    .describe("Filter by space type"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("Maximum number of spaces to return (default: 25)"),
  start: z
    .number()
    .min(0)
    .optional()
    .describe("Pagination offset (default: 0)"),
});

/**
 * Schema for get page parameters
 */
export const getPageSchema = z.object({
  pageId: pageIdSchema,
  includeContent: z
    .boolean()
    .optional()
    .describe("Whether to include page content (default: true)"),
  includeComments: z
    .boolean()
    .optional()
    .describe("Whether to include comment count (default: false)"),
  expand: z
    .array(z.string())
    .optional()
    .describe("Additional fields to expand"),
});

/**
 * Schema for search pages parameters
 */
export const searchPagesSchema = z.object({
  query: z
    .string()
    .describe(
      'CQL (Confluence Query Language) search query. Convert natural language to CQL syntax. Examples: text~"keyword", text~"multi word phrase", title~"page title", space.key="SPACE"',
    ),
  spaceKey: z.string().optional().describe("Limit search to specific space"),
  type: z.enum(["page", "blogpost"]).optional().describe("Content type filter"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("Maximum number of results (default: 25)"),
  start: z
    .number()
    .min(0)
    .optional()
    .describe("Pagination offset (default: 0)"),
  orderBy: z
    .enum(["relevance", "created", "modified", "title"])
    .optional()
    .describe("Sort order (default: relevance)"),
});

/**
 * Schema for create page parameters
 */
export const createPageSchema = z.object({
  spaceId: z
    .string()
    .describe("The ID of the space where the page will be created"),
  title: z.string().min(1).describe("The title of the new page"),
  content: z.string().describe("The content of the page"),
  parentPageId: z
    .string()
    .optional()
    .describe("The ID of the parent page (optional)"),
  status: z
    .enum(["current", "draft"])
    .optional()
    .describe("Page status (default: current)"),
  contentFormat: z
    .enum(["storage", "editor", "wiki"])
    .optional()
    .describe("Content format (default: storage)"),
});

/**
 * Schema for update page parameters
 */
export const updatePageSchema = z.object({
  pageId: pageIdSchema,
  title: z.string().min(1).optional().describe("New title for the page"),
  content: z.string().optional().describe("New content for the page"),
  versionNumber: z
    .number()
    .min(1)
    .describe("Current version number of the page"),
  status: z.enum(["current", "draft"]).optional().describe("Page status"),
  contentFormat: z
    .enum(["storage", "editor", "wiki"])
    .optional()
    .describe("Content format (default: storage)"),
  versionMessage: z
    .string()
    .optional()
    .describe("Message describing the changes made"),
});
