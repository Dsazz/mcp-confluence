#!/usr/bin/env node

/**
 * Confluence MCP Server
 *
 * Main entry point for the Confluence Model Context Protocol server
 */

import { normalizeError } from "@core/errors/index";
import { logger } from "@core/logging/index";
import { startServer } from "@core/server/index";
import { registerFeatures } from "@features/index";
import { config } from "dotenv";

/**
 * Bootstrap the application
 * Configure environment and start the server
 */
async function bootstrap(): Promise<void> {
  try {
    // Load environment variables
    config();
    logger.info("Environment configured", { prefix: "Bootstrap" });

    // Start the MCP server with feature registration
    await startServer(registerFeatures);
  } catch (error) {
    // Basic error handling for bootstrap process
    logger.error(normalizeError(error), {
      prefix: "Bootstrap",
    });
    process.exit(1);
  }
}

// Start the application
bootstrap();
