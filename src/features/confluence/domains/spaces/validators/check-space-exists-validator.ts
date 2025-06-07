/**
 * Check Space Exists Request Validator
 *
 * Zod-based validation for check space exists requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import { SpaceKeySchema } from "./schemas";

/**
 * Interface for check space exists request validation
 */
export interface CheckSpaceExistsRequestValidator {
  validate(key: string): void;
}

/**
 * Validator for check space exists requests
 */
export class CheckSpaceExistsValidator
  implements CheckSpaceExistsRequestValidator
{
  /**
   * Validate space key for check space exists request using Zod schema
   */
  validate(key: string): void {
    try {
      SpaceKeySchema.parse(key);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message ||
            "Invalid space key for check space exists request",
        );
      }
      throw new ValidationError(
        "Invalid space key for check space exists request",
      );
    }
  }
}
