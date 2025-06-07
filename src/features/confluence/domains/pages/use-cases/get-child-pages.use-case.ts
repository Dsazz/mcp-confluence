import { PageError, PageNotFoundError } from "../../../shared/validators";
import type { PageRepository, PageSummary, PaginationInfo } from "../models";
import { PageId } from "../models";

/**
 * Use case for getting child pages
 */
export class GetChildPagesUseCase {
  constructor(private pageRepository: PageRepository) {}

  async execute(
    parentPageId: string,
    options?: { limit?: number; start?: number },
  ): Promise<{ pages: PageSummary[]; pagination: PaginationInfo }> {
    try {
      const parentId = PageId.fromString(parentPageId);

      // Check if parent page exists
      const parentExists = await this.pageRepository.exists(parentId);
      if (!parentExists) {
        throw new PageNotFoundError(parentPageId);
      }

      return await this.pageRepository.findChildren(parentId, options);
    } catch (error) {
      if (error instanceof PageNotFoundError) {
        throw error;
      }

      throw new PageError(
        `Failed to retrieve child pages: ${error instanceof Error ? error.message : "Unknown error"}`,
        parentPageId,
        error,
      );
    }
  }
}
