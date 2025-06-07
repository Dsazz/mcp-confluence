/**
 * CQL (Confluence Query Language) Builder
 *
 * Provides methods for building CQL queries for Confluence search operations
 */

import type { SearchContentRequest } from "../models";

/**
 * CQL Builder class for constructing Confluence Query Language queries
 */
export class CQLBuilder {
  /**
   * Build CQL query from search content request
   */
  buildFromRequest(request: SearchContentRequest): string {
    let cql = `text ~ "${request.query}"`;

    if (request.spaceKey) {
      cql += ` AND space.key = "${request.spaceKey}"`;
    }

    if (request.type) {
      cql += ` AND type = "${request.type}"`;
    }

    if (request.includeArchivedSpaces === false) {
      cql += " AND space.status = current";
    }

    return cql;
  }

  /**
   * Map order by parameter to CQL order clause
   */
  mapOrderByToCQL(orderBy: string): string {
    switch (orderBy) {
      case "created":
        return "created DESC";
      case "modified":
        return "lastModified DESC";
      case "title":
        return "title ASC";
      default:
        return "score DESC"; // Default to relevance
    }
  }

  /**
   * Build CQL query for space-specific search
   */
  buildSpaceSearch(spaceKey: string, query: string): string {
    return `text ~ "${query}" AND space.key = "${spaceKey}"`;
  }

  /**
   * Build CQL query for content type-specific search
   */
  buildTypeSearch(
    contentType: "page" | "blogpost" | "comment" | "attachment",
    query: string,
  ): string {
    return `text ~ "${query}" AND type = "${contentType}"`;
  }

  /**
   * Build CQL query for search suggestions
   */
  buildSuggestions(query: string): string {
    return `text ~ "${query}*"`;
  }
}

/**
 * Create CQL builder instance
 */
export function createCQLBuilder(): CQLBuilder {
  return new CQLBuilder();
}
