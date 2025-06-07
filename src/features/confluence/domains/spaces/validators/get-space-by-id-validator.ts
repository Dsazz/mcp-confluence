/**
 * Get Space By ID Request Validator
 *
 * Zod-based validation for get space by ID requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import { SpaceIdSchema } from "./schemas";

/**
 * Interface for get space by ID request validation
 */
export interface GetSpaceByIdRequestValidator {
  validate(id: string): void;
}

/**
 * Validator for get space by ID requests
 */
export class GetSpaceByIdValidator implements GetSpaceByIdRequestValidator {
  /**
   * Validate space ID for get space by ID request using Zod schema
   */
  validate(id: string): void {
    try {
      SpaceIdSchema.parse(id);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid space ID for get space by ID request",
        );
      }
      throw new ValidationError("Invalid space ID for get space by ID request");
    }
  }
}
