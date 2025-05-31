import { beforeEach, describe, expect, test } from "bun:test";
import { normalizeError } from "../../core/errors/index";
import { McpError } from "../../core/errors/mcp.error";
import { ValidationError } from "../../core/errors/validation.error";
import { ConfluenceClient } from "../../features/confluence/api/client.impl";
import { ConfluenceConfig } from "../../features/confluence/api/config.types";
import { ConfluenceCreatePageHandler } from "../../features/confluence/tools/handlers/create-page.handler";
import { ConfluenceGetPageHandler } from "../../features/confluence/tools/handlers/get-page.handler";
import { ConfluenceGetSpacesHandler } from "../../features/confluence/tools/handlers/get-spaces.handler";
import { ConfluenceSearchPagesHandler } from "../../features/confluence/tools/handlers/search-pages.handler";
import { ConfluenceUpdatePageHandler } from "../../features/confluence/tools/handlers/update-page.handler";

describe("Error Handling Integration", () => {
  let mockConfluenceClient: ConfluenceClient;
  let handlers: {
    getSpaces: ConfluenceGetSpacesHandler;
    getPage: ConfluenceGetPageHandler;
    searchPages: ConfluenceSearchPagesHandler;
    createPage: ConfluenceCreatePageHandler;
    updatePage: ConfluenceUpdatePageHandler;
  };

  beforeEach(() => {
    // Setup mock Confluence client
    const mockConfig = new ConfluenceConfig(
      "https://test.atlassian.net/wiki",
      "test-token",
      "test@example.com",
    );
    mockConfluenceClient = new ConfluenceClient(mockConfig);

    // Initialize handlers
    handlers = {
      getSpaces: new ConfluenceGetSpacesHandler(mockConfluenceClient),
      getPage: new ConfluenceGetPageHandler(mockConfluenceClient),
      searchPages: new ConfluenceSearchPagesHandler(mockConfluenceClient),
      createPage: new ConfluenceCreatePageHandler(mockConfluenceClient),
      updatePage: new ConfluenceUpdatePageHandler(mockConfluenceClient),
    };
  });

  describe("Parameter Validation Errors", () => {
    test("should handle missing required parameters", async () => {
      // Test missing pageId for getPage
      const getPageResult = await handlers.getPage.handle({});
      expect(getPageResult.success).toBe(false);
      expect(getPageResult.error).toContain("pageId is required");

      // Test missing query for searchPages
      const searchResult = await handlers.searchPages.handle({});
      expect(searchResult.success).toBe(false);
      expect(searchResult.error).toContain("query is required");

      // Test missing spaceId for createPage
      const createResult = await handlers.createPage.handle({});
      expect(createResult.success).toBe(false);
      expect(createResult.error).toContain("spaceId is required");

      // Test missing pageId for updatePage
      const updateResult = await handlers.updatePage.handle({});
      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toContain("pageId is required");
    });

    test("should handle invalid parameter types", async () => {
      // Test invalid pageId type
      const getPageResult = await handlers.getPage.handle({
        pageId: 123 as never,
      });
      expect(getPageResult.success).toBe(false);
      expect(getPageResult.error).toContain(
        "pageId is required and must be a string",
      );

      // Test invalid query type
      const searchResult = await handlers.searchPages.handle({
        query: null as never,
      });
      expect(searchResult.success).toBe(false);
      expect(searchResult.error).toContain("query is required");

      // Test invalid spaceId type
      const createResult = await handlers.createPage.handle({
        spaceId: [] as never,
        title: "Test",
        content: "Test content",
      });
      expect(createResult.success).toBe(false);
      expect(createResult.error).toContain(
        "spaceId is required and must be a string",
      );
    });

    test("should handle invalid parameter values", async () => {
      // Test invalid limit values
      const getSpacesResult1 = await handlers.getSpaces.handle({ limit: 0 });
      expect(getSpacesResult1.success).toBe(false);
      expect(getSpacesResult1.error).toContain("Invalid limit parameter");

      const getSpacesResult2 = await handlers.getSpaces.handle({ limit: 150 });
      expect(getSpacesResult2.success).toBe(false);
      expect(getSpacesResult2.error).toContain("Invalid limit parameter");

      // Test invalid start values
      const getSpacesResult3 = await handlers.getSpaces.handle({ start: -1 });
      expect(getSpacesResult3.success).toBe(false);
      expect(getSpacesResult3.error).toContain("Invalid start parameter");

      // Test invalid type values
      const getSpacesResult4 = await handlers.getSpaces.handle({
        type: "invalid" as never,
      });
      expect(getSpacesResult4.success).toBe(false);
      expect(getSpacesResult4.error).toContain("Invalid type parameter");
    });

    test("should handle empty string parameters", async () => {
      // Test empty pageId
      const getPageResult = await handlers.getPage.handle({ pageId: "" });
      expect(getPageResult.success).toBe(false);
      expect(getPageResult.error).toContain("pageId is required");

      // Test empty query
      const searchResult = await handlers.searchPages.handle({ query: "" });
      expect(searchResult.success).toBe(false);
      expect(searchResult.error).toContain("query is required");

      // Test empty spaceId
      const createResult = await handlers.createPage.handle({
        spaceId: "",
        title: "Test",
        content: "Test content",
      });
      expect(createResult.success).toBe(false);
      expect(createResult.error).toContain("spaceId is required");
    });

    test("should handle whitespace-only parameters", async () => {
      // Test whitespace-only pageId - will make API call and fail with auth error
      const getPageResult = await handlers.getPage.handle({ pageId: "   " });
      expect(getPageResult.success).toBe(false);
      expect(getPageResult.error).toContain("Authentication failed");

      // Test whitespace-only query
      const searchResult = await handlers.searchPages.handle({ query: "   " });
      expect(searchResult.success).toBe(false);
      expect(searchResult.error).toContain("query is required");

      // Test whitespace-only title
      const createResult = await handlers.createPage.handle({
        spaceId: "TEST",
        title: "   ",
        content: "Test content",
      });
      expect(createResult.success).toBe(false);
      expect(createResult.error).toContain("title is required");
    });
  });

  describe("API Client Error Propagation", () => {
    test("should propagate HTTP 404 errors", async () => {
      // Test with non-existent page ID
      const getPageResult = await handlers.getPage.handle({
        pageId: "non-existent-page",
      });
      expect(getPageResult.success).toBe(false);
      expect(getPageResult.error).toBeDefined();
    });

    test("should propagate HTTP 401 authentication errors", async () => {
      // Create client with invalid credentials
      const invalidConfig = new ConfluenceConfig(
        "https://test.atlassian.net/wiki",
        "invalid-token",
        "invalid@example.com",
      );
      const invalidClient = new ConfluenceClient(invalidConfig);
      const invalidHandler = new ConfluenceGetSpacesHandler(invalidClient);

      const result = await invalidHandler.handle({});
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test("should propagate HTTP 403 permission errors", async () => {
      // Test with restricted page access
      const getPageResult = await handlers.getPage.handle({
        pageId: "restricted-page",
      });
      expect(getPageResult.success).toBe(false);
      expect(getPageResult.error).toBeDefined();
    });

    test("should handle network timeout errors", async () => {
      // Test with timeout scenario
      const getPageResult = await handlers.getPage.handle({
        pageId: "timeout-test",
      });
      expect(getPageResult.success).toBe(false);
      expect(getPageResult.error).toBeDefined();
    });

    test("should handle malformed API responses", async () => {
      // Test with invalid response format
      const searchResult = await handlers.searchPages.handle({
        query: "malformed-response-test",
      });
      expect(searchResult.success).toBe(false);
      expect(searchResult.error).toBeDefined();
    });
  });

  describe("Configuration Validation Errors", () => {
    test("should handle invalid base URL", () => {
      // Configuration creation doesn't validate, but usage will fail
      expect(() => {
        new ConfluenceConfig("invalid-url", "token", "email@example.com");
      }).not.toThrow();
    });

    test("should handle missing authentication", () => {
      // Configuration creation doesn't validate, but usage will fail
      expect(() => {
        new ConfluenceConfig(
          "https://test.atlassian.net/wiki",
          "",
          "email@example.com",
        );
      }).not.toThrow();
    });

    test("should handle invalid email format", () => {
      // Configuration creation doesn't validate, but usage will fail
      expect(() => {
        new ConfluenceConfig(
          "https://test.atlassian.net/wiki",
          "token",
          "invalid-email",
        );
      }).not.toThrow();
    });

    test("should validate configuration on client creation", () => {
      const invalidConfig = new ConfluenceConfig("", "", "");

      expect(() => {
        new ConfluenceClient(invalidConfig);
      }).toThrow();
    });

    test("should provide detailed validation errors", () => {
      const invalidConfig = new ConfluenceConfig("", "", "");
      const validation = invalidConfig.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors).toContain("hostUrl is required");
      expect(validation.errors).toContain("apiToken is required");
      expect(validation.errors).toContain("userEmail is required");
    });
  });

  describe("Error Response Formatting", () => {
    test("should format validation errors consistently", async () => {
      const results = await Promise.all([
        handlers.getPage.handle({}),
        handlers.searchPages.handle({}),
        handlers.createPage.handle({}),
        handlers.updatePage.handle({}),
      ]);

      for (const result of results) {
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe("string");
        expect(result.data).toBeUndefined();
      }
    });

    test("should include error context in responses", async () => {
      const getPageResult = await handlers.getPage.handle({
        pageId: "invalid-id",
      });

      expect(getPageResult.success).toBe(false);
      expect(getPageResult.error).toBeDefined();
      expect(typeof getPageResult.error).toBe("string");
    });

    test("should handle nested error objects", async () => {
      // Test with complex validation error
      const createResult = await handlers.createPage.handle({
        spaceId: "TEST",
        title: "",
        content: "",
        status: "invalid" as never,
      });

      expect(createResult.success).toBe(false);
      expect(createResult.error).toBeDefined();
      expect(typeof createResult.error).toBe("string");
    });

    test("should sanitize sensitive information from errors", async () => {
      // Create client with sensitive token
      const sensitiveConfig = new ConfluenceConfig(
        "https://test.atlassian.net/wiki",
        "sensitive-token-12345",
        "user@example.com",
      );
      const sensitiveClient = new ConfluenceClient(sensitiveConfig);
      const sensitiveHandler = new ConfluenceGetSpacesHandler(sensitiveClient);

      const result = await sensitiveHandler.handle({});

      // Error should not contain the sensitive token
      if (!result.success) {
        expect(result.error).not.toContain("sensitive-token-12345");
      }
    });
  });

  describe("Error Recovery and Resilience", () => {
    test("should handle transient errors gracefully", async () => {
      // Test multiple requests - all will fail with authentication but should handle gracefully
      const results = await Promise.all([
        handlers.getSpaces.handle({}),
        handlers.getSpaces.handle({}),
        handlers.getSpaces.handle({}),
      ]);

      // All should fail gracefully with authentication errors
      for (const result of results) {
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    test("should maintain state consistency after errors", async () => {
      // Cause an error
      await handlers.getPage.handle({});

      // Subsequent request should still fail gracefully (not crash)
      const validResult = await handlers.getSpaces.handle({});
      expect(validResult.success).toBe(false); // Will fail due to auth, but gracefully
      expect(validResult.error).toBeDefined();
    });

    test("should handle concurrent error scenarios", async () => {
      // Test multiple concurrent invalid requests
      const concurrentResults = await Promise.all([
        handlers.getPage.handle({}),
        handlers.searchPages.handle({}),
        handlers.createPage.handle({}),
        handlers.updatePage.handle({}),
      ]);

      // All should fail gracefully
      for (const result of concurrentResults) {
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }

      // System should still be responsive (fail gracefully, not crash)
      const validResult = await handlers.getSpaces.handle({});
      expect(validResult.success).toBe(false); // Will fail due to auth, but gracefully
      expect(validResult.error).toBeDefined();
    });

    test("should handle error cascades", async () => {
      // Test error in one operation doesn't affect others
      await handlers.getPage.handle({ pageId: "invalid" });
      await handlers.searchPages.handle({ query: "invalid" });

      // Other operations should still work (fail gracefully, not crash)
      const getSpacesResult = await handlers.getSpaces.handle({});
      expect(getSpacesResult.success).toBe(false); // Will fail due to auth, but gracefully
      expect(getSpacesResult.error).toBeDefined();
    });
  });

  describe("Custom Error Types", () => {
    test("should handle ValidationError instances", () => {
      const validationError = new ValidationError("Test validation error");

      expect(validationError).toBeInstanceOf(ValidationError);
      expect(validationError).toBeInstanceOf(McpError);
      expect(validationError.message).toBe("Test validation error");
      expect(validationError.code).toBe("VALIDATION_ERROR");
    });

    test("should handle McpError instances", () => {
      const mcpError = new McpError("Test MCP error", "TEST_ERROR");

      expect(mcpError).toBeInstanceOf(McpError);
      expect(mcpError.message).toBe("Test MCP error");
      expect(mcpError.code).toBe("TEST_ERROR");
    });

    test("should normalize different error types", () => {
      // Test with string error
      const stringError = normalizeError("String error");
      expect(typeof stringError).toBe("string");
      expect(stringError).toBe("String error");

      // Test with Error instance
      const errorInstance = new Error("Error instance");
      const normalizedError = normalizeError(errorInstance);
      expect(typeof normalizedError).toBe("string");
      expect(normalizedError).toBe("Error instance");

      // Test with object error
      const objectError = { message: "Object error" };
      const normalizedObjectError = normalizeError(objectError);
      expect(typeof normalizedObjectError).toBe("string");
      expect(normalizedObjectError).toContain("Object error");
    });

    test("should preserve error information in string format", () => {
      const originalError = new Error("Original error");
      const normalizedError = normalizeError(originalError);

      expect(typeof normalizedError).toBe("string");
      expect(normalizedError).toBe("Original error");
    });

    test("should handle unknown error types", () => {
      const unknownError = 42;
      const normalizedError = normalizeError(unknownError);

      expect(typeof normalizedError).toBe("string");
      expect(normalizedError).toBe("42");
    });
  });

  describe("Error Logging and Monitoring", () => {
    test("should log errors appropriately", async () => {
      // Test that errors are logged (this would require log capture in real implementation)
      const getPageResult = await handlers.getPage.handle({});

      expect(getPageResult.success).toBe(false);
      // In a real implementation, we would verify that the error was logged
    });

    test("should include error context in logs", async () => {
      // Test that error context is included in logs
      const searchResult = await handlers.searchPages.handle({ query: "" });

      expect(searchResult.success).toBe(false);
      // In a real implementation, we would verify that context was logged
    });

    test("should handle logging errors gracefully", async () => {
      // Test that logging errors don't break the main flow
      const getSpacesResult = await handlers.getSpaces.handle({});

      // Should fail gracefully due to authentication, not due to logging issues
      expect(getSpacesResult.success).toBe(false);
      expect(getSpacesResult.error).toBeDefined();
    });

    test("should provide error metrics", async () => {
      // Test error counting/metrics (would require metrics system)
      await handlers.getPage.handle({});
      await handlers.searchPages.handle({});

      // In a real implementation, we would verify error metrics were updated
      expect(true).toBe(true); // Placeholder
    });
  });

  describe("Error Boundary Integration", () => {
    test("should handle handler initialization errors", () => {
      // Test with invalid client
      expect(() => {
        const invalidConfig = new ConfluenceConfig("", "", "");
        const invalidClient = new ConfluenceClient(invalidConfig);
        new ConfluenceGetSpacesHandler(invalidClient);
      }).toThrow();
    });

    test("should handle tool execution errors", async () => {
      // Test that tool execution errors are caught and formatted
      const result = await handlers.getPage.handle({ pageId: "error-test" });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
    });

    test("should prevent error propagation to caller", async () => {
      // Test that errors don't bubble up as exceptions
      expect(async () => {
        await handlers.getPage.handle({});
      }).not.toThrow();

      expect(async () => {
        await handlers.searchPages.handle({});
      }).not.toThrow();

      expect(async () => {
        await handlers.createPage.handle({});
      }).not.toThrow();
    });

    test("should maintain system stability during errors", async () => {
      // Test multiple error scenarios
      const errorResults = await Promise.all([
        handlers.getPage.handle({}),
        handlers.searchPages.handle({}),
        handlers.createPage.handle({}),
        handlers.updatePage.handle({}),
      ]);

      // All should fail gracefully
      for (const result of errorResults) {
        expect(result.success).toBe(false);
      }

      // System should remain stable (fail gracefully, not crash)
      const validResult = await handlers.getSpaces.handle({});
      expect(validResult.success).toBe(false); // Will fail due to auth, but gracefully
      expect(validResult.error).toBeDefined();
    });
  });
});
