import { beforeEach, describe, expect, it } from "bun:test";
import type {
  SearchContentRequest,
  SearchRepository,
} from "@features/confluence/domains/search/models";
import { SearchContentUseCase } from "@features/confluence/domains/search/use-cases/search-content.use-case";
import { DomainError } from "@features/confluence/shared/validators";
import { SearchMockFactory } from "@test/__mocks__/v2/domains/search/search-mock-factory";

describe("SearchContentUseCase", () => {
  let useCase: SearchContentUseCase;
  let mockRepository: SearchRepository;
  let mockFactory: SearchMockFactory;

  beforeEach(() => {
    mockFactory = new SearchMockFactory();

    // Create mock repository with all interface methods
    mockRepository = {
      searchContent: async () => ({
        results: [],
        pagination: mockFactory.createPaginationInfo(),
      }),
      advancedSearch: async () => ({
        results: [],
        pagination: mockFactory.createPaginationInfo(),
      }),
      searchInSpace: async () => ({
        results: [],
        pagination: mockFactory.createPaginationInfo(),
      }),
      searchByType: async () => ({
        results: [],
        pagination: mockFactory.createPaginationInfo(),
      }),
      getSearchSuggestions: async () => [],
    };

    useCase = new SearchContentUseCase(mockRepository);
  });

  describe("Successful Search", () => {
    it("should search content successfully", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest({
          query: "test content",
          limit: 10,
          start: 0,
        });

      const mockResults = mockFactory.createSearchResults(3);
      const mockPagination = mockFactory.createPaginationInfo({
        total: 3,
        size: 3,
        hasMore: false,
      });

      mockRepository.searchContent = async () => ({
        results: mockResults,
        pagination: mockPagination,
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.results).toEqual(mockResults);
      expect(response.pagination).toEqual(mockPagination);
      expect(response.context.query.value).toBe("test content");
      expect(response.statistics.totalResults).toBe(3);
    });

    it("should search with empty results", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest({
          query: "nonexistent content",
        });

      mockRepository.searchContent = async () => ({
        results: [],
        pagination: mockFactory.createPaginationInfo({
          total: 0,
          size: 0,
          hasMore: false,
        }),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.results).toEqual([]);
      expect(response.statistics.totalResults).toBe(0);
      expect(response.statistics.resultsByType.pages).toBe(0);
      expect(response.statistics.resultsByType.blogposts).toBe(0);
    });

    it("should search with pagination", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest({
          query: "paginated search",
          limit: 5,
          start: 10,
        });

      const mockResults = mockFactory.createSearchResults(5);
      const mockPagination = mockFactory.createPaginationInfo({
        start: 10,
        limit: 5,
        size: 5,
        total: 50,
        hasMore: true,
      });

      mockRepository.searchContent = async () => ({
        results: mockResults,
        pagination: mockPagination,
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.results).toHaveLength(5);
      expect(response.pagination.start).toBe(10);
      expect(response.pagination.hasMore).toBe(true);
      expect(response.statistics.totalResults).toBe(50);
    });

    it("should search in specific space", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest({
          query: "space content",
          spaceKey: "TEST",
        });

      const mockResults = mockFactory.createSearchResults(2, {
        content: mockFactory.createSearchResultContent({
          spaceKey: "TEST",
          spaceName: "Test Space",
        }),
      });

      mockRepository.searchContent = async () => ({
        results: mockResults,
        pagination: mockFactory.createPaginationInfo({ total: 2 }),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.context.filters.spaceKey).toBe("TEST");
      expect(response.statistics.resultsBySpace).toHaveLength(1);
      expect(response.statistics.resultsBySpace[0].spaceKey).toBe("TEST");
      expect(response.statistics.resultsBySpace[0].count).toBe(2);
    });

    it("should search with content type filter", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest({
          query: "page content",
          type: "page",
        });

      const mockResults = mockFactory.createSearchResults(3, {
        content: mockFactory.createSearchResultContent({ type: "page" }),
      });

      mockRepository.searchContent = async () => ({
        results: mockResults,
        pagination: mockFactory.createPaginationInfo({ total: 3 }),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.context.filters.contentType).toBe("page");
      expect(response.statistics.resultsByType.pages).toBe(3);
      expect(response.statistics.resultsByType.blogposts).toBe(0);
    });

    it("should search with custom ordering", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest({
          query: "ordered content",
          orderBy: "created",
        });

      const mockResults = mockFactory.createSearchResults(2);

      mockRepository.searchContent = async () => ({
        results: mockResults,
        pagination: mockFactory.createPaginationInfo({ total: 2 }),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.context.sorting.field).toBe("created");
      expect(response.context.sorting.direction).toBe("DESC");
    });
  });

  describe("Repository Errors", () => {
    it("should wrap repository errors in DomainError", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest();
      const repositoryError = new Error("Repository connection failed");

      mockRepository.searchContent = async () => {
        throw repositoryError;
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(DomainError);
      await expect(useCase.execute(request)).rejects.toThrow(
        "Failed to search content: Repository connection failed",
      );
    });

    it("should preserve error context in DomainError", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest();
      const repositoryError = new Error("Search index unavailable");

      mockRepository.searchContent = async () => {
        throw repositoryError;
      };

      // Act & Assert
      try {
        await useCase.execute(request);
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
        expect((error as DomainError).message).toContain(
          "Search index unavailable",
        );
      }
    });

    it("should handle unknown errors gracefully", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest();

      mockRepository.searchContent = async () => {
        throw "Unknown error type";
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(DomainError);
      await expect(useCase.execute(request)).rejects.toThrow(
        "Failed to search content: Unknown error",
      );
    });
  });

  describe("Statistics Generation", () => {
    it("should generate statistics for mixed content types", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest();

      const mockResults = [
        mockFactory.createSearchResult({
          content: mockFactory.createSearchResultContent({ type: "page" }),
        }),
        mockFactory.createSearchResult({
          content: mockFactory.createSearchResultContent({ type: "page" }),
        }),
        mockFactory.createSearchResult({
          content: mockFactory.createSearchResultContent({ type: "blogpost" }),
        }),
        mockFactory.createSearchResult({
          content: mockFactory.createSearchResultContent({ type: "comment" }),
        }),
      ];

      mockRepository.searchContent = async () => ({
        results: mockResults,
        pagination: mockFactory.createPaginationInfo({ total: 4 }),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.statistics.resultsByType.pages).toBe(2);
      expect(response.statistics.resultsByType.blogposts).toBe(1);
      expect(response.statistics.resultsByType.comments).toBe(1);
      expect(response.statistics.resultsByType.attachments).toBe(0);
    });

    it("should generate statistics for multiple spaces", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest();

      const mockResults = [
        mockFactory.createSearchResult({
          content: mockFactory.createSearchResultContent({
            spaceKey: "SPACE1",
            spaceName: "Space One",
          }),
        }),
        mockFactory.createSearchResult({
          content: mockFactory.createSearchResultContent({
            spaceKey: "SPACE1",
            spaceName: "Space One",
          }),
        }),
        mockFactory.createSearchResult({
          content: mockFactory.createSearchResultContent({
            spaceKey: "SPACE2",
            spaceName: "Space Two",
          }),
        }),
      ];

      mockRepository.searchContent = async () => ({
        results: mockResults,
        pagination: mockFactory.createPaginationInfo({ total: 3 }),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.statistics.resultsBySpace).toHaveLength(2);

      const space1Stats = response.statistics.resultsBySpace.find(
        (s) => s.spaceKey === "SPACE1",
      );
      const space2Stats = response.statistics.resultsBySpace.find(
        (s) => s.spaceKey === "SPACE2",
      );

      expect(space1Stats?.count).toBe(2);
      expect(space1Stats?.spaceName).toBe("Space One");
      expect(space2Stats?.count).toBe(1);
      expect(space2Stats?.spaceName).toBe("Space Two");
    });

    it("should handle statistics with no content", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest();

      mockRepository.searchContent = async () => ({
        results: [],
        pagination: mockFactory.createPaginationInfo({ total: 0 }),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.statistics.totalResults).toBe(0);
      expect(response.statistics.resultsByType.pages).toBe(0);
      expect(response.statistics.resultsBySpace).toEqual([]);
    });

    it("should handle statistics with large datasets", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest();

      const mockResults = mockFactory.createSearchResults(100, {
        content: mockFactory.createSearchResultContent({ type: "page" }),
      });

      mockRepository.searchContent = async () => ({
        results: mockResults,
        pagination: mockFactory.createPaginationInfo({ total: 1000 }),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.statistics.totalResults).toBe(1000);
      expect(response.statistics.resultsByType.pages).toBe(100);
    });
  });

  describe("Edge Cases", () => {
    it("should handle different query formats", async () => {
      // Arrange
      const queries = [
        "simple query",
        "query with spaces",
        "query-with-dashes",
        "query_with_underscores",
        "query123",
      ];

      for (const query of queries) {
        const request: SearchContentRequest =
          mockFactory.createSearchContentRequest({ query });

        mockRepository.searchContent = async () => ({
          results: [],
          pagination: mockFactory.createPaginationInfo(),
        });

        // Act
        const response = await useCase.execute(request);

        // Assert
        expect(response.context.query.value).toBe(query);
      }
    });

    it("should handle special characters in query", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest({
          query: "query with @#$%^&*() special chars",
        });

      mockRepository.searchContent = async () => ({
        results: [],
        pagination: mockFactory.createPaginationInfo(),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.context.query.value).toBe(
        "query with @#$%^&*() special chars",
      );
    });

    it("should handle very long queries", async () => {
      // Arrange
      const longQuery = "a".repeat(1000);
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest({
          query: longQuery,
        });

      mockRepository.searchContent = async () => ({
        results: [],
        pagination: mockFactory.createPaginationInfo(),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.context.query.value).toBe(longQuery);
    });

    it("should handle content without space information", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest();

      const mockResults = [
        mockFactory.createSearchResult({
          content: mockFactory.createSearchResultContent({
            spaceKey: undefined,
            spaceName: undefined,
          }),
        }),
      ];

      mockRepository.searchContent = async () => ({
        results: mockResults,
        pagination: mockFactory.createPaginationInfo({ total: 1 }),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.statistics.resultsBySpace).toEqual([]);
    });
  });

  describe("Business Logic", () => {
    it("should handle search across multiple content types", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest({
          query: "mixed content search",
        });

      const mockResults = [
        mockFactory.createSearchResult({
          content: mockFactory.createSearchResultContent({ type: "page" }),
        }),
        mockFactory.createSearchResult({
          content: mockFactory.createSearchResultContent({ type: "blogpost" }),
        }),
        mockFactory.createSearchResult({
          content: mockFactory.createSearchResultContent({
            type: "attachment",
          }),
        }),
      ];

      mockRepository.searchContent = async () => ({
        results: mockResults,
        pagination: mockFactory.createPaginationInfo({ total: 3 }),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.results).toHaveLength(3);
      expect(response.statistics.resultsByType.pages).toBe(1);
      expect(response.statistics.resultsByType.blogposts).toBe(1);
      expect(response.statistics.resultsByType.attachments).toBe(1);
    });

    it("should handle search with relevance ordering", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest({
          query: "relevance search",
          orderBy: "relevance",
        });

      const mockResults = mockFactory.createSearchResults(3);

      mockRepository.searchContent = async () => ({
        results: mockResults,
        pagination: mockFactory.createPaginationInfo({ total: 3 }),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.context.sorting.field).toBe("relevance");
      expect(response.context.sorting.direction).toBe("DESC");
    });

    it("should handle search with date ordering", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest({
          query: "date search",
          orderBy: "modified",
        });

      const mockResults = mockFactory.createSearchResults(2);

      mockRepository.searchContent = async () => ({
        results: mockResults,
        pagination: mockFactory.createPaginationInfo({ total: 2 }),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.context.sorting.field).toBe("modified");
      expect(response.context.sorting.direction).toBe("DESC");
    });

    it("should handle search with large result sets", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest({
          query: "large dataset",
          limit: 50,
        });

      const mockResults = mockFactory.createSearchResults(50);

      mockRepository.searchContent = async () => ({
        results: mockResults,
        pagination: mockFactory.createPaginationInfo({
          total: 5000,
          size: 50,
          hasMore: true,
        }),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.results).toHaveLength(50);
      expect(response.statistics.totalResults).toBe(5000);
      expect(response.pagination.hasMore).toBe(true);
    });

    it("should handle search with minimal parameters", async () => {
      // Arrange
      const request: SearchContentRequest =
        mockFactory.createSearchContentRequest({
          query: "minimal search",
          orderBy: undefined, // Explicitly no orderBy to test default
        });

      const mockResults = mockFactory.createSearchResults(1);

      mockRepository.searchContent = async () => ({
        results: mockResults,
        pagination: mockFactory.createPaginationInfo({ total: 1 }),
      });

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.context.query.value).toBe("minimal search");
      expect(response.context.sorting.field).toBe("relevance"); // default when orderBy is undefined
      expect(response.results).toHaveLength(1);
    });
  });
});
