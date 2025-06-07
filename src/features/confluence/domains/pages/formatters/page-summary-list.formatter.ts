/**
 * Page Summary List Formatter
 *
 * Transforms lists of PageSummary objects with pagination metadata to API response format.
 * Handles pagination and list aggregation formatting.
 */

import type { Formatter } from "../../../shared/formatters";
import type { PageSummary, PaginationInfo } from "../models";
import {
  type ApiPageSummaryResponse,
  PageSummaryFormatter,
} from "./page-summary.formatter";

/**
 * API Response interfaces for PageSummary list formatting
 */
export interface ApiPageSummaryListResponse {
  pages: ApiPageSummaryResponse[];
  pagination: ApiPaginationResponse;
}

export interface ApiPaginationResponse {
  start: number;
  limit: number;
  size: number;
  hasMore: boolean;
  total?: number;
}

/**
 * Input type for the list formatter
 */
export interface PageSummaryListInput {
  pages: PageSummary[];
  pagination: PaginationInfo;
}

/**
 * PageSummaryListFormatter class that transforms lists of PageSummary objects to API response format
 *
 * Provides formatting for:
 * - Lists of page summaries with pagination
 * - Pagination metadata
 * - Aggregated list responses
 */
export class PageSummaryListFormatter
  implements Formatter<PageSummaryListInput, ApiPageSummaryListResponse>
{
  private readonly pageSummaryFormatter = new PageSummaryFormatter();

  /**
   * Formats a list of PageSummary objects with pagination metadata
   *
   * @param input - Object containing pages array and pagination info
   * @returns Formatted list response with pagination
   */
  format(input: PageSummaryListInput): ApiPageSummaryListResponse {
    return {
      pages: input.pages.map((page) => this.pageSummaryFormatter.format(page)),
      pagination: this.formatPagination(input.pagination),
    };
  }

  /**
   * Formats pagination information to API response format
   *
   * @param pagination - PaginationInfo object to format
   * @returns Formatted pagination response
   */
  private formatPagination(pagination: PaginationInfo): ApiPaginationResponse {
    return {
      start: pagination.start,
      limit: pagination.limit,
      size: pagination.size,
      hasMore: pagination.hasMore,
      total: pagination.total,
    };
  }
}
