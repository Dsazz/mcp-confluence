/**
 * Get Page Comment Count Request Validator
 *
 * Zod-based validation for get page comment count requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import type { GetPageCommentCountRequest } from "../models";
import { GetPageCommentCountRequestSchema } from "./schemas";

/**
 * Interface for get page comment count request validation
 */
export interface GetPageCommentCountRequestValidator {
  validate(request: GetPageCommentCountRequest): void;
}

/**
 * Validator for get page comment count requests
 */
export class GetPageCommentCountValidator
  implements GetPageCommentCountRequestValidator
{
  /**
   * Validate get page comment count request using Zod schema
   */
  validate(request: GetPageCommentCountRequest): void {
    try {
      GetPageCommentCountRequestSchema.parse(request);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid get page comment count request",
        );
      }
      throw new ValidationError("Invalid get page comment count request");
    }
  }
}
