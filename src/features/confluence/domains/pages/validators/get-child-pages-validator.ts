/**
 * Get Child Pages Request Validator
 *
 * Zod-based validation for get child pages requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import { PageIdSchema, PaginationOptionsSchema } from "./schemas";

/**
 * Interface for get child pages request validation
 */
export interface GetChildPagesRequestValidator {
  validate(
    parentPageId: string,
    options?: { limit?: number; start?: number },
  ): void;
}

/**
 * Validator for get child pages requests
 */
export class GetChildPagesValidator implements GetChildPagesRequestValidator {
  /**
   * Validate get child pages request using Zod schema
   */
  validate(
    parentPageId: string,
    options?: { limit?: number; start?: number },
  ): void {
    try {
      PageIdSchema.parse(parentPageId);
      if (options !== undefined) {
        PaginationOptionsSchema.parse(options);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid get child pages request",
        );
      }
      throw new ValidationError("Invalid get child pages request");
    }
  }
}
