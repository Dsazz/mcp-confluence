import { z } from "zod";

/**
 * Zod Schemas for Input Validation
 */
const SpaceKeySchema = z
  .string()
  .regex(/^[A-Z][A-Z0-9]*$/, "Space key must be uppercase alphanumeric");
const SpaceNameSchema = z.string().min(1).max(200);
const SpaceTypeSchema = z.enum(["global", "personal"]);

export const GetSpacesRequestSchema = z.object({
  type: SpaceTypeSchema.optional(),
  limit: z.number().min(1).max(250).optional(),
  start: z.number().min(0).optional(),
  expand: z.string().optional(),
});

export const GetSpaceByKeyRequestSchema = z.object({
  key: SpaceKeySchema,
});

export const GetSpaceByIdRequestSchema = z.object({
  id: z.string().min(1, "Space ID cannot be empty"),
});

export const CreateSpaceRequestSchema = z.object({
  key: SpaceKeySchema,
  name: SpaceNameSchema,
  description: z.string().optional(),
  type: SpaceTypeSchema.optional(),
});

/**
 * Inferred Types from Schemas
 */
export type GetSpacesRequest = z.infer<typeof GetSpacesRequestSchema>;
export type GetSpaceByKeyRequest = z.infer<typeof GetSpaceByKeyRequestSchema>;
export type GetSpaceByIdRequest = z.infer<typeof GetSpaceByIdRequestSchema>;
export type CreateSpaceRequest = z.infer<typeof CreateSpaceRequestSchema>;
