import type {
  GetPageCommentsOptions,
  GetPageOptions,
  SearchPagesOptions,
} from "./client.impl";
import { CqlQueryBuilder } from "./cql-query.builder";
import { createPaginationParams } from "./pagination.helper";

/**
 * Build parameters for getPage requests
 * @param options - Page retrieval options
 * @returns Request parameters
 */
export function buildGetPageParams(
  options: GetPageOptions,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (options.includeContent !== false) {
    params["body-format"] = "storage";
  }

  if (options.expand?.length) {
    params.expand = options.expand.join(",");
  }

  return params;
}

/**
 * Build parameters for searchPages requests
 * @param query - Search query
 * @param options - Search options
 * @returns Request parameters
 */
export function buildSearchParams(
  query: string,
  options: SearchPagesOptions,
): Record<string, string | number> {
  return {
    cql: CqlQueryBuilder.buildQuery(query, options),
    ...createPaginationParams(options),
  };
}

/**
 * Build parameters for getPageComments requests
 * @param options - Comment retrieval options
 * @returns Request parameters
 */
export function buildGetCommentsParams(
  options: GetPageCommentsOptions,
): Record<string, string | number> {
  const params = createPaginationParams(options);

  if (options.orderBy) {
    params.sort =
      options.orderBy === "created" ? "created-date" : "modified-date";
  }

  return params;
}

/**
 * Build parameters for getSpaces requests
 * @param options - Space retrieval options
 * @returns Request parameters
 */
export function buildGetSpacesParams(options: {
  type?: string;
  limit?: number;
  start?: number;
}): Record<string, string | number> {
  const params = createPaginationParams(options);

  if (options.type) {
    params.type = options.type;
  }

  return params;
}
