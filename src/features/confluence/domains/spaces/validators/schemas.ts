/**
 * Spaces Validation Schemas
 *
 * Zod schemas for validating spaces requests
 */

import { z } from "zod";

/**
 * Space key schema
 */
export const SpaceKeySchema = z
  .string()
  .trim()
  .min(1, "Space key cannot be empty");

/**
 * Space ID schema
 */
export const SpaceIdSchema = z
  .string()
  .trim()
  .min(1, "Space ID cannot be empty");

/**
 * Space name schema
 */
export const SpaceNameSchema = z
  .string()
  .trim()
  .min(1, "Space name cannot be empty")
  .max(255, "Space name is too long (maximum 255 characters)");

/**
 * Space type schema
 */
export const SpaceTypeSchema = z.enum(["global", "personal"]);

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
 * Get spaces request schema
 */
export const GetSpacesRequestSchema = z
  .object({
    type: SpaceTypeSchema.optional(),
    limit: z.number().int().min(1).max(250).optional(),
    start: z.number().int().min(0).optional(),
  })
  .optional();

/**
 * Create space request schema
 */
export const CreateSpaceRequestSchema = z.object({
  key: SpaceKeySchema,
  name: SpaceNameSchema,
  type: SpaceTypeSchema.optional(),
  description: z.string().optional(),
});

/**
 * Update space request schema
 */
export const UpdateSpaceRequestSchema = z.object({
  name: SpaceNameSchema.optional(),
  type: SpaceTypeSchema.optional(),
  description: z.string().optional(),
});

/**
 * Type exports for schema inference
 */
export type GetSpacesRequestInput = z.infer<typeof GetSpacesRequestSchema>;
export type CreateSpaceRequestInput = z.infer<typeof CreateSpaceRequestSchema>;
export type UpdateSpaceRequestInput = z.infer<typeof UpdateSpaceRequestSchema>;
