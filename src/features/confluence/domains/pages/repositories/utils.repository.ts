import type { SearchPagesRequest } from "../models";

/**
 * Utility functions for the PageRepository implementation
 */

export function buildCQLQuery(query: SearchPagesRequest): string {
  let cql = `text ~ "${query.query}"`;

  if (query.spaceKey) {
    cql += ` AND space.key = "${query.spaceKey}"`;
  }

  if (query.type) {
    cql += ` AND type = "${query.type}"`;
  }

  // Add ordering
  if (query.orderBy) {
    switch (query.orderBy) {
      case "created":
        cql += " ORDER BY created DESC";
        break;
      case "modified":
        cql += " ORDER BY lastModified DESC";
        break;
      case "title":
        cql += " ORDER BY title ASC";
        break;
      default:
        // relevance is default, no ORDER BY needed
        break;
    }
  }

  return cql;
}

export function isNotFoundError(error: unknown): boolean {
  if (error && typeof error === "object" && "status" in error) {
    return (error as { status: number }).status === 404;
  }
  if (error instanceof Error) {
    return error.message.includes("404") || error.message.includes("not found");
  }
  return false;
}
