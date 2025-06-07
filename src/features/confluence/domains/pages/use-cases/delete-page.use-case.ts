import { PageError, PageNotFoundError } from "../../../shared/validators";
import type { PageRepository } from "../models";
import { PageId } from "../models";

/**
 * Use case for deleting a page
 */
export class DeletePageUseCase {
  constructor(private pageRepository: PageRepository) {}

  async execute(pageId: string): Promise<void> {
    try {
      const id = PageId.fromString(pageId);

      // Check if page exists
      const existingPage = await this.pageRepository.findById(id);

      if (!existingPage) {
        throw new PageNotFoundError(pageId);
      }

      await this.pageRepository.delete(id);
    } catch (error) {
      if (error instanceof PageNotFoundError) {
        throw error;
      }

      throw new PageError(
        `Failed to delete page: ${error instanceof Error ? error.message : "Unknown error"}`,
        pageId,
        error,
      );
    }
  }
}
