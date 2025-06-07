import type { GetPageRequest, GetPageResponse } from "../models";

import { ValidationError } from "@features/confluence/shared/validators";
import type { GetPageByIdUseCase } from "../use-cases";
import { GetPageValidator } from "../validators";

/**
 * Handler for getting a page by ID
 */
export class GetPageHandler {
  private validator = new GetPageValidator();

  constructor(private getPageByIdUseCase: GetPageByIdUseCase) {}

  async handle(request: GetPageRequest): Promise<GetPageResponse> {
    try {
      this.validator.validate(request);
      return await this.getPageByIdUseCase.execute(request);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to get page: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
