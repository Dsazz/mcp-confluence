/**
 * TODO: Remove this useless validator.
 * Get Space Statistics Request Validator
 *
 * Validator for get space statistics requests (no validation needed as no parameters)
 */

/**
 * Interface for get space statistics request validation
 */
export interface GetSpaceStatisticsRequestValidator {
  validate(): void;
}

/**
 * Validator for get space statistics requests
 */
export class GetSpaceStatisticsValidator
  implements GetSpaceStatisticsRequestValidator
{
  /**
   * Validate get space statistics request (no parameters to validate)
   */
  validate(): void {
    // No validation needed for this endpoint as it takes no parameters
    // This validator exists for consistency with the pattern
  }
}
