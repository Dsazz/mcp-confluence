/**
 * Search By Type Request Validator
 *
 * Zod-based validation for search by type requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import { SearchByTypeRequestSchema } from "./schemas";

/**
 * Interface for search by type request validation
 */
export interface SearchByTypeRequestValidator {
  validate(
    contentType: "page" | "blogpost" | "comment" | "attachment",
    query: string,
    options?: { limit?: number; start?: number },
  ): void;
}

/**
 * Validator for search by type requests
 */
export class SearchByTypeValidator implements SearchByTypeRequestValidator {
  /**
   * Validate search by type request using Zod schema
   */
  validate(
    contentType: "page" | "blogpost" | "comment" | "attachment",
    query: string,
    options?: { limit?: number; start?: number },
  ): void {
    try {
      SearchByTypeRequestSchema.parse({
        contentType,
        query,
        options,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid search by type request",
        );
      }
      throw new ValidationError("Invalid search by type request");
    }
  }
}
