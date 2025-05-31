import type {
  Space,
  Page,
  SearchResult,
  Comment,
  PaginationInfo,
} from "./models.types";
import type {
  ConfluenceApiSpacesResponse,
  ConfluenceApiSearchResponse,
  ConfluenceApiCommentsResponse,
} from "./responses.types";
import type {
  ConfluenceConfig,
  ConfluenceAuthHeaders,
} from "./config.types";
import { ConfluenceHttpClientFactory } from "./http-client.factory";
import { ConfluenceOperationRouter, type ConfluenceOperation } from "./operation.router";
import { validateConfluenceConfig } from "./client-config.validator";
import { createPaginationInfo } from "./pagination.helper";
import {
  buildGetPageParams,
  buildSearchParams,
  buildGetCommentsParams,
  buildGetSpacesParams,
} from "./request.builder";

export interface CreatePageData {
  spaceId: string;
  title: string;
  body: {
    storage: {
      value: string;
      representation: string;
    };
  };
  status?: string;
  parentId?: string;
}

export interface UpdatePageData {
  id: string;
  type: string;
  title: string;
  status: string;
  version: {
    number: number;
    message?: string;
  };
  body?: {
    storage: {
      value: string;
      representation: string;
    };
  };
}

export interface ConfluenceApiClient {
  getSpaces(
    options?: GetSpacesOptions,
  ): Promise<{ spaces: Space[]; pagination: PaginationInfo }>;
  getPage(pageId: string, options?: GetPageOptions): Promise<Page>;
  createPage(data: CreatePageData): Promise<Page>;
  updatePage(pageId: string, data: UpdatePageData): Promise<Page>;
  searchPages(
    query: string,
    options?: SearchPagesOptions,
  ): Promise<{
    results: SearchResult[];
    pagination: PaginationInfo;
    totalSize: number;
    searchDuration: number;
  }>;
  getPageComments(
    pageId: string,
    options?: GetPageCommentsOptions,
  ): Promise<{ comments: Comment[]; pagination: PaginationInfo }>;
}

export interface GetSpacesOptions {
  type?: "global" | "personal";
  limit?: number;
  start?: number;
}

export interface GetPageOptions {
  includeContent?: boolean;
  expand?: string[];
}

export interface SearchPagesOptions {
  spaceKey?: string;
  type?: "page" | "blogpost";
  limit?: number;
  start?: number;
  orderBy?: "relevance" | "created" | "modified" | "title";
}

export interface GetPageCommentsOptions {
  limit?: number;
  start?: number;
  orderBy?: "created" | "updated";
}

/**
 * Main Confluence API client
 * Orchestrates HTTP clients and operations with clean separation of concerns
 */
export class ConfluenceClient implements ConfluenceApiClient {
  private readonly httpClientFactory: ConfluenceHttpClientFactory;
  private readonly operationRouter: ConfluenceOperationRouter;

  constructor(config: ConfluenceConfig) {
    validateConfluenceConfig(config);
    this.httpClientFactory = new ConfluenceHttpClientFactory(config);
    this.operationRouter = new ConfluenceOperationRouter();
  }

  /**
   * Get the appropriate HTTP client for a specific operation
   */
  private getHttpClientForOperation(operation: ConfluenceOperation) {
    const version = this.operationRouter.getVersionForOperation(operation);
    return version === "v1" 
      ? this.httpClientFactory.createV1Client()
      : this.httpClientFactory.createV2Client();
  }

  async getSpaces(
    options: GetSpacesOptions = {},
  ): Promise<{ spaces: Space[]; pagination: PaginationInfo }> {
    const httpClient = this.getHttpClientForOperation("getSpaces");
    const params = buildGetSpacesParams(options);

    const response = await httpClient.sendRequest<ConfluenceApiSpacesResponse>({
      method: "GET",
      url: "spaces",
      headers: {} as ConfluenceAuthHeaders,
      params,
    });

    return {
      spaces: response.results,
      pagination: createPaginationInfo(response),
    };
  }

  async getPage(pageId: string, options: GetPageOptions = {}): Promise<Page> {
    const httpClient = this.getHttpClientForOperation("getPage");
    const params = buildGetPageParams(options);

    return await httpClient.sendRequest<Page>({
      method: "GET",
      url: `pages/${pageId}`,
      headers: {} as ConfluenceAuthHeaders,
      params,
    });
  }

  async createPage(data: CreatePageData): Promise<Page> {
    const httpClient = this.getHttpClientForOperation("createPage");
    
    return await httpClient.sendRequest<Page>({
      method: "POST",
      url: "pages",
      headers: {} as ConfluenceAuthHeaders,
      data: data,
    });
  }

  async updatePage(pageId: string, data: UpdatePageData): Promise<Page> {
    const httpClient = this.getHttpClientForOperation("updatePage");
    
    return await httpClient.sendRequest<Page>({
      method: "PUT",
      url: `pages/${pageId}`,
      headers: {} as ConfluenceAuthHeaders,
      data: data,
    });
  }

  async searchPages(
    query: string,
    options: SearchPagesOptions = {},
  ): Promise<{
    results: SearchResult[];
    pagination: PaginationInfo;
    totalSize: number;
    searchDuration: number;
  }> {
    const httpClient = this.getHttpClientForOperation("search");
    const params = buildSearchParams(query, options);

    const response = await httpClient.sendRequest<ConfluenceApiSearchResponse>({
      method: "GET",
      url: "search",
      headers: {} as ConfluenceAuthHeaders,
      params,
    });

    return {
      results: response.results,
      pagination: createPaginationInfo(response),
      totalSize: response.totalSize,
      searchDuration: response.searchDuration,
    };
  }

  async getPageComments(
    pageId: string,
    options: GetPageCommentsOptions = {},
  ): Promise<{ comments: Comment[]; pagination: PaginationInfo }> {
    const httpClient = this.getHttpClientForOperation("getPageComments");
    const params = buildGetCommentsParams(options);

    const response = await httpClient.sendRequest<ConfluenceApiCommentsResponse>({
      method: "GET",
      url: `pages/${pageId}/comments`,
      headers: {} as ConfluenceAuthHeaders,
      params,
    });

    return {
      comments: response.results,
      pagination: createPaginationInfo(response),
    };
  }

  /**
   * Get web UI base URL for constructing links
   */
  getWebBaseUrl(): string {
    return this.httpClientFactory.createV2Client().getWebBaseUrl();
  }

  /**
   * Get information about the current API version routing
   * Useful for debugging and monitoring
   */
  getRoutingInfo(): {
    operationDistribution: { v1: number; v2: number };
    v1Operations: ConfluenceOperation[];
    v2Operations: ConfluenceOperation[];
  } {
    return {
      operationDistribution: this.operationRouter.getVersionDistribution(),
      v1Operations: this.operationRouter.getOperationsForVersion("v1"),
      v2Operations: this.operationRouter.getOperationsForVersion("v2"),
    };
  }
}