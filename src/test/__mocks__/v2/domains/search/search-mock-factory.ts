import type {
  AdvancedSearchRequest,
  AdvancedSearchResponse,
  PaginationInfo,
  SearchContentRequest,
  SearchContentResponse,
  SearchContext,
  SearchResult,
  SearchResultContent,
  SearchStatistics,
  SearchSuggestionsResponse,
} from "@features/confluence/domains/search/models";
import {
  CQLQuery,
  SearchQuery,
} from "@features/confluence/domains/search/models";
import { BaseMockFactory, MockDataUtils } from "../../base/base-mock-factory";

export class SearchMockFactory extends BaseMockFactory<SearchResult> {
  /**
   * Required implementation for BaseMockFactory
   */
  create(overrides: Partial<SearchResult> = {}): SearchResult {
    return this.createSearchResult(overrides);
  }

  /**
   * Required implementation for BaseMockFactory
   */
  protected generateRandomData(): Partial<SearchResult> {
    return {
      score: MockDataUtils.randomNumber(1, 100) / 100,
      excerpt: `Random excerpt ${MockDataUtils.generateId()}`,
    };
  }

  /**
   * Create a mock SearchQuery value object
   */
  createSearchQuery(value?: string): SearchQuery {
    return new SearchQuery(value || `test query ${MockDataUtils.generateId()}`);
  }

  /**
   * Create a mock CQLQuery value object
   */
  createCQLQuery(value?: string): CQLQuery {
    return new CQLQuery(value || `text~"test ${MockDataUtils.generateId()}"`);
  }

  /**
   * Create a mock SearchResultContent
   */
  createSearchResultContent(
    overrides: Partial<SearchResultContent> = {},
  ): SearchResultContent {
    const now = new Date();

    return {
      id: MockDataUtils.generateId(),
      type: MockDataUtils.randomChoice([
        "page",
        "blogpost",
        "comment",
        "attachment",
      ] as const),
      status: "current",
      title: `Test Content ${MockDataUtils.generateId()}`,
      spaceId: MockDataUtils.generateId(),
      spaceKey: MockDataUtils.generateKey(),
      spaceName: MockDataUtils.generateName(),
      authorId: MockDataUtils.generateId(),
      authorDisplayName: `Test User ${MockDataUtils.generateId()}`,
      createdAt: now,
      updatedAt: now,
      version: {
        number: 1,
        createdAt: now,
      },
      links: {
        webui: `/spaces/TEST/pages/${MockDataUtils.generateId()}`,
        self: `/api/v2/content/${MockDataUtils.generateId()}`,
        editui: `/pages/edit-v2.action?pageId=${MockDataUtils.generateId()}`,
      },
      ...overrides,
    };
  }

  /**
   * Create a mock SearchResult
   */
  createSearchResult(overrides: Partial<SearchResult> = {}): SearchResult {
    return {
      content: this.createSearchResultContent(),
      excerpt: `This is a test excerpt showing search results ${MockDataUtils.generateId()}`,
      score: MockDataUtils.randomNumber(1, 100) / 100,
      highlights: {
        title: [`Test <mark>highlight</mark> ${MockDataUtils.generateId()}`],
        content: [
          `Content with <mark>highlighted</mark> terms ${MockDataUtils.generateId()}`,
        ],
      },
      ...overrides,
    };
  }

