/**
 * Page Summary Formatter
 *
 * Transforms PageSummary domain objects to API response format for list responses.
 * Handles pagination metadata and summary information formatting.
 */

import type { Formatter } from "../../../shared/formatters";
import { formatDate } from "../../../shared/formatters";
import type { PageSummary } from "../models";

/**
 * API Response interfaces for PageSummary formatting
 */
export interface ApiPageSummaryResponse {
  id: string;
  title: string;
  status: "current" | "draft" | "trashed" | "deleted";
  spaceId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  version: {
    number: number;
    createdAt: string;
  };
  links: {
    webui: string;
  };
}

/**
 * PageSummaryFormatter class that transforms PageSummary domain objects to API response format
 *
 * Provides formatting for:
 * - Individual page summaries
 * - Lists of page summaries with pagination
 * - Pagination metadata
 */
export class PageSummaryFormatter
  implements Formatter<PageSummary, ApiPageSummaryResponse>
{
  /**
   * Formats a PageSummary domain object into an API response format
   *
   * @param pageSummary - The PageSummary domain object to format
   * @returns Formatted API response object
   */
  format(pageSummary: PageSummary): ApiPageSummaryResponse {
    return {
      id: pageSummary.id.value,
      title: pageSummary.title.value,
      status: pageSummary.status,
      spaceId: pageSummary.spaceId,
      authorId: pageSummary.authorId,
      createdAt: formatDate(pageSummary.createdAt),
      updatedAt: formatDate(pageSummary.updatedAt),
      version: {
        number: pageSummary.version.number,
        createdAt: formatDate(pageSummary.version.createdAt),
      },
      links: {
        webui: pageSummary.links.webui,
      },
    };
  }
}
