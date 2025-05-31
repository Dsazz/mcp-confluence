/**
 * Features Registration
 *
 * Main registration point for all MCP features
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "@core/logging";
import { initializeConfluenceFeature } from "./confluence/index.js";

/**
 * Register all features with the MCP server
 *
 * @param server - The MCP server instance
 */
export async function registerFeatures(server: McpServer): Promise<void> {
  logger.info("Registering features...", { prefix: "Server" });

  try {
    // Register Confluence features
    initializeConfluenceFeature(server);

    logger.info("Features registered successfully", { prefix: "Server" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to register features: ${errorMessage}`, {
      prefix: "Server",
    });
    throw error;
  }
}

// Export feature modules
export * from "./confluence";
