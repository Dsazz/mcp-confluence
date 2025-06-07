import { logger } from "@core/logging";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { initializeMCPTools } from "./tools";

/**
 * Confluence integration for MCP
 *
 * This module provides the main initialization point for the Confluence feature,
 * which uses a domain-driven architecture with dependency injection.
 */

/**
 * Initializes the Confluence features
 * @param server - The MCP server instance
 */
export function initializeConfluenceFeatures(server: McpServer): void {
  try {
    logger.info("Initializing Confluence features...", {
      prefix: "CONFLUENCE",
    });

    initializeMCPTools(server);

    logger.info("Confluence features initialized successfully", {
      prefix: "CONFLUENCE",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to initialize Confluence features: ${errorMessage}`, {
      prefix: "CONFLUENCE",
    });
    throw error;
  }
}
