/**
 * Search Statistics Formatter
 *
 * Transforms SearchStatistics domain objects to API response format.
 * Handles search metadata, performance metrics, and result statistics.
 */

import type { Formatter } from "../../../shared/formatters";
import type { SearchStatistics } from "../models";

/**
 * API Response interfaces for SearchStatistics formatting
 */
export interface ApiSearchStatisticsResponse {
  totalResults: number;
  searchTime: number;
  performance: {
    searchTimeMs: number;
    searchTimeFormatted: string;
  };
  breakdown: {
    byType: {
      pages: number;
      blogposts: number;
      comments: number;
      attachments: number;
    };
    bySpace: Array<{
      spaceKey: string;
      spaceName: string;
      count: number;
      percentage: number;
    }>;
  };
  summary: {
    hasResults: boolean;
    isEmpty: boolean;
    resultCount: string;
    topSpaces: string[];
  };
}

/**
 * SearchStatisticsFormatter class that transforms SearchStatistics domain objects to API response format
 *
 * Provides formatting for:
 * - Search performance metrics and timing
 * - Result breakdowns by content type and space
 * - Human-readable summaries and percentages
 * - Search metadata and context
 */
export class SearchStatisticsFormatter
  implements Formatter<SearchStatistics, ApiSearchStatisticsResponse>
{
  /**
   * Formats a SearchStatistics domain object into an API response format
   *
   * @param statistics - The SearchStatistics domain object to format
   * @returns Formatted API response object
   */
  format(statistics: SearchStatistics): ApiSearchStatisticsResponse {
    return {
      totalResults: statistics.totalResults,
      searchTime: statistics.searchTime,
      performance: this.formatPerformance(statistics.searchTime),
      breakdown: this.formatBreakdown(statistics),
      summary: this.formatSummary(statistics),
    };
  }

  /**
   * Formats performance metrics with human-readable timing
   */
  private formatPerformance(
    searchTime: number,
  ): ApiSearchStatisticsResponse["performance"] {
    return {
      searchTimeMs: searchTime,
      searchTimeFormatted: this.formatSearchTime(searchTime),
    };
  }

  /**
   * Formats result breakdowns by type and space with percentages
   */
  private formatBreakdown(
    statistics: SearchStatistics,
  ): ApiSearchStatisticsResponse["breakdown"] {
    return {
      byType: {
        pages: statistics.resultsByType.pages,
        blogposts: statistics.resultsByType.blogposts,
        comments: statistics.resultsByType.comments,
        attachments: statistics.resultsByType.attachments,
      },
      bySpace: statistics.resultsBySpace.map((space) => ({
        spaceKey: space.spaceKey,
        spaceName: space.spaceName,
        count: space.count,
        percentage: this.calculatePercentage(
          space.count,
          statistics.totalResults,
        ),
      })),
    };
  }

  /**
   * Formats human-readable summary information
   */
  private formatSummary(
    statistics: SearchStatistics,
  ): ApiSearchStatisticsResponse["summary"] {
    const hasResults = statistics.totalResults > 0;
    const topSpaces = statistics.resultsBySpace
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((space) => space.spaceName);

    return {
      hasResults,
      isEmpty: !hasResults,
      resultCount: this.formatResultCount(statistics.totalResults),
      topSpaces,
    };
  }

  /**
   * Formats search time into human-readable string
   */
  private formatSearchTime(timeMs: number): string {
    if (timeMs < 1000) {
      return `${timeMs}ms`;
    }

    const seconds = (timeMs / 1000).toFixed(2);
    return `${seconds}s`;
  }

  /**
   * Calculates percentage with proper rounding
   */
  private calculatePercentage(count: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((count / total) * 100 * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Formats result count into human-readable string
   */
  private formatResultCount(count: number): string {
    if (count === 0) {
      return "No results";
    }

    if (count === 1) {
      return "1 result";
    }

    if (count < 1000) {
      return `${count} results`;
    }

    if (count < 1000000) {
      const thousands = (count / 1000).toFixed(1);
      return `${thousands}K results`;
    }

    const millions = (count / 1000000).toFixed(1);
    return `${millions}M results`;
  }
}
