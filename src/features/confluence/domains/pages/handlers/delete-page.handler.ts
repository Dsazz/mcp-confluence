import { ValidationError } from "@features/confluence/shared/validators";
import type { DeletePageUseCase } from "../use-cases";
import { DeletePageValidator } from "../validators";

/**
 * Handler for deleting a page
 */
export class DeletePageHandler {
  private validator = new DeletePageValidator();

  constructor(private deletePageUseCase: DeletePageUseCase) {}

  async handle(pageId: string): Promise<void> {
    try {
      this.validator.validate(pageId);
      await this.deletePageUseCase.execute(pageId);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to delete page: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
