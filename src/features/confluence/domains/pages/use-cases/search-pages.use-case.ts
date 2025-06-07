import { PageError } from "../../../shared/validators";
import type {
  PageRepository,
  PageStatistics,
  PageSummary,
  SearchPagesRequest,
  SearchPagesResponse,
} from "../models";

/**
 * Use case for searching pages
 */
export class SearchPagesUseCase {
  constructor(private pageRepository: PageRepository) {}

  async execute(request: SearchPagesRequest): Promise<SearchPagesResponse> {
    try {
      const { pages, pagination } = await this.pageRepository.search(request);

      // Pages are already PageSummary[] from the repository
      const pageSummaries: PageSummary[] = pages;

      // Create statistics from the full pages (would need all pages for accurate stats)
      const statistics: PageStatistics = {
        totalPages: pagination.total ?? pagination.size,
        currentPages: pageSummaries.filter((p) => p.status === "current")
          .length,
        draftPages: pageSummaries.filter((p) => p.status === "draft").length,
        trashedPages: pageSummaries.filter((p) => p.status === "trashed")
          .length,
        blogPosts: 0, // Would need type information in summary
      };

      return {
        pages: pageSummaries,
        pagination,
        query: request.query,
        statistics,
      };
    } catch (error) {
      throw new PageError(
        `Failed to search pages: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        error,
      );
    }
  }
}
