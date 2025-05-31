import { BaseToolHandler } from "@core/tools/tool-handler.class";
import { logger } from "@core/logging";
import type { SearchPagesResponse } from "../../api/index";
import type { ConfluenceClient } from "../../api/index";
import type { SearchPagesParams } from "../tools.types";

export class ConfluenceSearchPagesHandler extends BaseToolHandler<
  SearchPagesParams,
  SearchPagesResponse
> {
  constructor(private confluenceClient: ConfluenceClient) {
    super(
      "confluence",
      "confluence_search_pages",
      "Search for pages using CQL (Confluence Query Language)",
    );
  }

  protected async execute(
    params: SearchPagesParams,
  ): Promise<SearchPagesResponse> {
    // Validate parameters
    const validatedParams = this.validateParams(params);

    try {
      // Call API to search pages
      const { results, pagination, totalSize, searchDuration } =
        await this.confluenceClient.searchPages(validatedParams.query, {
          spaceKey: validatedParams.spaceKey,
          type: validatedParams.type,
          limit: validatedParams.limit,
          start: validatedParams.start,
          orderBy: validatedParams.orderBy,
        });

      // Build summary
      const summary = {
        total: totalSize,
        searchQuery: validatedParams.query,
        executionTime: searchDuration,
      };

      // Generate search suggestions if no results
      const suggestions =
        results.length === 0
          ? this.generateSearchSuggestions(validatedParams.query)
          : undefined;

      return {
        results,
        pagination,
        summary,
        suggestions,
      };
    } catch (error) {
      // Provide better error messages for CQL syntax issues
      logger.debug("Search error details", { error, prefix: "CONFLUENCE" });
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        logger.debug("Error message analysis", { errorMessage, prefix: "CONFLUENCE" });
        
        // Handle HTTP 400 errors which are often CQL syntax issues
        if (errorMessage.includes("400") || errorMessage.includes("bad request")) {
          throw new Error(
            `CQL syntax error in query: "${validatedParams.query}". Please use proper CQL syntax. Examples: text~"keyword", text~"phrase here", title~"page title", space.key="SPACE"`
          );
        }
        
        // Handle other API errors with context
        if (errorMessage.includes("401") || errorMessage.includes("authentication")) {
          throw new Error("Authentication failed. Please check your Confluence credentials.");
        }
        
        if (errorMessage.includes("403") || errorMessage.includes("access denied")) {
          throw new Error("Access denied. You may not have permission to search in this space.");
        }
        
        if (errorMessage.includes("404")) {
          throw new Error("Confluence instance not found. Please check your host URL.");
        }
      }
      
      // Re-throw the original error if we can't provide a better message
      throw error;
    }
  }

  private validateParams(params: SearchPagesParams): SearchPagesParams {
    if (!params || typeof params !== "object") {
      throw new Error("Parameters are required");
    }

    if (
      !params.query ||
      typeof params.query !== "string" ||
      params.query.trim().length === 0
    ) {
      throw new Error("query is required and must be a non-empty CQL string");
    }

    const validatedParams: SearchPagesParams = {
      query: params.query.trim(),
    };

    // Validate optional parameters
    if (params.spaceKey && typeof params.spaceKey === "string") {
      validatedParams.spaceKey = params.spaceKey;
    }

    if (params.type && typeof params.type === "string") {
      if (params.type === "page" || params.type === "blogpost") {
        validatedParams.type = params.type;
      } else {
        throw new Error(
          `Invalid type parameter: ${params.type}. Must be 'page' or 'blogpost'`,
        );
      }
    }

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

    if (params.start !== undefined) {
      if (typeof params.start === "number" && params.start >= 0) {
        validatedParams.start = params.start;
      } else {
        throw new Error(
          "Invalid start parameter: must be a non-negative number",
        );
      }
    }

    if (params.orderBy && typeof params.orderBy === "string") {
      const validOrderBy = ["relevance", "created", "modified", "title"];
      if (validOrderBy.includes(params.orderBy)) {
        validatedParams.orderBy = params.orderBy as
          | "relevance"
          | "created"
          | "modified"
          | "title";
      } else {
        throw new Error(
          `Invalid orderBy parameter: ${params.orderBy}. Must be one of: ${validOrderBy.join(", ")}`,
        );
      }
    }

    return validatedParams;
  }

  private generateSearchSuggestions(query: string): string[] {
    const suggestions: string[] = [];

    // Suggest proper CQL syntax if it looks like natural language
    if (!query.includes("~") && !query.includes("=")) {
      suggestions.push(`Try CQL syntax: text~"${query}"`);
    }

    // Suggest quoted phrases for multi-word queries
    if (query.includes(" ") && !query.includes('"')) {
      suggestions.push(`Try quoted phrase: text~"${query}"`);
    }

    // Suggest title search if it looks like a page title
    if (query.length > 10 && !query.includes("~")) {
      suggestions.push(`Try title search: title~"${query}"`);
    }

    // Generic CQL suggestions
    suggestions.push("Use text~\"keyword\" for text search");
    suggestions.push("Use space.key=\"SPACE\" to limit to a space");

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }
}
