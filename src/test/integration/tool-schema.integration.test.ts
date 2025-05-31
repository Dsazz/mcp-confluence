import { beforeEach, describe, expect, test } from "bun:test";
import type { ConfluenceClient } from "../../features/confluence/api/index";
import type { GetSpacesResponse } from "../../features/confluence/api/responses.types";
import type { SearchPagesResponse } from "../../features/confluence/api/responses.types";
import { ConfluenceGetPageHandler } from "../../features/confluence/tools/handlers/get-page.handler";
import { ConfluenceGetSpacesHandler } from "../../features/confluence/tools/handlers/get-spaces.handler";
import { ConfluenceSearchPagesHandler } from "../../features/confluence/tools/handlers/search-pages.handler";
import { ConfluenceCreatePageHandler } from "../../features/confluence/tools/handlers/create-page.handler";
import { ConfluenceUpdatePageHandler } from "../../features/confluence/tools/handlers/update-page.handler";
import { mockRegistry } from "../__mocks__/index";

describe("Tool Schema Integration", () => {
  let handlers: {
    getPage: ConfluenceGetPageHandler;
    getSpaces: ConfluenceGetSpacesHandler;
    searchPages: ConfluenceSearchPagesHandler;
    createPage: ConfluenceCreatePageHandler;
    updatePage: ConfluenceUpdatePageHandler;
  };

  beforeEach(() => {
    // Create mock Confluence client
    const mockConfluenceClient: ConfluenceClient = {
      getPage: () => Promise.resolve(mockRegistry.pages.create()),
      getPageComments: () => Promise.resolve({
        comments: mockRegistry.comments.createMany(3),
        pagination: mockRegistry.pagination.create(),
      }),
      getWebBaseUrl: () => "https://test.atlassian.net/wiki",
      getSpaces: () => Promise.resolve({
        spaces: mockRegistry.spaces.createMany(3),
        pagination: mockRegistry.pagination.create(),
      }),
      createPage: () => Promise.resolve(mockRegistry.pages.create()),
      updatePage: () => Promise.resolve(mockRegistry.pages.create()),
      searchPages: () => Promise.resolve({
        results: mockRegistry.searchResults.createMany(3),
        pagination: mockRegistry.pagination.create(),
        totalSize: 3,
        searchDuration: 50,
      }),
      httpClient: {},
      validateConfig: () => {},
      buildSearchQuery: () => 'text ~ "test"',
    } as unknown as ConfluenceClient;

    // Initialize handlers
    handlers = {
      getPage: new ConfluenceGetPageHandler(mockConfluenceClient),
      getSpaces: new ConfluenceGetSpacesHandler(mockConfluenceClient),
      searchPages: new ConfluenceSearchPagesHandler(mockConfluenceClient),
      createPage: new ConfluenceCreatePageHandler(mockConfluenceClient),
      updatePage: new ConfluenceUpdatePageHandler(mockConfluenceClient),
    };
  });

  describe("Tool Schema Compliance", () => {
    test("should have correct tool metadata for all handlers", () => {
      // Verify each handler has required metadata
      expect(handlers.getPage.feature).toBe("confluence");
      expect(handlers.getPage.name).toBe("confluence_get_page");
      expect(handlers.getPage.description).toContain("Get detailed information about a specific Confluence page");

      expect(handlers.getSpaces.feature).toBe("confluence");
      expect(handlers.getSpaces.name).toBe("confluence_get_spaces");
      expect(handlers.getSpaces.description).toContain("List user's accessible Confluence spaces");

      expect(handlers.searchPages.feature).toBe("confluence");
      expect(handlers.searchPages.name).toBe("confluence_search_pages");
      expect(handlers.searchPages.description).toContain("Search for pages using CQL (Confluence Query Language)");

      expect(handlers.createPage.feature).toBe("confluence");
      expect(handlers.createPage.name).toBe("confluence_create_page");
      expect(handlers.createPage.description).toContain("Create a new page in Confluence");

      expect(handlers.updatePage.feature).toBe("confluence");
      expect(handlers.updatePage.name).toBe("confluence_update_page");
      expect(handlers.updatePage.description).toContain("Update an existing page in Confluence");
    });

    test("should validate required parameters for each tool", async () => {
      // Test get page - requires pageId
      const getPageResult = await handlers.getPage.handle({});
      expect(getPageResult.success).toBe(false);
      expect(getPageResult.error).toContain("pageId is required");

      // Test search pages - requires query
      const searchResult = await handlers.searchPages.handle({});
      expect(searchResult.success).toBe(false);
      expect(searchResult.error).toContain("query is required");

      // Test create page - requires spaceId, title, content
      const createResult = await handlers.createPage.handle({});
      expect(createResult.success).toBe(false);
      expect(createResult.error).toContain("spaceId is required");

      // Test update page - requires pageId, versionNumber, and title or content
      const updateResult = await handlers.updatePage.handle({});
      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toContain("pageId is required");
    });

    test("should validate parameter types for each tool", async () => {
      // Test invalid parameter types
      const getPageResult = await handlers.getPage.handle({
        pageId: 123, // Should be string
      });
      expect(getPageResult.success).toBe(false);
      expect(getPageResult.error).toContain("pageId is required and must be a string");

      const searchResult = await handlers.searchPages.handle({
        query: 123, // Should be string
      });
      expect(searchResult.success).toBe(false);
      expect(searchResult.error).toContain("query is required and must be a non-empty CQL string");

      const createResult = await handlers.createPage.handle({
        spaceId: 123, // Should be string
        title: "Test",
        content: "Test"
      });
      expect(createResult.success).toBe(false);
      expect(createResult.error).toContain("spaceId is required and must be a string");
    });

    test("should validate optional parameter constraints", async () => {
      // Test get spaces with invalid limit
      const spacesResult = await handlers.getSpaces.handle({
        limit: 150, // Should be <= 100
      });
      expect(spacesResult.success).toBe(false);
      expect(spacesResult.error).toContain("Invalid limit parameter");

      // Test search pages with invalid type
      const searchResult = await handlers.searchPages.handle({
        query: "test",
        type: "invalid" as never,
      });
      expect(searchResult.success).toBe(false);
      expect(searchResult.error).toContain("Invalid type parameter");

      // Test create page with invalid status
      const createResult = await handlers.createPage.handle({
        spaceId: "SPACE1",
        title: "Test",
        content: "Test",
        status: "invalid" as never,
      });
      expect(createResult.success).toBe(false);
      expect(createResult.error).toContain("Invalid status parameter");
    });
  });

  describe("Response Schema Compliance", () => {
    test("should return consistent response structure for successful operations", async () => {
      // Test successful responses have consistent structure
      const getPageResult = await handlers.getPage.handle({
        pageId: "123456"
      });
      expect(getPageResult.success).toBe(true);
      expect(getPageResult.data).toBeDefined();
      expect(getPageResult.error).toBeUndefined();

      const getSpacesResult = await handlers.getSpaces.handle({});
      expect(getSpacesResult.success).toBe(true);
      expect(getSpacesResult.data).toBeDefined();
      expect(getSpacesResult.error).toBeUndefined();

      const searchResult = await handlers.searchPages.handle({
        query: "test"
      });
      expect(searchResult.success).toBe(true);
      expect(searchResult.data).toBeDefined();
      expect(searchResult.error).toBeUndefined();
    });

    test("should return consistent error structure for failed operations", async () => {
      // Test error responses have consistent structure
      const getPageResult = await handlers.getPage.handle({});
      expect(getPageResult.success).toBe(false);
      expect(getPageResult.data).toBeUndefined();
      expect(getPageResult.error).toBeDefined();
      expect(typeof getPageResult.error).toBe("string");

      const searchResult = await handlers.searchPages.handle({});
      expect(searchResult.success).toBe(false);
      expect(searchResult.data).toBeUndefined();
      expect(searchResult.error).toBeDefined();
      expect(typeof searchResult.error).toBe("string");
    });

    test("should include required fields in successful responses", async () => {
      // Test that successful responses include expected fields
      const getPageResult = await handlers.getPage.handle({
        pageId: "123456"
      });
      expect(getPageResult.success).toBe(true);
      const pageData = getPageResult.data as string;
      expect(pageData).toBeDefined();
      expect(typeof pageData).toBe("string"); // GetPage returns formatted string

      const getSpacesResult = await handlers.getSpaces.handle({});
      expect(getSpacesResult.success).toBe(true);
      const spacesData = getSpacesResult.data as GetSpacesResponse;
      expect(spacesData.spaces).toBeDefined();
      expect(spacesData.pagination).toBeDefined();
      expect(spacesData.summary).toBeDefined();

      const searchResult = await handlers.searchPages.handle({
        query: "test"
      });
      expect(searchResult.success).toBe(true);
      const searchData = searchResult.data as SearchPagesResponse;
      expect(searchData.results).toBeDefined();
      expect(searchData.pagination).toBeDefined();
      expect(searchData.summary).toBeDefined();
    });
  });

  describe("Parameter Transformation and Validation", () => {
    test("should handle parameter trimming and normalization", async () => {
      // Test that parameters are properly trimmed and normalized
      const getPageResult = await handlers.getPage.handle({
        pageId: "  123456  ", // Should be trimmed
      });
      expect(getPageResult.success).toBe(true);

      const searchResult = await handlers.searchPages.handle({
        query: "  test query  ", // Should be trimmed
      });
      expect(searchResult.success).toBe(true);
    });

    test("should validate parameter combinations", async () => {
      // Test update page requires either title or content
      const updateResult1 = await handlers.updatePage.handle({
        pageId: "123456",
        versionNumber: 1,
        // Missing both title and content
      });
      expect(updateResult1.success).toBe(false);
      expect(updateResult1.error).toContain("At least one of 'title' or 'content' must be provided");

      // Test with title only - should succeed
      const updateResult2 = await handlers.updatePage.handle({
        pageId: "123456",
        versionNumber: 1,
        title: "New Title",
      });
      expect(updateResult2.success).toBe(true);

      // Test with content only - should succeed
      const updateResult3 = await handlers.updatePage.handle({
        pageId: "123456",
        versionNumber: 1,
        content: "New Content",
      });
      expect(updateResult3.success).toBe(true);
    });

    test("should validate enum parameters", async () => {
      // Test valid enum values
      const spacesResult1 = await handlers.getSpaces.handle({
        type: "global",
      });
      expect(spacesResult1.success).toBe(true);

      const spacesResult2 = await handlers.getSpaces.handle({
        type: "personal",
      });
      expect(spacesResult2.success).toBe(true);

      // Test invalid enum value
      const spacesResult3 = await handlers.getSpaces.handle({
        type: "invalid" as never,
      });
      expect(spacesResult3.success).toBe(false);
      expect(spacesResult3.error).toContain("Invalid type parameter");
    });
  });

  describe("Cross-Tool Consistency", () => {
    test("should have consistent error message formats across tools", async () => {
      // Test that error messages follow consistent patterns
      const errors = [
        await handlers.getPage.handle({}),
        await handlers.searchPages.handle({}),
        await handlers.createPage.handle({}),
        await handlers.updatePage.handle({}),
      ];

      for (const result of errors) {
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe("string");
        if (result.error) {
          expect(result.error.length).toBeGreaterThan(0);
        }
      }
    });

    test("should have consistent success response structures", async () => {
      // Test that all successful responses follow similar patterns
      const results = [
        await handlers.getPage.handle({ pageId: "123456" }),
        await handlers.getSpaces.handle({}),
        await handlers.searchPages.handle({ query: "test" }),
      ];

      for (const result of results) {
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.error).toBeUndefined();
      }
    });

    test("should handle null and undefined parameters consistently", async () => {
      // Test that all tools handle null/undefined consistently
      const nullResults = [
        await handlers.getPage.handle(null as never),
        await handlers.searchPages.handle(null as never),
        await handlers.createPage.handle(null as never),
        await handlers.updatePage.handle(null as never),
      ];

      for (const result of nullResults) {
        expect(result.success).toBe(false);
        expect(result.error).toContain("Parameters are required");
      }

      const undefinedResults = [
        await handlers.getPage.handle(undefined as never),
        await handlers.searchPages.handle(undefined as never),
        await handlers.createPage.handle(undefined as never),
        await handlers.updatePage.handle(undefined as never),
      ];

      for (const result of undefinedResults) {
        expect(result.success).toBe(false);
        expect(result.error).toContain("Parameters are required");
      }
    });
  });
}); 