import type { ConfluenceHttpClient } from "@features/confluence/client/http";
import { PageRepositoryError } from "@features/confluence/shared/validators";
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
import { createPage as createPageFactory, createPageSummary } from "../models";

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

      return this.mapToPage(response);
    } catch (error) {
      // If it's a 404, return null instead of throwing
      if (this.isNotFoundError(error)) {
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
      // Search for pages with the exact title in the specified space
      const response =
        await this.httpClient.sendRequest<ConfluencePagesResponse>({
          method: "GET",
          url: "/pages",
          params: {
            "space-id": spaceId,
            title: title.value,
            limit: 1,
          },
        });

      if (response.results.length === 0) {
        return null;
      }

      return this.mapToPage(response.results[0]);
    } catch (error) {
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

      const pages = response.results.map((pageData) =>
        this.mapToPage(pageData),
      );
      const pagination = this.mapToPagination(response);

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
        this.mapToPageSummary(pageData),
      );
      const pagination = this.mapToPagination(response);

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
        cql: this.buildCQLQuery(query),
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
        .map((result) => this.mapSearchResultToPageSummary(result));

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
        await this.httpClient.sendRequest<ConfluencePageResponse>({
          method: "POST",
          url: "/pages",
          data: this.mapCreateRequest(request),
        });

      return this.mapToPage(response);
    } catch (error) {
      throw new PageRepositoryError(
        `Failed to create page: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async update(id: PageId, updates: UpdatePageRequest): Promise<Page> {
    try {
      const response =
        await this.httpClient.sendRequest<ConfluencePageResponse>({
          method: "PUT",
          url: `/pages/${id.value}`,
          data: this.mapUpdateRequest(updates),
        });

      return this.mapToPage(response);
    } catch (error) {
      throw new PageRepositoryError(
        `Failed to update page: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
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
      if (this.isNotFoundError(error)) {
        return 0;
      }

      throw new PageRepositoryError(
        `Failed to get comment count: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  /**
   * Private helper methods
   */
  private buildCQLQuery(query: SearchPagesRequest): string {
    let cql = `text ~ "${query.query}"`;

    if (query.spaceKey) {
      cql += ` AND space.key = "${query.spaceKey}"`;
    }

    if (query.type) {
      cql += ` AND type = "${query.type}"`;
    }

    // Add ordering
    if (query.orderBy) {
      switch (query.orderBy) {
        case "created":
          cql += " ORDER BY created DESC";
          break;
        case "modified":
          cql += " ORDER BY lastModified DESC";
          break;
        case "title":
          cql += " ORDER BY title ASC";
          break;
        default:
          // relevance is default, no ORDER BY needed
          break;
      }
    }

    return cql;
  }

  private mapToPage(pageData: ConfluencePageData): Page {
    return createPageFactory({
      id: pageData.id,
      type: pageData.type as "page" | "blogpost",
      status: pageData.status as "current" | "draft" | "trashed" | "deleted",
      title: pageData.title,
      spaceId: pageData.spaceId,
      parentId: pageData.parentId,
      authorId: pageData.authorId,
      createdAt: pageData.createdAt,
      updatedAt: pageData.version.createdAt,
      version: {
        number: pageData.version.number,
        message: pageData.version.message,
        createdAt: pageData.version.createdAt,
        authorId: pageData.version.authorId,
      },
      body: pageData.body,
      links: {
        self: pageData._links.self || "",
        webui: pageData._links.webui || "",
        editui: pageData._links.editui || "",
        tinyui: pageData._links.tinyui,
      },
      permissions: this.mapPermissions(),
      metadata: this.mapMetadata(pageData),
    });
  }

  private mapToPageSummary(pageData: ConfluencePageData): PageSummary {
    return createPageSummary({
      id: pageData.id,
      title: pageData.title,
      status: pageData.status as "current" | "draft" | "trashed" | "deleted",
      spaceId: pageData.spaceId,
      authorId: pageData.authorId,
      createdAt: pageData.createdAt,
      updatedAt: pageData.version.createdAt,
      version: {
        number: pageData.version.number,
        createdAt: pageData.version.createdAt,
      },
      links: {
        webui: pageData._links.webui || "",
      },
    });
  }

  private mapSearchResultToPageSummary(
    result: ConfluenceSearchResult,
  ): PageSummary {
    return createPageSummary({
      id: result.content.id,
      title: result.content.title,
      status: result.content.status as
        | "current"
        | "draft"
        | "trashed"
        | "deleted",
      spaceId: result.content.spaceId || "",
      authorId: result.content.authorId,
      createdAt: result.content.createdAt,
      updatedAt: result.content.version.createdAt,
      version: {
        number: result.content.version.number,
        createdAt: result.content.version.createdAt,
      },
      links: {
        webui: result.content._links.webui || "",
      },
    });
  }

  private mapToPagination(
    response: ConfluencePagesResponse | ConfluenceSearchResponse,
  ): PaginationInfo {
    return {
      start: response.start || 0,
      limit: response.limit || 25,
      size: response.size || response.results.length,
      hasMore: response.size === (response.limit || 25),
      total: response.totalSize,
    };
  }

  private mapPermissions(): Page["permissions"] {
    // Default permissions - would need actual permission data from API
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      canComment: true,
      canRestrict: false,
    };
  }

  private mapMetadata(pageData: ConfluencePageData): Page["metadata"] {
    return {
      labels: pageData.labels || [],
      properties: pageData.properties || {},
      restrictions: {
        read: [],
        update: [],
      },
    };
  }

  private mapCreateRequest(request: CreatePageRequest): unknown {
    const data: Record<string, unknown> = {
      spaceId: request.spaceId,
      title: request.title,
      body: {
        storage: {
          value: request.content,
          representation: request.contentFormat || "storage",
        },
      },
      status: request.status || "current",
    };

    if (request.parentPageId) {
      data.parentId = request.parentPageId;
    }

    return data;
  }

  private mapUpdateRequest(updates: UpdatePageRequest): unknown {
    const data: Record<string, unknown> = {
      id: updates.pageId,
      type: "page",
      version: {
        number: updates.versionNumber + 1,
        message: updates.versionMessage,
      },
    };

    if (updates.title) {
      data.title = updates.title;
    }

    if (updates.content) {
      data.body = {
        storage: {
          value: updates.content,
          representation: updates.contentFormat || "storage",
        },
      };
    }

    if (updates.status) {
      data.status = updates.status;
    }

    return data;
  }

  private isNotFoundError(error: unknown): boolean {
    if (error && typeof error === "object" && "status" in error) {
      return (error as { status: number }).status === 404;
    }
    if (error instanceof Error) {
      return (
        error.message.includes("404") || error.message.includes("not found")
      );
    }
    return false;
  }
}

/**
 * Type definitions for Confluence API responses
 */
interface ConfluencePagesResponse {
  results: ConfluencePageData[];
  start?: number;
  limit?: number;
  size: number;
  totalSize?: number;
  _links: {
    self: string;
    next?: string;
    prev?: string;
  };
}

interface ConfluencePageResponse extends ConfluencePageData {}

interface ConfluencePageData {
  id: string;
  type: string;
  status: string;
  title: string;
  spaceId: string;
  parentId?: string;
  authorId: string;
  createdAt: string;
  version: {
    number: number;
    message?: string;
    createdAt: string;
    authorId: string;
  };
  body?: {
    storage?: {
      value: string;
      representation: "storage";
    };
    atlas_doc_format?: {
      value: string;
      representation: "atlas_doc_format";
    };
  };
  _links: {
    self?: string;
    webui?: string;
    editui?: string;
    tinyui?: string;
  };
  labels?: string[];
  properties?: Record<string, unknown>;
}

interface ConfluenceSearchResponse {
  results: ConfluenceSearchResult[];
  start?: number;
  limit?: number;
  size: number;
  totalSize?: number;
  _links: {
    self: string;
    next?: string;
    prev?: string;
  };
}

interface ConfluenceSearchResult {
  content: {
    id: string;
    type: string;
    status: string;
    title: string;
    spaceId?: string;
    authorId: string;
    createdAt: string;
    version: {
      number: number;
      createdAt: string;
    };
    _links: {
      webui?: string;
      self?: string;
    };
  };
  excerpt?: string;
  score: number;
}

interface ConfluenceCommentsResponse {
  results: unknown[];
  start?: number;
  limit?: number;
  size: number;
  totalSize?: number;
}
