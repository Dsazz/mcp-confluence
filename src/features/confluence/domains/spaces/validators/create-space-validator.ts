/**
 * Create Space Request Validator
 *
 * Zod-based validation for create space requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import type { CreateSpaceRequest } from "../models";
import { CreateSpaceRequestSchema } from "./schemas";

/**
 * Interface for create space request validation
 */
export interface CreateSpaceRequestValidator {
  validate(request: CreateSpaceRequest): void;
}

/**
 * Validator for create space requests
 */
export class CreateSpaceValidator implements CreateSpaceRequestValidator {
  /**
   * Validate create space request using Zod schema
   */
  validate(request: CreateSpaceRequest): void {
    try {
      CreateSpaceRequestSchema.parse(request);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid create space request",
        );
      }
      throw new ValidationError("Invalid create space request");
    }
  }
}
