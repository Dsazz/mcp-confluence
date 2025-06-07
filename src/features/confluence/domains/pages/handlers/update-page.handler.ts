import type { UpdatePageRequest, UpdatePageResponse } from "../models";

import { ValidationError } from "@features/confluence/shared/validators";
import type { UpdatePageUseCase } from "../use-cases";
import { UpdatePageValidator } from "../validators";

/**
 * Handler for updating a page
 */
export class UpdatePageHandler {
  private validator = new UpdatePageValidator();

  constructor(private updatePageUseCase: UpdatePageUseCase) {}

  async handle(request: UpdatePageRequest): Promise<UpdatePageResponse> {
    try {
      this.validator.validate(request);
      return await this.updatePageUseCase.execute(request);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to update page: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
