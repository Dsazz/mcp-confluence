import { z } from "zod";

/**
 * Zod Schemas for Input Validation
 */
const PageIdSchema = z.string().min(1, "Page ID cannot be empty");
const PageTitleSchema = z.string().min(1).max(500);
const PageContentSchema = z.string().min(1, "Page content cannot be empty");
const PageStatusSchema = z.enum(["current", "draft", "trashed", "deleted"]);
const PageTypeSchema = z.enum(["page", "blogpost"]);
const ContentFormatSchema = z.enum([
  "storage",
  "editor",
  "wiki",
  "atlas_doc_format",
]);

export const GetPageRequestSchema = z.object({
  pageId: PageIdSchema,
  includeContent: z.boolean().optional(),
  includeComments: z.boolean().optional(),
  expand: z.string().optional(),
});

export const GetPageCommentCountRequestSchema = z.object({
  pageId: PageIdSchema,
});

export const GetPagesBySpaceRequestSchema = z.object({
  spaceId: z.string().min(1, "Space ID cannot be empty"),
  limit: z.number().min(1).max(250).optional(),
  start: z.number().min(0).optional(),
});

export const GetChildPagesRequestSchema = z.object({
  parentPageId: PageIdSchema,
  limit: z.number().min(1).max(250).optional(),
  start: z.number().min(0).optional(),
});

export const CreatePageRequestSchema = z.object({
  spaceId: z.string().min(1, "Space ID is required"),
  title: PageTitleSchema,
  content: PageContentSchema,
  parentPageId: z.string().optional(),
  status: PageStatusSchema.optional(),
  contentFormat: ContentFormatSchema.optional(),
});

export const UpdatePageRequestSchema = z.object({
  pageId: PageIdSchema,
  versionNumber: z.number().min(1, "Version number must be positive"),
  title: PageTitleSchema.optional(),
  content: PageContentSchema.optional(),
  status: PageStatusSchema.optional(),
  contentFormat: ContentFormatSchema.optional(),
  versionMessage: z.string().optional(),
});

export const SearchPagesRequestSchema = z.object({
  query: z.string().min(1, "Search query cannot be empty"),
  spaceKey: z.string().optional(),
  limit: z.number().min(1).max(250).optional(),
  start: z.number().min(0).optional(),
  orderBy: z.enum(["relevance", "created", "modified", "title"]).optional(),
  type: PageTypeSchema.optional(),
});

/**
 * Inferred Types from Schemas
 */
export type GetPageRequest = z.infer<typeof GetPageRequestSchema>;
export type GetPageCommentCountRequest = z.infer<
  typeof GetPageCommentCountRequestSchema
>;
export type GetPagesBySpaceRequest = z.infer<
  typeof GetPagesBySpaceRequestSchema
>;
export type GetChildPagesRequest = z.infer<typeof GetChildPagesRequestSchema>;
export type CreatePageRequest = z.infer<typeof CreatePageRequestSchema>;
export type UpdatePageRequest = z.infer<typeof UpdatePageRequestSchema>;
export type SearchPagesRequest = z.infer<typeof SearchPagesRequestSchema>;
