/**
 * Search Suggestions Request Validator
 *
 * Zod-based validation for search suggestions requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import { SearchSuggestionsRequestSchema } from "./schemas";

/**
 * Interface for search suggestions request validation
 */
export interface SearchSuggestionsRequestValidator {
  validate(query: string): void;
}

/**
 * Validator for search suggestions requests
 */
export class SearchSuggestionsValidator
  implements SearchSuggestionsRequestValidator
{
  /**
   * Validate search suggestions request using Zod schema
   */
  validate(query: string): void {
    try {
      SearchSuggestionsRequestSchema.parse({ query });
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid search suggestions request",
        );
      }
      throw new ValidationError("Invalid search suggestions request");
    }
  }
}
