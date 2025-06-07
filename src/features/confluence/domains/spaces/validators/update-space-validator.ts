/**
 * Update Space Request Validator
 *
 * Zod-based validation for update space requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import type { CreateSpaceRequest } from "../models";
import { SpaceKeySchema, UpdateSpaceRequestSchema } from "./schemas";

/**
 * Interface for update space request validation
 */
export interface UpdateSpaceRequestValidator {
  validate(key: string, updates: Partial<CreateSpaceRequest>): void;
}

/**
 * Validator for update space requests
 */
export class UpdateSpaceValidator implements UpdateSpaceRequestValidator {
  /**
   * Validate update space request using Zod schema
   */
  validate(key: string, updates: Partial<CreateSpaceRequest>): void {
    try {
      SpaceKeySchema.parse(key);
      UpdateSpaceRequestSchema.parse(updates);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid update space request",
        );
      }
      throw new ValidationError("Invalid update space request");
    }
  }
}
