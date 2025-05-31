import { logger } from "@core/logging";
import { adaptHandler } from "@core/responses";
import type { ToolConfig } from "@core/tools";
/**
 * Register Confluence tools with MCP
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ConfluenceConfig } from "./api/config.types";
import { ConfluenceClient } from "./api/index";
import { createConfluenceTools } from "./tools/index";
import {
  createPageSchema,
  getPageSchema,
  getSpacesSchema,
  searchPagesSchema,
  updatePageSchema,
} from "./tools/index";

/**
 * Register tools with MCP server
 *
 * @param server - The MCP server instance
 */
export function registerTools(server: McpServer): void {
  try {
    logger.info("Starting Confluence tools registration...", {
      prefix: "CONFLUENCE",
    });

    // Create configuration from environment variables
    logger.debug("Creating Confluence configuration from environment...", {
      prefix: "CONFLUENCE",
    });
    const confluenceConfig = ConfluenceConfig.fromEnv();
    logger.debug("Confluence configuration created successfully", {
      prefix: "CONFLUENCE",
    });

    // Create Confluence client (which will validate the config internally)
    logger.debug("Creating Confluence client...", { prefix: "CONFLUENCE" });
    const client = new ConfluenceClient(confluenceConfig);
    logger.debug("Confluence client created successfully", {
      prefix: "CONFLUENCE",
    });

    // Create tool instances
    logger.debug("Creating Confluence tool instances...", {
      prefix: "CONFLUENCE",
    });
    const confluenceTools = createConfluenceTools(client);
    logger.debug("Confluence tool instances created successfully", {
      prefix: "CONFLUENCE",
    });

    // Define tool configurations
    const toolConfigs: ToolConfig[] = [
      {
        name: "confluence_get_spaces",
        description: "List accessible Confluence spaces",
        params: getSpacesSchema.shape,
        handler: (args: unknown) => confluenceTools.getSpaces.handle(args),
      },
      {
        name: "confluence_get_page",
        description: "Get detailed information about a specific page",
        params: getPageSchema.shape,
        handler: (args: unknown) => confluenceTools.getPage.handle(args),
      },
      {
        name: "confluence_search_pages",
        description:
          "Search for pages using CQL (Confluence Query Language). The LLM should convert user requests into proper CQL syntax.",
        params: searchPagesSchema.shape,
        handler: (args: unknown) => confluenceTools.searchPages.handle(args),
      },
      {
        name: "confluence_create_page",
        description: "Create a new page in Confluence",
        params: createPageSchema.shape,
        handler: (args: unknown) => confluenceTools.createPage.handle(args),
      },
      {
        name: "confluence_update_page",
        description: "Update an existing page in Confluence",
        params: updatePageSchema.shape,
        handler: (args: unknown) => confluenceTools.updatePage.handle(args),
      },
    ];

    logger.debug(
      `Registering ${toolConfigs.length} Confluence tools with MCP server...`,
      { prefix: "CONFLUENCE" },
    );

    // Register all tools with MCP server
    for (const config of toolConfigs) {
      try {
        logger.debug(`Registering tool: ${config.name}`, {
          prefix: "CONFLUENCE",
        });
        logger.debug(
          `Tool params: ${JSON.stringify(Object.keys(config.params))}`,
          { prefix: "CONFLUENCE" },
        );

        server.tool(
          config.name,
          config.description,
          config.params,
          adaptHandler(config.handler),
        );

        logger.debug(`Successfully registered tool: ${config.name}`, {
          prefix: "CONFLUENCE",
        });
      } catch (toolError) {
        logger.error(`Failed to register tool ${config.name}: ${toolError}`, {
          prefix: "CONFLUENCE",
        });
        throw toolError;
      }
    }

    logger.info("Confluence tools registered successfully", {
      prefix: "CONFLUENCE",
    });
  } catch (error) {
    logger.error(`Failed to register Confluence tools: ${error}`, {
      prefix: "CONFLUENCE",
    });
    logger.error(`Error details: ${JSON.stringify(error)}`, {
      prefix: "CONFLUENCE",
    });
    throw error;
  }
}
