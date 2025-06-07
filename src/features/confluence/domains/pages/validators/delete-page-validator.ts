/**
 * Delete Page Request Validator
 *
 * Zod-based validation for delete page requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import { PageIdSchema } from "./schemas";

/**
 * Interface for delete page request validation
 */
export interface DeletePageRequestValidator {
  validate(pageId: string): void;
}

/**
 * Validator for delete page requests
 */
export class DeletePageValidator implements DeletePageRequestValidator {
  /**
   * Validate page ID for delete request using Zod schema
   */
  validate(pageId: string): void {
    try {
      PageIdSchema.parse(pageId);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid page ID for delete request",
        );
      }
      throw new ValidationError("Invalid page ID for delete request");
    }
  }
}
