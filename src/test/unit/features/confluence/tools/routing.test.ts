/**
 * Unit tests for Tool Routing
 *
 * Tests the routeToolCall function that routes MCP tool calls to appropriate
 * domain handlers based on tool names.
 */

import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { DomainHandlers } from "@features/confluence/tools/handlers";
import { routeToolCall } from "@features/confluence/tools/routing";

describe("Tool Routing", () => {
  let mockDomainHandlers: DomainHandlers;
  let mockSpacesGetHandler: ReturnType<typeof mock>;
  let mockSpacesGetByKeyHandler: ReturnType<typeof mock>;
  let mockSpacesGetByIdHandler: ReturnType<typeof mock>;
  let mockPagesGetHandler: ReturnType<typeof mock>;
  let mockPagesCreateHandler: ReturnType<typeof mock>;
  let mockPagesUpdateHandler: ReturnType<typeof mock>;
  let mockPagesSearchHandler: ReturnType<typeof mock>;
  let mockPagesGetBySpaceHandler: ReturnType<typeof mock>;
  let mockPagesGetChildHandler: ReturnType<typeof mock>;
  let mockSearchHandler: ReturnType<typeof mock>;
  let mockContentGetHandler: ReturnType<typeof mock>;
  let mockContentCreateHandler: ReturnType<typeof mock>;
  let mockContentUpdateHandler: ReturnType<typeof mock>;

  beforeEach(() => {
    // Create mock handlers
    mockSpacesGetHandler = mock();
    mockSpacesGetByKeyHandler = mock();
    mockSpacesGetByIdHandler = mock();
    mockPagesGetHandler = mock();
    mockPagesCreateHandler = mock();
    mockPagesUpdateHandler = mock();
    mockPagesSearchHandler = mock();
    mockPagesGetBySpaceHandler = mock();
    mockPagesGetChildHandler = mock();
    mockSearchHandler = mock();
    mockContentGetHandler = mock();
    mockContentCreateHandler = mock();
    mockContentUpdateHandler = mock();

    // Create mock domain handlers structure
    mockDomainHandlers = {
      spaces: {
        getSpaces: { handle: mockSpacesGetHandler },
        getSpaceByKey: { handle: mockSpacesGetByKeyHandler },
        getSpaceById: { handle: mockSpacesGetByIdHandler },
      },
      pages: {
        getPage: { handle: mockPagesGetHandler },
        createPage: { handle: mockPagesCreateHandler },
        updatePage: { handle: mockPagesUpdateHandler },
        searchPages: { handle: mockPagesSearchHandler },
        getPagesBySpace: { handle: mockPagesGetBySpaceHandler },
        getChildPages: { handle: mockPagesGetChildHandler },
      },
      search: {
        searchContent: { handle: mockSearchHandler },
      },
      content: {
        getContent: { handle: mockContentGetHandler },
        createContent: { handle: mockContentCreateHandler },
        updateContent: { handle: mockContentUpdateHandler },
      },
    } as unknown as DomainHandlers;

    // Reset all mocks
    mockSpacesGetHandler.mockClear();
    mockSpacesGetByKeyHandler.mockClear();
    mockSpacesGetByIdHandler.mockClear();
    mockPagesGetHandler.mockClear();
    mockPagesCreateHandler.mockClear();
    mockPagesUpdateHandler.mockClear();
    mockPagesSearchHandler.mockClear();
    mockPagesGetBySpaceHandler.mockClear();
    mockPagesGetChildHandler.mockClear();
    mockSearchHandler.mockClear();
    mockContentGetHandler.mockClear();
    mockContentCreateHandler.mockClear();
    mockContentUpdateHandler.mockClear();
  });

  describe("routeToolCall", () => {
    describe("Spaces Domain Routing", () => {
      test("should route confluence_get_spaces to spaces.getSpaces handler", async () => {
        const mockResponse = { spaces: [], pagination: {} };
        mockSpacesGetHandler.mockResolvedValue(mockResponse);

        const args = { limit: 25, start: 0 };
        const result = await routeToolCall(
          "confluence_get_spaces",
          args,
          mockDomainHandlers,
        );

        expect(mockSpacesGetHandler).toHaveBeenCalledWith(args);
        expect(result).toBe(mockResponse);
      });

      test("should route confluence_get_space_by_key to spaces.getSpaceByKey handler", async () => {
        const mockResponse = { id: "123", key: "TEST", name: "Test Space" };
        mockSpacesGetByKeyHandler.mockResolvedValue(mockResponse);

        const args = { key: "TEST" };
        const result = await routeToolCall(
          "confluence_get_space_by_key",
          args,
          mockDomainHandlers,
        );

        expect(mockSpacesGetByKeyHandler).toHaveBeenCalledWith("TEST");
        expect(result).toBe(mockResponse);
      });

      test("should route confluence_get_space_by_id to spaces.getSpaceById handler", async () => {
        const mockResponse = { id: "123", key: "TEST", name: "Test Space" };
        mockSpacesGetByIdHandler.mockResolvedValue(mockResponse);

        const args = { id: "123" };
        const result = await routeToolCall(
          "confluence_get_space_by_id",
          args,
          mockDomainHandlers,
        );

        expect(mockSpacesGetByIdHandler).toHaveBeenCalledWith("123");
        expect(result).toBe(mockResponse);
      });

      test("should handle spaces handler errors", async () => {
        const testError = new Error("Spaces handler error");
        mockSpacesGetHandler.mockRejectedValue(testError);

        const args = { limit: 25 };
        await expect(
          routeToolCall("confluence_get_spaces", args, mockDomainHandlers),
        ).rejects.toThrow("Spaces handler error");
      });
    });

    describe("Pages Domain Routing", () => {
      test("should route confluence_get_page to pages.getPage handler", async () => {
        const mockResponse = { id: "123", title: "Test Page" };
        mockPagesGetHandler.mockResolvedValue(mockResponse);

        const args = { pageId: "123" };
        const result = await routeToolCall(
          "confluence_get_page",
          args,
          mockDomainHandlers,
        );

        expect(mockPagesGetHandler).toHaveBeenCalledWith(args);
        expect(result).toBe(mockResponse);
      });

      test("should route confluence_create_page to pages.createPage handler", async () => {
        const mockResponse = { id: "456", title: "New Page" };
        mockPagesCreateHandler.mockResolvedValue(mockResponse);

        const args = {
          spaceId: "SPACE1",
          title: "New Page",
          content: "<p>Content</p>",
        };
        const result = await routeToolCall(
          "confluence_create_page",
          args,
          mockDomainHandlers,
        );

        expect(mockPagesCreateHandler).toHaveBeenCalledWith(args);
        expect(result).toBe(mockResponse);
      });

      test("should route confluence_update_page to pages.updatePage handler", async () => {
        const mockResponse = { id: "123", title: "Updated Page" };
        mockPagesUpdateHandler.mockResolvedValue(mockResponse);

        const args = { pageId: "123", title: "Updated Page", versionNumber: 2 };
        const result = await routeToolCall(
          "confluence_update_page",
          args,
          mockDomainHandlers,
        );

        expect(mockPagesUpdateHandler).toHaveBeenCalledWith(args);
        expect(result).toBe(mockResponse);
      });

      test("should route confluence_get_pages_by_space to pages.getPagesBySpace handler", async () => {
        const mockResponse = { pages: [], pagination: {} };
        mockPagesGetBySpaceHandler.mockResolvedValue(mockResponse);

        const args = { spaceId: "SPACE1", limit: 25, start: 0 };
        const result = await routeToolCall(
          "confluence_get_pages_by_space",
          args,
          mockDomainHandlers,
        );

        expect(mockPagesGetBySpaceHandler).toHaveBeenCalledWith("SPACE1", {
          limit: 25,
          start: 0,
        });
        expect(result).toBe(mockResponse);
      });

      test("should route confluence_get_child_pages to pages.getChildPages handler", async () => {
        const mockResponse = { pages: [], pagination: {} };
        mockPagesGetChildHandler.mockResolvedValue(mockResponse);

        const args = { parentPageId: "123", limit: 10, start: 0 };
        const result = await routeToolCall(
          "confluence_get_child_pages",
          args,
          mockDomainHandlers,
        );

        expect(mockPagesGetChildHandler).toHaveBeenCalledWith("123", {
          limit: 10,
          start: 0,
        });
        expect(result).toBe(mockResponse);
      });

      test("should handle pages handler errors", async () => {
        const testError = new Error("Pages handler error");
        mockPagesGetHandler.mockRejectedValue(testError);

        const args = { pageId: "123" };
        await expect(
          routeToolCall("confluence_get_page", args, mockDomainHandlers),
        ).rejects.toThrow("Pages handler error");
      });
    });

    describe("Search Domain Routing", () => {
      test("should route confluence_search to search.searchContent handler", async () => {
        const mockResponse = { results: [], pagination: {} };
        mockSearchHandler.mockResolvedValue(mockResponse);

        const args = { query: "test", limit: 10 };
        const result = await routeToolCall(
          "confluence_search",
          args,
          mockDomainHandlers,
        );

        expect(mockSearchHandler).toHaveBeenCalledWith(args);
        expect(result).toBe(mockResponse);
      });

      test("should handle search handler errors", async () => {
        const testError = new Error("Search handler error");
        mockSearchHandler.mockRejectedValue(testError);

        const args = { query: "test" };
        await expect(
          routeToolCall("confluence_search", args, mockDomainHandlers),
        ).rejects.toThrow("Search handler error");
      });
    });

    describe("Unknown Tool Handling", () => {
      test("should throw error for unknown tool name", async () => {
        const unknownTool = "unknown_tool";
        const args = { someParam: "value" };

        await expect(
          routeToolCall(unknownTool, args, mockDomainHandlers),
        ).rejects.toThrow("Unknown tool: unknown_tool");
      });

      test("should throw error for empty tool name", async () => {
        const args = { someParam: "value" };

        await expect(
          routeToolCall("", args, mockDomainHandlers),
        ).rejects.toThrow("Unknown tool: ");
      });

      test("should throw error for removed content tools", async () => {
        // Content tools are no longer exposed via MCP
        await expect(
          routeToolCall("confluence_get_content", {}, mockDomainHandlers),
        ).rejects.toThrow("Unknown tool: confluence_get_content");

        await expect(
          routeToolCall("confluence_create_content", {}, mockDomainHandlers),
        ).rejects.toThrow("Unknown tool: confluence_create_content");

        await expect(
          routeToolCall("confluence_update_content", {}, mockDomainHandlers),
        ).rejects.toThrow("Unknown tool: confluence_update_content");
      });
    });

    describe("Argument Passing", () => {
      test("should pass undefined arguments correctly", async () => {
        const mockResponse = { spaces: [] };
        mockSpacesGetHandler.mockResolvedValue(mockResponse);

        await routeToolCall(
          "confluence_get_spaces",
          undefined,
          mockDomainHandlers,
        );

        expect(mockSpacesGetHandler).toHaveBeenCalledWith(undefined);
      });

      test("should pass null arguments correctly", async () => {
        const mockResponse = { spaces: [] };
        mockSpacesGetHandler.mockResolvedValue(mockResponse);

        await routeToolCall("confluence_get_spaces", null, mockDomainHandlers);

        expect(mockSpacesGetHandler).toHaveBeenCalledWith(null);
      });

      test("should pass empty object arguments correctly", async () => {
        const mockResponse = { spaces: [] };
        mockSpacesGetHandler.mockResolvedValue(mockResponse);

        const args = {};
        await routeToolCall("confluence_get_spaces", args, mockDomainHandlers);

        expect(mockSpacesGetHandler).toHaveBeenCalledWith(args);
      });

      test("should pass complex object arguments correctly", async () => {
        const mockResponse = { id: "123" };
        mockPagesCreateHandler.mockResolvedValue(mockResponse);

        const complexArgs = {
          spaceId: "SPACE1",
          title: "Complex Page",
          content: "<p>Complex content with <strong>formatting</strong></p>",
          metadata: {
            labels: ["tag1", "tag2"],
            properties: {
              customField: "value",
            },
          },
        };

        await routeToolCall(
          "confluence_create_page",
          complexArgs,
          mockDomainHandlers,
        );

        expect(mockPagesCreateHandler).toHaveBeenCalledWith(complexArgs);
      });
    });

    describe("Response Handling", () => {
      test("should return handler response without modification", async () => {
        const originalResponse = {
          spaces: [
            { id: "1", name: "Space 1" },
            { id: "2", name: "Space 2" },
          ],
          pagination: { limit: 25, start: 0, size: 2 },
        };

        mockSpacesGetHandler.mockResolvedValue(originalResponse);

        const result = await routeToolCall(
          "confluence_get_spaces",
          {},
          mockDomainHandlers,
        );

        expect(result).toBe(originalResponse);
        expect(result).toEqual(originalResponse);
      });

      test("should handle null responses", async () => {
        mockSpacesGetHandler.mockResolvedValue(null);

        const result = await routeToolCall(
          "confluence_get_spaces",
          {},
          mockDomainHandlers,
        );

        expect(result).toBeNull();
      });

      test("should handle undefined responses", async () => {
        mockSpacesGetHandler.mockResolvedValue(undefined);

        const result = await routeToolCall(
          "confluence_get_spaces",
          {},
          mockDomainHandlers,
        );

        expect(result).toBeUndefined();
      });

      test("should handle primitive responses", async () => {
        mockSpacesGetHandler.mockResolvedValue("string response");

        const result = await routeToolCall(
          "confluence_get_spaces",
          {},
          mockDomainHandlers,
        );

        expect(result).toBe("string response");
      });
    });

    describe("Error Propagation", () => {
      test("should propagate handler errors without modification", async () => {
        const originalError = new Error("Original handler error");
        originalError.name = "CustomError";
        mockSpacesGetHandler.mockRejectedValue(originalError);

        await expect(
          routeToolCall("confluence_get_spaces", {}, mockDomainHandlers),
        ).rejects.toThrow(originalError);
      });

      test("should propagate non-Error exceptions", async () => {
        const stringError = "String error from handler";
        mockSpacesGetHandler.mockRejectedValue(stringError);

        await expect(
          routeToolCall("confluence_get_spaces", {}, mockDomainHandlers),
        ).rejects.toBe(stringError);
      });

      test("should propagate custom error objects", async () => {
        const customError = {
          code: "CUSTOM_ERROR",
          message: "Custom error object",
          details: { field: "value" },
        };
        mockSpacesGetHandler.mockRejectedValue(customError);

        await expect(
          routeToolCall("confluence_get_spaces", {}, mockDomainHandlers),
        ).rejects.toBe(customError);
      });
    });

    describe("Tool Name Integration", () => {
      test("should handle all expected tool names", async () => {
        // Test that all expected tool names are handled correctly
        const toolTests = [
          { name: "confluence_get_spaces", handler: mockSpacesGetHandler },
          {
            name: "confluence_get_space_by_key",
            handler: mockSpacesGetByKeyHandler,
            args: { key: "TEST" },
          },
          {
            name: "confluence_get_space_by_id",
            handler: mockSpacesGetByIdHandler,
            args: { id: "123" },
          },
          { name: "confluence_get_page", handler: mockPagesGetHandler },
          { name: "confluence_create_page", handler: mockPagesCreateHandler },
          { name: "confluence_update_page", handler: mockPagesUpdateHandler },
          {
            name: "confluence_get_pages_by_space",
            handler: mockPagesGetBySpaceHandler,
            args: { spaceId: "SPACE1" },
          },
          {
            name: "confluence_get_child_pages",
            handler: mockPagesGetChildHandler,
            args: { parentPageId: "123" },
          },
          { name: "confluence_search", handler: mockSearchHandler },
        ];

        for (const { name, handler, args = {} } of toolTests) {
          handler.mockResolvedValue({ success: true });

          const result = await routeToolCall(name, args, mockDomainHandlers);

          expect(result).toEqual({ success: true });
          expect(handler).toHaveBeenCalled();

          handler.mockClear();
        }
      });
    });
  });
});
