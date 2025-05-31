import type { PaginationInfo } from "./models.types";

/**
 * Helper interface for API responses with pagination
 */
export interface PaginatedApiResponse {
  limit: number;
  start: number;
  size: number;
  _links: {
    next?: string;
  };
}

/**
 * Create pagination info from API response
 * Extracted to reduce repetitive code in main client
 * @param response - API response with pagination data
 * @returns Standardized pagination info
 */
export function createPaginationInfo(response: PaginatedApiResponse): PaginationInfo {
  return {
    limit: response.limit,
    start: response.start,
    size: response.size,
    hasMore: Boolean(response._links.next),
  };
}

/**
 * Create default pagination parameters
 * @param options - Optional pagination options
 * @returns Standardized pagination parameters
 */
export function createPaginationParams(options: {
  limit?: number;
  start?: number;
} = {}): Record<string, string | number> {
  return {
    limit: options.limit || 25,
    start: options.start || 0,
  };
} 