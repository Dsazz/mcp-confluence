/**
 * MCP Integration
 *
 * Handles MCP server registration and response formatting
 */

import { logger } from "@core/logging";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createDomainHandlers } from "./handlers";
import { routeToolCall } from "./routing";

import { pagesMCPTools } from "../domains/pages/mcp-tools";
import { searchMCPTools } from "../domains/search/mcp-tools";
// Import domain MCP tools directly
import { spacesMCPTools } from "../domains/spaces/mcp-tools";

/**
 * All tool configurations combined from domains
 */
const allToolConfigs = {
  ...spacesMCPTools,
  ...pagesMCPTools,
  ...searchMCPTools,
} as const;

/**
 * Create MCP-compatible handler wrapper
 */
function createMCPHandler(
  toolName: string,
  domainHandlers: ReturnType<typeof createDomainHandlers>,
) {
  return async (args: unknown) => {
    try {
      logger.info(`Tool ${toolName} called with args:`, {
        prefix: "CONFLUENCE",
        args,
      });

      // Route to appropriate domain handler
      const result = await routeToolCall(toolName, args, domainHandlers);

      // Return MCP-compatible response
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      logger.error(`Tool ${toolName} failed:`, {
        prefix: "CONFLUENCE",
        error: error instanceof Error ? error.message : String(error),
      });

      // Return MCP-compatible error response
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  };
}

/**
 * Register all tools with the MCP server
 */
export function initializeMCPTools(server: McpServer): void {
  try {
    // Create domain handlers
    const domainHandlers = createDomainHandlers();

    // Register all tools with the MCP server
    const toolConfigEntries = Object.entries(allToolConfigs);

    for (const [, toolConfig] of toolConfigEntries) {
      // Create MCP-compatible handler wrapper
      const mcpHandler = createMCPHandler(toolConfig.name, domainHandlers);

      // Register the tool with the MCP server
      server.tool(
        toolConfig.name,
        toolConfig.description,
        toolConfig.inputSchema.shape,
        mcpHandler,
      );

      logger.info(`Registered tool: ${toolConfig.name}`, {
        prefix: "CONFLUENCE",
      });
    }

    logger.info("Confluence MCP tools registered successfully", {
      prefix: "CONFLUENCE",
      toolsRegistered: toolConfigEntries.length,
      realHandlers: 8, // All tools now have real handlers
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to register Confluence MCP tools: ${errorMessage}`, {
      prefix: "CONFLUENCE",
    });
    throw error;
  }
}
