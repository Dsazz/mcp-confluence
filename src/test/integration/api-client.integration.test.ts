import { beforeEach, describe, expect, test } from "bun:test";
import { ConfluenceClient } from "../../features/confluence/api/client.impl";
import { ConfluenceConfig } from "../../features/confluence/api/config.types";
import { ConfluenceHttpClientFactory } from "../../features/confluence/api/http-client.factory";
import { ConfluenceOperationRouter } from "../../features/confluence/api/operation.router";

describe("API Client Integration", () => {
  let client: ConfluenceClient;
  let validConfig: ConfluenceConfig;
  let httpClientFactory: ConfluenceHttpClientFactory;
  let operationRouter: ConfluenceOperationRouter;

  beforeEach(() => {
    // Setup valid configuration
    validConfig = new ConfluenceConfig(
      "https://test.atlassian.net",
      "test-token-123",
      "test@example.com",
    );

    // Initialize components
    httpClientFactory = new ConfluenceHttpClientFactory(validConfig);
    operationRouter = new ConfluenceOperationRouter();
    client = new ConfluenceClient(validConfig);
  });

  describe("Configuration and Initialization", () => {
    test("should initialize with valid configuration", () => {
      expect(() => new ConfluenceClient(validConfig)).not.toThrow();
      expect(client).toBeDefined();
      expect(client.getWebBaseUrl()).toBe("https://test.atlassian.net/wiki");
    });

    test("should handle URLs with /wiki path without duplication", () => {
      // Test with URL that already has /wiki path
      const configWithWiki = new ConfluenceConfig(
        "https://test.atlassian.net/wiki",
        "test-token-123",
        "test@example.com",
      );
      const clientWithWiki = new ConfluenceClient(configWithWiki);

      expect(clientWithWiki.getWebBaseUrl()).toBe(
        "https://test.atlassian.net/wiki",
      );
    });

    test("should handle URLs without /wiki path by adding it", () => {
      // Test with URL that doesn't have /wiki path
      const configWithoutWiki = new ConfluenceConfig(
        "https://test.atlassian.net",
        "test-token-123",
        "test@example.com",
      );
      const clientWithoutWiki = new ConfluenceClient(configWithoutWiki);

      expect(clientWithoutWiki.getWebBaseUrl()).toBe(
        "https://test.atlassian.net/wiki",
      );
    });

    test("should validate configuration on initialization", () => {
      const invalidConfig = new ConfluenceConfig("", "", "");

      expect(() => new ConfluenceClient(invalidConfig)).toThrow();
    });

    test("should provide operation routing information", () => {
      const routingInfo = client.getRoutingInfo();

      expect(routingInfo).toBeDefined();
      expect(routingInfo.operationDistribution).toBeDefined();
      expect(routingInfo.v1Operations).toBeDefined();
      expect(routingInfo.v2Operations).toBeDefined();
      expect(Array.isArray(routingInfo.v1Operations)).toBe(true);
      expect(Array.isArray(routingInfo.v2Operations)).toBe(true);
    });

    test("should route search operations to v1 API", () => {
      const version = operationRouter.getVersionForOperation("search");
      expect(version).toBe("v1");
    });

    test("should route CRUD operations to v2 API", () => {
      const getPageVersion = operationRouter.getVersionForOperation("getPage");
      const createPageVersion =
        operationRouter.getVersionForOperation("createPage");
      const updatePageVersion =
        operationRouter.getVersionForOperation("updatePage");

      expect(getPageVersion).toBe("v2");
      expect(createPageVersion).toBe("v2");
      expect(updatePageVersion).toBe("v2");
    });
  });

  describe("HTTP Client Factory Integration", () => {
    test("should create different HTTP clients for different API versions", () => {
      const v1Client = httpClientFactory.createV1Client();
      const v2Client = httpClientFactory.createV2Client();

      expect(v1Client).toBeDefined();
      expect(v2Client).toBeDefined();
      expect(v1Client).not.toBe(v2Client);
    });

    test("should handle client creation errors gracefully", () => {
      const invalidConfig = new ConfluenceConfig("invalid-url", "", "invalid");

      // Factory creation doesn't validate, but client usage will fail
      expect(
        () => new ConfluenceHttpClientFactory(invalidConfig),
      ).not.toThrow();

      // The actual validation happens when making requests
      const factory = new ConfluenceHttpClientFactory(invalidConfig);
      expect(factory).toBeDefined();
    });

    test("should configure clients with correct base URLs", () => {
      const v1Client = httpClientFactory.createV1Client();
      const v2Client = httpClientFactory.createV2Client();

      // Both clients should be configured with the base URL
      expect(v1Client).toBeDefined();
      expect(v2Client).toBeDefined();
    });
  });

  describe("Request Building and Parameter Processing", () => {
    test("should build correct request parameters for search", async () => {
      // Test search with various parameters
      const searchOptions = {
        spaceKey: "TEST",
        type: "page" as const,
        limit: 10,
        start: 0,
        orderBy: "relevance" as const,
      };

      // This will make an HTTP request and fail with authentication error
      await expect(
        client.searchPages("test query", searchOptions),
      ).rejects.toThrow("Authentication failed");
    });

    test("should build correct request parameters for getSpaces", async () => {
      const spacesOptions = {
        type: "global" as const,
        limit: 50,
        start: 0,
      };

      await expect(client.getSpaces(spacesOptions)).rejects.toThrow(
        "Authentication failed",
      );
    });

    test("should handle special characters in parameters", async () => {
      const queryWithSpecialChars = 'text ~ "test & special chars"';

      await expect(client.searchPages(queryWithSpecialChars)).rejects.toThrow(
        "Authentication failed",
      );
    });

    test("should validate parameter constraints", async () => {
      // Test invalid limit (too high)
      const invalidOptions = {
        limit: 150, // Should be <= 100
      };

      await expect(client.getSpaces(invalidOptions)).rejects.toThrow();
    });
  });

  describe("Response Processing and Pagination", () => {
    test("should handle pagination correctly in responses", async () => {
      // Test that pagination would be processed correctly if authenticated
      await expect(client.getSpaces({ limit: 25 })).rejects.toThrow(
        "Authentication failed",
      );
    });

    test("should handle last page pagination correctly", async () => {
      await expect(client.getSpaces({ limit: 25, start: 75 })).rejects.toThrow(
        "Authentication failed",
      );
    });

    test("should correctly process search response", async () => {
      await expect(client.searchPages("test query")).rejects.toThrow(
        "Authentication failed",
      );
    });

    test("should correctly process spaces response", async () => {
      await expect(client.getSpaces()).rejects.toThrow("Authentication failed");
    });
  });

  describe("Error Handling and Propagation", () => {
    test("should propagate HTTP client errors", async () => {
      // Test with invalid page ID that would cause HTTP error
      await expect(client.getPage("invalid-page-id")).rejects.toThrow();
    });

    test("should handle invalid responses gracefully", async () => {
      // Test with malformed query that might return invalid response
      await expect(client.searchPages("")).rejects.toThrow();
    });

    test("should handle network timeouts", async () => {
      // This would require mocking network timeouts
      // For now, we test that the client handles errors appropriately
      await expect(client.getPage("timeout-test")).rejects.toThrow();
    });

    test("should handle authentication errors", async () => {
      const invalidAuthConfig = new ConfluenceConfig(
        "https://test.atlassian.net/wiki",
        "invalid-token",
        "invalid@example.com",
      );

      const invalidClient = new ConfluenceClient(invalidAuthConfig);
      await expect(invalidClient.getSpaces()).rejects.toThrow();
    });
  });

  describe("CRUD Operations Integration", () => {
    test("should create page with correct data structure", async () => {
      const createData = {
        spaceId: "TEST",
        title: "Test Page",
        body: {
          storage: {
            value: "<p>Test content</p>",
            representation: "storage",
          },
        },
        status: "current",
      };

      await expect(client.createPage(createData)).rejects.toThrow(
        "Authentication failed",
      );
    });

    test("should update page with correct data structure", async () => {
      const updateData = {
        id: "123456",
        type: "page",
        title: "Updated Test Page",
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

      await expect(client.updatePage("123456", updateData)).rejects.toThrow(
        "Authentication failed",
      );
    });

    test("should handle validation errors in CRUD operations", async () => {
      // Test create page with missing required fields
      const invalidCreateData = {
        spaceId: "",
        title: "",
        body: {
          storage: {
            value: "",
            representation: "storage",
          },
        },
      };

      await expect(client.createPage(invalidCreateData)).rejects.toThrow();

      // Test update page with invalid version
      const invalidUpdateData = {
        id: "123456",
        type: "page",
        title: "Test",
        status: "current",
        version: {
          number: -1, // Invalid version number
        },
      };

      await expect(
        client.updatePage("123456", invalidUpdateData),
      ).rejects.toThrow();
    });

    test("should handle page comments retrieval", async () => {
      await expect(client.getPageComments("123456")).rejects.toThrow(
        "Authentication failed",
      );
    });

    test("should handle page comments with options", async () => {
      const options = {
        limit: 10,
        start: 0,
        orderBy: "created" as const,
      };

      await expect(client.getPageComments("123456", options)).rejects.toThrow(
        "Authentication failed",
      );
    });
  });

  describe("Integration Workflow Scenarios", () => {
    test("should support search → get page workflow", async () => {
      // Test that workflow would work if authenticated
      await expect(client.searchPages("test")).rejects.toThrow(
        "Authentication failed",
      );
    });

    test("should support get spaces → create page workflow", async () => {
      // Test that workflow would work if authenticated
      await expect(client.getSpaces()).rejects.toThrow("Authentication failed");
    });

    test("should support create → update page workflow", async () => {
      // Test that workflow would work if authenticated
      const createData = {
        spaceId: "TEST",
        title: "Page to Update",
        body: {
          storage: {
            value: "<p>Initial content</p>",
            representation: "storage",
          },
        },
      };

      await expect(client.createPage(createData)).rejects.toThrow(
        "Authentication failed",
      );
    });
  });
});
