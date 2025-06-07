/**
 * Search Pages Request Validator
 *
 * Zod-based validation for search pages requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import type { SearchPagesRequest } from "../models";
import { SearchPagesRequestSchema } from "./schemas";

/**
 * Interface for search pages request validation
 */
export interface SearchPagesRequestValidator {
  validate(request: SearchPagesRequest): void;
}

/**
 * Validator for search pages requests
 */
export class SearchPagesValidator implements SearchPagesRequestValidator {
  /**
   * Validate search pages request using Zod schema
   */
  validate(request: SearchPagesRequest): void {
    try {
      SearchPagesRequestSchema.parse(request);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid search pages request",
        );
      }
      throw new ValidationError("Invalid search pages request");
    }
  }
}
