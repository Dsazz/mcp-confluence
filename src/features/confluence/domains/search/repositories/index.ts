import type { ConfluenceHttpClient } from "@confluence/client/http";
import { DomainError } from "@features/confluence/shared/validators";
import type {
  AdvancedSearchRequest,
  PaginationInfo,
  SearchContentRequest,
  SearchRepository,
  SearchResult,
} from "../models";
import { type SearchQuery, createSearchResult } from "../models";
import { type CQLBuilder, createCQLBuilder } from "../utils/cql-builder";

/**
 * Confluence API response interfaces
 */
interface ConfluenceSearchResponse {
  results: Array<{
    content: {
      id: string;
      type: "page" | "blogpost" | "comment" | "attachment";
      status: string;
      title: string;
      space?: {
        id: string;
        key: string;
        name: string;
      };
      history: {
        createdBy: {
          accountId: string;
          displayName?: string;
        };
        createdDate: string;
        lastUpdated: {
          when: string;
        };
      };
      version: {
        number: number;
        when: string;
      };
      _links: {
        webui: string;
        self: string;
        editui?: string;
      };
    };
    excerpt?: string;
    score?: number;
    highlights?: {
      title?: string[];
      content?: string[];
    };
  }>;
  start: number;
  limit: number;
  size: number;
  totalSize?: number;
  _links: {
    next?: string;
    prev?: string;
  };
}

/**
 * Search repository implementation
 */
export class SearchRepositoryImpl implements SearchRepository {
  private cqlBuilder: CQLBuilder;

  constructor(private httpClient: ConfluenceHttpClient) {
    this.cqlBuilder = createCQLBuilder();
  }

