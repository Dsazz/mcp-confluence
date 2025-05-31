// Central Mock Registry - Single point of access for all mock factories
import type {
  Comment,
  SearchResult,
  PaginationInfo,
  ResponseMetadata,
} from "../../features/confluence/api/models.types";
import type {
  ConfluenceApiSpacesResponse,
  ConfluenceApiSearchResponse,
} from "../../features/confluence/api/responses.types";
import type { ConfluenceApiMockRegistry } from "./confluence-api.mock.registry";
import { PageMockFactory } from "./page.mock.factory";
import { SpaceMockFactory } from "./space.mock.factory";
import { ConfluenceErrorMockFactory } from "./error.mock.factory";
import type { MockFactory, BuildableMockFactory, MockBuilder } from "./mock-factory.interfaces";

// Simple mock factories for supporting entities
class PaginationMockFactory implements MockFactory<PaginationInfo> {
  create(overrides: Partial<PaginationInfo> = {}): PaginationInfo {
    return {
      limit: 25,
      start: 0,
      size: 10,
      hasMore: false,
      ...overrides,
    };
  }

  createMany(count: number, overrides: Partial<PaginationInfo> = {}): PaginationInfo[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  createWithDefaults(): PaginationInfo {
    return this.create();
  }

  createValid(): PaginationInfo {
    return this.create({ size: 25, hasMore: true });
  }

  createMinimal(): PaginationInfo {
    return this.create({ size: 0, hasMore: false });
  }
}

class ResponseMetadataMockFactory implements MockFactory<ResponseMetadata> {
  create(overrides: Partial<ResponseMetadata> = {}): ResponseMetadata {
    return {
      timestamp: new Date().toISOString(),
      executionTime: Math.random() * 100,
      apiVersion: "v2",
      ...overrides,
    };
  }

  createMany(count: number, overrides: Partial<ResponseMetadata> = {}): ResponseMetadata[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  createWithDefaults(): ResponseMetadata {
    return this.create();
  }

  createValid(): ResponseMetadata {
    return this.create({ executionTime: 50 });
  }

  createMinimal(): ResponseMetadata {
    return this.create();
  }
}

// Mock Builder for SearchResult
class SearchResultMockBuilder implements MockBuilder<SearchResult> {
  private overrides: Partial<SearchResult> = {};

  constructor(private factory: SearchResultMockFactory) {}

  with<K extends keyof SearchResult>(key: K, value: SearchResult[K]): SearchResultMockBuilder {
    this.overrides[key] = value;
    return this;
  }

  withPartial(partial: Partial<SearchResult>): SearchResultMockBuilder {
    this.overrides = { ...this.overrides, ...partial };
    return this;
  }

  withRelated<R>(_relation: string, _factory: { create(): R }): SearchResultMockBuilder {
    return this;
  }

  build(): SearchResult {
    return this.factory.create(this.overrides);
  }
}

class SearchResultMockFactory implements BuildableMockFactory<SearchResult> {
  create(overrides: Partial<SearchResult> = {}): SearchResult {
    const id = Math.random().toString(36).substr(2, 9);
    return {
      content: {
        id,
        type: "page",
        status: "current",
        title: "Search Result Page",
        spaceId: "SPACE1",
        authorId: "user123",
        createdAt: "2024-01-01T00:00:00.000Z",
        version: {
          number: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
        _links: {
          webui: `/spaces/SPACE1/pages/${id}`,
          self: `/wiki/api/v2/pages/${id}`,
        },
        ...overrides.content,
      },
      excerpt: "This is a search result excerpt...",
      score: Math.random(),
      ...overrides,
    };
  }

  createMany(count: number, overrides: Partial<SearchResult> = {}): SearchResult[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        ...overrides,
        content: {
          id: `result-${index + 1}`,
          type: "page" as const,
          status: "current",
          title: `Search Result ${index + 1}`,
          authorId: "user123",
          createdAt: "2024-01-01T00:00:00.000Z",
          version: {
            number: 1,
            createdAt: "2024-01-01T00:00:00.000Z",
          },
          _links: {
            webui: `/spaces/SPACE1/pages/result-${index + 1}`,
            self: `/wiki/api/v2/pages/result-${index + 1}`,
          },
          ...overrides.content,
        },
        score: Math.random(),
      })
    );
  }

  createWithDefaults(): SearchResult {
    return this.create();
  }

  createValid(): SearchResult {
    return this.create({ score: 0.95 });
  }

  createMinimal(): SearchResult {
    return this.create({ excerpt: undefined });
  }

  builder(): SearchResultMockBuilder {
    return new SearchResultMockBuilder(this);
  }
}

// Mock Builder for Comment
class CommentMockBuilder implements MockBuilder<Comment> {
  private overrides: Partial<Comment> = {};

  constructor(private factory: CommentMockFactory) {}

  with<K extends keyof Comment>(key: K, value: Comment[K]): CommentMockBuilder {
    this.overrides[key] = value;
    return this;
  }

  withPartial(partial: Partial<Comment>): CommentMockBuilder {
    this.overrides = { ...this.overrides, ...partial };
    return this;
  }

  withRelated<R>(_relation: string, _factory: { create(): R }): CommentMockBuilder {
    return this;
  }

  build(): Comment {
    return this.factory.create(this.overrides);
  }
}

