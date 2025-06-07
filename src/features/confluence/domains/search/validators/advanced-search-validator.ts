/**
 * Advanced Search Request Validator
 *
 * Zod-based validation for advanced search requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import type { AdvancedSearchRequest } from "../models";
import { AdvancedSearchRequestSchema } from "./schemas";

/**
 * Interface for advanced search request validation
 */
export interface AdvancedSearchRequestValidator {
  validate(request: AdvancedSearchRequest): void;
}

/**
 * Validator for advanced search requests
 */
export class AdvancedSearchValidator implements AdvancedSearchRequestValidator {
  /**
   * Validate advanced search request using Zod schema
   */
  validate(request: AdvancedSearchRequest): void {
    try {
      AdvancedSearchRequestSchema.parse(request);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid advanced search request",
        );
      }
      throw new ValidationError("Invalid advanced search request");
    }
  }
}
