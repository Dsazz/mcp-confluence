/**
 * Search Content Request Validator
 *
 * Zod-based validation for search content requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import type { SearchContentRequest } from "../models";
import { SearchContentRequestSchema } from "./schemas";

/**
 * Interface for search content request validation
 */
export interface SearchContentRequestValidator {
  validate(request: SearchContentRequest): void;
}

/**
 * Validator for search content requests
 */
export class SearchContentValidator implements SearchContentRequestValidator {
  /**
   * Validate search content request using Zod schema
   */
  validate(request: SearchContentRequest): void {
    try {
      SearchContentRequestSchema.parse(request);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid search content request",
        );
      }
      throw new ValidationError("Invalid search content request");
    }
  }
}
