/**
 * Get Pages By Space Request Validator
 *
 * Zod-based validation for get pages by space requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import { PaginationOptionsSchema, SpaceIdSchema } from "./schemas";

/**
 * Interface for get pages by space request validation
 */
export interface GetPagesBySpaceRequestValidator {
  validate(spaceId: string, options?: { limit?: number; start?: number }): void;
}

/**
 * Validator for get pages by space requests
 */
export class GetPagesBySpaceValidator
  implements GetPagesBySpaceRequestValidator
{
  /**
   * Validate get pages by space request using Zod schema
   */
  validate(
    spaceId: string,
    options?: { limit?: number; start?: number },
  ): void {
    try {
      SpaceIdSchema.parse(spaceId);
      if (options !== undefined) {
        PaginationOptionsSchema.parse(options);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid get pages by space request",
        );
      }
      throw new ValidationError("Invalid get pages by space request");
    }
  }
}
