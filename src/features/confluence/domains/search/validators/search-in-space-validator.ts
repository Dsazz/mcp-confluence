/**
 * Search In Space Request Validator
 *
 * Zod-based validation for search in space requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import { SearchInSpaceRequestSchema } from "./schemas";

/**
 * Interface for search in space request validation
 */
export interface SearchInSpaceRequestValidator {
  validate(
    spaceKey: string,
    query: string,
    options?: { limit?: number; start?: number },
  ): void;
}

/**
 * Validator for search in space requests
 */
export class SearchInSpaceValidator implements SearchInSpaceRequestValidator {
  /**
   * Validate search in space request using Zod schema
   */
  validate(
    spaceKey: string,
    query: string,
    options?: { limit?: number; start?: number },
  ): void {
    try {
      SearchInSpaceRequestSchema.parse({
        spaceKey,
        query,
        options,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid search in space request",
        );
      }
      throw new ValidationError("Invalid search in space request");
    }
  }
}
