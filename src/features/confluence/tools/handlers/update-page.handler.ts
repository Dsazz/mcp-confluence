import { BaseToolHandler } from "@core/tools/tool-handler.class";
import type { UpdatePageResponse, Page } from "../../api/index";
import type { ConfluenceClient } from "../../api/index";
import type { UpdatePageParams } from "../tools.types";
import type { Space } from "../../api/models.types";
import { logger } from "@core/logging";

export class ConfluenceUpdatePageHandler extends BaseToolHandler<
  UpdatePageParams,
  UpdatePageResponse
> {
  constructor(private confluenceClient: ConfluenceClient) {
    super(
      "confluence",
      "confluence_update_page",
      "Update an existing page in Confluence",
    );
  }

  protected async execute(
    params: UpdatePageParams,
  ): Promise<UpdatePageResponse> {
    // Validate parameters
    const validatedParams = this.validateParams(params);

    // Get the current page to compare versions and content
    const currentPage = await this.getCurrentPage(validatedParams.pageId);

    // Verify version number
    if (currentPage.version.number !== validatedParams.versionNumber) {
      throw new Error(
        `Version mismatch. Current version is ${currentPage.version.number}, but you provided ${validatedParams.versionNumber}. Please refresh and try again.`
      );
    }

    // Update the page using the Confluence API
    const updatedPage = await this.updatePage(validatedParams, currentPage);

    // Determine what changed
    const changes = this.detectChanges(currentPage, updatedPage, validatedParams);

    // Get additional context information
    const context = await this.getPageContext(updatedPage);

    logger.info(
      `Updated page "${updatedPage.title}" (ID: ${updatedPage.id})`,
      { prefix: "CONFLUENCE" }
    );

    return {
      page: updatedPage,
      updated: true,
      timestamp: new Date().toISOString(),
      previousVersion: currentPage.version.number,
      currentVersion: updatedPage.version.number,
      changes,
      context,
    };
  }

  private validateParams(params: UpdatePageParams): UpdatePageParams {
    if (!params || typeof params !== "object") {
      throw new Error("Parameters are required");
    }

    if (!params.pageId || typeof params.pageId !== "string") {
      throw new Error("pageId is required and must be a string");
    }

    if (typeof params.versionNumber !== "number" || params.versionNumber < 1) {
      throw new Error("versionNumber is required and must be a positive number");
    }

    // At least one of title or content must be provided
    if (!params.title && !params.content) {
      throw new Error("At least one of 'title' or 'content' must be provided");
    }

    const validatedParams: UpdatePageParams = {
      pageId: params.pageId.trim(),
      versionNumber: params.versionNumber,
    };

    // Validate optional parameters
    if (params.title && typeof params.title === "string") {
      if (params.title.trim().length === 0) {
        throw new Error("title must be a non-empty string");
      }
      validatedParams.title = params.title.trim();
    }

    if (params.content && typeof params.content === "string") {
      validatedParams.content = params.content;
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

    if (params.versionMessage && typeof params.versionMessage === "string") {
      validatedParams.versionMessage = params.versionMessage.trim();
    }

    return validatedParams;
  }

  private async getCurrentPage(pageId: string): Promise<Page> {
    try {
      return await this.confluenceClient.getPage(pageId, {
        includeContent: true,
      });
    } catch (error) {
      logger.error("Failed to get current page", { 
        error: error instanceof Error ? error.message : String(error),
        pageId,
        prefix: "CONFLUENCE"
      });
      
      if (error instanceof Error && error.message.includes("not found")) {
        throw new Error(`Page not found: ${pageId}. Please verify the page ID.`);
      }
      
      throw new Error(`Failed to get current page: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async updatePage(params: UpdatePageParams, currentPage: Page): Promise<Page> {
    // Prepare the update data
    const updateData = {
      id: params.pageId,
      type: "page",
      title: params.title || currentPage.title,
      status: params.status || currentPage.status,
      version: {
        number: params.versionNumber + 1,
        ...(params.versionMessage && { message: params.versionMessage }),
      },
      ...(params.content && {
        body: {
          storage: {
            value: params.content,
            representation: params.contentFormat || "storage",
          },
        },
      }),
    };

    try {
      // Note: This assumes the ConfluenceClient has an updatePage method
      // If not, we'll need to add it to the client implementation
      const response = await this.confluenceClient.updatePage(params.pageId, updateData);
      return response;
    } catch (error) {
      logger.error("Failed to update page", { 
        error: error instanceof Error ? error.message : String(error),
        pageId: params.pageId,
        prefix: "CONFLUENCE"
      });
      
      if (error instanceof Error) {
        if (error.message.includes("Permission denied")) {
          throw new Error("Permission denied. You don't have permission to edit this page.");
        }
        if (error.message.includes("Version conflict")) {
          throw new Error("Version conflict. The page has been modified by another user. Please refresh and try again.");
        }
        if (error.message.includes("Title already exists")) {
          throw new Error(`A page with title "${params.title}" already exists in this space.`);
        }
      }
      
      throw new Error(`Failed to update page: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private detectChanges(currentPage: Page, _updatedPage: Page, params: UpdatePageParams) {
    return {
      title: !!(params.title && params.title !== currentPage.title),
      content: !!(params.content && params.content !== currentPage.body?.storage?.value),
      status: !!(params.status && params.status !== currentPage.status),
    };
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