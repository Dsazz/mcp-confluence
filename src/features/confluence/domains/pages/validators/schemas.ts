/**
 * Pages Validation Schemas
 *
 * Zod schemas for validating pages requests
 */

import { z } from "zod";

/**
 * Page ID schema
 */
export const PageIdSchema = z.string().trim().min(1, "Page ID cannot be empty");

/**
 * Page title schema
 */
export const PageTitleSchema = z
  .string()
  .trim()
  .min(1, "Page title cannot be empty")
  .max(255, "Page title is too long (maximum 255 characters)");

/**
 * Space ID schema
 */
export const SpaceIdSchema = z
  .string()
  .trim()
  .min(1, "Space ID cannot be empty");

/**
 * Content format schema
 */
export const ContentFormatSchema = z.enum([
  "storage",
  "editor",
  "wiki",
  "atlas_doc_format",
]);

/**
 * Page status schema
 */
export const PageStatusSchema = z.enum(["current", "draft"]);

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
 * Get page request schema
 */
export const GetPageRequestSchema = z.object({
  pageId: PageIdSchema,
  includeContent: z.boolean().optional(),
  includeComments: z.boolean().optional(),
  expand: z.string().optional(),
});

/**
 * Get page comment count request schema
 */
export const GetPageCommentCountRequestSchema = z.object({
  pageId: PageIdSchema,
});

/**
 * Create page request schema
 */
export const CreatePageRequestSchema = z.object({
  spaceId: SpaceIdSchema,
  title: PageTitleSchema,
  content: z.string().min(1, "Page content cannot be empty"),
  parentPageId: PageIdSchema.optional(),
  status: PageStatusSchema.optional(),
  contentFormat: ContentFormatSchema.optional(),
});

/**
 * Update page request schema
 */
export const UpdatePageRequestSchema = z.object({
  pageId: PageIdSchema,
  title: PageTitleSchema.optional(),
  content: z.string().optional(),
  status: PageStatusSchema.optional(),
  contentFormat: ContentFormatSchema.optional(),
  versionNumber: z.number().int().min(1, "Version number must be positive"),
  versionMessage: z.string().optional(),
});

/**
 * Search pages request schema
 */
export const SearchPagesRequestSchema = z.object({
  query: z.string().trim().min(1, "Search query cannot be empty"),
  spaceKey: z.string().optional(),
  limit: z.number().int().min(1).max(250).optional(),
  start: z.number().int().min(0).optional(),
  orderBy: z.enum(["relevance", "created", "modified", "title"]).optional(),
});

/**
 * Get pages by space request schema
 */
export const GetPagesBySpaceRequestSchema = z.object({
  spaceId: SpaceIdSchema,
  options: PaginationOptionsSchema,
});

/**
 * Get child pages request schema
 */
export const GetChildPagesRequestSchema = z.object({
  parentPageId: PageIdSchema,
  options: PaginationOptionsSchema,
});

/**
 * Type exports for schema inference
 */
export type GetPageRequestInput = z.infer<typeof GetPageRequestSchema>;
export type GetPageCommentCountRequestInput = z.infer<
  typeof GetPageCommentCountRequestSchema
>;
export type CreatePageRequestInput = z.infer<typeof CreatePageRequestSchema>;
export type UpdatePageRequestInput = z.infer<typeof UpdatePageRequestSchema>;
export type SearchPagesRequestInput = z.infer<typeof SearchPagesRequestSchema>;
export type GetPagesBySpaceRequestInput = z.infer<
  typeof GetPagesBySpaceRequestSchema
>;
export type GetChildPagesRequestInput = z.infer<
  typeof GetChildPagesRequestSchema
>;
