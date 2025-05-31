import type { SearchPagesOptions } from "./client.impl";

/**
 * Simplified CQL query builder that accepts LLM-generated CQL and adds filtering
 * Follows the sooperset/mcp-atlassian pattern of minimal query processing
 */
export class CqlQueryBuilder {
  private query: string;
  private options: SearchPagesOptions;

  constructor(query: string, options: SearchPagesOptions = {}) {
    this.query = query;
    this.options = options;
  }

  /**
   * Builds a complete CQL query string by adding filters to the base query
   * @returns Properly formatted CQL query string
   */
  build(): string {
    let cql = this.query.trim();

    // If no query provided, default to basic text search
    if (!cql) {
      cql = "text ~ *";
    }

    // Add space filtering if specified
    if (this.options.spaceKey) {
      cql += this.buildSpaceClause();
    }

    // Add type filtering if specified
    if (this.options.type) {
      cql += this.buildTypeClause();
    }

    // Add ordering if specified and not relevance (which is default)
    if (this.options.orderBy && this.options.orderBy !== "relevance") {
      cql += this.buildOrderByClause();
    }

    return cql;
  }

  /**
   * Builds the space key filter clause
   * @private
   */
  private buildSpaceClause(): string {
    return ` AND space.key = "${this.options.spaceKey}"`;
  }

  /**
   * Builds the content type filter clause
   * @private
   */
  private buildTypeClause(): string {
    return ` AND type = "${this.options.type}"`;
  }

  /**
   * Builds the ORDER BY clause with proper field mapping
   * @private
   */
  private buildOrderByClause(): string {
    const orderField = this.mapOrderByField(this.options.orderBy || "created");
    return ` ORDER BY ${orderField}`;
  }

  /**
   * Maps orderBy option to the correct CQL field name
   * @private
   */
  private mapOrderByField(orderBy: string): string {
    switch (orderBy) {
      case "created":
        return "created";
      case "modified":
        return "lastModified";
      case "title":
        return "title";
      default:
        return "created";
    }
  }

  /**
   * Static factory method for creating a CQL query builder
   */
  static create(query: string, options: SearchPagesOptions = {}): CqlQueryBuilder {
    return new CqlQueryBuilder(query, options);
  }

  /**
   * Static convenience method for building a CQL query in one call
   */
  static buildQuery(query: string, options: SearchPagesOptions = {}): string {
    return new CqlQueryBuilder(query, options).build();
  }
} 