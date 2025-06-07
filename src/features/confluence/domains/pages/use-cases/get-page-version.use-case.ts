import { PageError, PageNotFoundError } from "../../../shared/validators";
import type { PageRepository, PageVersion } from "../models";
import { PageId } from "../models";

/**
 * Use case for getting page version information
 */
export class GetPageVersionUseCase {
  constructor(private pageRepository: PageRepository) {}

  async execute(pageId: string): Promise<PageVersion> {
    try {
      const id = PageId.fromString(pageId);

      // Check if page exists
      const exists = await this.pageRepository.exists(id);
      if (!exists) {
        throw new PageNotFoundError(pageId);
      }

      return await this.pageRepository.getVersion(id);
    } catch (error) {
      if (error instanceof PageNotFoundError) {
        throw error;
      }

      throw new PageError(
        `Failed to retrieve page version: ${error instanceof Error ? error.message : "Unknown error"}`,
        pageId,
        error,
      );
    }
  }
}
