import { PageError } from "../../../shared/validators";
import type { Page, PageRepository, PaginationInfo } from "../models";

/**
 * Use case for getting pages by space
 */
export class GetPagesBySpaceUseCase {
  constructor(private pageRepository: PageRepository) {}

  async execute(
    spaceId: string,
    options?: { limit?: number; start?: number },
  ): Promise<{ pages: Page[]; pagination: PaginationInfo }> {
    try {
      return await this.pageRepository.findBySpaceId(spaceId, options);
    } catch (error) {
      throw new PageError(
        `Failed to retrieve pages for space: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        error,
      );
    }
  }
}
