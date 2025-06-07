/**
 * Space Summary Formatter
 *
 * Formats space statistics and summary information for the confluence system.
 * Handles aggregated space metrics and overview data.
 */

import type { Formatter } from "../../../shared/formatters";
import { formatDate } from "../../../shared/formatters";
import type { PaginationInfo, Space, SpaceSummary } from "../models";

/**
 * API Response interfaces for SpaceSummary formatting
 */
export interface ApiSpaceSummaryResponse {
  total: number;
  globalSpaces: number;
  personalSpaces: number;
  archivedSpaces: number;
}

export interface ApiSpaceListResponse {
  spaces: ApiSpaceItemResponse[];
  pagination: ApiPaginationResponse;
  summary: ApiSpaceSummaryResponse;
}

export interface ApiSpaceItemResponse {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: "global" | "personal";
  status: "current" | "archived";
  createdAt: string;
  updatedAt: string;
  links: {
    webui: string;
  };
  homepage?: {
    id: string;
    title: string;
  };
}

export interface ApiPaginationResponse {
  start: number;
  limit: number;
  size: number;
  hasMore: boolean;
  total?: number;
}

/**
 * SpaceSummaryFormatter class that formats space summary and statistics
 *
 * Provides formatting for:
 * - Space statistics and metrics
 * - Space lists with pagination
 * - Aggregated space data
 */
export class SpaceSummaryFormatter
  implements Formatter<SpaceSummary, ApiSpaceSummaryResponse>
{
  /**
   * Formats a SpaceSummary domain object into an API response format
   *
   * @param summary - The SpaceSummary domain object to format
   * @returns Formatted API response object
   */
  format(summary: SpaceSummary): ApiSpaceSummaryResponse {
    return {
      total: summary.total,
      globalSpaces: summary.globalSpaces,
      personalSpaces: summary.personalSpaces,
      archivedSpaces: summary.archivedSpaces,
    };
  }

  /**
   * Formats a list of spaces with pagination and summary
   *
   * @param spaces - Array of Space objects
   * @param pagination - Pagination information
   * @param summary - Space summary statistics
   * @returns Formatted list response with pagination and summary
   */
  formatList(
    spaces: Space[],
    pagination: PaginationInfo,
    summary: SpaceSummary,
  ): ApiSpaceListResponse {
    return {
      spaces: spaces.map((space) => this.formatSpaceItem(space)),
      pagination: this.formatPagination(pagination),
      summary: this.format(summary),
    };
  }

  /**
   * Formats a Space object to a simplified item format for lists
   *
   * @param space - Space object to format
   * @returns Formatted space item response
   */
  private formatSpaceItem(space: Space): ApiSpaceItemResponse {
    return {
      id: space.id,
      key: space.key.value,
      name: space.name.value,
      description: space.description,
      type: space.type,
      status: space.status,
      createdAt: formatDate(space.createdAt),
      updatedAt: formatDate(space.updatedAt),
      links: {
        webui: space.links.webui,
      },
      homepage: space.homepage
        ? {
            id: space.homepage.id,
            title: space.homepage.title,
          }
        : undefined,
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