class CommentMockFactory implements BuildableMockFactory<Comment> {
  create(overrides: Partial<Comment> = {}): Comment {
    return {
      id: Math.random().toString(36).substr(2, 9),
      status: "current",
      title: "Test Comment",
      version: {
        number: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
        authorId: "user123",
      },
      body: {
        storage: {
          value: "<p>This is a test comment</p>",
          representation: "storage",
        },
      },
      _links: {
        self: "/wiki/api/v2/comments/123",
      },
      ...overrides,
    };
  }

  createMany(count: number, overrides: Partial<Comment> = {}): Comment[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        ...overrides,
        title: `Comment ${index + 1}`,
      })
    );
  }

  createWithDefaults(): Comment {
    return this.create();
  }

  createValid(): Comment {
    return this.create({
      body: {
        storage: {
          value: "<p>This is a comprehensive comment with detailed information.</p>",
          representation: "storage",
        },
      },
    });
  }

  createMinimal(): Comment {
    return this.create({ title: undefined });
  }

  builder(): CommentMockBuilder {
    return new CommentMockBuilder(this);
  }
}

// API Response Mock Factories
class ConfluenceApiSpacesResponseMockFactory implements MockFactory<ConfluenceApiSpacesResponse> {
  constructor(private spaceMockFactory: SpaceMockFactory) {}

  create(overrides: Partial<ConfluenceApiSpacesResponse> = {}): ConfluenceApiSpacesResponse {
    const results = overrides.results || this.spaceMockFactory.createMany(3);
    return {
      results,
      start: 0,
      limit: 25,
      size: results.length,
      _links: {
        self: "/wiki/api/v2/spaces",
      },
      ...overrides,
    };
  }

  createMany(count: number, overrides: Partial<ConfluenceApiSpacesResponse> = {}): ConfluenceApiSpacesResponse[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  createWithDefaults(): ConfluenceApiSpacesResponse {
    return this.create();
  }

  createValid(): ConfluenceApiSpacesResponse {
    return this.create({ size: 5 });
  }

  createMinimal(): ConfluenceApiSpacesResponse {
    return this.create({ results: [] });
  }
}

class ConfluenceApiSearchResponseMockFactory implements MockFactory<ConfluenceApiSearchResponse> {
  constructor(private searchResultMockFactory: SearchResultMockFactory) {}

  create(overrides: Partial<ConfluenceApiSearchResponse> = {}): ConfluenceApiSearchResponse {
    const results = overrides.results || this.searchResultMockFactory.createMany(5);
    return {
      results,
      start: 0,
      limit: 25,
      size: results.length,
      totalSize: results.length,
      searchDuration: Math.random() * 100,
      _links: {
        self: "/wiki/api/v2/search",
      },
      ...overrides,
    };
  }

  createMany(count: number, overrides: Partial<ConfluenceApiSearchResponse> = {}): ConfluenceApiSearchResponse[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  createWithDefaults(): ConfluenceApiSearchResponse {
    return this.create();
  }

  createValid(): ConfluenceApiSearchResponse {
    return this.create({ totalSize: 10 });
  }

  createMinimal(): ConfluenceApiSearchResponse {
    return this.create({ results: [] });
  }
}

// Central Mock Registry Implementation
class ConfluenceApiMockRegistryImpl implements ConfluenceApiMockRegistry {
  public readonly pages = new PageMockFactory();
  public readonly spaces = new SpaceMockFactory();
  public readonly searchResults = new SearchResultMockFactory();
  public readonly comments = new CommentMockFactory();
  public readonly pagination = new PaginationMockFactory();
  public readonly metadata = new ResponseMetadataMockFactory();
  public readonly errors = new ConfluenceErrorMockFactory();

  public readonly apiResponses = {
    spaces: new ConfluenceApiSpacesResponseMockFactory(this.spaces),
    search: new ConfluenceApiSearchResponseMockFactory(this.searchResults),
  };

  // Convenience methods for common scenarios
  createPageInSpace(spaceId: string): ReturnType<PageMockFactory['create']> {
    return this.pages.create({ spaceId });
  }

  createPageWithParent(parentId: string): ReturnType<PageMockFactory['create']> {
    return this.pages.create({ parentId });
  }

  createSearchResults(query: string, count: number): ReturnType<SearchResultMockFactory['createMany']> {
    return this.searchResults.createMany(count, {
      content: { 
        id: `search-${Date.now()}`,
        type: "page" as const,
        status: "current",
        title: `Result for "${query}"`,
        authorId: "user123",
        createdAt: "2024-01-01T00:00:00.000Z",
        version: {
          number: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
        _links: {
          webui: "/spaces/SPACE1/pages/search",
          self: "/wiki/api/v2/pages/search",
        },
      },
    });
  }

  createErrorResponse(type: string, context?: Record<string, unknown>): ReturnType<ConfluenceErrorMockFactory['create']> {
    return this.errors.create({ type, context } as Parameters<ConfluenceErrorMockFactory['create']>[0]);
  }
}

// Export the singleton instance
export const mockRegistry = new ConfluenceApiMockRegistryImpl();

// Export individual factories for direct use
export { PageMockFactory } from "./page.mock.factory";
export { SpaceMockFactory } from "./space.mock.factory";
export { ConfluenceErrorMockFactory } from "./error.mock.factory";

// Export types
export type { ConfluenceApiMockRegistry } from "./confluence-api.mock.registry";
export type {
  MockFactory,
  BuildableMockFactory,
  MockBuilder,
  MockScenario,
} from "./mock-factory.interfaces"; 