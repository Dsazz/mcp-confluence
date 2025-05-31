import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { ConfluenceClient } from "@features/confluence/api/index";
import type { SearchPagesResponse } from "@features/confluence/api/responses.types";
import { ConfluenceSearchPagesHandler } from "@features/confluence/tools/handlers/search-pages.handler";
import type { SearchPagesParams } from "@features/confluence/tools/tools.types";
import { mockRegistry } from "../../../../../__mocks__/index";

describe("ConfluenceSearchPagesHandler", () => {
  let handler: ConfluenceSearchPagesHandler;
  let mockConfluenceClient: ConfluenceClient;

  beforeEach(() => {
    // Create a mock ConfluenceClient with all required properties
    mockConfluenceClient = {
      getPage: mock(() => Promise.resolve(mockRegistry.pages.create())),
      getPageComments: mock(() =>
        Promise.resolve({
          comments: mockRegistry.comments.createMany(3),
          pagination: mockRegistry.pagination.create(),
        }),
      ),
      getWebBaseUrl: mock(() => "https://test.atlassian.net/wiki"),
      getSpaces: mock(() =>
        Promise.resolve({
          spaces: mockRegistry.spaces.createMany(3),
          pagination: mockRegistry.pagination.create(),
        }),
      ),
      createPage: mock(() => Promise.resolve(mockRegistry.pages.create())),
      updatePage: mock(() => Promise.resolve(mockRegistry.pages.create())),
      searchPages: mock(() =>
        Promise.resolve({
          results: mockRegistry.searchResults.createMany(3),
          pagination: mockRegistry.pagination.create(),
          totalSize: 3,
          searchDuration: 50,
        }),
      ),
      // Required internal properties
      httpClient: {} as object,
      validateConfig: mock(() => {}),
      buildSearchQuery: mock(() => 'text ~ "test"'),
    } as unknown as ConfluenceClient;

    handler = new ConfluenceSearchPagesHandler(mockConfluenceClient);
  });

  describe("Constructor", () => {
    test("should initialize with correct properties", () => {
      expect(handler.feature).toBe("confluence");
      expect(handler.name).toBe("confluence_search_pages");
      expect(handler.description).toBe(
        "Search for pages using CQL (Confluence Query Language)",
      );
    });
  });

  describe("Parameter Validation", () => {
    test("should throw error when params is null", async () => {
      const response = await handler.handle(null);
      expect(response.success).toBe(false);
      expect(response.error).toContain("Parameters are required");
    });

    test("should throw error when params is undefined", async () => {
      const response = await handler.handle(undefined);
      expect(response.success).toBe(false);
      expect(response.error).toContain("Parameters are required");
    });

    test("should throw error when params is not an object", async () => {
      const response = await handler.handle("invalid");
      expect(response.success).toBe(false);
      expect(response.error).toContain("Parameters are required");
    });

    test("should throw error when query is missing", async () => {
      const params = {};
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "query is required and must be a non-empty CQL string",
      );
    });

    test("should throw error when query is not a string", async () => {
      const params = { query: 123 };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "query is required and must be a non-empty CQL string",
      );
    });

    test("should throw error when query is empty string", async () => {
      const params = { query: "" };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "query is required and must be a non-empty CQL string",
      );
    });

    test("should throw error when query is whitespace only", async () => {
      const params = { query: "   " };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "query is required and must be a non-empty CQL string",
      );
    });

    test("should accept valid minimal parameters", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockRegistry.pagination.create(),
          totalSize: 3,
          searchDuration: 50,
        }),
      );

      const params: SearchPagesParams = { query: "test search" };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should trim query parameter", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      const searchPagesMock = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockRegistry.pagination.create(),
          totalSize: 3,
          searchDuration: 50,
        }),
      );
      mockConfluenceClient.searchPages = searchPagesMock;

      const params: SearchPagesParams = { query: "  test search  " };
      await handler.handle(params);

      expect(searchPagesMock).toHaveBeenCalledWith(
        "test search",
        expect.any(Object),
      );
    });

    test("should accept valid spaceKey parameter", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockRegistry.pagination.create(),
          totalSize: 3,
          searchDuration: 50,
        }),
      );

      const params: SearchPagesParams = { query: "test", spaceKey: "SPACE1" };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept valid type parameter - page", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockRegistry.pagination.create(),
          totalSize: 3,
          searchDuration: 50,
        }),
      );

      const params: SearchPagesParams = { query: "test", type: "page" };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept valid type parameter - blogpost", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockRegistry.pagination.create(),
          totalSize: 3,
          searchDuration: 50,
        }),
      );

      const params: SearchPagesParams = { query: "test", type: "blogpost" };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should throw error for invalid type parameter", async () => {
      const params = { query: "test", type: "invalid" as "page" | "blogpost" };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Invalid type parameter: invalid. Must be 'page' or 'blogpost'",
      );
    });

    test("should accept valid limit parameter", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockRegistry.pagination.create(),
          totalSize: 3,
          searchDuration: 50,
        }),
      );

      const params: SearchPagesParams = { query: "test", limit: 50 };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should throw error for invalid limit parameter - zero", async () => {
      const params: SearchPagesParams = { query: "test", limit: 0 };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Invalid limit parameter: must be a number between 1 and 100",
      );
    });

    test("should throw error for invalid limit parameter - too large", async () => {
      const params: SearchPagesParams = { query: "test", limit: 101 };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Invalid limit parameter: must be a number between 1 and 100",
      );
    });

    test("should accept valid start parameter", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockRegistry.pagination.create(),
          totalSize: 3,
          searchDuration: 50,
        }),
      );

      const params: SearchPagesParams = { query: "test", start: 10 };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should throw error for invalid start parameter - negative", async () => {
      const params: SearchPagesParams = { query: "test", start: -1 };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Invalid start parameter: must be a non-negative number",
      );
    });

    test("should accept valid orderBy parameter - relevance", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockRegistry.pagination.create(),
          totalSize: 3,
          searchDuration: 50,
        }),
      );

      const params: SearchPagesParams = { query: "test", orderBy: "relevance" };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept valid orderBy parameter - created", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockRegistry.pagination.create(),
          totalSize: 3,
          searchDuration: 50,
        }),
      );

      const params: SearchPagesParams = { query: "test", orderBy: "created" };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should throw error for invalid orderBy parameter", async () => {
      const params = {
        query: "test",
        orderBy: "invalid" as "relevance" | "created" | "modified" | "title",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Invalid orderBy parameter: invalid. Must be one of: relevance, created, modified, title",
      );
    });

    test("should accept all valid parameters together", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockRegistry.pagination.create(),
          totalSize: 3,
          searchDuration: 50,
        }),
      );

      const params: SearchPagesParams = {
        query: "test search",
        spaceKey: "SPACE1",
        type: "page",
        limit: 25,
        start: 0,
        orderBy: "relevance",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });
  });

  describe("API Integration", () => {
    test("should call searchPages with correct parameters", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      const searchPagesMock = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockRegistry.pagination.create(),
          totalSize: 3,
          searchDuration: 50,
        }),
      );
      mockConfluenceClient.searchPages = searchPagesMock;

      const params: SearchPagesParams = {
        query: "test search",
        spaceKey: "SPACE1",
        type: "page",
        limit: 50,
        start: 10,
        orderBy: "created",
      };

      await handler.handle(params);

      expect(searchPagesMock).toHaveBeenCalledWith("test search", {
        spaceKey: "SPACE1",
        type: "page",
        limit: 50,
        start: 10,
        orderBy: "created",
      });
    });

    test("should call searchPages with minimal parameters", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      const searchPagesMock = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockRegistry.pagination.create(),
          totalSize: 3,
          searchDuration: 50,
        }),
      );
      mockConfluenceClient.searchPages = searchPagesMock;

      const params: SearchPagesParams = { query: "test" };

      await handler.handle(params);

      expect(searchPagesMock).toHaveBeenCalledWith("test", {
        spaceKey: undefined,
        type: undefined,
        limit: undefined,
        start: undefined,
        orderBy: undefined,
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle API errors gracefully", async () => {
      const mockClient = mockConfluenceClient;
      mockClient.searchPages = mock(() =>
        Promise.reject(new Error("Search service unavailable")),
      );

      const handler = new ConfluenceSearchPagesHandler(mockClient);

      const response = await handler.handle({ query: "test query" });
      expect(response.success).toBe(false);
      expect(response.error).toContain("Search service unavailable");
    });

    test("should handle network errors", async () => {
      const mockClient = mockConfluenceClient;
      mockClient.searchPages = mock(() =>
        Promise.reject(new Error("Network timeout")),
      );

      const handler = new ConfluenceSearchPagesHandler(mockClient);

      const response = await handler.handle({ query: "test query" });
      expect(response.success).toBe(false);
      expect(response.error).toContain("Network timeout");
    });

    test("should provide better error message for HTTP 400 errors", async () => {
      const mockClient = mockConfluenceClient;
      mockClient.searchPages = mock(() =>
        Promise.reject(new Error("HTTP 400: Bad Request")),
      );

      const handler = new ConfluenceSearchPagesHandler(mockClient);

      const response = await handler.handle({ query: "Test Hub" });
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        'CQL syntax error in query: "Test Hub"',
      );
      expect(response.error).toContain("Please use proper CQL syntax");
    });

    test("should provide better error message for authentication errors", async () => {
      const mockClient = mockConfluenceClient;
      mockClient.searchPages = mock(() =>
        Promise.reject(new Error("HTTP 401: Authentication failed")),
      );

      const handler = new ConfluenceSearchPagesHandler(mockClient);

      const response = await handler.handle({ query: "test query" });
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Authentication failed. Please check your Confluence credentials.",
      );
    });

    test("should provide better error message for access denied errors", async () => {
      const mockClient = mockConfluenceClient;
      mockClient.searchPages = mock(() =>
        Promise.reject(new Error("HTTP 403: Access denied")),
      );

      const handler = new ConfluenceSearchPagesHandler(mockClient);

      const response = await handler.handle({ query: "test query" });
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Access denied. You may not have permission to search in this space.",
      );
    });

    test("should provide better error message for not found errors", async () => {
      const mockClient = mockConfluenceClient;
      mockClient.searchPages = mock(() =>
        Promise.reject(new Error("HTTP 404: Not found")),
      );

      const handler = new ConfluenceSearchPagesHandler(mockClient);

      const response = await handler.handle({ query: "test query" });
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Confluence instance not found. Please check your host URL.",
      );
    });
  });

  describe("Response Formatting", () => {
    test("should return response with results, pagination, and summary", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockRegistry.pagination.create(),
          totalSize: 5,
          searchDuration: 75,
        }),
      );

      const params: SearchPagesParams = { query: "test search" };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as SearchPagesResponse;
      expect(data).toHaveProperty("results");
      expect(data).toHaveProperty("pagination");
      expect(data).toHaveProperty("summary");
      expect(data.results).toHaveLength(3);
      expect(data.summary.total).toBe(5);
      expect(data.summary.searchQuery).toBe("test search");
      expect(data.summary.executionTime).toBe(75);
    });

    test("should include suggestions when no results found", async () => {
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: [],
          pagination: mockRegistry.pagination.create({ size: 0 }),
          totalSize: 0,
          searchDuration: 25,
        }),
      );

      const params: SearchPagesParams = { query: "nonexistent" };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as SearchPagesResponse;
      expect(data.results).toHaveLength(0);
      expect(data.suggestions).toBeDefined();
      expect(Array.isArray(data.suggestions)).toBe(true);
      expect(data.suggestions?.length).toBeGreaterThan(0);
    });

    test("should not include suggestions when results found", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockRegistry.pagination.create(),
          totalSize: 3,
          searchDuration: 50,
        }),
      );

      const params: SearchPagesParams = { query: "test" };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as SearchPagesResponse;
      expect(data.suggestions).toBeUndefined();
    });
  });

  describe("Search Suggestions", () => {
    test("should suggest removing quotes for quoted queries", async () => {
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: [],
          pagination: mockRegistry.pagination.create({ size: 0 }),
          totalSize: 0,
          searchDuration: 25,
        }),
      );

      const params: SearchPagesParams = { query: '"exact phrase"' };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as SearchPagesResponse;
      expect(data.suggestions).toBeDefined();
      expect(
        data.suggestions?.some((s: string) =>
          s.includes('Use text~"keyword" for text search'),
        ),
      ).toBe(true);
    });

    test("should suggest wildcard search for non-wildcard queries", async () => {
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: [],
          pagination: mockRegistry.pagination.create({ size: 0 }),
          totalSize: 0,
          searchDuration: 25,
        }),
      );

      const params: SearchPagesParams = { query: "search" };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as SearchPagesResponse;
      expect(data.suggestions).toBeDefined();
      expect(
        data.suggestions?.some((s: string) => s.includes('text~"search"')),
      ).toBe(true);
    });

    test("should suggest fewer keywords for multi-word queries", async () => {
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: [],
          pagination: mockRegistry.pagination.create({ size: 0 }),
          totalSize: 0,
          searchDuration: 25,
        }),
      );

      const params: SearchPagesParams = {
        query: "very long search query with many words",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as SearchPagesResponse;
      expect(data.suggestions).toBeDefined();
      expect(
        data.suggestions?.some((s: string) =>
          s.includes('title~"very long search query with many words"'),
        ),
      ).toBe(true);
    });

    test("should limit suggestions to 3 items", async () => {
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: [],
          pagination: mockRegistry.pagination.create({ size: 0 }),
          totalSize: 0,
          searchDuration: 25,
        }),
      );

      const params: SearchPagesParams = {
        query: '"very long search query with many words"',
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as SearchPagesResponse;
      expect(data.suggestions).toBeDefined();
      expect(data.suggestions?.length).toBeLessThanOrEqual(3);
    });
  });

  describe("Pagination Handling", () => {
    test("should include pagination information in response", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      const mockPagination = mockRegistry.pagination.create({
        limit: 25,
        start: 0,
        size: 3,
        hasMore: true,
      });
      mockConfluenceClient.searchPages = mock(() =>
        Promise.resolve({
          results: mockResults,
          pagination: mockPagination,
          totalSize: 10,
          searchDuration: 50,
        }),
      );

      const params: SearchPagesParams = { query: "test" };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as SearchPagesResponse;
      expect(data.pagination).toEqual(mockPagination);
    });
  });
});
