/**
 * Get Space By Key Request Validator
 *
 * Zod-based validation for get space by key requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import { SpaceKeySchema } from "./schemas";

/**
 * Interface for get space by key request validation
 */
export interface GetSpaceByKeyRequestValidator {
  validate(key: string): void;
}

/**
 * Validator for get space by key requests
 */
export class GetSpaceByKeyValidator implements GetSpaceByKeyRequestValidator {
  /**
   * Validate space key for get space by key request using Zod schema
   */
  validate(key: string): void {
    try {
      SpaceKeySchema.parse(key);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message ||
            "Invalid space key for get space by key request",
        );
      }
      throw new ValidationError(
        "Invalid space key for get space by key request",
      );
    }
  }
}
