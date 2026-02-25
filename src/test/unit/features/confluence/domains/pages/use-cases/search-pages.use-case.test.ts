import { beforeEach, describe, expect, test } from "bun:test";
import type { SearchPagesRequest } from "@features/confluence/domains/pages/models";
import { SearchPagesUseCase } from "@features/confluence/domains/pages/use-cases/search-pages.use-case";
import type {
  SearchRepository,
  SearchResult,
} from "@features/confluence/domains/search/models";
import { PageError } from "@features/confluence/shared/validators";
import { PagesMockFactory } from "@test/__mocks__/v2/domains/pages/pages-mock-factory";

function createMockSearchResult(
  overrides: Partial<{
    id: string;
    title: string;
    status: string;
    spaceId: string;
  }> = {},
): SearchResult {
  return {
    content: {
      id: overrides.id ?? "page-123",
      type: "page",
      status: overrides.status ?? "current",
      title: overrides.title ?? "Test Page",
      spaceId: overrides.spaceId ?? "space-1",
      authorId: "author-1",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
      version: { number: 1, createdAt: new Date("2024-01-01T00:00:00Z") },
      links: { webui: "/test", self: "/api/test" },
    },
    score: 1.0,
  };
}

describe("SearchPagesUseCase", () => {
  let useCase: SearchPagesUseCase;
  let mockSearchRepository: SearchRepository;
  let pagesMockFactory: PagesMockFactory;

  beforeEach(() => {
    pagesMockFactory = new PagesMockFactory();

    mockSearchRepository = {
      searchContent: async () => ({
        results: [],
        pagination: { start: 0, limit: 25, size: 0, hasMore: false },
      }),
      advancedSearch: async () => ({
        results: [],
        pagination: { start: 0, limit: 25, size: 0, hasMore: false },
      }),
      searchInSpace: async () => ({
        results: [],
        pagination: { start: 0, limit: 25, size: 0, hasMore: false },
      }),
      searchByType: async () => ({
        results: [],
        pagination: { start: 0, limit: 25, size: 0, hasMore: false },
      }),
      getSearchSuggestions: async () => [],
    };

    useCase = new SearchPagesUseCase(mockSearchRepository);
  });

  describe("Successful Search", () => {
    test("should search pages successfully", async () => {
      // Arrange
      const request: SearchPagesRequest =
        pagesMockFactory.createSearchPagesRequest();
      const searchResults = [
        createMockSearchResult({ id: "page-1", title: "Page One" }),
        createMockSearchResult({ id: "page-2", title: "Page Two" }),
      ];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 2 });

      mockSearchRepository.searchContent = async () => ({
        results: searchResults,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.start).toBe(pagination.start);
      expect(result.pagination.hasMore).toBe(pagination.hasMore);
      expect(result.query).toBe(request.query);
      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalPages).toBe(2);
    });

    test("should search with empty results", async () => {
      // Arrange
      const request: SearchPagesRequest =
        pagesMockFactory.createSearchPagesRequest();
      const pagination = pagesMockFactory.createPaginationInfo({ total: 0 });

      mockSearchRepository.searchContent = async () => ({
        results: [],
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.statistics.totalPages).toBe(0);
    });

    test("should search with pagination", async () => {
      // Arrange
      const request: SearchPagesRequest = {
        ...pagesMockFactory.createSearchPagesRequest(),
        limit: 10,
        start: 20,
      };
      const searchResults = Array.from({ length: 10 }, (_, i) =>
        createMockSearchResult({ id: `page-${i}` }),
      );
      const pagination = pagesMockFactory.createPaginationInfo({
        total: 100,
        start: 20,
        limit: 10,
        size: 10,
        hasMore: true,
      });

      mockSearchRepository.searchContent = async () => ({
        results: searchResults,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(10);
      expect(result.pagination.start).toBe(20);
      expect(result.pagination.hasMore).toBe(true);
    });

    test("should search in specific space", async () => {
      // Arrange
      const request: SearchPagesRequest = {
        ...pagesMockFactory.createSearchPagesRequest(),
        spaceKey: "TEST",
      };
      const searchResults = [createMockSearchResult()];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 1 });

      mockSearchRepository.searchContent = async () => ({
        results: searchResults,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(1);
      expect(result.statistics.totalPages).toBe(1);
    });

    test("should search with different order", async () => {
      // Arrange
      const request: SearchPagesRequest = {
        ...pagesMockFactory.createSearchPagesRequest(),
        orderBy: "created",
      };
      const searchResults = [createMockSearchResult()];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 1 });

      mockSearchRepository.searchContent = async () => ({
        results: searchResults,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(1);
    });
  });

  describe("Repository Errors", () => {
    test("should wrap repository errors in PageError", async () => {
      // Arrange
      const request: SearchPagesRequest =
        pagesMockFactory.createSearchPagesRequest();
      const repositoryError = new Error("Search service unavailable");

      mockSearchRepository.searchContent = async () => {
        throw repositoryError;
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(PageError);
    });

    test("should preserve error context in PageError", async () => {
      // Arrange
      const request: SearchPagesRequest =
        pagesMockFactory.createSearchPagesRequest();
      const repositoryError = new Error("Search service unavailable");

      mockSearchRepository.searchContent = async () => {
        throw repositoryError;
      };

      // Act & Assert
      try {
        await useCase.execute(request);
      } catch (error) {
        expect(error).toBeInstanceOf(PageError);
        expect((error as PageError).message).toContain(
          "Failed to search pages",
        );
        expect((error as PageError).message).toContain(
          "Search service unavailable",
        );
      }
    });
  });

  describe("Statistics Generation", () => {
    test("should generate statistics for mixed page types", async () => {
      // Arrange
      const request: SearchPagesRequest =
        pagesMockFactory.createSearchPagesRequest();
      const searchResults = [
        createMockSearchResult({ id: "p1", status: "current" }),
        createMockSearchResult({ id: "p2", status: "draft" }),
        createMockSearchResult({ id: "p3", status: "trashed" }),
      ];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 3 });

      mockSearchRepository.searchContent = async () => ({
        results: searchResults,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalPages).toBe(3);
      expect(result.statistics.currentPages).toBe(1);
      expect(result.statistics.draftPages).toBe(1);
      expect(result.statistics.trashedPages).toBe(1);
    });

    test("should handle statistics with no pages", async () => {
      // Arrange
      const request: SearchPagesRequest =
        pagesMockFactory.createSearchPagesRequest();
      const pagination = pagesMockFactory.createPaginationInfo({ total: 0 });

      mockSearchRepository.searchContent = async () => ({
        results: [],
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalPages).toBe(0);
      expect(result.statistics.currentPages).toBe(0);
      expect(result.statistics.draftPages).toBe(0);
      expect(result.statistics.trashedPages).toBe(0);
    });

    test("should handle statistics with large datasets", async () => {
      // Arrange
      const request: SearchPagesRequest =
        pagesMockFactory.createSearchPagesRequest();
      const searchResults = Array.from({ length: 50 }, (_, i) =>
        createMockSearchResult({ id: `page-${i}`, status: "current" }),
      );
      const pagination = pagesMockFactory.createPaginationInfo({ total: 1000 });

      mockSearchRepository.searchContent = async () => ({
        results: searchResults,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalPages).toBe(1000); // Uses pagination total
      expect(result.statistics.currentPages).toBe(50); // From actual results
    });
  });

  describe("Edge Cases", () => {
    test("should handle different query types", async () => {
      // Arrange
      const queries = [
        "simple search",
        'title:"Exact Title"',
        "content:keyword",
        "space:TEST AND title:page",
      ];

      for (const query of queries) {
        const request: SearchPagesRequest = {
          ...pagesMockFactory.createSearchPagesRequest(),
          query,
        };
        const searchResults = [createMockSearchResult()];
        const pagination = pagesMockFactory.createPaginationInfo({ total: 1 });

        mockSearchRepository.searchContent = async () => ({
          results: searchResults,
          pagination,
        });

        // Act
        const result = await useCase.execute(request);

        // Assert
        expect(result).toBeDefined();
        expect(result.query).toBe(query);
      }
    });

    test("should handle special characters in query", async () => {
      // Arrange
      const request: SearchPagesRequest = {
        ...pagesMockFactory.createSearchPagesRequest(),
        query: "search with @#$%^&*() characters",
      };
      const searchResults = [createMockSearchResult()];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 1 });

      mockSearchRepository.searchContent = async () => ({
        results: searchResults,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.query).toContain("@#$%^&*()");
    });

    test("should handle very long queries", async () => {
      // Arrange
      const longQuery = "search ".repeat(100);
      const request: SearchPagesRequest = {
        ...pagesMockFactory.createSearchPagesRequest(),
        query: longQuery,
      };
      const searchResults = [createMockSearchResult()];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 1 });

      mockSearchRepository.searchContent = async () => ({
        results: searchResults,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.query).toBe(longQuery);
    });

    test("should handle different page types in results", async () => {
      // Arrange
      const request: SearchPagesRequest = {
        ...pagesMockFactory.createSearchPagesRequest(),
        type: "page",
      };
      const searchResults = [
        createMockSearchResult({ id: "page-1" }),
        createMockSearchResult({ id: "page-2" }),
      ];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 2 });

      mockSearchRepository.searchContent = async () => ({
        results: searchResults,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(2);
    });
  });

  describe("Business Logic", () => {
    test("should handle search across multiple spaces", async () => {
      // Arrange
      const request: SearchPagesRequest =
        pagesMockFactory.createSearchPagesRequest();
      const searchResults = [
        createMockSearchResult({ id: "p1", spaceId: "SPACE1" }),
        createMockSearchResult({ id: "p2", spaceId: "SPACE2" }),
      ];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 2 });

      mockSearchRepository.searchContent = async () => ({
        results: searchResults,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(2);
      expect(result.pages[0].spaceId).toBe("SPACE1");
      expect(result.pages[1].spaceId).toBe("SPACE2");
    });

    test("should handle search with relevance ordering", async () => {
      // Arrange
      const request: SearchPagesRequest = {
        ...pagesMockFactory.createSearchPagesRequest(),
        orderBy: "relevance",
      };
      const searchResults = [createMockSearchResult()];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 1 });

      mockSearchRepository.searchContent = async () => ({
        results: searchResults,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(1);
    });

    test("should handle search with date ordering", async () => {
      // Arrange
      const request: SearchPagesRequest = {
        ...pagesMockFactory.createSearchPagesRequest(),
        orderBy: "modified",
      };
      const searchResults = [createMockSearchResult()];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 1 });

      mockSearchRepository.searchContent = async () => ({
        results: searchResults,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(1);
    });

    test("should handle search with large result sets", async () => {
      // Arrange
      const request: SearchPagesRequest = {
        ...pagesMockFactory.createSearchPagesRequest(),
        limit: 250,
      };
      const searchResults = Array.from({ length: 250 }, (_, i) =>
        createMockSearchResult({ id: `page-${i}` }),
      );
      const pagination = pagesMockFactory.createPaginationInfo({
        total: 5000,
        size: 250,
        limit: 250,
      });

      mockSearchRepository.searchContent = async () => ({
        results: searchResults,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(250);
      expect(result.statistics.totalPages).toBe(5000);
    });

    test("should handle search with minimal parameters", async () => {
      // Arrange
      const request: SearchPagesRequest = {
        query: "minimal search",
      };
      const searchResults = [createMockSearchResult()];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 1 });

      mockSearchRepository.searchContent = async () => ({
        results: searchResults,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.query).toBe("minimal search");
      expect(result.pages).toHaveLength(1);
    });
  });
});
