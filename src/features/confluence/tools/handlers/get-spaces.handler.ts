import { BaseToolHandler } from "@core/tools/tool-handler.class";
import type { ConfluenceClient, GetSpacesResponse } from "../../api/index";
import type { GetSpacesParams } from "../tools.types";

export class ConfluenceGetSpacesHandler extends BaseToolHandler<
  GetSpacesParams,
  GetSpacesResponse
> {
  constructor(private confluenceClient: ConfluenceClient) {
    super(
      "confluence",
      "confluence_get_spaces",
      "List user's accessible Confluence spaces",
    );
  }

  protected async execute(params: GetSpacesParams): Promise<GetSpacesResponse> {
    // Validate parameters
    const validatedParams = this.validateParams(params);

    // Call API
    const { spaces, pagination } = await this.confluenceClient.getSpaces({
      type: validatedParams.type,
      limit: validatedParams.limit,
      start: validatedParams.start,
    });

    // Calculate summary statistics
    const summary = {
      total: spaces.length,
      globalSpaces: spaces.filter((space) => space.type === "global").length,
      personalSpaces: spaces.filter((space) => space.type === "personal")
        .length,
    };

    return {
      spaces,
      pagination,
      summary,
    };
  }

  private validateParams(params: GetSpacesParams): GetSpacesParams {
    const validatedParams: GetSpacesParams = {};

    if (params && typeof params === "object") {
      // Validate type parameter
      if (params.type && typeof params.type === "string") {
        if (params.type === "global" || params.type === "personal") {
          validatedParams.type = params.type;
        } else {
          throw new Error(
            `Invalid type parameter: ${params.type}. Must be 'global' or 'personal'`,
          );
        }
      }

      // Validate limit parameter
      if (params.limit !== undefined) {
        if (
          typeof params.limit === "number" &&
          params.limit > 0 &&
          params.limit <= 100
        ) {
          validatedParams.limit = params.limit;
        } else {
          throw new Error(
            "Invalid limit parameter: must be a number between 1 and 100",
          );
        }
      }

      // Validate start parameter
      if (params.start !== undefined) {
        if (typeof params.start === "number" && params.start >= 0) {
          validatedParams.start = params.start;
        } else {
          throw new Error(
            "Invalid start parameter: must be a non-negative number",
          );
        }
      }
    }

    return validatedParams;
  }
}
