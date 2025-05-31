import { BaseToolHandler } from "@core/tools/tool-handler.class";
import type {
  BasicSpaceInfo,
  GetPageResponse,
  Page,
  PageBreadcrumb,
} from "../../api/index";
import type { ConfluenceClient } from "../../api/index";
import { formatPageResponse } from "../../formatters/index";
import type { GetPageParams } from "../tools.types";

export class ConfluenceGetPageHandler extends BaseToolHandler<
  GetPageParams,
  string
> {
  constructor(private confluenceClient: ConfluenceClient) {
    super(
      "confluence",
      "confluence_get_page",
      "Get detailed information about a specific Confluence page in human-readable format",
    );
  }

  protected async execute(params: GetPageParams): Promise<string> {
    // Validate parameters
    const validatedParams = this.validateParams(params);

    // Call API to get the page
    const page = await this.confluenceClient.getPage(validatedParams.pageId, {
      includeContent: validatedParams.includeContent,
      expand: validatedParams.expand,
    });

    // Get comments count if requested
    let commentCount = 0;
    if (validatedParams.includeComments) {
      const { pagination } = await this.confluenceClient.getPageComments(
        validatedParams.pageId,
        { limit: 1 },
      );
      commentCount = pagination.size || 0;
    }

    // Build context information
    const context = this.buildPageContext(page);

    const response: GetPageResponse = {
      page,
      relationships: {
        commentCount,
        children: [], // This would require additional API calls to get child pages
      },
      context,
    };

    // Format the response for human readability
    return formatPageResponse(response);
  }

  private validateParams(params: GetPageParams): GetPageParams {
    if (!params || typeof params !== "object") {
      throw new Error("Parameters are required");
    }

    if (!params.pageId || typeof params.pageId !== "string") {
      throw new Error("pageId is required and must be a string");
    }

    const validatedParams: GetPageParams = {
      pageId: params.pageId,
      includeContent: params.includeContent !== false, // Default to true
      includeComments: params.includeComments === true, // Default to false
      expand: params.expand,
    };

    return validatedParams;
  }

  private buildPageContext(page: Page): {
    space: BasicSpaceInfo;
    breadcrumbs: PageBreadcrumb[];
  } {
    // Extract space information from page
    const space: BasicSpaceInfo = {
      id: page.spaceId,
      key: "", // Would need additional API call to get space key
      name: "", // Would need additional API call to get space name
      type: "global", // Default, would need additional API call to get actual type
      _links: {
        webui: `${this.confluenceClient.getWebBaseUrl()}/spaces/${page.spaceId}`,
      },
    };

    // Build breadcrumbs - simplified for now
    const breadcrumbs: PageBreadcrumb[] = [
      {
        id: page.id,
        title: page.title,
        _links: {
          webui: page._links.webui,
        },
      },
    ];

    return {
      space,
      breadcrumbs,
    };
  }
}
