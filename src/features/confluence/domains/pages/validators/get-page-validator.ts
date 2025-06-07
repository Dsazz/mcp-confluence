/**
 * Get Page Request Validator
 *
 * Zod-based validation for get page requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import type { GetPageRequest } from "../models";
import { GetPageRequestSchema } from "./schemas";

/**
 * Interface for get page request validation
 */
export interface GetPageRequestValidator {
  validate(request: GetPageRequest): void;
}

/**
 * Validator for get page requests
 */
export class GetPageValidator implements GetPageRequestValidator {
  /**
   * Validate get page request using Zod schema
   */
  validate(request: GetPageRequest): void {
    try {
      GetPageRequestSchema.parse(request);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid get page request",
        );
      }
      throw new ValidationError("Invalid get page request");
    }
  }
}
