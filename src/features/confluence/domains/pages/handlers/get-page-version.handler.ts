import type { PageVersion } from "../models";

import { ValidationError } from "@features/confluence/shared/validators";
import type { GetPageVersionUseCase } from "../use-cases";
import { GetPageVersionValidator } from "../validators";

/**
 * Handler for getting a page version
 */
export class GetPageVersionHandler {
  private validator = new GetPageVersionValidator();

  constructor(private getPageVersionUseCase: GetPageVersionUseCase) {}

  async handle(pageId: string): Promise<PageVersion> {
    try {
      this.validator.validate(pageId);
      return await this.getPageVersionUseCase.execute(pageId);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to get page version: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
