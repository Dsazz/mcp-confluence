/**
 * Features Registration
 *
 * Main registration point for all MCP features
 */

import { logger } from "@core/logging";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { initializeConfluenceFeatures } from "./confluence/index";

/**
 * Register all features with the MCP server
 *
 * @param server - The MCP server instance
 */
export async function registerFeatures(server: McpServer): Promise<void> {
  logger.info("Registering features...", { prefix: "Server" });

  try {
    // Register Confluence features
    initializeConfluenceFeatures(server);

    logger.info("Features registered successfully", { prefix: "Server" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to register features: ${errorMessage}`, {
      prefix: "Server",
    });
    throw error;
  }
}
