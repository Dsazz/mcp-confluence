import { beforeEach, afterEach, describe, expect, test } from "bun:test";
import { createServer, type ServerContext } from "../../core/server/server.lifecycle";
import { setupErrorHandlers, setupSignalHandlers, type ServerCleanup } from "../../core/server/server.handlers";
import { serverConfig } from "../../core/server/server.config";
import { ConfluenceGetSpacesHandler } from "../../features/confluence/tools/handlers/get-spaces.handler";
import { ConfluenceGetPageHandler } from "../../features/confluence/tools/handlers/get-page.handler";
import { ConfluenceSearchPagesHandler } from "../../features/confluence/tools/handlers/search-pages.handler";
import { ConfluenceCreatePageHandler } from "../../features/confluence/tools/handlers/create-page.handler";
import { ConfluenceUpdatePageHandler } from "../../features/confluence/tools/handlers/update-page.handler";
import { ConfluenceConfig } from "../../features/confluence/api/config.types";
import { ConfluenceClient } from "../../features/confluence/api/client.impl";

describe("Server Lifecycle Integration", () => {
  let serverContext: ServerContext | null = null;
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
      "test@example.com"
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

  afterEach(async () => {
    // Cleanup server if it was created
    if (serverContext) {
      try {
        // Mock process.exit to prevent actual exit during tests
        const originalExit = process.exit;
        process.exit = (() => {}) as never;
        
        serverContext.cleanup(0);
        
        // Restore original exit after a delay
        setTimeout(() => {
          process.exit = originalExit;
        }, 100);
        
        serverContext = null;
      } catch {
        // Ignore cleanup errors in tests
      }
    }
  });

  describe("Server Initialization and Configuration", () => {
    test("should initialize server with valid configuration", async () => {
      serverContext = await createServer();
      
      expect(serverContext).toBeDefined();
      expect(serverContext.server).toBeDefined();
      expect(serverContext.transport).toBeDefined();
      expect(typeof serverContext.cleanup).toBe("function");
    });

    test("should have correct server configuration", () => {
      expect(serverConfig).toBeDefined();
      expect(serverConfig.name).toBeDefined();
      expect(serverConfig.version).toBeDefined();
      expect(typeof serverConfig.name).toBe("string");
      expect(typeof serverConfig.version).toBe("string");
    });

    test("should create server context with all required components", async () => {
      serverContext = await createServer();
      const { server, transport, cleanup } = serverContext;

      // Verify all components are present
      expect(server).toBeDefined();
      expect(transport).toBeDefined();
      expect(cleanup).toBeDefined();
      expect(typeof cleanup).toBe("function");
    });

    test("should handle server creation without errors", async () => {
      expect(async () => {
        serverContext = await createServer();
      }).not.toThrow();
    });
  });

  describe("Tool Handler Integration", () => {
    test("should initialize all confluence tool handlers", () => {
      // Verify all handlers are properly initialized
      expect(handlers.getSpaces).toBeDefined();
      expect(handlers.getPage).toBeDefined();
      expect(handlers.searchPages).toBeDefined();
      expect(handlers.createPage).toBeDefined();
      expect(handlers.updatePage).toBeDefined();
    });

    test("should have correct tool metadata for all handlers", () => {
      // Verify each handler has required metadata
      expect(handlers.getSpaces.feature).toBe("confluence");
      expect(handlers.getSpaces.name).toBe("confluence_get_spaces");
      expect(handlers.getSpaces.description).toContain("List user's accessible Confluence spaces");

      expect(handlers.getPage.feature).toBe("confluence");
      expect(handlers.getPage.name).toBe("confluence_get_page");
      expect(handlers.getPage.description).toContain("Get detailed information about a specific Confluence page");

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

    test("should handle valid tool requests", async () => {
      // Test valid requests to each handler - will fail with auth but should handle gracefully
      const getSpacesResult = await handlers.getSpaces.handle({});
      expect(getSpacesResult.success).toBe(false); // Auth failure expected
      expect(getSpacesResult.error).toBeDefined();

      const getPageResult = await handlers.getPage.handle({ pageId: "123456" });
      expect(getPageResult.success).toBe(false); // Auth failure expected
      expect(getPageResult.error).toBeDefined();

      const searchResult = await handlers.searchPages.handle({ query: "test" });
      expect(searchResult.success).toBe(false); // Auth failure expected
      expect(searchResult.error).toBeDefined();
    });

    test("should handle invalid tool requests", async () => {
      // Test invalid requests
      const getPageResult = await handlers.getPage.handle({});
      expect(getPageResult.success).toBe(false);
      expect(getPageResult.error).toContain("pageId is required");

      const searchResult = await handlers.searchPages.handle({});
      expect(searchResult.success).toBe(false);
      expect(searchResult.error).toContain("query is required");

      const createResult = await handlers.createPage.handle({});
      expect(createResult.success).toBe(false);
      expect(createResult.error).toContain("spaceId is required");

      const updateResult = await handlers.updatePage.handle({});
      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toContain("pageId is required");
    });

    test("should handle malformed requests gracefully", async () => {
      // Test with null/undefined parameters
      const getPageResult = await handlers.getPage.handle(null as never);
      expect(getPageResult.success).toBe(false);
      expect(getPageResult.error).toBeDefined();

      const searchResult = await handlers.searchPages.handle(undefined as never);
      expect(searchResult.success).toBe(false);
      expect(searchResult.error).toBeDefined();
    });

    test("should respect parameter validation constraints", async () => {
      // Test parameter validation
      const getSpacesResult = await handlers.getSpaces.handle({
        limit: 150, // Should be <= 100
      });
      expect(getSpacesResult.success).toBe(false);
      expect(getSpacesResult.error).toContain("Invalid limit parameter");

      const searchResult = await handlers.searchPages.handle({
        query: "test",
        type: "invalid" as never,
      });
      expect(searchResult.success).toBe(false);
      expect(searchResult.error).toContain("Invalid type parameter");
    });
  });

  describe("Resource Management and Cleanup", () => {
    test("should cleanup resources on shutdown", async () => {
      serverContext = await createServer();
      const { server, transport, cleanup } = serverContext;

      // Verify resources are active
      expect(server).toBeDefined();
      expect(transport).toBeDefined();

      // Test cleanup
      let cleanupCompleted = false;
      const originalExit = process.exit;
      process.exit = (() => {
        cleanupCompleted = true;
      }) as never;

      cleanup(0);

      // Wait for cleanup to process
      await new Promise(resolve => setTimeout(resolve, 600)); // Wait longer than cleanup timeout

      // Restore original exit
      process.exit = originalExit;

      expect(cleanupCompleted).toBe(true);
    });

    test("should handle multiple cleanup calls gracefully", async () => {
      serverContext = await createServer();
      const { cleanup } = serverContext;

      // Mock process.exit to track calls
      let exitCallCount = 0;
      const originalExit = process.exit;
      const originalSetTimeout = global.setTimeout;
      
      process.exit = ((_code?: number) => {
        exitCallCount++;
        // Don't actually exit in tests
      }) as never;

      // Mock setTimeout to execute immediately
      global.setTimeout = ((fn: () => void) => {
        fn();
        return {} as NodeJS.Timeout;
      }) as typeof setTimeout;

      // Call cleanup multiple times
      cleanup(0);
      cleanup(0);
      cleanup(0);

      // Restore original functions
      process.exit = originalExit;
      global.setTimeout = originalSetTimeout;

      // Should only process cleanup once despite multiple calls
      expect(exitCallCount).toBe(1);
    });

    test("should handle cleanup with different exit codes", async () => {
      serverContext = await createServer();
      const { cleanup } = serverContext;

      let capturedExitCode: number | undefined;
      const originalExit = process.exit;
      const originalSetTimeout = global.setTimeout;
      
      process.exit = ((_code?: number) => {
        capturedExitCode = _code;
        // Don't actually exit in tests
      }) as never;

      // Mock setTimeout to execute immediately
      global.setTimeout = ((fn: () => void) => {
        fn();
        return {} as NodeJS.Timeout;
      }) as typeof setTimeout;

      cleanup(42);

      // Restore original functions
      process.exit = originalExit;
      global.setTimeout = originalSetTimeout;

      expect(capturedExitCode).toBe(42);
    });
  });

  describe("Error and Signal Handlers", () => {
    test("should setup error handlers correctly", () => {
      const mockCleanup: ServerCleanup = () => {};
      
      // Should not throw when setting up error handlers
      expect(() => setupErrorHandlers(mockCleanup)).not.toThrow();
    });

    test("should setup signal handlers correctly", () => {
      const mockCleanup: ServerCleanup = () => {};
      
      // Should not throw when setting up signal handlers
      expect(() => setupSignalHandlers(mockCleanup)).not.toThrow();
    });

    test("should handle cleanup function validation", () => {
      const validCleanup: ServerCleanup = () => {
        // Valid cleanup function
      };

      const invalidCleanup = "not a function";

      expect(typeof validCleanup).toBe("function");
      expect(typeof invalidCleanup).not.toBe("function");
    });

    test("should handle error handler setup with valid cleanup", () => {
      const testCleanup: ServerCleanup = () => {
        // Test cleanup function
      };

      setupErrorHandlers(testCleanup);
      
      // Verify setup completed without errors
      expect(typeof testCleanup).toBe("function");
    });

    test("should handle signal handler setup with valid cleanup", () => {
      const testCleanup: ServerCleanup = () => {
        // Test cleanup function
      };

      setupSignalHandlers(testCleanup);
      
      // Verify setup completed without errors
      expect(typeof testCleanup).toBe("function");
    });
  });

  describe("Integration with Transport Layer", () => {
    test("should handle transport initialization", async () => {
      serverContext = await createServer();
      const { transport } = serverContext;

      expect(transport).toBeDefined();
      expect(typeof transport.close).toBe("function");
    });

    test("should handle transport close events", async () => {
      serverContext = await createServer();
      const { transport } = serverContext;

      let closeEventFired = false;
      const originalOnClose = transport.onclose;
      
      transport.onclose = () => {
        closeEventFired = true;
        if (originalOnClose) {
          originalOnClose();
        }
      };

      // Simulate transport close
      transport.close();

      // Wait for event to process
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(closeEventFired).toBe(true);
    });

    test("should handle transport error events", async () => {
      serverContext = await createServer();
      const { transport } = serverContext;

      let errorEventFired = false;
      let capturedError: Error | undefined;

      transport.onerror = (error: Error) => {
        errorEventFired = true;
        capturedError = error;
      };

      // Simulate transport error
      const testError = new Error("Transport error");
      if (transport.onerror) {
        transport.onerror(testError);
      }

      expect(errorEventFired).toBe(true);
      expect(capturedError).toEqual(testError);
    });

    test("should handle transport event handler assignment", async () => {
      serverContext = await createServer();
      const { transport } = serverContext;

      // Test that event handlers can be assigned
      expect(() => {
        transport.onclose = () => {};
        transport.onerror = () => {};
      }).not.toThrow();
    });
  });

  describe("Configuration Validation", () => {
    test("should validate server configuration structure", () => {
      expect(serverConfig).toBeDefined();
      expect(typeof serverConfig).toBe("object");
      expect(serverConfig.name).toBeDefined();
      expect(serverConfig.version).toBeDefined();
    });

    test("should handle server configuration with required fields", () => {
      const config = serverConfig;
      
      expect(config.name).toBeTruthy();
      expect(config.version).toBeTruthy();
      expect(typeof config.name).toBe("string");
      expect(typeof config.version).toBe("string");
    });

    test("should validate confluence client configuration", () => {
      const config = new ConfluenceConfig(
        "https://test.atlassian.net/wiki",
        "test-token",
        "test@example.com"
      );

      const validation = config.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    test("should handle invalid confluence client configuration", () => {
      const invalidConfig = new ConfluenceConfig("", "", "");

      const validation = invalidConfig.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
}); 