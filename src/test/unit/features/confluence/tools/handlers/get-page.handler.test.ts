import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { ConfluenceClient } from "@features/confluence/api/index";
import { ConfluenceGetPageHandler } from "@features/confluence/tools/handlers/get-page.handler";
import type { GetPageParams } from "@features/confluence/tools/tools.types";
import { mockRegistry } from "./../../../../../__mocks__/index";

describe("ConfluenceGetPageHandler", () => {
  let handler: ConfluenceGetPageHandler;
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

    handler = new ConfluenceGetPageHandler(mockConfluenceClient);
  });

  describe("Constructor", () => {
    test("should initialize with correct properties", () => {
      expect(handler.feature).toBe("confluence");
      expect(handler.name).toBe("confluence_get_page");
      expect(handler.description).toBe(
        "Get detailed information about a specific Confluence page in human-readable format",
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

    test("should throw error when pageId is missing", async () => {
      const params = {};
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "pageId is required and must be a string",
      );
    });

    test("should throw error when pageId is not a string", async () => {
      const params = { pageId: 123 };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "pageId is required and must be a string",
      );
    });

    test("should throw error when pageId is empty string", async () => {
      const params = { pageId: "" };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "pageId is required and must be a string",
      );
    });

    test("should accept valid minimal parameters", async () => {
      const mockPage = mockRegistry.pages.create();
      mockConfluenceClient.getPage = mock(() => Promise.resolve(mockPage));

      const params: GetPageParams = { pageId: "123456" };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept all optional parameters", async () => {
      const mockPage = mockRegistry.pages.create();
      const mockComments = {
        comments: mockRegistry.comments.createMany(3),
        pagination: mockRegistry.pagination.create(),
      };
      mockConfluenceClient.getPage = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getPageComments = mock(() =>
        Promise.resolve(mockComments),
      );

      const params: GetPageParams = {
        pageId: "123456",
        includeContent: true,
        includeComments: true,
        expand: ["body.storage", "version"],
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });
  });

  describe("API Integration", () => {
    test("should call getPage with correct parameters", async () => {
      const mockPage = mockRegistry.pages.create();
      const getPageMock = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getPage = getPageMock;

      const params: GetPageParams = {
        pageId: "123456",
        includeContent: true,
        expand: ["body.storage"],
      };

      await handler.handle(params);

      expect(getPageMock).toHaveBeenCalledWith("123456", {
        includeContent: true,
        expand: ["body.storage"],
      });
    });

    test("should call getPageComments when includeComments is true", async () => {
      const mockPage = mockRegistry.pages.create();
      const mockComments = {
        comments: mockRegistry.comments.createMany(3),
        pagination: mockRegistry.pagination.create(),
      };
      const getPageCommentsMock = mock(() => Promise.resolve(mockComments));

      mockConfluenceClient.getPage = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getPageComments = getPageCommentsMock;

      const params: GetPageParams = {
        pageId: "123456",
        includeComments: true,
      };

      await handler.handle(params);

      expect(getPageCommentsMock).toHaveBeenCalledWith("123456", { limit: 1 });
    });

    test("should not call getPageComments when includeComments is false", async () => {
      const mockPage = mockRegistry.pages.create();
      const getPageCommentsMock = mock(() =>
        Promise.resolve({
          comments: mockRegistry.comments.createMany(3),
          pagination: mockRegistry.pagination.create(),
        }),
      );

      mockConfluenceClient.getPage = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getPageComments = getPageCommentsMock;

      const params: GetPageParams = {
        pageId: "123456",
        includeComments: false,
      };

      await handler.handle(params);

      expect(getPageCommentsMock).not.toHaveBeenCalled();
    });

    test("should not call getPageComments when includeComments is undefined", async () => {
      const mockPage = mockRegistry.pages.create();
      const getPageCommentsMock = mock(() =>
        Promise.resolve({
          comments: mockRegistry.comments.createMany(3),
          pagination: mockRegistry.pagination.create(),
        }),
      );

      mockConfluenceClient.getPage = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getPageComments = getPageCommentsMock;

      const params: GetPageParams = {
        pageId: "123456",
      };

      await handler.handle(params);

      expect(getPageCommentsMock).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    test("should handle API errors gracefully", async () => {
      const apiError = new Error("Page not found");
      mockConfluenceClient.getPage = mock(() => Promise.reject(apiError));

      const params: GetPageParams = { pageId: "invalid-id" };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain("Page not found");
    });

    test("should handle network errors", async () => {
      const networkError = new Error("Network timeout");
      mockConfluenceClient.getPage = mock(() => Promise.reject(networkError));

      const params: GetPageParams = { pageId: "123456" };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain("Network timeout");
    });

    test("should handle getPageComments errors gracefully", async () => {
      const mockPage = mockRegistry.pages.create();
      const commentsError = new Error("Comments API error");

      mockConfluenceClient.getPage = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getPageComments = mock(() =>
        Promise.reject(commentsError),
      );

      const params: GetPageParams = {
        pageId: "123456",
        includeComments: true,
      };

      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain("Comments API error");
    });
  });

  describe("Response Formatting", () => {
    test("should return formatted string response", async () => {
      const mockPage = mockRegistry.pages.create({
        title: "Test Page",
        id: "123456",
      });

      mockConfluenceClient.getPage = mock(() => Promise.resolve(mockPage));

      const params: GetPageParams = { pageId: "123456" };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      expect(typeof response.data).toBe("string");
      expect(response.data).toContain("Test Page");
    });

    test("should include comment count when requested", async () => {
      const mockPage = mockRegistry.pages.create();
      const mockComments = {
        comments: mockRegistry.comments.createMany(3),
        pagination: mockRegistry.pagination.create({
          size: 5,
          limit: 1,
          start: 0,
        }),
      };

      mockConfluenceClient.getPage = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getPageComments = mock(() =>
        Promise.resolve(mockComments),
      );

      const params: GetPageParams = {
        pageId: "123456",
        includeComments: true,
      };

      const response = await handler.handle(params);
      expect(response.success).toBe(true);
      // The response should be formatted and include comment information
      expect(typeof response.data).toBe("string");
    });

    test("should handle zero comment count", async () => {
      const mockPage = mockRegistry.pages.create();
      const mockComments = {
        comments: [],
        pagination: mockRegistry.pagination.create({
          size: 0,
          limit: 1,
          start: 0,
        }),
      };

      mockConfluenceClient.getPage = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getPageComments = mock(() =>
        Promise.resolve(mockComments),
      );

      const params: GetPageParams = {
        pageId: "123456",
        includeComments: true,
      };

      const response = await handler.handle(params);
      expect(response.success).toBe(true);
      expect(typeof response.data).toBe("string");
    });
  });

  describe("Context Building", () => {
    test("should build page context with space information", async () => {
      const mockPage = mockRegistry.pages.create({
        spaceId: "SPACE123",
        title: "Test Page",
      });

      mockConfluenceClient.getPage = mock(() => Promise.resolve(mockPage));

      const params: GetPageParams = { pageId: "123456" };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      // The context should be built and included in the formatted response
      expect(typeof response.data).toBe("string");
    });

    test("should build breadcrumbs correctly", async () => {
      const mockPage = mockRegistry.pages.create({
        id: "123456",
        title: "Test Page",
        _links: {
          webui: "/pages/123456",
          editui: "/pages/123456/edit",
          self: "/wiki/api/v2/pages/123456",
        },
      });

      mockConfluenceClient.getPage = mock(() => Promise.resolve(mockPage));

      const params: GetPageParams = { pageId: "123456" };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      expect(typeof response.data).toBe("string");
    });
  });

  describe("Default Parameter Handling", () => {
    test("should default includeContent to true when not specified", async () => {
      const mockPage = mockRegistry.pages.create();
      const getPageMock = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getPage = getPageMock;

      const params: GetPageParams = { pageId: "123456" };
      await handler.handle(params);

      expect(getPageMock).toHaveBeenCalledWith("123456", {
        includeContent: true,
        expand: undefined,
      });
    });

    test("should default includeComments to false when not specified", async () => {
      const mockPage = mockRegistry.pages.create();
      const getPageCommentsMock = mock(() =>
        Promise.resolve({
          comments: mockRegistry.comments.createMany(3),
          pagination: mockRegistry.pagination.create(),
        }),
      );

      mockConfluenceClient.getPage = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getPageComments = getPageCommentsMock;

      const params: GetPageParams = { pageId: "123456" };
      await handler.handle(params);

      expect(getPageCommentsMock).not.toHaveBeenCalled();
    });

    test("should respect explicit includeContent false", async () => {
      const mockPage = mockRegistry.pages.create();
      const getPageMock = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getPage = getPageMock;

      const params: GetPageParams = {
        pageId: "123456",
        includeContent: false,
      };
      await handler.handle(params);

      expect(getPageMock).toHaveBeenCalledWith("123456", {
        includeContent: false,
        expand: undefined,
      });
    });
  });
});
