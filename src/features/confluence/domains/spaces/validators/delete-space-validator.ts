/**
 * Delete Space Request Validator
 *
 * Zod-based validation for delete space requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import { SpaceKeySchema } from "./schemas";

/**
 * Interface for delete space request validation
 */
export interface DeleteSpaceRequestValidator {
  validate(key: string): void;
}

/**
 * Validator for delete space requests
 */
export class DeleteSpaceValidator implements DeleteSpaceRequestValidator {
  /**
   * Validate space key for delete space request using Zod schema
   */
  validate(key: string): void {
    try {
      SpaceKeySchema.parse(key);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid space key for delete space request",
        );
      }
      throw new ValidationError("Invalid space key for delete space request");
    }
  }
}
