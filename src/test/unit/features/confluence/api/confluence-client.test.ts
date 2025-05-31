import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { ConfluenceClient } from "../../../../../features/confluence/api/client.impl";
import { ConfluenceConfig } from "../../../../../features/confluence/api/config.types";
import type { IConfluenceHttpClient } from "../../../../../features/confluence/api/http-client.abstract.base";
import type { ConfluenceHttpClientFactory } from "../../../../../features/confluence/api/http-client.factory";
import type {
  ConfluenceApiCommentsResponse,
  ConfluenceApiSearchResponse,
  ConfluenceApiSpacesResponse,
} from "../../../../../features/confluence/api/responses.types";
import { mockRegistry } from "../../../../__mocks__/index";

interface MockHttpClient extends IConfluenceHttpClient {
  sendRequest: ReturnType<typeof mock>;
  getWebBaseUrl: ReturnType<typeof mock>;
}

describe("ConfluenceClient", () => {
  let confluenceClient: ConfluenceClient;
  let mockConfig: ConfluenceConfig;
  let mockHttpClientFactory: ConfluenceHttpClientFactory;
  let mockV1Client: MockHttpClient;
  let mockV2Client: MockHttpClient;

  beforeEach(() => {
    // Create mock config
    mockConfig = new ConfluenceConfig(
      "https://test.atlassian.net",
      "test-api-token",
      "test@example.com",
    );

    // Create mock HTTP clients
    mockV1Client = {
      sendRequest: mock(),
      getWebBaseUrl: mock(() => "https://test.atlassian.net/wiki"),
    } as MockHttpClient;

    mockV2Client = {
      sendRequest: mock(),
      getWebBaseUrl: mock(() => "https://test.atlassian.net/wiki"),
    } as MockHttpClient;

    // Create mock factory
    mockHttpClientFactory = {
      createV1Client: mock(() => mockV1Client),
      createV2Client: mock(() => mockV2Client),
    } as unknown as ConfluenceHttpClientFactory;

    // Create client instance
    confluenceClient = new ConfluenceClient(mockConfig);

    // Replace the internal factory with our mock
    (
      confluenceClient as unknown as {
        httpClientFactory: ConfluenceHttpClientFactory;
      }
    ).httpClientFactory = mockHttpClientFactory;
  });

  afterEach(() => {
    // Clear all mocks
    mock.restore();
  });

  describe("Constructor and Configuration", () => {
    test("should create client with valid configuration", () => {
      const client = new ConfluenceClient(mockConfig);
      expect(client).toBeInstanceOf(ConfluenceClient);
    });

    test("should throw error for missing host URL", () => {
      expect(() => {
        new ConfluenceClient(new ConfluenceConfig("", "token", "email"));
      }).toThrow("Confluence host URL is required");
    });

    test("should throw error for missing API token", () => {
      expect(() => {
        new ConfluenceClient(
          new ConfluenceConfig("https://test.com", "", "email"),
        );
      }).toThrow("Confluence API token is required");
    });

    test("should throw error for missing user email", () => {
      expect(() => {
        new ConfluenceClient(
          new ConfluenceConfig("https://test.com", "token", ""),
        );
      }).toThrow("User email is required for API token authentication");
    });
  });

  describe("getSpaces", () => {
    test("should get spaces with default options", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(3);
      const mockResponse: ConfluenceApiSpacesResponse = {
        results: mockSpaces,
        start: 0,
        limit: 25,
        size: 3,
        _links: {
          self: "/wiki/api/v2/spaces",
        },
      };

      mockV2Client.sendRequest.mockResolvedValue(mockResponse);

      const result = await confluenceClient.getSpaces();

      expect(result.spaces).toEqual(mockSpaces);
      expect(result.pagination).toEqual({
        limit: 25,
        start: 0,
        size: 3,
        hasMore: false,
      });

      expect(mockHttpClientFactory.createV2Client).toHaveBeenCalled();
      expect(mockV2Client.sendRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "spaces",
        headers: {},
        params: {
          limit: 25,
          start: 0,
        },
      });
    });

    test("should get spaces with custom options", async () => {
      const mockSpaces = mockRegistry.spaces.createMany(5);
      const mockResponse: ConfluenceApiSpacesResponse = {
        results: mockSpaces,
        start: 10,
        limit: 50,
        size: 5,
        _links: {
          self: "/wiki/api/v2/spaces",
          next: "/wiki/api/v2/spaces?start=60",
        },
      };

      mockV2Client.sendRequest.mockResolvedValue(mockResponse);

      const result = await confluenceClient.getSpaces({
        type: "global",
        limit: 50,
        start: 10,
      });

      expect(result.spaces).toEqual(mockSpaces);
      expect(result.pagination).toEqual({
        limit: 50,
        start: 10,
        size: 5,
        hasMore: true,
      });

      expect(mockV2Client.sendRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "spaces",
        headers: {},
        params: {
          limit: 50,
          start: 10,
          type: "global",
        },
      });
    });
  });

  describe("getPage", () => {
    test("should get page with default options", async () => {
      const mockPage = mockRegistry.pages.create();
      mockV2Client.sendRequest.mockResolvedValue(mockPage);

      const result = await confluenceClient.getPage("123");

      expect(result).toEqual(mockPage);
      expect(mockV2Client.sendRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "pages/123",
        headers: {},
        params: {
          "body-format": "storage",
        },
      });
    });

    test("should get page with custom options", async () => {
      const mockPage = mockRegistry.pages.create();
      mockV2Client.sendRequest.mockResolvedValue(mockPage);

      const result = await confluenceClient.getPage("123", {
        includeContent: false,
        expand: ["version", "space"],
      });

      expect(result).toEqual(mockPage);
      expect(mockV2Client.sendRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "pages/123",
        headers: {},
        params: {
          expand: "version,space",
        },
      });
    });

    test("should get page with content included by default", async () => {
      const mockPage = mockRegistry.pages.create();
      mockV2Client.sendRequest.mockResolvedValue(mockPage);

      await confluenceClient.getPage("123", { includeContent: true });

      expect(mockV2Client.sendRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "pages/123",
        headers: {},
        params: {
          "body-format": "storage",
        },
      });
    });
  });

  describe("createPage", () => {
    test("should create page successfully", async () => {
      const createData = {
        spaceId: "SPACE1",
        title: "New Page",
        body: {
          storage: {
            value: "<p>Page content</p>",
            representation: "storage",
          },
        },
      };

      const mockPage = mockRegistry.pages.create({
        id: "new-page-123",
        title: "New Page",
        spaceId: "SPACE1",
      });

      mockV2Client.sendRequest.mockResolvedValue(mockPage);

      const result = await confluenceClient.createPage(createData);

      expect(result).toEqual(mockPage);
      expect(mockV2Client.sendRequest).toHaveBeenCalledWith({
        method: "POST",
        url: "pages",
        headers: {},
        data: createData,
      });
    });

    test("should create page with optional parameters", async () => {
      const createData = {
        spaceId: "SPACE1",
        title: "New Page",
        body: {
          storage: {
            value: "<p>Page content</p>",
            representation: "storage",
          },
        },
        status: "draft",
        parentId: "parent-123",
      };

      const mockPage = mockRegistry.pages.create();
      mockV2Client.sendRequest.mockResolvedValue(mockPage);

      const result = await confluenceClient.createPage(createData);

      expect(result).toEqual(mockPage);
      expect(mockV2Client.sendRequest).toHaveBeenCalledWith({
        method: "POST",
        url: "pages",
        headers: {},
        data: createData,
      });
    });
  });

  describe("updatePage", () => {
    test("should update page successfully", async () => {
      const updateData = {
        id: "page-123",
        type: "page",
        title: "Updated Page",
        status: "current",
        version: {
          number: 2,
          message: "Updated content",
        },
        body: {
          storage: {
            value: "<p>Updated content</p>",
            representation: "storage",
          },
        },
      };

      const mockPage = mockRegistry.pages.create({
        id: "page-123",
        title: "Updated Page",
        version: {
          number: 2,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "user123",
        },
      });

      mockV2Client.sendRequest.mockResolvedValue(mockPage);

      const result = await confluenceClient.updatePage("page-123", updateData);

      expect(result).toEqual(mockPage);
      expect(mockV2Client.sendRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "pages/page-123",
        headers: {},
        data: updateData,
      });
    });
  });

  describe("searchPages", () => {
    test("should search pages with default options", async () => {
      const mockResults = mockRegistry.searchResults.createMany(3);
      const mockResponse: ConfluenceApiSearchResponse = {
        results: mockResults,
        start: 0,
        limit: 25,
        size: 3,
        totalSize: 10,
        searchDuration: 45.5,
        _links: {
          self: "/wiki/rest/api/search",
        },
      };

      mockV1Client.sendRequest.mockResolvedValue(mockResponse);

      const result = await confluenceClient.searchPages("test query");

      expect(result.results).toEqual(mockResults);
      expect(result.pagination).toEqual({
        limit: 25,
        start: 0,
        size: 3,
        hasMore: false,
      });
      expect(result.totalSize).toBe(10);
      expect(result.searchDuration).toBe(45.5);

      expect(mockHttpClientFactory.createV1Client).toHaveBeenCalled();
      expect(mockV1Client.sendRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "search",
        headers: {},
        params: {
          cql: "test query",
          limit: 25,
          start: 0,
        },
      });
    });

    test("should search pages with custom options", async () => {
      const mockResults = mockRegistry.searchResults.createMany(5);
      const mockResponse: ConfluenceApiSearchResponse = {
        results: mockResults,
        start: 10,
        limit: 50,
        size: 5,
        totalSize: 100,
        searchDuration: 123.4,
        _links: {
          self: "/wiki/rest/api/search",
          next: "/wiki/rest/api/search?start=60",
        },
      };

      mockV1Client.sendRequest.mockResolvedValue(mockResponse);

      const result = await confluenceClient.searchPages("test query", {
        spaceKey: "TEST",
        type: "page",
        limit: 50,
        start: 10,
        orderBy: "created",
      });

      expect(result.results).toEqual(mockResults);
      expect(result.pagination).toEqual({
        limit: 50,
        start: 10,
        size: 5,
        hasMore: true,
      });

      expect(mockV1Client.sendRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "search",
        headers: {},
        params: {
          cql: 'test query AND space.key = "TEST" AND type = "page" ORDER BY created',
          limit: 50,
          start: 10,
        },
      });
    });

    test("should build correct CQL for different order options", async () => {
      const mockResponse: ConfluenceApiSearchResponse = {
        results: [],
        start: 0,
        limit: 25,
        size: 0,
        totalSize: 0,
        searchDuration: 10,
        _links: { self: "/wiki/rest/api/search" },
      };

      mockV1Client.sendRequest.mockResolvedValue(mockResponse);

      // Test different orderBy options
      await confluenceClient.searchPages("test", { orderBy: "modified" });

      expect(mockV1Client.sendRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "search",
        headers: {},
        params: {
          cql: "test ORDER BY lastModified",
          limit: 25,
          start: 0,
        },
      });
    });
  });

  describe("getPageComments", () => {
    test("should get page comments with default options", async () => {
      const mockComments = mockRegistry.comments.createMany(3);
      const mockResponse: ConfluenceApiCommentsResponse = {
        results: mockComments,
        start: 0,
        limit: 25,
        size: 3,
        _links: {
          self: "/wiki/api/v2/pages/123/comments",
        },
      };

      mockV2Client.sendRequest.mockResolvedValue(mockResponse);

      const result = await confluenceClient.getPageComments("123");

      expect(result.comments).toEqual(mockComments);
      expect(result.pagination).toEqual({
        limit: 25,
        start: 0,
        size: 3,
        hasMore: false,
      });

      expect(mockV2Client.sendRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "pages/123/comments",
        headers: {},
        params: {
          limit: 25,
          start: 0,
        },
      });
    });

    test("should get page comments with custom options", async () => {
      const mockComments = mockRegistry.comments.createMany(5);
      const mockResponse: ConfluenceApiCommentsResponse = {
        results: mockComments,
        start: 10,
        limit: 50,
        size: 5,
        _links: {
          self: "/wiki/api/v2/pages/123/comments",
          next: "/wiki/api/v2/pages/123/comments?start=60",
        },
      };

      mockV2Client.sendRequest.mockResolvedValue(mockResponse);

      const result = await confluenceClient.getPageComments("123", {
        limit: 50,
        start: 10,
        orderBy: "created",
      });

      expect(result.comments).toEqual(mockComments);
      expect(result.pagination).toEqual({
        limit: 50,
        start: 10,
        size: 5,
        hasMore: true,
      });

      expect(mockV2Client.sendRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "pages/123/comments",
        headers: {},
        params: {
          limit: 50,
          start: 10,
          sort: "created-date",
        },
      });
    });

    test("should handle updated orderBy option", async () => {
      const mockComments = mockRegistry.comments.createMany(3);
      const mockResponse: ConfluenceApiCommentsResponse = {
        results: mockComments,
        start: 0,
        limit: 25,
        size: 3,
        _links: {
          self: "/wiki/api/v2/pages/123/comments",
        },
      };

      mockV2Client.sendRequest.mockResolvedValue(mockResponse);

      await confluenceClient.getPageComments("123", { orderBy: "updated" });

      expect(mockV2Client.sendRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "pages/123/comments",
        headers: {},
        params: {
          limit: 25,
          start: 0,
          sort: "modified-date",
        },
      });
    });
  });

  describe("getWebBaseUrl", () => {
    test("should return web base URL from HTTP client", () => {
      const result = confluenceClient.getWebBaseUrl();
      expect(result).toBe("https://test.atlassian.net/wiki");
      expect(mockHttpClientFactory.createV2Client).toHaveBeenCalled();
      expect(mockV2Client.getWebBaseUrl).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling", () => {
    test("should propagate HTTP client errors", async () => {
      const error = new Error("Network error");
      mockV2Client.sendRequest.mockRejectedValue(error);

      await expect(confluenceClient.getSpaces()).rejects.toThrow(
        "Network error",
      );
    });

    test("should handle API errors in all methods", async () => {
      const apiError = new Error("API Error");
      mockV2Client.sendRequest.mockRejectedValue(apiError);

      await expect(confluenceClient.getPage("123")).rejects.toThrow(
        "API Error",
      );
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty search results", async () => {
      const mockResponse: ConfluenceApiSearchResponse = {
        results: [],
        start: 0,
        limit: 25,
        size: 0,
        totalSize: 0,
        searchDuration: 15,
        _links: { self: "/wiki/rest/api/search" },
      };

      mockV1Client.sendRequest.mockResolvedValue(mockResponse);

      const result = await confluenceClient.searchPages("nonexistent");

      expect(result.results).toEqual([]);
      expect(result.totalSize).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    test("should handle empty spaces response", async () => {
      const mockResponse: ConfluenceApiSpacesResponse = {
        results: [],
        start: 0,
        limit: 25,
        size: 0,
        _links: { self: "/wiki/api/v2/spaces" },
      };

      mockV2Client.sendRequest.mockResolvedValue(mockResponse);

      const result = await confluenceClient.getSpaces();

      expect(result.spaces).toEqual([]);
      expect(result.pagination.hasMore).toBe(false);
    });

    test("should handle empty comments response", async () => {
      const mockResponse: ConfluenceApiCommentsResponse = {
        results: [],
        start: 0,
        limit: 25,
        size: 0,
        _links: { self: "/wiki/api/v2/pages/123/comments" },
      };

      mockV2Client.sendRequest.mockResolvedValue(mockResponse);

      const result = await confluenceClient.getPageComments("123");

      expect(result.comments).toEqual([]);
      expect(result.pagination.hasMore).toBe(false);
    });
  });
});
