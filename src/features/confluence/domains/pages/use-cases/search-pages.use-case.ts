import type { SearchRepository } from "@confluence/search";
import { PageError } from "../../../shared/validators";
import type {
  PageStatistics,
  PageSummary,
  SearchPagesRequest,
  SearchPagesResponse,
} from "../models";
import { createPageSummary } from "../models";

/**
 * Use case for searching pages.
 * Delegates CQL-based search to the search domain's repository (V1 API).
 */
export class SearchPagesUseCase {
  constructor(private searchRepository: SearchRepository) {}

  async execute(request: SearchPagesRequest): Promise<SearchPagesResponse> {
    try {
      const { results, pagination } = await this.searchRepository.searchContent(
        {
          query: request.query,
          spaceKey: request.spaceKey,
          type: request.type,
          limit: request.limit,
          start: request.start,
          orderBy: request.orderBy,
        },
      );

      const pageSummaries: PageSummary[] = results
        .filter(
          (r) => r.content.type === "page" || r.content.type === "blogpost",
        )
        .map((r) =>
          createPageSummary({
            id: r.content.id,
            title: r.content.title,
            status: r.content.status as
              | "current"
              | "draft"
              | "trashed"
              | "deleted",
            spaceId: r.content.spaceId || "",
            authorId: r.content.authorId,
            createdAt: r.content.createdAt,
            updatedAt: r.content.updatedAt,
            version: {
              number: r.content.version.number,
              createdAt: r.content.version.createdAt,
            },
            links: {
              webui: r.content.links.webui,
            },
          }),
        );

      const statistics: PageStatistics = {
        totalPages: pagination.total ?? pagination.size,
        currentPages: pageSummaries.filter((p) => p.status === "current")
          .length,
        draftPages: pageSummaries.filter((p) => p.status === "draft").length,
        trashedPages: pageSummaries.filter((p) => p.status === "trashed")
          .length,
        blogPosts: 0,
      };

      return {
        pages: pageSummaries,
        pagination: {
          start: pagination.start,
          limit: pagination.limit,
          size: pageSummaries.length,
          hasMore: pagination.hasMore,
          total: pagination.total,
        },
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
