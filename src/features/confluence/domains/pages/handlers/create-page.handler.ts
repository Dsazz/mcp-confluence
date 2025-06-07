import type { CreatePageRequest, CreatePageResponse } from "../models";

import { ValidationError } from "@features/confluence/shared/validators";
import type { CreatePageUseCase } from "../use-cases";
import { CreatePageValidator } from "../validators";

/**
 * Handler for creating a page
 */
export class CreatePageHandler {
  private validator = new CreatePageValidator();

  constructor(private createPageUseCase: CreatePageUseCase) {}

  async handle(request: CreatePageRequest): Promise<CreatePageResponse> {
    try {
      this.validator.validate(request);
      return await this.createPageUseCase.execute(request);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to create page: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
