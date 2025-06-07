import type { PageSummary, PaginationInfo } from "../models";

import { ValidationError } from "@features/confluence/shared/validators";
import type { GetChildPagesUseCase } from "../use-cases";
import { GetChildPagesValidator } from "../validators";

/**
 * Handler for getting child pages
 */
export class GetChildPagesHandler {
  private validator = new GetChildPagesValidator();

  constructor(private getChildPagesUseCase: GetChildPagesUseCase) {}

  async handle(
    parentPageId: string,
    options?: { limit?: number; start?: number },
  ): Promise<{ pages: PageSummary[]; pagination: PaginationInfo }> {
    try {
      this.validator.validate(parentPageId, options);
      return await this.getChildPagesUseCase.execute(parentPageId, options);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to get child pages: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
