/**
 * Create Page Request Validator
 *
 * Zod-based validation for create page requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import type { CreatePageRequest } from "../models";
import { CreatePageRequestSchema } from "./schemas";

/**
 * Interface for create page request validation
 */
export interface CreatePageRequestValidator {
  validate(request: CreatePageRequest): void;
}

/**
 * Validator for create page requests
 */
export class CreatePageValidator implements CreatePageRequestValidator {
  /**
   * Validate create page request using Zod schema
   */
  validate(request: CreatePageRequest): void {
    try {
      CreatePageRequestSchema.parse(request);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid create page request",
        );
      }
      throw new ValidationError("Invalid create page request");
    }
  }
}
