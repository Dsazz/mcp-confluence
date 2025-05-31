import { BaseToolHandler } from "@core/tools/tool-handler.class";
import type { CreatePageResponse, Page } from "../../api/index";
import type { ConfluenceClient } from "../../api/index";
import type { CreatePageParams } from "../tools.types";
import type { Space } from "../../api/models.types";
import { logger } from "@core/logging";

export class ConfluenceCreatePageHandler extends BaseToolHandler<
  CreatePageParams,
  CreatePageResponse
> {
  constructor(private confluenceClient: ConfluenceClient) {
    super(
      "confluence",
      "confluence_create_page",
      "Create a new page in Confluence",
    );
  }

  protected async execute(
    params: CreatePageParams,
  ): Promise<CreatePageResponse> {
    // Validate parameters
    const validatedParams = this.validateParams(params);

    // Create the page using the Confluence API
    const createdPage = await this.createPage(validatedParams);

    // Get additional context information
    const context = await this.getPageContext(createdPage);

    logger.info(
      `Created page "${createdPage.title}" in space ${validatedParams.spaceId}`,
      { prefix: "CONFLUENCE" }
    );

    return {
      page: createdPage,
      created: true,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private validateParams(params: CreatePageParams): CreatePageParams {
    if (!params || typeof params !== "object") {
      throw new Error("Parameters are required");
    }

    if (!params.spaceId || typeof params.spaceId !== "string") {
      throw new Error("spaceId is required and must be a string");
    }

    if (!params.title || typeof params.title !== "string" || params.title.trim().length === 0) {
      throw new Error("title is required and must be a non-empty string");
    }

    if (!params.content || typeof params.content !== "string") {
      throw new Error("content is required and must be a string");
    }

    const validatedParams: CreatePageParams = {
      spaceId: params.spaceId.trim(),
      title: params.title.trim(),
      content: params.content,
    };

    // Validate optional parameters
    if (params.parentPageId && typeof params.parentPageId === "string") {
      validatedParams.parentPageId = params.parentPageId.trim();
    }

    if (params.status && typeof params.status === "string") {
      if (["current", "draft"].includes(params.status)) {
        validatedParams.status = params.status as "current" | "draft";
      } else {
        throw new Error(
          `Invalid status parameter: ${params.status}. Must be 'current' or 'draft'`,
        );
      }
    }

    if (params.contentFormat && typeof params.contentFormat === "string") {
      if (["storage", "editor", "wiki"].includes(params.contentFormat)) {
        validatedParams.contentFormat = params.contentFormat as "storage" | "editor" | "wiki";
      } else {
        throw new Error(
          `Invalid contentFormat parameter: ${params.contentFormat}. Must be 'storage', 'editor', or 'wiki'`,
        );
      }
    }

    return validatedParams;
  }

  private async createPage(params: CreatePageParams): Promise<Page> {
    // Prepare the page data for Confluence API
    const pageData = {
      spaceId: params.spaceId,
      title: params.title,
      body: {
        storage: {
          value: params.content,
          representation: params.contentFormat || "storage",
        },
      },
      status: params.status || "current",
      ...(params.parentPageId && { parentId: params.parentPageId }),
    };

    try {
      const response = await this.confluenceClient.createPage(pageData);
      return response;
    } catch (error) {
      logger.error("Failed to create page", { 
        error: error instanceof Error ? error.message : String(error),
        spaceId: params.spaceId,
        title: params.title,
        prefix: "CONFLUENCE"
      });
      
      if (error instanceof Error) {
        if (error.message.includes("Space not found")) {
          throw new Error(`Space not found: ${params.spaceId}. Please verify the space ID.`);
        }
        if (error.message.includes("Parent page not found")) {
          throw new Error(`Parent page not found: ${params.parentPageId}. Please verify the parent page ID.`);
        }
        if (error.message.includes("Permission denied")) {
          throw new Error(`Permission denied. You don't have permission to create pages in space: ${params.spaceId}`);
        }
        if (error.message.includes("Title already exists")) {
          throw new Error(`A page with title "${params.title}" already exists in this space.`);
        }
      }
      
      throw new Error(`Failed to create page: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getPageContext(page: Page) {
    try {
      // Get space information
      const spaces = await this.confluenceClient.getSpaces({ 
        limit: 1000 // Get all spaces to find the one containing our page
      });
      
      const space = spaces.spaces.find((s: Space) => s.id === page.spaceId);
      
      // Generate breadcrumbs
      const breadcrumbs = [];
      if (space) {
        breadcrumbs.push({
          id: space.id,
          title: space.name,
          _links: {
            webui: space._links.webui,
          },
        });
      }
      
      // Add parent breadcrumbs if this page has a parent
      if (page.parentId) {
        try {
          const parentPage = await this.confluenceClient.getPage(page.parentId);
          breadcrumbs.push({
            id: parentPage.id,
            title: parentPage.title,
            _links: {
              webui: parentPage._links.webui,
            },
          });
        } catch (_error) {
          logger.warn("Failed to get parent page for breadcrumbs", { 
            parentId: page.parentId,
            prefix: "CONFLUENCE"
          });
        }
      }

      return {
        space: space ? {
          id: space.id,
          key: space.key,
          name: space.name,
          type: space.type,
          _links: {
            webui: space._links.webui,
          },
        } : {
          id: page.spaceId,
          key: "unknown",
          name: "Unknown Space",
          type: "global" as const,
          _links: {
            webui: `/spaces/${page.spaceId}`,
          },
        },
        breadcrumbs,
      };
    } catch (error) {
      logger.warn("Failed to get page context", { 
        error: error instanceof Error ? error.message : String(error),
        prefix: "CONFLUENCE"
      });
      
      return {
        space: {
          id: page.spaceId,
          key: "unknown",
          name: "Unknown Space",
          type: "global" as const,
          _links: {
            webui: `/spaces/${page.spaceId}`,
          },
        },
        breadcrumbs: [],
      };
    }
  }
} 