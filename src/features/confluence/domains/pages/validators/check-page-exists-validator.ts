/**
 * Check Page Exists Request Validator
 *
 * Zod-based validation for check page exists requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import { PageIdSchema } from "./schemas";

/**
 * Interface for check page exists request validation
 */
export interface CheckPageExistsRequestValidator {
  validate(pageId: string): void;
}

/**
 * Validator for check page exists requests
 */
export class CheckPageExistsValidator
  implements CheckPageExistsRequestValidator
{
  /**
   * Validate page ID for check page exists request using Zod schema
   */
  validate(pageId: string): void {
    try {
      PageIdSchema.parse(pageId);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid page ID for check page exists request",
        );
      }
      throw new ValidationError(
        "Invalid page ID for check page exists request",
      );
    }
  }
}
