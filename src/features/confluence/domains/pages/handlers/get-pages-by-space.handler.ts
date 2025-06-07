import type { Page, PaginationInfo } from "../models";

import { ValidationError } from "@features/confluence/shared/validators";
import type { GetPagesBySpaceUseCase } from "../use-cases";
import { GetPagesBySpaceValidator } from "../validators";

/**
 * Handler for getting pages by space
 */
export class GetPagesBySpaceHandler {
  private validator = new GetPagesBySpaceValidator();

  constructor(private getPagesBySpaceUseCase: GetPagesBySpaceUseCase) {}

  async handle(
    spaceId: string,
    options?: { limit?: number; start?: number },
  ): Promise<{ pages: Page[]; pagination: PaginationInfo }> {
    try {
      this.validator.validate(spaceId, options);
      return await this.getPagesBySpaceUseCase.execute(spaceId, options);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to get pages by space: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
