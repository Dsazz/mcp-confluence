import { DomainError } from "@features/confluence/shared/validators";
import type { SearchContentRequest, SearchContentResponse } from "../models";
import type { SearchContentUseCase } from "../use-cases";
import { SearchContentValidator } from "../validators/search-content-validator";

/**
 * Handler for searching content across Confluence
 */
export class SearchContentHandler {
  private validator = new SearchContentValidator();

  constructor(private searchContentUseCase: SearchContentUseCase) {}

  async handle(request: SearchContentRequest): Promise<SearchContentResponse> {
    try {
      this.validator.validate(request);
      return await this.searchContentUseCase.execute(request);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        `Failed to handle search content request: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
