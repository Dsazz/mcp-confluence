/**
 * Search Validation Schemas
 *
 * Zod schemas for validating search requests
 */

import { z } from "zod";

/**
 * Content type schema
 */
export const ContentTypeSchema = z.enum([
  "page",
  "blogpost",
  "comment",
  "attachment",
]);

/**
 * Order by schema
 */
export const OrderBySchema = z.enum([
  "relevance",
  "created",
  "modified",
  "title",
]);

/**
 * Pagination options schema
 */
export const PaginationOptionsSchema = z
  .object({
    limit: z.number().int().min(1).max(250).optional(),
    start: z.number().int().min(0).optional(),
  })
  .optional();

/**
 * Search content request schema
 */
export const SearchContentRequestSchema = z.object({
  query: z.string().trim().min(1, "Search query cannot be empty"),
  spaceKey: z.string().optional(),
  type: ContentTypeSchema.optional(),
  limit: z.number().int().min(1).max(250).optional(),
  start: z.number().int().min(0).optional(),
  orderBy: OrderBySchema.optional(),
  includeArchivedSpaces: z.boolean().optional(),
});

/**
 * Advanced search request schema
 */
export const AdvancedSearchRequestSchema = z.object({
  cql: z.string().trim().min(1, "CQL query cannot be empty"),
  limit: z.number().int().min(1).max(250).optional(),
  start: z.number().int().min(0).optional(),
  expand: z.string().optional(),
});

/**
 * Search in space request schema
 */
export const SearchInSpaceRequestSchema = z.object({
  spaceKey: z.string().trim().min(1, "Space key cannot be empty"),
  query: z.string().trim().min(1, "Search query cannot be empty"),
  options: PaginationOptionsSchema,
});

/**
 * Search by type request schema
 */
export const SearchByTypeRequestSchema = z.object({
  contentType: ContentTypeSchema,
  query: z.string().trim().min(1, "Search query cannot be empty"),
  options: PaginationOptionsSchema,
});

/**
 * Search suggestions request schema
 */
export const SearchSuggestionsRequestSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Search query cannot be empty")
    .max(100, "Search query is too long (maximum 100 characters)"),
});

/**
 * Type exports for schema inference
 */
export type SearchContentRequestInput = z.infer<
  typeof SearchContentRequestSchema
>;
export type AdvancedSearchRequestInput = z.infer<
  typeof AdvancedSearchRequestSchema
>;
export type SearchInSpaceRequestInput = z.infer<
  typeof SearchInSpaceRequestSchema
>;
export type SearchByTypeRequestInput = z.infer<
  typeof SearchByTypeRequestSchema
>;
export type SearchSuggestionsRequestInput = z.infer<
  typeof SearchSuggestionsRequestSchema
>;
