/**
 * Get Page Version Request Validator
 *
 * Zod-based validation for get page version requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import { PageIdSchema } from "./schemas";

/**
 * Interface for get page version request validation
 */
export interface GetPageVersionRequestValidator {
  validate(pageId: string): void;
}

/**
 * Validator for get page version requests
 */
export class GetPageVersionValidator implements GetPageVersionRequestValidator {
  /**
   * Validate page ID for get page version request using Zod schema
   */
  validate(pageId: string): void {
    try {
      PageIdSchema.parse(pageId);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid page ID for get page version request",
        );
      }
      throw new ValidationError("Invalid page ID for get page version request");
    }
  }
}
