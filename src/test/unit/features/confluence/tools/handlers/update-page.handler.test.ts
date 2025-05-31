import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { UpdatePageResponse } from "@features/confluence/api/confluence.responses.types";
import type { ConfluenceClient } from "@features/confluence/api/index";
import type { UpdatePageParams } from "@features/confluence/tools/confluence.tools.types";
import { ConfluenceUpdatePageHandler } from "@features/confluence/tools/handlers/update-page.handler";
import { mockRegistry } from "../../../../../__mocks__/index";

describe("ConfluenceUpdatePageHandler", () => {
  let handler: ConfluenceUpdatePageHandler;
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

    handler = new ConfluenceUpdatePageHandler(mockConfluenceClient);
  });

  describe("Constructor", () => {
    test("should initialize with correct properties", () => {
      expect(handler.feature).toBe("confluence");
      expect(handler.name).toBe("confluence_update_page");
      expect(handler.description).toBe("Update an existing page in Confluence");
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
      const params = { versionNumber: 1, title: "Updated Title" };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "pageId is required and must be a string",
      );
    });

    test("should throw error when pageId is not a string", async () => {
      const params = { pageId: 123, versionNumber: 1, title: "Updated Title" };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "pageId is required and must be a string",
      );
    });

    test("should throw error when versionNumber is missing", async () => {
      const params = { pageId: "123456", title: "Updated Title" };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "versionNumber is required and must be a positive number",
      );
    });

    test("should throw error when versionNumber is not a number", async () => {
      const params = {
        pageId: "123456",
        versionNumber: "1",
        title: "Updated Title",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "versionNumber is required and must be a positive number",
      );
    });

    test("should throw error when versionNumber is zero", async () => {
      const params = {
        pageId: "123456",
        versionNumber: 0,
        title: "Updated Title",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "versionNumber is required and must be a positive number",
      );
    });

    test("should throw error when versionNumber is negative", async () => {
      const params = {
        pageId: "123456",
        versionNumber: -1,
        title: "Updated Title",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "versionNumber is required and must be a positive number",
      );
    });

    test("should throw error when neither title nor content is provided", async () => {
      const params = { pageId: "123456", versionNumber: 1 };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "At least one of 'title' or 'content' must be provided",
      );
    });

    test("should throw error when title is whitespace only", async () => {
      const params = { pageId: "123456", versionNumber: 1, title: "   " };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain("title must be a non-empty string");
    });

    test("should accept valid parameters with title only", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: {
          number: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: {
          number: 2,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept valid parameters with content only", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: {
          number: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: {
          number: 2,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        content: "Updated content",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should trim pageId and title parameters", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: {
          number: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: {
          number: 2,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      const getPageMock = mock(() => Promise.resolve(mockCurrentPage));
      const updatePageMock = mock(() => Promise.resolve(mockUpdatedPage));
      mockConfluenceClient.getPage = getPageMock;
      mockConfluenceClient.updatePage = updatePageMock;

      const params: UpdatePageParams = {
        pageId: "  123456  ",
        versionNumber: 1,
        title: "  Updated Title  ",
      };
      await handler.handle(params);

      expect(getPageMock).toHaveBeenCalledWith("123456", {
        includeContent: true,
      });
    });

    test("should accept valid status parameter - current", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: {
          number: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: {
          number: 2,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
        status: "current",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept valid status parameter - draft", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: {
          number: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: {
          number: 2,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
        status: "draft",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should throw error for invalid status parameter", async () => {
      const params = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
        status: "invalid" as "current" | "draft",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Invalid status parameter: invalid. Must be 'current' or 'draft'",
      );
    });

    test("should accept valid contentFormat parameter - storage", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        content: "Updated content",
        contentFormat: "storage",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept valid contentFormat parameter - editor", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        content: "Updated content",
        contentFormat: "editor",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept valid contentFormat parameter - wiki", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        content: "Updated content",
        contentFormat: "wiki",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should throw error for invalid contentFormat parameter", async () => {
      const params = {
        pageId: "123456",
        versionNumber: 1,
        content: "Updated content",
        contentFormat: "invalid" as "storage" | "editor" | "wiki",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Invalid contentFormat parameter: invalid. Must be 'storage', 'editor', or 'wiki'",
      );
    });

    test("should accept valid versionMessage parameter", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
        versionMessage: "Updated the title",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept all valid parameters together", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
        content: "Updated content",
        status: "draft",
        contentFormat: "storage",
        versionMessage: "Updated title and content",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept empty title when content is provided", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: {
          number: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: {
          number: 2,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params = {
        pageId: "123456",
        versionNumber: 1,
        title: "",
        content: "Some content",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });
  });

  describe("Version Checking", () => {
    test("should throw error when version number doesn't match current page", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 5, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 3,
        title: "Updated Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Version mismatch. Current version is 5, but you provided 3. Please refresh and try again.",
      );
    });

    test("should proceed when version number matches current page", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 3, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: { number: 4, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 3,
        title: "Updated Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
    });
  });

  describe("API Integration", () => {
    test("should call getPage to get current page", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const getPageMock = mock(() => Promise.resolve(mockCurrentPage));
      mockConfluenceClient.getPage = getPageMock;
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      await handler.handle(params);

      expect(getPageMock).toHaveBeenCalledWith("123456", {
        includeContent: true,
      });
    });

    test("should call updatePage with correct parameters", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        id: "123456",
        title: "Original Title",
        status: "current",
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const updatePageMock = mock(() => Promise.resolve(mockUpdatedPage));
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = updatePageMock;

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
        content: "Updated content",
        status: "draft",
        contentFormat: "storage",
        versionMessage: "Updated title and content",
      };
      await handler.handle(params);

      expect(updatePageMock).toHaveBeenCalledWith("123456", {
        id: "123456",
        type: "page",
        title: "Updated Title",
        status: "draft",
        version: {
          number: 2,
          message: "Updated title and content",
        },
        body: {
          storage: {
            value: "Updated content",
            representation: "storage",
          },
        },
      });
    });

    test("should call updatePage with defaults for optional parameters", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        id: "123456",
        title: "Original Title",
        status: "current",
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const updatePageMock = mock(() => Promise.resolve(mockUpdatedPage));
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = updatePageMock;

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      await handler.handle(params);

      expect(updatePageMock).toHaveBeenCalledWith("123456", {
        id: "123456",
        type: "page",
        title: "Updated Title",
        status: "current",
        version: {
          number: 2,
        },
      });
    });

    test("should call getSpaces to build context", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockSpaces = mockRegistry.spaces.createMany(3);
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );
      const getSpacesMock = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );
      mockConfluenceClient.getSpaces = getSpacesMock;

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      await handler.handle(params);

      expect(getSpacesMock).toHaveBeenCalledWith({ limit: 1000 });
    });
  });

  describe("Error Handling", () => {
    test("should handle page not found error when getting current page", async () => {
      mockConfluenceClient.getPage = mock(() =>
        Promise.reject(new Error("Page not found")),
      );

      const params: UpdatePageParams = {
        pageId: "INVALID",
        versionNumber: 1,
        title: "Updated Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Page not found: INVALID. Please verify the page ID.",
      );
    });

    test("should handle generic error when getting current page", async () => {
      mockConfluenceClient.getPage = mock(() =>
        Promise.reject(new Error("Network timeout")),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Failed to get current page: Network timeout",
      );
    });

    test("should handle permission denied error when updating", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.reject(new Error("Permission denied")),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Permission denied. You don't have permission to edit this page.",
      );
    });

    test("should handle version conflict error when updating", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.reject(new Error("Version conflict")),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Version conflict. The page has been modified by another user. Please refresh and try again.",
      );
    });

    test("should handle title already exists error when updating", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.reject(new Error("Title already exists")),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Existing Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain(
        'A page with title "Existing Title" already exists in this space.',
      );
    });

    test("should handle generic API errors when updating", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.reject(new Error("Network timeout")),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Failed to update page: Network timeout",
      );
    });

    test("should handle non-Error exceptions when updating", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.reject("String error"),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain("Failed to update page: String error");
    });
  });

  describe("Response Formatting", () => {
    test("should return response with page, updated flag, timestamps, versions, changes, and context", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockSpaces = mockRegistry.spaces.createMany(3);
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as UpdatePageResponse;
      expect(data.page).toEqual(mockUpdatedPage);
      expect(data.updated).toBe(true);
      expect(data.timestamp).toBeDefined();
      expect(data.previousVersion).toBe(1);
      expect(data.currentVersion).toBe(2);
      expect(data.changes).toBeDefined();
      expect(data.context).toBeDefined();
      expect(data.context.space).toBeDefined();
      expect(data.context.breadcrumbs).toBeDefined();
    });

    test("should detect title changes correctly", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        title: "Original Title",
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as UpdatePageResponse;
      expect(data.changes.title).toBe(true);
      expect(data.changes.content).toBe(false);
      expect(data.changes.status).toBe(false);
    });

    test("should detect content changes correctly", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        body: {
          storage: { value: "Original content", representation: "storage" },
        },
        version: {
          number: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: {
          number: 2,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        content: "Updated content",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as UpdatePageResponse;
      expect(data.changes.title).toBe(false);
      expect(data.changes.content).toBe(true);
      expect(data.changes.status).toBe(false);
    });

    test("should detect status changes correctly", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        status: "current",
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
        status: "draft",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as UpdatePageResponse;
      expect(data.changes.title).toBe(true);
      expect(data.changes.content).toBe(false);
      expect(data.changes.status).toBe(true);
    });

    test("should detect no changes when values are the same", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        title: "Same Title",
        status: "current",
        body: { storage: { value: "Same content", representation: "storage" } },
        version: {
          number: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: {
          number: 2,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Same Title",
        content: "Same content",
        status: "current",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as UpdatePageResponse;
      expect(data.changes.title).toBe(false);
      expect(data.changes.content).toBe(false);
      expect(data.changes.status).toBe(false);
    });

    test("should include space information in context when space is found", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        spaceId: "SPACE1",
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockSpace = mockRegistry.spaces.create({ id: "SPACE1" });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: [mockSpace],
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as UpdatePageResponse;
      expect(data.context.space.id).toBe("SPACE1");
      expect(data.context.space.name).toBe(mockSpace.name);
    });

    test("should include parent page in breadcrumbs when parentId exists", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        parentId: "PARENT123",
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockParentPage = mockRegistry.pages.create({ id: "PARENT123" });
      const mockSpace = mockRegistry.spaces.create({
        id: mockUpdatedPage.spaceId,
      });

      mockConfluenceClient.getPage = mock((pageId: string) => {
        if (pageId === "PARENT123") return Promise.resolve(mockParentPage);
        return Promise.resolve(mockCurrentPage);
      });
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: [mockSpace],
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as UpdatePageResponse;
      expect(data.context.breadcrumbs).toHaveLength(2);
      expect(data.context.breadcrumbs[1].id).toBe("PARENT123");
      expect(data.context.breadcrumbs[1].title).toBe(mockParentPage.title);
    });

    test("should handle context building errors gracefully", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockCurrentPage),
      );
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.reject(new Error("Context error")),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as UpdatePageResponse;
      expect(data.context.space.name).toBe("Unknown Space");
      expect(data.context.breadcrumbs).toHaveLength(0);
    });

    test("should handle parent page fetch errors gracefully", async () => {
      const mockCurrentPage = mockRegistry.pages.create({
        version: { number: 1, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockUpdatedPage = mockRegistry.pages.create({
        parentId: "PARENT123",
        version: { number: 2, createdAt: "2024-01-01T00:00:00.000Z", authorId: "user123" },
      });
      const mockSpace = mockRegistry.spaces.create({
        id: mockUpdatedPage.spaceId,
      });

      mockConfluenceClient.getPage = mock((pageId: string) => {
        if (pageId === "PARENT123")
          return Promise.reject(new Error("Parent not found"));
        return Promise.resolve(mockCurrentPage);
      });
      mockConfluenceClient.updatePage = mock(() =>
        Promise.resolve(mockUpdatedPage),
      );
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: [mockSpace],
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: UpdatePageParams = {
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as UpdatePageResponse;
      // Should only have space breadcrumb, not parent page
      expect(data.context.breadcrumbs).toHaveLength(1);
      expect(data.context.breadcrumbs[0].id).toBe(mockSpace.id);
    });
  });
});
