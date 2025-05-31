import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { ConfluenceClient } from "@features/confluence/api/index";
import type { GetSpacesResponse } from "@features/confluence/api/responses.types";
import { ConfluenceGetSpacesHandler } from "@features/confluence/tools/handlers/get-spaces.handler";
import type { GetSpacesParams } from "@features/confluence/tools/tools.types";
import { mockRegistry } from "../../../../../__mocks__/index";

describe("ConfluenceGetSpacesHandler", () => {
  let handler: ConfluenceGetSpacesHandler;
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

    handler = new ConfluenceGetSpacesHandler(mockConfluenceClient);
  });

  describe("Constructor", () => {
    test("should initialize with correct properties", () => {
      expect(handler.feature).toBe("confluence");
      expect(handler.name).toBe("confluence_get_spaces");
      expect(handler.description).toBe(
        "List user's accessible Confluence spaces",
      );
    });
  });

  describe("Parameter Validation", () => {
    test("should accept empty parameters", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(3);
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: GetSpacesParams = {};
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept null parameters", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(3);
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const response = await handler.handle(null);
      expect(response.success).toBe(true);
    });

    test("should accept undefined parameters", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(3);
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const response = await handler.handle(undefined);
      expect(response.success).toBe(true);
    });

    test("should accept valid type parameter - global", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(3, { type: "global" });
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: GetSpacesParams = { type: "global" };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept valid type parameter - personal", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(3, {
        type: "personal",
      });
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: GetSpacesParams = { type: "personal" };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should throw error for invalid type parameter", async () => {
      const params = { type: "invalid" as "global" | "personal" };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Invalid type parameter: invalid. Must be 'global' or 'personal'",
      );
    });

    test("should accept valid limit parameter", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(5);
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: GetSpacesParams = { limit: 50 };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should throw error for invalid limit parameter - zero", async () => {
      const params: GetSpacesParams = { limit: 0 };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Invalid limit parameter: must be a number between 1 and 100",
      );
    });

    test("should throw error for invalid limit parameter - too large", async () => {
      const params: GetSpacesParams = { limit: 101 };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Invalid limit parameter: must be a number between 1 and 100",
      );
    });

    test("should throw error for invalid limit parameter - negative", async () => {
      const params: GetSpacesParams = { limit: -1 };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Invalid limit parameter: must be a number between 1 and 100",
      );
    });

    test("should accept valid start parameter", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(3);
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: GetSpacesParams = { start: 10 };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should accept zero start parameter", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(3);
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: GetSpacesParams = { start: 0 };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });

    test("should throw error for invalid start parameter - negative", async () => {
      const params: GetSpacesParams = { start: -1 };
      const response = await handler.handle(params);
      expect(response.success).toBe(false);
      expect(response.error).toContain(
        "Invalid start parameter: must be a non-negative number",
      );
    });

    test("should accept all valid parameters together", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(3);
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: GetSpacesParams = {
        type: "global",
        limit: 25,
        start: 0,
      };
      const response = await handler.handle(params);
      expect(response.success).toBe(true);
    });
  });

  describe("API Integration", () => {
    test("should call getSpaces with correct parameters", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(3);
      const getSpacesMock = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );
      mockConfluenceClient.getSpaces = getSpacesMock;

      const params: GetSpacesParams = {
        type: "global",
        limit: 50,
        start: 10,
      };

      await handler.handle(params);

      expect(getSpacesMock).toHaveBeenCalledWith({
        type: "global",
        limit: 50,
        start: 10,
      });
    });

    test("should call getSpaces with empty options when no params provided", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(3);
      const getSpacesMock = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );
      mockConfluenceClient.getSpaces = getSpacesMock;

      await handler.handle({});

      expect(getSpacesMock).toHaveBeenCalledWith({});
    });

    test("should call getSpaces with partial parameters", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(3);
      const getSpacesMock = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );
      mockConfluenceClient.getSpaces = getSpacesMock;

      const params: GetSpacesParams = { type: "personal" };

      await handler.handle(params);

      expect(getSpacesMock).toHaveBeenCalledWith({
        type: "personal",
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle API errors gracefully", async () => {
      const apiError = new Error("Unauthorized access");
      mockConfluenceClient.getSpaces = mock(() => Promise.reject(apiError));

      const params: GetSpacesParams = {};
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain("Unauthorized access");
    });

    test("should handle network errors", async () => {
      const networkError = new Error("Network timeout");
      mockConfluenceClient.getSpaces = mock(() => Promise.reject(networkError));

      const params: GetSpacesParams = {};
      const response = await handler.handle(params);

      expect(response.success).toBe(false);
      expect(response.error).toContain("Network timeout");
    });
  });

  describe("Response Formatting", () => {
    test("should return response with spaces, pagination, and summary", async () => {
      const mockSpaces = [
        mockRegistry.spaces.create({ type: "global" }),
        mockRegistry.spaces.create({ type: "global" }),
        mockRegistry.spaces.create({ type: "personal" }),
      ];
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: GetSpacesParams = {};
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as GetSpacesResponse;
      expect(data).toHaveProperty("spaces");
      expect(data).toHaveProperty("pagination");
      expect(data).toHaveProperty("summary");
      expect(data.spaces).toHaveLength(3);
    });

    test("should calculate summary statistics correctly", async () => {
      const mockSpaces = [
        mockRegistry.spaces.create({ type: "global" }),
        mockRegistry.spaces.create({ type: "global" }),
        mockRegistry.spaces.create({ type: "personal" }),
        mockRegistry.spaces.create({ type: "personal" }),
      ];
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: GetSpacesParams = {};
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as GetSpacesResponse;
      expect(data.summary.total).toBe(4);
      expect(data.summary.globalSpaces).toBe(2);
      expect(data.summary.personalSpaces).toBe(2);
    });

    test("should handle empty spaces list", async () => {
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: [],
          pagination: mockRegistry.pagination.create({ size: 0 }),
        }),
      );

      const params: GetSpacesParams = {};
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as GetSpacesResponse;
      expect(data.spaces).toHaveLength(0);
      expect(data.summary.total).toBe(0);
      expect(data.summary.globalSpaces).toBe(0);
      expect(data.summary.personalSpaces).toBe(0);
    });

    test("should handle only global spaces", async () => {
      const mockSpaces = [
        mockRegistry.spaces.create({ type: "global" }),
        mockRegistry.spaces.create({ type: "global" }),
      ];
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: GetSpacesParams = {};
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as GetSpacesResponse;
      expect(data.summary.total).toBe(2);
      expect(data.summary.globalSpaces).toBe(2);
      expect(data.summary.personalSpaces).toBe(0);
    });

    test("should handle only personal spaces", async () => {
      const mockSpaces = [
        mockRegistry.spaces.create({ type: "personal" }),
        mockRegistry.spaces.create({ type: "personal" }),
      ];
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockRegistry.pagination.create(),
        }),
      );

      const params: GetSpacesParams = {};
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as GetSpacesResponse;
      expect(data.summary.total).toBe(2);
      expect(data.summary.globalSpaces).toBe(0);
      expect(data.summary.personalSpaces).toBe(2);
    });
  });

  describe("Pagination Handling", () => {
    test("should include pagination information in response", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(3);
      const mockPagination = mockRegistry.pagination.create({
        limit: 25,
        start: 0,
        size: 3,
        hasMore: true,
      });
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockPagination,
        }),
      );

      const params: GetSpacesParams = {};
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as GetSpacesResponse;
      expect(data.pagination).toEqual(mockPagination);
    });

    test("should handle pagination with no more results", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(3);
      const mockPagination = mockRegistry.pagination.create({
        limit: 25,
        start: 0,
        size: 3,
        hasMore: false,
      });
      mockConfluenceClient.getSpaces = mock(() =>
        Promise.resolve({
          spaces: mockSpaces,
          pagination: mockPagination,
        }),
      );

      const params: GetSpacesParams = {};
      const response = await handler.handle(params);

      expect(response.success).toBe(true);
      const data = response.data as GetSpacesResponse;
      expect(data.pagination.hasMore).toBe(false);
    });
  });
});
