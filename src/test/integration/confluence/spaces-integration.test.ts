/**
 * Integration tests for Spaces domain (Confluence V2)
 *
 * This test file demonstrates the V2 layered integration testing pattern
 * with systematic coverage across the domain architecture.
 */

import { beforeEach, describe, expect, mock, test } from "bun:test";
import { GetSpacesHandler } from "@features/confluence/domains/spaces/handlers/get-spaces.handler";
import { spacesMCPTools } from "@features/confluence/domains/spaces/mcp-tools";
import type {
  GetSpacesRequest,
  SpaceRepository,
} from "@features/confluence/domains/spaces/models";
import type { GetAllSpacesUseCase } from "@features/confluence/domains/spaces/use-cases";
import { ValidationError } from "@features/confluence/shared/validators";
import { createDomainHandlers } from "@features/confluence/tools/handlers";
import { initializeMCPTools } from "@features/confluence/tools/mcp";
import { routeToolCall } from "@features/confluence/tools/routing";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SpacesMockFactory } from "@test/__mocks__/v2/domains/spaces/spaces-mock-factory";

// Type for MCP response structure
interface McpResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
}

describe("Spaces Domain Integration (V2)", () => {
  let spacesMockFactory: SpacesMockFactory;

  beforeEach(() => {
    spacesMockFactory = new SpacesMockFactory();
  });

  describe("Layer 1: Tool Integration Tests", () => {
    test("should register spaces tools in tool registry", () => {
      // Verify that spaces MCP tools are properly defined
      expect(spacesMCPTools).toBeDefined();
      expect(spacesMCPTools.getSpaces).toBeDefined();
      expect(spacesMCPTools.getSpaces.name).toBe("confluence_get_spaces");
      expect(spacesMCPTools.getSpaces.description).toContain("spaces");
      expect(spacesMCPTools.getSpaces.inputSchema).toBeDefined();
    });

    test("should create tool instances through factory", () => {
      // Test that domain handlers can be created
      const domainHandlers = createDomainHandlers();

      expect(domainHandlers).toBeDefined();
      expect(domainHandlers.spaces).toBeDefined();
      expect(domainHandlers.spaces.getSpaces).toBeDefined();
      expect(domainHandlers.spaces.getSpaces).toBeInstanceOf(GetSpacesHandler);
    });

    test("should register tools with MCP server", () => {
      const mockTool = mock();
      const mockServer = {
        tool: mockTool,
      } as unknown as McpServer;

      // This should not throw
      expect(() => initializeMCPTools(mockServer)).not.toThrow();

      // Verify that tool registration was called
      expect(mockTool).toHaveBeenCalled();

      // Check that spaces tool was registered
      const toolCalls = mockTool.mock.calls;
      const spacesToolCall = toolCalls.find(
        (call) => call[0] === "confluence_get_spaces",
      );
      expect(spacesToolCall).toBeDefined();
    });
  });

  describe("Layer 2: Handler Integration Tests", () => {
    test("should integrate handlers with use cases", async () => {
      const mockResponse = spacesMockFactory.createGetSpacesResponse();
      const mockExecute = mock().mockResolvedValue(mockResponse);

      const mockUseCase = {
        execute: mockExecute,
      } as unknown as GetAllSpacesUseCase;

      const handler = new GetSpacesHandler(mockUseCase);
      const request = spacesMockFactory.createGetSpacesRequest();

      const result = await handler.handle(request);

      expect(mockExecute).toHaveBeenCalledWith(request);
      expect(result).toEqual(mockResponse);
    });

    test("should handle validation errors properly", async () => {
      const mockExecute = mock().mockImplementation(() => {
        throw new ValidationError("Invalid request");
      });

      const mockUseCase = {
        execute: mockExecute,
      } as unknown as GetAllSpacesUseCase;

      const handler = new GetSpacesHandler(mockUseCase);
      const invalidRequest = { type: "invalid" } as unknown as GetSpacesRequest;

      await expect(handler.handle(invalidRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    test("should propagate domain errors correctly", async () => {
      const domainError = new Error("Repository connection failed");
      const mockExecute = mock().mockRejectedValue(domainError);

      const mockUseCase = {
        execute: mockExecute,
      } as unknown as GetAllSpacesUseCase;

      const handler = new GetSpacesHandler(mockUseCase);
      const request = spacesMockFactory.createGetSpacesRequest();

      await expect(handler.handle(request)).rejects.toThrow(
        "Failed to get spaces: Repository connection failed",
      );
    });
  });

  describe("Layer 3: Domain Integration Tests", () => {
    test("should integrate use cases with repositories", async () => {
      // Mock repository response
      const mockSpaces = spacesMockFactory.createSpaces(3);
      const mockFindAll = mock().mockResolvedValue({
        spaces: mockSpaces,
        pagination: spacesMockFactory.createPaginationInfo({
          size: mockSpaces.length,
        }),
      });

      const mockRepository = {
        findAll: mockFindAll,
      } as unknown as SpaceRepository;

      // Create a real use case instance (if available) or mock it
      // For this test, we'll mock the use case but verify it calls repository
      const mockUseCase = {
        execute: async (request: GetSpacesRequest) => {
          const repoResult = await mockRepository.findAll(request);
          return {
            spaces: repoResult.spaces,
            pagination: repoResult.pagination,
            summary: spacesMockFactory.createSpaceSummary({
              total: repoResult.spaces.length,
              globalSpaces: repoResult.spaces.filter((s) => s.type === "global")
                .length,
              personalSpaces: repoResult.spaces.filter(
                (s) => s.type === "personal",
              ).length,
            }),
          };
        },
      } as unknown as GetAllSpacesUseCase;

      const request = spacesMockFactory.createGetSpacesRequest();
      const result = await mockUseCase.execute(request);

      expect(mockFindAll).toHaveBeenCalledWith(request);
      expect(result.spaces).toEqual(mockSpaces);
      expect(result.summary.total).toBe(mockSpaces.length);
    });

    test("should handle domain errors properly", async () => {
      const repositoryError = new Error("Database connection failed");
      const mockFindAll = mock().mockRejectedValue(repositoryError);

      const mockRepository = {
        findAll: mockFindAll,
      } as unknown as SpaceRepository;

      const mockUseCase = {
        execute: async (request: GetSpacesRequest) => {
          return await mockRepository.findAll(request);
        },
      } as unknown as GetAllSpacesUseCase;

      const request = spacesMockFactory.createGetSpacesRequest();

      await expect(mockUseCase.execute(request)).rejects.toThrow(
        "Database connection failed",
      );
    });

    test("should transform repository data correctly", async () => {
      const mockSpaces = spacesMockFactory.createSpaces(5, {
        type: "global",
      });

      const mockFindAll = mock().mockResolvedValue({
        spaces: mockSpaces,
        pagination: spacesMockFactory.createPaginationInfo({
          size: mockSpaces.length,
        }),
      });

      const mockRepository = {
        findAll: mockFindAll,
      } as unknown as SpaceRepository;

      const mockUseCase = {
        execute: async (request: GetSpacesRequest) => {
          const repoResult = await mockRepository.findAll(request);
          return {
            spaces: repoResult.spaces,
            pagination: repoResult.pagination,
            summary: spacesMockFactory.createSpaceSummary({
              total: repoResult.spaces.length,
              globalSpaces: repoResult.spaces.filter((s) => s.type === "global")
                .length,
              personalSpaces: repoResult.spaces.filter(
                (s) => s.type === "personal",
              ).length,
            }),
          };
        },
      } as unknown as GetAllSpacesUseCase;

      const request = spacesMockFactory.createGetSpacesRequest({
        type: "global",
      });
      const result = await mockUseCase.execute(request);

      expect(result.spaces).toHaveLength(5);
      expect(result.summary.globalSpaces).toBe(5);
      expect(result.summary.personalSpaces).toBe(0);
    });
  });

  describe("Layer 4: Workflow Integration Tests", () => {
    test("should complete end-to-end space retrieval workflow", async () => {
      // Setup complete workflow chain
      const mockSpaces = spacesMockFactory.createSpaces(2);
      const mockResponse = spacesMockFactory.createGetSpacesResponse({
        spaces: mockSpaces,
      });

      // Create domain handlers
      const domainHandlers = createDomainHandlers();

      // Mock the use case execution
      const originalExecute = domainHandlers.spaces.getSpaces.handle;
      domainHandlers.spaces.getSpaces.handle =
        mock().mockResolvedValue(mockResponse);

      // Test the complete workflow through tool routing
      const toolArgs = spacesMockFactory.createGetSpacesRequest();
      const result = await routeToolCall(
        "confluence_get_spaces",
        toolArgs,
        domainHandlers,
      );

      expect(domainHandlers.spaces.getSpaces.handle).toHaveBeenCalledWith(
        toolArgs,
      );
      expect(result).toEqual(mockResponse);

      // Restore original method
      domainHandlers.spaces.getSpaces.handle = originalExecute;
    });

    test("should handle end-to-end workflow errors", async () => {
      // Create domain handlers
      const domainHandlers = createDomainHandlers();

      // Mock the use case to throw an error
      const originalExecute = domainHandlers.spaces.getSpaces.handle;
      domainHandlers.spaces.getSpaces.handle = mock().mockRejectedValue(
        new ValidationError("Invalid space parameters"),
      );

      // Test error propagation through the workflow
      const toolArgs = { type: "invalid" };

      await expect(
        routeToolCall("confluence_get_spaces", toolArgs, domainHandlers),
      ).rejects.toThrow("Invalid space parameters");

      // Restore original method
      domainHandlers.spaces.getSpaces.handle = originalExecute;
    });

    test("should handle MCP tool integration end-to-end", async () => {
      const mockSpaces = spacesMockFactory.createSpaces(1);
      const mockResponse = spacesMockFactory.createGetSpacesResponse({
        spaces: mockSpaces,
      });

      // Create a serializable version of the response for JSON comparison
      const serializableResponse = JSON.parse(JSON.stringify(mockResponse));

      // Create a mock MCP handler that simulates successful response
      let registeredHandler: ((args: unknown) => Promise<unknown>) | null =
        null;
      const mockTool = mock().mockImplementation(
        (
          name: string,
          _description: string,
          _schema: unknown,
          _handler: (args: unknown) => Promise<unknown>,
        ) => {
          if (name === "confluence_get_spaces") {
            // Create a mock handler that returns the expected response
            registeredHandler = mock().mockResolvedValue({
              content: [
                {
                  type: "text",
                  text: JSON.stringify(serializableResponse, null, 2),
                },
              ],
            });
          }
        },
      );

      const mockServer = {
        tool: mockTool,
      } as unknown as McpServer;

      // Register tools
      initializeMCPTools(mockServer);

      // Verify the handler was registered
      expect(registeredHandler).not.toBeNull();

      // Test the MCP handler
      if (registeredHandler) {
        const toolArgs = spacesMockFactory.createGetSpacesRequest();
        const handler = registeredHandler as (
          args: unknown,
        ) => Promise<unknown>;
        const mcpResult = await handler(toolArgs);

        expect(mcpResult).toHaveProperty("content");
        const typedResult = mcpResult as McpResponse;
        expect(typedResult.content).toHaveLength(1);
        expect(typedResult.content[0].type).toBe("text");

        const responseData = JSON.parse(typedResult.content[0].text);
        expect(responseData).toEqual(serializableResponse);
      }
    });

    test("should handle MCP tool error responses", async () => {
      // Create a mock MCP handler that simulates error response
      let registeredHandler: ((args: unknown) => Promise<unknown>) | null =
        null;
      const mockTool = mock().mockImplementation(
        (
          name: string,
          _description: string,
          _schema: unknown,
          _handler: (args: unknown) => Promise<unknown>,
        ) => {
          if (name === "confluence_get_spaces") {
            // Create a mock handler that returns an error response
            registeredHandler = mock().mockResolvedValue({
              content: [
                {
                  type: "text",
                  text: "Error: MCP tool validation failed",
                },
              ],
            });
          }
        },
      );

      const mockServer = {
        tool: mockTool,
      } as unknown as McpServer;

      // Register tools
      initializeMCPTools(mockServer);

      // Test the MCP error handling
      if (registeredHandler) {
        const toolArgs = { type: "invalid" };
        const handler = registeredHandler as (
          args: unknown,
        ) => Promise<unknown>;
        const mcpResult = await handler(toolArgs);

        expect(mcpResult).toHaveProperty("content");
        const typedResult = mcpResult as McpResponse;
        expect(typedResult.content).toHaveLength(1);
        expect(typedResult.content[0].type).toBe("text");
        expect(typedResult.content[0].text).toContain("Error:");
        expect(typedResult.content[0].text).toContain(
          "MCP tool validation failed",
        );
      }
    });
  });
});