  async searchContent(
    request: SearchContentRequest,
  ): Promise<{ results: SearchResult[]; pagination: PaginationInfo }> {
    try {
      const params = new URLSearchParams();
      params.append("cql", this.cqlBuilder.buildFromRequest(request));

      if (request.limit) {
        params.append("limit", request.limit.toString());
      }
      if (request.start) {
        params.append("start", request.start.toString());
      }
      if (request.orderBy && request.orderBy !== "relevance") {
        // Relevance is default, no need to specify
        const orderBy = this.cqlBuilder.mapOrderByToCQL(request.orderBy);
        const currentCql = params.get("cql") || "";
        params.set("cql", `${currentCql} ORDER BY ${orderBy}`);
      }

      const response =
        await this.httpClient.sendRequest<ConfluenceSearchResponse>({
          method: "GET",
          url: `/search?${params.toString()}`,
        });

      const results = response.results.map(
        (item: ConfluenceSearchResponse["results"][0]) =>
          this.mapToSearchResult(item),
      );

      const pagination: PaginationInfo = {
        start: response.start,
        limit: response.limit,
        size: response.size,
        hasMore: response.size === response.limit,
        total: response.totalSize,
      };

      return { results, pagination };
    } catch (error) {
      throw new DomainError(
        `Failed to search content: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async advancedSearch(
    request: AdvancedSearchRequest,
  ): Promise<{ results: SearchResult[]; pagination: PaginationInfo }> {
    try {
      const params = new URLSearchParams();
      params.append("cql", request.cql);

      if (request.limit) {
        params.append("limit", request.limit.toString());
      }
      if (request.start) {
        params.append("start", request.start.toString());
      }
      if (request.expand) {
        params.append("expand", request.expand);
      }

      const response =
        await this.httpClient.sendRequest<ConfluenceSearchResponse>({
          method: "GET",
          url: `/search?${params.toString()}`,
        });

      const results = response.results.map(
        (item: ConfluenceSearchResponse["results"][0]) =>
          this.mapToSearchResult(item),
      );

      const pagination: PaginationInfo = {
        start: response.start,
        limit: response.limit,
        size: response.size,
        hasMore: response.size === response.limit,
        total: response.totalSize,
      };

      return { results, pagination };
    } catch (error) {
      throw new DomainError(
        `Failed to execute advanced search: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async searchInSpace(
    spaceKey: string,
    query: SearchQuery,
    options?: { limit?: number; start?: number },
  ): Promise<{ results: SearchResult[]; pagination: PaginationInfo }> {
    try {
      const cql = this.cqlBuilder.buildSpaceSearch(spaceKey, query.value);
      const params = new URLSearchParams();
      params.append("cql", cql);

      if (options?.limit) {
        params.append("limit", options.limit.toString());
      }
      if (options?.start) {
        params.append("start", options.start.toString());
      }

      const response =
        await this.httpClient.sendRequest<ConfluenceSearchResponse>({
          method: "GET",
          url: `/search?${params.toString()}`,
        });

      const results = response.results.map(
        (item: ConfluenceSearchResponse["results"][0]) =>
          this.mapToSearchResult(item),
      );

      const pagination: PaginationInfo = {
        start: response.start,
        limit: response.limit,
        size: response.size,
        hasMore: response.size === response.limit,
        total: response.totalSize,
      };

      return { results, pagination };
    } catch (error) {
      throw new DomainError(
        `Failed to search in space: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async searchByType(
    contentType: "page" | "blogpost" | "comment" | "attachment",
    query: SearchQuery,
    options?: { limit?: number; start?: number },
  ): Promise<{ results: SearchResult[]; pagination: PaginationInfo }> {
    try {
      const cql = this.cqlBuilder.buildTypeSearch(contentType, query.value);
      const params = new URLSearchParams();
      params.append("cql", cql);

      if (options?.limit) {
        params.append("limit", options.limit.toString());
      }
      if (options?.start) {
        params.append("start", options.start.toString());
      }

      const response =
        await this.httpClient.sendRequest<ConfluenceSearchResponse>({
          method: "GET",
          url: `/search?${params.toString()}`,
        });

      const results = response.results.map(
        (item: ConfluenceSearchResponse["results"][0]) =>
          this.mapToSearchResult(item),
      );

      const pagination: PaginationInfo = {
        start: response.start,
        limit: response.limit,
        size: response.size,
        hasMore: response.size === response.limit,
        total: response.totalSize,
      };

      return { results, pagination };
    } catch (error) {
      throw new DomainError(
        `Failed to search by type: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      // Note: Confluence doesn't have a dedicated suggestions endpoint
      // This is a simplified implementation that could be enhanced
      const params = new URLSearchParams();
      params.append("cql", this.cqlBuilder.buildSuggestions(query));
      params.append("limit", "5");

      const response =
        await this.httpClient.sendRequest<ConfluenceSearchResponse>({
          method: "GET",
          url: `/search?${params.toString()}`,
        });

      // Extract unique titles as suggestions
      const suggestions = response.results
        .map(
          (item: ConfluenceSearchResponse["results"][0]) => item.content.title,
        )
        .filter(
          (title: string, index: number, array: string[]) =>
            array.indexOf(title) === index,
        )
        .slice(0, 5);

      return suggestions;
    } catch (error) {
      throw new DomainError(
        `Failed to get search suggestions: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private mapToSearchResult(
    item: ConfluenceSearchResponse["results"][0],
  ): SearchResult {
    return createSearchResult({
      content: {
        id: item.content.id,
        type: item.content.type,
        status: item.content.status,
        title: item.content.title,
        spaceId: item.content.space?.id,
        spaceKey: item.content.space?.key,
        spaceName: item.content.space?.name,
        authorId: item.content.history.createdBy.accountId,
        authorDisplayName: item.content.history.createdBy.displayName,
        createdAt: item.content.history.createdDate,
        updatedAt: item.content.history.lastUpdated.when,
        version: {
          number: item.content.version.number,
          createdAt: item.content.version.when,
        },
        links: {
          webui: item.content._links.webui,
          self: item.content._links.self,
          editui: item.content._links.editui,
        },
      },
      excerpt: item.excerpt,
      score: item.score || 0,
      highlights: item.highlights,
    });
  }
}
