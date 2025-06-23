import type { ConfluenceHttpClient } from "@features/confluence/client/http";
import {
  PageRepositoryError,
  VersionConflictError,
} from "@features/confluence/shared/validators";
import type {
  CreatePageRequest,
  Page,
  PageId,
  PageRepository,
  PageSummary,
  PageTitle,
  PageVersion,
  PaginationInfo,
  SearchPagesRequest,
  UpdatePageRequest,
} from "../models";
import {
  mapCreateRequest,
  mapSearchResultToPageData,
  mapSearchResultToPageSummary,
  mapToPage,
  mapToPageSummary,
  mapToPagination,
  mapUpdateRequest,
  mapV1ContentResponseToPageData,
} from "./mappers.repository";
import type {
  ConfluenceCommentsResponse,
  ConfluencePageResponse,
  ConfluencePagesResponse,
  ConfluenceSearchResponse,
  ConfluenceV1ContentResponse,
} from "./types.repository";
import { buildCQLQuery, isNotFoundError } from "./utils.repository";

/**
 * Implementation of PageRepository using Confluence HTTP client
 */
export class PageRepositoryImpl implements PageRepository {
  constructor(private httpClient: ConfluenceHttpClient) {}

  async findById(
    id: PageId,
    options?: { includeContent?: boolean; expand?: string },
  ): Promise<Page | null> {
    try {
      const params: Record<string, string | boolean> = {};

      if (options?.includeContent !== false) {
        params["body-format"] = "storage";
      }

      if (options?.expand) {
        params.expand = options.expand;
      }

      const response =
        await this.httpClient.sendRequest<ConfluencePageResponse>({
          method: "GET",
          url: `/pages/${id.value}`,
          params,
        });

      return mapToPage(response);
    } catch (error) {
      // If it's a 404, return null instead of throwing
      if (isNotFoundError(error)) {
        return null;
      }

      throw new PageRepositoryError(
        `Failed to retrieve page by ID: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async findByTitle(spaceId: string, title: PageTitle): Promise<Page | null> {
    try {
      // Use CQL search to find pages by title in a specific space
      // This is more reliable with the v1 API
      const cqlQuery = `title = "${title.value}" AND space = ${spaceId}`;

      const response =
        await this.httpClient.sendRequest<ConfluenceSearchResponse>({
          method: "GET",
          url: "/search",
          params: {
            cql: cqlQuery,
            limit: 1,
          },
        });

      if (response.results.length === 0) {
        return null;
      }

      // Convert search result to page data format using mapper
      const searchResult = response.results[0];
      const pageData = mapSearchResultToPageData(searchResult, spaceId);

      return mapToPage(pageData);
    } catch (error) {
      // If it's a 404 or no results, return null instead of throwing
      if (isNotFoundError(error)) {
        return null;
      }

      throw new PageRepositoryError(
        `Failed to find page by title: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async findBySpaceId(
    spaceId: string,
    options?: { limit?: number; start?: number },
  ): Promise<{ pages: Page[]; pagination: PaginationInfo }> {
    try {
      const params: Record<string, string | number> = {
        "space-id": spaceId,
      };

      if (options?.limit) {
        params.limit = options.limit;
      }

      if (options?.start) {
        params.cursor = options.start.toString();
      }

      const response =
        await this.httpClient.sendRequest<ConfluencePagesResponse>({
          method: "GET",
          url: "/pages",
          params,
        });

      const pages = response.results.map((pageData) => mapToPage(pageData));
      const pagination = mapToPagination(response);

      return { pages, pagination };
    } catch (error) {
      throw new PageRepositoryError(
        `Failed to retrieve pages by space: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async findChildren(
    parentId: PageId,
    options?: { limit?: number; start?: number },
  ): Promise<{ pages: PageSummary[]; pagination: PaginationInfo }> {
    try {
      const params: Record<string, string | number> = {
        "parent-id": parentId.value,
      };

      if (options?.limit) {
        params.limit = options.limit;
      }

      if (options?.start) {
        params.cursor = options.start.toString();
      }

      const response =
        await this.httpClient.sendRequest<ConfluencePagesResponse>({
          method: "GET",
          url: "/pages",
          params,
        });

      const pages = response.results.map((pageData) =>
        mapToPageSummary(pageData),
      );
      const pagination = mapToPagination(response);

      return { pages, pagination };
    } catch (error) {
      throw new PageRepositoryError(
        `Failed to retrieve child pages: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async search(
    query: SearchPagesRequest,
  ): Promise<{ pages: PageSummary[]; pagination: PaginationInfo }> {
    try {
      const params: Record<string, string | number> = {
        cql: buildCQLQuery(query),
      };

      if (query.limit) {
        params.limit = query.limit;
      }

      if (query.start) {
        params.start = query.start;
      }

      const response =
        await this.httpClient.sendRequest<ConfluenceSearchResponse>({
          method: "GET",
          url: "/search",
          params,
        });

      const pages = response.results
        .filter(
          (result) =>
            result.content.type === "page" ||
            result.content.type === "blogpost",
        )
        .map((result) => mapSearchResultToPageSummary(result));

      const pagination: PaginationInfo = {
        start: response.start || 0,
        limit: response.limit || 25,
        size: pages.length,
        hasMore: response.size === (response.limit || 25),
        total: response.totalSize,
      };

      return { pages, pagination };
    } catch (error) {
      throw new PageRepositoryError(
        `Failed to search pages: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async create(request: CreatePageRequest): Promise<Page> {
    try {
      const response =
        await this.httpClient.sendRequest<ConfluenceV1ContentResponse>({
          method: "POST",
          url: "/content",
          data: mapCreateRequest(request),
        });

      // Convert v1 API response to our expected format, then map to Page
      const pageData = mapV1ContentResponseToPageData(response);
      return mapToPage(pageData);
    } catch (error) {
      throw new PageRepositoryError(
        `Failed to create page: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async update(id: PageId, updates: UpdatePageRequest): Promise<Page> {
    try {
      return await this.performUpdate(id, updates);
    } catch (error) {
      if (this.isVersionConflictError(error)) {
        // Auto-recover by fetching latest version and retrying
        return await this.updateWithVersionRefresh(id, updates);
      }
      throw error;
    }
  }

  /**
   * Perform the actual update operation
   */
  private async performUpdate(
    id: PageId,
    updates: UpdatePageRequest,
  ): Promise<Page> {
    try {
      const response =
        await this.httpClient.sendRequest<ConfluencePageResponse>({
          method: "PUT",
          url: `/pages/${id.value}`,
          data: mapUpdateRequest(updates),
        });

      return mapToPage(response);
    } catch (error) {
      // Let version conflicts bubble up for special handling
      if (this.isVersionConflictError(error)) {
        throw error;
      }

      throw new PageRepositoryError(
        `Failed to update page: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  /**
   * Handle version conflicts by refreshing version and retrying
   */
  private async updateWithVersionRefresh(
    id: PageId,
    updates: UpdatePageRequest,
    maxRetries = 3,
  ): Promise<Page> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Fetch the latest page version
        const currentPage = await this.findById(id, { includeContent: false });

        if (!currentPage) {
          throw new PageRepositoryError(
            `Page not found during version refresh: ${id.value}`,
          );
        }

        // Update the request with the current version
        const updatedRequest: UpdatePageRequest = {
          ...updates,
          versionNumber: currentPage.version.number,
        };

        // Attempt the update with refreshed version
        return await this.performUpdate(id, updatedRequest);
      } catch (error) {
        if (this.isVersionConflictError(error) && attempt < maxRetries) {
          // Wait a bit before retrying to allow any background processes to complete
          await this.delay(1000 * attempt);
          continue;
        }

        // If it's the last attempt or not a version conflict, throw the error
        throw new PageRepositoryError(
          `Failed to update page after ${attempt} attempts with version refresh: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          error,
        );
      }
    }

    throw new PageRepositoryError(
      `Failed to update page after ${maxRetries} version refresh attempts`,
    );
  }

  /**
   * Check if an error is a version conflict error
   */
  private isVersionConflictError(error: unknown): boolean {
    return error instanceof VersionConflictError;
  }

  /**
   * Create a delay for retry mechanisms
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async delete(id: PageId): Promise<void> {
    try {
      await this.httpClient.sendRequest<void>({
        method: "DELETE",
        url: `/pages/${id.value}`,
      });
    } catch (error) {
      throw new PageRepositoryError(
        `Failed to delete page: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async exists(id: PageId): Promise<boolean> {
    try {
      const page = await this.findById(id);
      return page !== null;
    } catch (error) {
      throw new PageRepositoryError(
        `Failed to check page existence: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async getVersion(id: PageId): Promise<PageVersion> {
    try {
      const page = await this.findById(id);
      if (!page) {
        throw new PageRepositoryError(`Page not found: ${id.value}`);
      }
      return page.version;
    } catch (error) {
      throw new PageRepositoryError(
        `Failed to get page version: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async getCommentCount(id: PageId): Promise<number> {
    try {
      const response =
        await this.httpClient.sendRequest<ConfluenceCommentsResponse>({
          method: "GET",
          url: `/pages/${id.value}/comments`,
          params: { limit: 1 },
        });

      return response.size || 0;
    } catch (error) {
      // If comments endpoint fails, return 0 instead of throwing
      if (isNotFoundError(error)) {
        return 0;
      }

      throw new PageRepositoryError(
        `Failed to get comment count: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }
}
