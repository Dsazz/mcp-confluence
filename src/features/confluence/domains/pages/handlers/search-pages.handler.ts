import type { SearchPagesRequest, SearchPagesResponse } from "../models";

import { ValidationError } from "@features/confluence/shared/validators";
import type { SearchPagesUseCase } from "../use-cases";
import { SearchPagesValidator } from "../validators";

/**
 * Handler for searching pages
 */
export class SearchPagesHandler {
  private validator = new SearchPagesValidator();

  constructor(private searchPagesUseCase: SearchPagesUseCase) {}

  async handle(request: SearchPagesRequest): Promise<SearchPagesResponse> {
    try {
      this.validator.validate(request);
      return await this.searchPagesUseCase.execute(request);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to search pages: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
