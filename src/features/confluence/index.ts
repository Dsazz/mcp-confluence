/**
 * Confluence integration for MCP
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "@core/logging";
import { registerTools } from "./register-tools";

/**
 * Initializes the Confluence feature
 * @param server - The MCP server instance
 */
export function initializeConfluenceFeature(server: McpServer): void {
  try {
    // Register all tools with the MCP server
    registerTools(server);

    logger.info("Confluence feature initialized successfully", { prefix: "CONFLUENCE" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to initialize Confluence feature: ${errorMessage}`, {
      prefix: "CONFLUENCE",
    });
  }
}

// API exports
export * from "./api/index";

// Tools exports
export * from "./tools/index";
