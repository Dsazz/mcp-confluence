import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { ConfluenceClient } from "@features/confluence/api/index";
import type { CreatePageResponse } from "@features/confluence/api/responses.types";
import { ConfluenceCreatePageHandler } from "@features/confluence/tools/handlers/create-page.handler";
import type { CreatePageParams } from "@features/confluence/tools/tools.types";
import { mockRegistry } from "./../../../../../__mocks__/index";

describe("ConfluenceCreatePageHandler", () => {
  let handler: ConfluenceCreatePageHandler;
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

    handler = new ConfluenceCreatePageHandler(mockConfluenceClient);
  });

  describe("Constructor", () => {
    test("should initialize with correct properties", () => {
      expect(handler.feature).toBe("confluence");
      expect(handler.name).toBe("confluence_create_page");
      expect(handler.description).toBe("Create a new page in Confluence");
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

    test("should throw error when spaceId is missing", async () => {
      const params = { title: "Test Page", content: "Test content" };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "spaceId is required and must be a string",
      );
    });

    test("should throw error when spaceId is not a string", async () => {
      const params = {
        spaceId: 123,
        title: "Test Page",
        content: "Test content",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "spaceId is required and must be a string",
      );
    });

    test("should throw error when title is missing", async () => {
      const params = { spaceId: "SPACE1", content: "Test content" };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "title is required and must be a non-empty string",
      );
    });

    test("should throw error when title is not a string", async () => {
      const params = {
        spaceId: "SPACE1",
        title: 123,
        content: "Test content",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "title is required and must be a non-empty string",
      );
    });

    test("should throw error when title is empty string", async () => {
      const params = { spaceId: "SPACE1", title: "", content: "Test content" };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "title is required and must be a non-empty string",
      );
    });

    test("should throw error when title is whitespace only", async () => {
      const params = {
        spaceId: "SPACE1",
        title: "   ",
        content: "Test content",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "title is required and must be a non-empty string",
      );
    });

    test("should throw error when content is missing", async () => {
      const params = { spaceId: "SPACE1", title: "Test Page" };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "content is required and must be a string",
      );
    });

    test("should throw error when content is not a string", async () => {
      const params = { spaceId: "SPACE1", title: "Test Page", content: 123 };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "content is required and must be a string",
      );
    });

    test("should accept valid minimal parameters", async () => {
      const mockPage = mockRegistry.pages.create();
      mockConfluenceClient.createPage = mock(() => Promise.resolve(mockPage));

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should trim spaceId and title parameters", async () => {
      const mockPage = mockRegistry.pages.create();
      const createPageMock = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.createPage = createPageMock;

      const params: CreatePageParams = {
        spaceId: "  SPACE1  ",
        title: "  Test Page  ",
        content: "Test content",
      };
      await handler.handle(params);

      expect(createPageMock).toHaveBeenCalledWith(
        expect.objectContaining({
          spaceId: "SPACE1",
          title: "Test Page",
        }),
      );
    });

    test("should accept valid parentPageId parameter", async () => {
      const mockPage = mockRegistry.pages.create();
      mockConfluenceClient.createPage = mock(() => Promise.resolve(mockPage));

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
        parentPageId: "123456",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept valid status parameter - current", async () => {
      const mockPage = mockRegistry.pages.create();
      mockConfluenceClient.createPage = mock(() => Promise.resolve(mockPage));

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
        status: "current",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept valid status parameter - draft", async () => {
      const mockPage = mockRegistry.pages.create();
      mockConfluenceClient.createPage = mock(() => Promise.resolve(mockPage));

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
        status: "draft",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should throw error for invalid status parameter", async () => {
      const params = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
        status: "invalid" as "current" | "draft",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Invalid status parameter: invalid. Must be 'current' or 'draft'",
      );
    });

    test("should accept valid contentFormat parameter - storage", async () => {
      const mockPage = mockRegistry.pages.create();
      mockConfluenceClient.createPage = mock(() => Promise.resolve(mockPage));

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
        contentFormat: "storage",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept valid contentFormat parameter - editor", async () => {
      const mockPage = mockRegistry.pages.create();
      mockConfluenceClient.createPage = mock(() => Promise.resolve(mockPage));

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
        contentFormat: "editor",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept valid contentFormat parameter - wiki", async () => {
      const mockPage = mockRegistry.pages.create();
      mockConfluenceClient.createPage = mock(() => Promise.resolve(mockPage));

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
        contentFormat: "wiki",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should throw error for invalid contentFormat parameter", async () => {
      const params = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
        contentFormat: "invalid" as "storage" | "editor" | "wiki",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Invalid contentFormat parameter: invalid. Must be 'storage', 'editor', or 'wiki'",
      );
    });

    test("should accept all valid parameters together", async () => {
      const mockPage = mockRegistry.pages.create();
      mockConfluenceClient.createPage = mock(() => Promise.resolve(mockPage));

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
        parentPageId: "123456",
        status: "draft",
        contentFormat: "storage",
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });
  });

  describe("API Integration", () => {
    test("should call createPage with correct parameters", async () => {
      const mockPage = mockRegistry.pages.create();
      const createPageMock = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.createPage = createPageMock;

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
        parentPageId: "123456",
        status: "draft",
        contentFormat: "storage",
      };
      await handler.handle(params);

      expect(createPageMock).toHaveBeenCalledWith({
        spaceId: "SPACE1",
        title: "Test Page",
        body: {
          storage: {
            value: "Test content",
            representation: "storage",
          },
        },
        status: "draft",
        parentId: "123456",
      });
    });

    test("should call createPage with default values for optional parameters", async () => {
      const mockPage = mockRegistry.pages.create();
      const createPageMock = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.createPage = createPageMock;

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
      };
      await handler.handle(params);

      expect(createPageMock).toHaveBeenCalledWith({
        spaceId: "SPACE1",
        title: "Test Page",
        body: {
          storage: {
            value: "Test content",
            representation: "storage",
          },
        },
        status: "current",
      });
    });

    test("should call getSpaces to build context", async () => {
      const mockPage = mockRegistry.pages.create();
      const mockSpaces = mockRegistry.spaces.createMany(3);
      mockConfluenceClient.createPage = mock(() => Promise.resolve(mockPage));
      const getSpacesMock = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );
      mockConfluenceClient.getSpaces = getSpacesMock;

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
      };
      await handler.handle(params);

      expect(getSpacesMock).toHaveBeenCalledWith({ limit: 1000 });
    });
  });

  describe("Error Handling", () => {
    test("should handle space not found error", async () => {
      mockConfluenceClient.createPage = mock(() =>
        Promise.reject(new Error("Space not found")),
      );

      const params: CreatePageParams = {
        spaceId: "INVALID",
        title: "Test Page",
        content: "Test content",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Space not found: INVALID. Please verify the space ID.",
      );
    });

    test("should handle parent page not found error", async () => {
      mockConfluenceClient.createPage = mock(() =>
        Promise.reject(new Error("Parent page not found")),
      );

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
        parentPageId: "INVALID",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Parent page not found: INVALID. Please verify the parent page ID.",
      );
    });

    test("should handle permission denied error", async () => {
      mockConfluenceClient.createPage = mock(() =>
        Promise.reject(new Error("Permission denied")),
      );

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Permission denied. You don't have permission to create pages in space: SPACE1",
      );
    });

    test("should handle title already exists error", async () => {
      mockConfluenceClient.createPage = mock(() =>
        Promise.reject(new Error("Title already exists")),
      );

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Existing Page",
        content: "Test content",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain(
        'A page with title "Existing Page" already exists in this space.',
      );
    });

    test("should handle generic API errors", async () => {
      mockConfluenceClient.createPage = mock(() =>
        Promise.reject(new Error("Network timeout")),
      );

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Failed to create page: Network timeout",
      );
    });

    test("should handle non-Error exceptions", async () => {
      mockConfluenceClient.createPage = mock(() =>
        Promise.reject("String error"),
      );

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain("Failed to create page: String error");
    });
  });

  describe("Response Formatting", () => {
    test("should return response with page, created flag, timestamp, and context", async () => {
      const mockPage = mockRegistry.pages.create();
      const mockSpaces = mockRegistry.spaces.createMany(3);
      mockConfluenceClient.createPage = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as CreatePageResponse;
      expect(data.page).toEqual(mockPage);
      expect(data.created).toBe(true);
      expect(data.timestamp).toBeDefined();
      expect(data.context).toBeDefined();
      expect(data.context.space).toBeDefined();
      expect(data.context.breadcrumbs).toBeDefined();
    });

    test("should include space information in context when space is found", async () => {
      const mockPage = mockRegistry.pages.create({ spaceId: "SPACE1" });
      const mockSpace = mockRegistry.spaces.create({ id: "SPACE1" });
      mockConfluenceClient.createPage = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: [mockSpace],
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as CreatePageResponse;
      expect(data.context.space.id).toBe("SPACE1");
      expect(data.context.space.name).toBe(mockSpace.name);
    });

    test("should include parent page in breadcrumbs when parentPageId is provided", async () => {
      const mockPage = mockRegistry.pages.create({ parentId: "PARENT123" });
      const mockParentPage = mockRegistry.pages.create({ id: "PARENT123" });
      const mockSpace = mockRegistry.spaces.create({ id: mockPage.spaceId });

      mockConfluenceClient.createPage = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: [mockSpace],
          pagination: mockRegistry.pagination.create(),
        }),
      );
      mockConfluenceClient.getPage = mock(() =>
        Promise.resolve(mockParentPage),
      );

      const params: CreatePageParams = {
        spaceId: mockPage.spaceId,
        title: "Test Page",
        content: "Test content",
        parentPageId: "PARENT123",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as CreatePageResponse;
      expect(data.context.breadcrumbs).toHaveLength(2);
      expect(data.context.breadcrumbs[1].id).toBe("PARENT123");
      expect(data.context.breadcrumbs[1].title).toBe(mockParentPage.title);
    });

    test("should handle context building errors gracefully", async () => {
      const mockPage = mockRegistry.pages.create();
      mockConfluenceClient.createPage = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.reject(new Error("Context error")),
      );

      const params: CreatePageParams = {
        spaceId: "SPACE1",
        title: "Test Page",
        content: "Test content",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as CreatePageResponse;
      expect(data.context.space.name).toBe("Unknown Space");
      expect(data.context.breadcrumbs).toHaveLength(0);
    });

    test("should handle parent page fetch errors gracefully", async () => {
      const mockPage = mockRegistry.pages.create({ parentId: "PARENT123" });
      const mockSpace = mockRegistry.spaces.create({ id: mockPage.spaceId });

      mockConfluenceClient.createPage = mock(() => Promise.resolve(mockPage));
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: [mockSpace],
          pagination: mockRegistry.pagination.create(),
        }),
      );
      mockConfluenceClient.getPage = mock(() =>
        Promise.reject(new Error("Parent not found")),
      );

      const params: CreatePageParams = {
        spaceId: mockPage.spaceId,
        title: "Test Page",
        content: "Test content",
        parentPageId: "PARENT123",
      };
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as CreatePageResponse;
      // Should only have space breadcrumb, not parent page
      expect(data.context.breadcrumbs).toHaveLength(1);
      expect(data.context.breadcrumbs[0].id).toBe(mockSpace.id);
    });
  });
});
