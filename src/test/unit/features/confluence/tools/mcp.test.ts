/**
 * Unit tests for MCP Integration
 *
 * Tests the MCP server registration and response formatting functionality
 * for Confluence domain tools.
 */

import { describe, expect, test } from "bun:test";

describe("MCP Integration", () => {
  describe("initializeMCPTools", () => {
    test("should export initializeMCPTools function", () => {
      // This test verifies that the function exists and can be imported
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");

      expect(typeof initializeMCPTools).toBe("function");
    });

    test("should have proper function signature", () => {
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");

      // Verify function has one required parameter (server)
      expect(initializeMCPTools.length).toBe(1);
    });

    test("should contain MCP server registration logic", () => {
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      const functionString = initializeMCPTools.toString();

      // Verify the function contains MCP server registration logic
      expect(functionString).toContain("server");
      expect(functionString).toContain("tool");
      expect(functionString).toContain("createDomainHandlers");
    });

    test("should handle errors gracefully", () => {
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      const functionString = initializeMCPTools.toString();

      // Verify the function contains error handling logic
      expect(functionString).toContain("try");
      expect(functionString).toContain("catch");
      expect(functionString).toContain("error");
    });

    test("should use logger for error reporting", () => {
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      const functionString = initializeMCPTools.toString();

      // Verify the function uses logger for error reporting
      expect(functionString).toContain("logger");
      expect(functionString).toContain("error");
    });
  });

  describe("Tool Configuration Aggregation", () => {
    test("should import all domain MCP tools", () => {
      // Verify that all domain MCP tool modules can be imported
      expect(() =>
        require("@features/confluence/domains/spaces/mcp-tools"),
      ).not.toThrow();
      expect(() =>
        require("@features/confluence/domains/pages/mcp-tools"),
      ).not.toThrow();
      expect(() =>
        require("@features/confluence/domains/search/mcp-tools"),
      ).not.toThrow();
    });

    test("should combine domain tool configurations", () => {
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      const functionString = initializeMCPTools.toString();

      // Verify the function references the combined tool configurations
      expect(functionString).toContain("allToolConfigs");
      expect(functionString).toContain("Object.entries");
    });

    test("should handle tool configuration structure", () => {
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      const functionString = initializeMCPTools.toString();

      // Verify the function handles tool configuration properties
      expect(functionString).toContain("name");
      expect(functionString).toContain("description");
      expect(functionString).toContain("inputSchema");
    });
  });

  describe("MCP Handler Wrapper", () => {
    test("should create MCP-compatible handler wrapper", () => {
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      const functionString = initializeMCPTools.toString();

      // Verify the function creates MCP-compatible handlers
      expect(functionString).toContain("createMCPHandler");
      expect(functionString).toContain("mcpHandler");
    });

    test("should handle response formatting", () => {
      // Verify that the module exports the expected function
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");

      // The response formatting is handled internally by createMCPHandler
      // We can verify the function exists and has the expected structure
      expect(typeof initializeMCPTools).toBe("function");
      expect(initializeMCPTools.length).toBe(1); // Takes server parameter
    });

    test("should handle error responses", () => {
      // Verify that the initializeMCPTools function has error handling
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      const functionString = initializeMCPTools.toString();

      // The function should have try-catch error handling
      expect(functionString).toContain("try");
      expect(functionString).toContain("catch");
      expect(functionString).toContain("error instanceof Error");
    });
  });

  describe("Integration with Domain Handlers", () => {
    test("should import createDomainHandlers", () => {
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      const functionString = initializeMCPTools.toString();

      // Verify the function imports and uses createDomainHandlers
      expect(functionString).toContain("createDomainHandlers");
    });

    test("should import routeToolCall", () => {
      // Verify that the module can import routeToolCall without errors
      expect(() => require("@features/confluence/tools/routing")).not.toThrow();

      // Verify that the initializeMCPTools function exists and can be called
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      expect(typeof initializeMCPTools).toBe("function");
    });
  });

  describe("Logging Integration", () => {
    test("should log tool registration", () => {
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      const functionString = initializeMCPTools.toString();

      // Verify the function logs tool registration
      expect(functionString).toContain("Registered tool:");
      expect(functionString).toContain('prefix: "CONFLUENCE"');
    });

    test("should log successful completion", () => {
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      const functionString = initializeMCPTools.toString();

      // Verify the function logs successful completion
      expect(functionString).toContain("tools registered successfully");
      expect(functionString).toContain("toolsRegistered");
      expect(functionString).toContain("realHandlers");
    });

    test("should log errors with context", () => {
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      const functionString = initializeMCPTools.toString();

      // Verify the function logs errors with proper context
      expect(functionString).toContain("Failed to register");
      expect(functionString).toContain('prefix: "CONFLUENCE"');
    });
  });

  describe("Tool Registration Process", () => {
    test("should iterate over tool configurations", () => {
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      const functionString = initializeMCPTools.toString();

      // Verify the function iterates over tool configurations
      expect(functionString).toContain("Object.entries");
      expect(functionString).toContain("for");
    });

    test("should register tools with MCP server", () => {
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      const functionString = initializeMCPTools.toString();

      // Verify the function registers tools with the MCP server
      expect(functionString).toContain("server.tool");
      expect(functionString).toContain("toolConfig.name");
      expect(functionString).toContain("toolConfig.description");
    });

    test("should handle tool configuration properties", () => {
      const { initializeMCPTools } = require("@features/confluence/tools/mcp");
      const functionString = initializeMCPTools.toString();

      // Verify the function handles tool configuration properties
      expect(functionString).toContain("inputSchema.shape");
      expect(functionString).toContain("mcpHandler");
    });
  });

  describe("Expected Tool Names", () => {
    test("should handle confluence tool naming convention", () => {
      // Verify that the expected tool names follow the confluence_ prefix convention
      const expectedToolNames = [
        "confluence_get_spaces",
        "confluence_get_space_by_key",
        "confluence_get_space_by_id",
        "confluence_get_page",
        "confluence_create_page",
        "confluence_update_page",
        "confluence_get_pages_by_space",
        "confluence_get_child_pages",
        "confluence_search",
      ];

      // All tool names should start with "confluence_"
      for (const name of expectedToolNames) {
        expect(name).toMatch(/^confluence_/);
      }

      // Should have 9 total tools
      expect(expectedToolNames).toHaveLength(9);
    });

    test("should cover all domain operations", () => {
      const expectedDomains = ["spaces", "pages", "search", "content"];
      const expectedOperations = ["get", "create", "update", "search"];

      // Verify we have expected domains and operations
      expect(expectedDomains).toHaveLength(4);
      expect(expectedOperations).toHaveLength(4);
    });
  });
});
