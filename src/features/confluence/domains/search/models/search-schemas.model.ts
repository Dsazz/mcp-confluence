import { z } from "zod";

/**
 * Zod Schemas for Input Validation
 */
const SearchQuerySchema = z.string().min(1, "Search query cannot be empty");
const ContentTypeSchema = z.enum(["page", "blogpost", "comment", "attachment"]);
const OrderBySchema = z.enum(["relevance", "created", "modified", "title"]);

export const SearchContentRequestSchema = z.object({
  query: SearchQuerySchema,
  spaceKey: z.string().optional(),
  type: ContentTypeSchema.optional(),
  limit: z.number().min(1).max(250).optional(),
  start: z.number().min(0).optional(),
  orderBy: OrderBySchema.optional(),
  includeArchivedSpaces: z.boolean().optional(),
});

export const AdvancedSearchRequestSchema = z.object({
  cql: z.string().min(1, "CQL query cannot be empty"),
  limit: z.number().min(1).max(250).optional(),
  start: z.number().min(0).optional(),
  expand: z.string().optional(),
});

/**
 * Inferred Types from Schemas
 */
export type SearchContentRequest = z.infer<typeof SearchContentRequestSchema>;
export type AdvancedSearchRequest = z.infer<typeof AdvancedSearchRequestSchema>;