  /**
   * Create a mock SearchContext
   */
  createSearchContext(overrides: Partial<SearchContext> = {}): SearchContext {
    return {
      query: this.createSearchQuery(),
      filters: {
        spaceKey: MockDataUtils.generateKey(),
        contentType: MockDataUtils.randomChoice(["page", "blogpost"] as const),
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          to: new Date(),
        },
        author: MockDataUtils.generateId(),
      },
      sorting: {
        field: MockDataUtils.randomChoice([
          "relevance",
          "created",
          "modified",
          "title",
        ] as const),
        direction: MockDataUtils.randomChoice(["ASC", "DESC"] as const),
      },
      ...overrides,
    };
  }

  /**
   * Create a mock SearchStatistics
   */
  createSearchStatistics(
    overrides: Partial<SearchStatistics> = {},
  ): SearchStatistics {
    const totalResults = MockDataUtils.randomNumber(10, 1000);

    return {
      totalResults,
      searchTime: MockDataUtils.randomNumber(10, 500),
      resultsByType: {
        pages: Math.floor(totalResults * 0.6),
        blogposts: Math.floor(totalResults * 0.3),
        comments: Math.floor(totalResults * 0.08),
        attachments: Math.floor(totalResults * 0.02),
      },
      resultsBySpace: [
        {
          spaceKey: MockDataUtils.generateKey(),
          spaceName: MockDataUtils.generateName(),
          count: Math.floor(totalResults * 0.4),
        },
        {
          spaceKey: MockDataUtils.generateKey(),
          spaceName: MockDataUtils.generateName(),
          count: Math.floor(totalResults * 0.6),
        },
      ],
      ...overrides,
    };
  }

  /**
   * Create multiple search results
   */
  createSearchResults(
    count: number,
    overrides: Partial<SearchResult> = {},
  ): SearchResult[] {
    return Array.from({ length: count }, () =>
      this.createSearchResult(overrides),
    );
  }

  /**
   * Create pagination info
   */
  createPaginationInfo(
    overrides: Partial<PaginationInfo> = {},
  ): PaginationInfo {
    return {
      start: 0,
      limit: 25,
      size: 10,
      hasMore: false,
      total: 10,
      ...overrides,
    };
  }

  /**
   * Create a mock SearchContentRequest
   */
  createSearchContentRequest(
    overrides: Partial<SearchContentRequest> = {},
  ): SearchContentRequest {
    return {
      query: `test query ${MockDataUtils.generateId()}`,
      spaceKey: MockDataUtils.generateKey(),
      type: MockDataUtils.randomChoice([
        "page",
        "blogpost",
        "comment",
        "attachment",
      ] as const),
      limit: 25,
      start: 0,
      orderBy: MockDataUtils.randomChoice([
        "relevance",
        "created",
        "modified",
        "title",
      ] as const),
      includeArchivedSpaces: false,
      ...overrides,
    };
  }

  /**
   * Create a mock AdvancedSearchRequest
   */
  createAdvancedSearchRequest(
    overrides: Partial<AdvancedSearchRequest> = {},
  ): AdvancedSearchRequest {
    return {
      cql: `text~"test ${MockDataUtils.generateId()}"`,
      limit: 25,
      start: 0,
      expand: "content.body.storage",
      ...overrides,
    };
  }

  /**
   * Create a mock SearchContentResponse
   */
  createSearchContentResponse(
    overrides: Partial<SearchContentResponse> = {},
  ): SearchContentResponse {
    const results = this.createSearchResults(5);
    return {
      results,
      pagination: this.createPaginationInfo({ total: results.length }),
      context: this.createSearchContext(),
      statistics: this.createSearchStatistics(),
      ...overrides,
    };
  }

  /**
   * Create a mock AdvancedSearchResponse
   */
  createAdvancedSearchResponse(
    overrides: Partial<AdvancedSearchResponse> = {},
  ): AdvancedSearchResponse {
    const results = this.createSearchResults(5);
    return {
      results,
      pagination: this.createPaginationInfo({ total: results.length }),
      cqlQuery: `text~"test ${MockDataUtils.generateId()}"`,
      statistics: this.createSearchStatistics(),
      ...overrides,
    };
  }

  /**
   * Create a mock SearchSuggestionsResponse
   */
  createSearchSuggestionsResponse(
    overrides: Partial<SearchSuggestionsResponse> = {},
  ): SearchSuggestionsResponse {
    return {
      query: `test query ${MockDataUtils.generateId()}`,
      suggestions: [
        `suggestion 1 ${MockDataUtils.generateId()}`,
        `suggestion 2 ${MockDataUtils.generateId()}`,
        `suggestion 3 ${MockDataUtils.generateId()}`,
      ],
      ...overrides,
    };
  }
}
