import { beforeEach, describe, expect, mock, test } from "bun:test";
import { SearchContentHandler } from "@features/confluence/domains/search/handlers/search-content.handler";
import type { SearchContentRequest } from "@features/confluence/domains/search/models";
import type { SearchContentUseCase } from "@features/confluence/domains/search/use-cases";
import { DomainError } from "@features/confluence/shared/validators";
import { SearchMockFactory } from "@test/__mocks__/v2/domains/search/search-mock-factory";

describe("SearchContentHandler", () => {
  let handler: SearchContentHandler;
  let mockUseCase: SearchContentUseCase;
  let mockExecute: ReturnType<typeof mock>;
  let searchMockFactory: SearchMockFactory;

  beforeEach(() => {
    searchMockFactory = new SearchMockFactory();
    mockExecute = mock(() => Promise.resolve());
    mockUseCase = {
      execute: mockExecute,
    } as unknown as SearchContentUseCase;
    handler = new SearchContentHandler(mockUseCase);
  });

  describe("Constructor", () => {
    test("should initialize with injected use case", () => {
      expect(handler).toBeInstanceOf(SearchContentHandler);
    });
  });

  describe("Parameter Validation", () => {
    test("should throw DomainError when request is invalid", async () => {
      const invalidRequest = {} as SearchContentRequest;

      await expect(handler.handle(invalidRequest)).rejects.toThrow(DomainError);
    });

    test("should throw DomainError when query is empty", async () => {
      const request = searchMockFactory.createSearchContentRequest({
        query: "",
      });

      await expect(handler.handle(request)).rejects.toThrow(DomainError);
    });

    test("should accept valid search content request", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      const mockResponse = searchMockFactory.createSearchContentResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result).toBe(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should accept search request with all parameters", async () => {
      const request = searchMockFactory.createSearchContentRequest({
        query: "confluence documentation",
        spaceKey: "DOCS",
        type: "page",
        limit: 50,
        start: 10,
        orderBy: "relevance",
        includeArchivedSpaces: false,
      });
      const mockResponse = searchMockFactory.createSearchContentResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result).toBe(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should throw DomainError for invalid limit", async () => {
      const request = searchMockFactory.createSearchContentRequest({
        limit: 0,
      });

      await expect(handler.handle(request)).rejects.toThrow(DomainError);
    });

    test("should throw DomainError for invalid start", async () => {
      const request = searchMockFactory.createSearchContentRequest({
        start: -1,
      });

      await expect(handler.handle(request)).rejects.toThrow(DomainError);
    });
  });

  describe("Use Case Integration", () => {
    test("should call use case with correct parameters", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      const mockResponse = searchMockFactory.createSearchContentResponse();
      mockExecute.mockResolvedValue(mockResponse);

      await handler.handle(request);

      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should return response from use case", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      const mockResponse = searchMockFactory.createSearchContentResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result).toBe(mockResponse);
    });

    test("should handle use case errors and wrap them in DomainError", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      const originalError = new Error("Search service unavailable");
      mockExecute.mockRejectedValue(originalError);

      try {
        await handler.handle(request);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
        expect((error as DomainError).message).toContain(
          "Search service unavailable",
        );
      }
    });

    test("should preserve DomainError from use case", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      const domainError = new DomainError("Invalid search parameters");
      mockExecute.mockRejectedValue(domainError);

      await expect(handler.handle(request)).rejects.toThrow(
        "Invalid search parameters",
      );
    });

    test("should handle unknown errors gracefully", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      mockExecute.mockRejectedValue("Unknown error");

      await expect(handler.handle(request)).rejects.toThrow(DomainError);
    });
  });

  describe("Response Structure", () => {
    test("should return SearchContentResponse object", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      const mockResponse = searchMockFactory.createSearchContentResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result).toHaveProperty("results");
      expect(result).toHaveProperty("pagination");
      expect(result).toHaveProperty("context");
      expect(result).toHaveProperty("statistics");
      expect(Array.isArray(result.results)).toBe(true);
    });

    test("should handle empty search results", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      const mockResponse = searchMockFactory.createSearchContentResponse({
        results: [],
        pagination: searchMockFactory.createPaginationInfo({ total: 0 }),
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.results).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    test("should handle single search result", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      const mockResults = searchMockFactory.createSearchResults(1);
      const mockResponse = searchMockFactory.createSearchContentResponse({
        results: mockResults,
        pagination: searchMockFactory.createPaginationInfo({ total: 1 }),
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.results).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    test("should handle multiple search results", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      const mockResults = searchMockFactory.createSearchResults(10);
      const mockResponse = searchMockFactory.createSearchContentResponse({
        results: mockResults,
        pagination: searchMockFactory.createPaginationInfo({ total: 10 }),
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.results).toHaveLength(10);
      expect(result.pagination.total).toBe(10);
    });
  });

  describe("Edge Cases", () => {
    test("should handle different content types", async () => {
      const contentTypes = [
        "page",
        "blogpost",
        "comment",
        "attachment",
      ] as const;

      for (const type of contentTypes) {
        const request = searchMockFactory.createSearchContentRequest({ type });
        const mockResponse = searchMockFactory.createSearchContentResponse();
        mockExecute.mockResolvedValue(mockResponse);

        const result = await handler.handle(request);

        expect(result).toBe(mockResponse);
        expect(mockExecute).toHaveBeenCalledWith(request);
      }
    });

    test("should handle different order by options", async () => {
      const orderByOptions = [
        "relevance",
        "created",
        "modified",
        "title",
      ] as const;

      for (const orderBy of orderByOptions) {
        const request = searchMockFactory.createSearchContentRequest({
          orderBy,
        });
        const mockResponse = searchMockFactory.createSearchContentResponse();
        mockExecute.mockResolvedValue(mockResponse);

        const result = await handler.handle(request);

        expect(result).toBe(mockResponse);
        expect(mockExecute).toHaveBeenCalledWith(request);
      }
    });

    test("should handle various pagination options", async () => {
      const paginationOptions = [
        { limit: 10, start: 0 },
        { limit: 50, start: 25 },
        { limit: 100, start: 200 },
        { limit: 250, start: 500 },
      ];

      for (const options of paginationOptions) {
        const request = searchMockFactory.createSearchContentRequest(options);
        const mockResponse = searchMockFactory.createSearchContentResponse();
        mockExecute.mockResolvedValue(mockResponse);

        const result = await handler.handle(request);

        expect(result).toBe(mockResponse);
        expect(mockExecute).toHaveBeenCalledWith(request);
      }
    });

    test("should handle space-specific searches", async () => {
      const spaceKeys = ["DOCS", "DEV", "MARKETING", "SUPPORT"];

      for (const spaceKey of spaceKeys) {
        const request = searchMockFactory.createSearchContentRequest({
          spaceKey,
        });
        const mockResponse = searchMockFactory.createSearchContentResponse();
        mockExecute.mockResolvedValue(mockResponse);

        const result = await handler.handle(request);

        expect(result).toBe(mockResponse);
        expect(mockExecute).toHaveBeenCalledWith(request);
      }
    });

    test("should handle archived spaces option", async () => {
      const archivedOptions = [true, false];

      for (const includeArchivedSpaces of archivedOptions) {
        const request = searchMockFactory.createSearchContentRequest({
          includeArchivedSpaces,
        });
        const mockResponse = searchMockFactory.createSearchContentResponse();
        mockExecute.mockResolvedValue(mockResponse);

        const result = await handler.handle(request);

        expect(result).toBe(mockResponse);
        expect(mockExecute).toHaveBeenCalledWith(request);
      }
    });
  });

  describe("Error Handling", () => {
    test("should preserve error context from use case", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      const originalError = new Error("Search index unavailable");
      mockExecute.mockRejectedValue(originalError);

      try {
        await handler.handle(request);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
        expect((error as DomainError).message).toContain(
          "Search index unavailable",
        );
      }
    });

    test("should handle search timeout error", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      const timeoutError = new Error("Search request timed out");
      mockExecute.mockRejectedValue(timeoutError);

      await expect(handler.handle(request)).rejects.toThrow(
        "Search request timed out",
      );
    });

    test("should handle permission denied error", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      const permissionError = new Error("Permission denied");
      mockExecute.mockRejectedValue(permissionError);

      await expect(handler.handle(request)).rejects.toThrow(
        "Permission denied",
      );
    });

    test("should handle space not found error", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      const spaceError = new Error("Space not found");
      mockExecute.mockRejectedValue(spaceError);

      await expect(handler.handle(request)).rejects.toThrow("Space not found");
    });

    test("should validate handler flow with error", async () => {
      const request = searchMockFactory.createSearchContentRequest();
      const error = new Error("Internal server error");
      mockExecute.mockRejectedValue(error);

      await expect(handler.handle(request)).rejects.toThrow();
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });
  });

  describe("Business Logic", () => {
    test("should handle text search", async () => {
      const request = searchMockFactory.createSearchContentRequest({
        query: "confluence documentation",
      });
      const mockResponse = searchMockFactory.createSearchContentResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result).toBe(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should handle space-specific search", async () => {
      const request = searchMockFactory.createSearchContentRequest({
        query: "API documentation",
        spaceKey: "DEV",
      });
      const mockResponse = searchMockFactory.createSearchContentResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result).toBe(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should handle type-specific search", async () => {
      const request = searchMockFactory.createSearchContentRequest({
        query: "release notes",
        type: "blogpost",
      });
      const mockResponse = searchMockFactory.createSearchContentResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result).toBe(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should handle paginated search", async () => {
      const request = searchMockFactory.createSearchContentRequest({
        query: "documentation",
        limit: 25,
        start: 50,
      });
      const mockResponse = searchMockFactory.createSearchContentResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result).toBe(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should handle search with no results", async () => {
      const request = searchMockFactory.createSearchContentRequest({
        query: "nonexistent content",
      });
      const mockResponse = searchMockFactory.createSearchContentResponse({
        results: [],
        pagination: searchMockFactory.createPaginationInfo({ total: 0 }),
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.results).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    test("should handle search with many results", async () => {
      const request = searchMockFactory.createSearchContentRequest({
        query: "documentation",
        limit: 100,
      });
      const mockResults = searchMockFactory.createSearchResults(100);
      const mockResponse = searchMockFactory.createSearchContentResponse({
        results: mockResults,
        pagination: searchMockFactory.createPaginationInfo({
          total: 1000,
          hasMore: true,
        }),
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.results).toHaveLength(100);
      expect(result.pagination.total).toBe(1000);
      expect(result.pagination.hasMore).toBe(true);
    });
  });
});
