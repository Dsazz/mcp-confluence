/**
 * Get Spaces Request Validator
 *
 * Zod-based validation for get spaces requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import type { GetSpacesRequest } from "../models";
import { GetSpacesRequestSchema } from "./schemas";

/**
 * Interface for get spaces request validation
 */
export interface GetSpacesRequestValidator {
  validate(request?: GetSpacesRequest): void;
}

/**
 * Validator for get spaces requests
 */
export class GetSpacesValidator implements GetSpacesRequestValidator {
  /**
   * Validate get spaces request using Zod schema
   */
  validate(request?: GetSpacesRequest): void {
    try {
      GetSpacesRequestSchema.parse(request);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid get spaces request",
        );
      }
      throw new ValidationError("Invalid get spaces request");
    }
  }
}
