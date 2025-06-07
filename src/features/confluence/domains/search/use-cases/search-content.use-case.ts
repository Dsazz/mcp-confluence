import { DomainError } from "../../../shared/validators";
import type {
  SearchContentRequest,
  SearchContentResponse,
  SearchRepository,
} from "../models";
import { SearchQuery } from "../models";

/**
 * Use case for searching content across Confluence
 */
export class SearchContentUseCase {
  constructor(private searchRepository: SearchRepository) {}

  async execute(request: SearchContentRequest): Promise<SearchContentResponse> {
    try {
      // Validate search query
      const searchQuery = SearchQuery.fromString(request.query);

      // Execute search
      const { results, pagination } =
        await this.searchRepository.searchContent(request);

      // Build search context
      const context = {
        query: searchQuery,
        filters: {
          spaceKey: request.spaceKey,
          contentType: request.type,
        },
        sorting: {
          field: request.orderBy || "relevance",
          direction: "DESC" as const,
        },
      };

      // Calculate statistics
      const statistics = {
        totalResults: pagination.total || results.length,
        searchTime: 0, // Would be provided by API
        resultsByType: {
          pages: results.filter((r) => r.content.type === "page").length,
          blogposts: results.filter((r) => r.content.type === "blogpost")
            .length,
          comments: results.filter((r) => r.content.type === "comment").length,
          attachments: results.filter((r) => r.content.type === "attachment")
            .length,
        },
        resultsBySpace: this.calculateSpaceStatistics(results),
      };

      return {
        results,
        pagination,
        context,
        statistics,
      };
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        `Failed to search content: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private calculateSpaceStatistics(
    results: SearchContentResponse["results"],
  ): Array<{ spaceKey: string; spaceName: string; count: number }> {
    const spaceMap = new Map<string, { spaceName: string; count: number }>();

    for (const result of results) {
      if (result.content.spaceKey) {
        const existing = spaceMap.get(result.content.spaceKey);
        if (existing) {
          existing.count++;
        } else {
          spaceMap.set(result.content.spaceKey, {
            spaceName: result.content.spaceName || result.content.spaceKey,
            count: 1,
          });
        }
      }
    }

    return Array.from(spaceMap.entries()).map(([spaceKey, data]) => ({
      spaceKey,
      spaceName: data.spaceName,
      count: data.count,
    }));
  }
}
