/**
 * Search Result Formatter
 *
 * Transforms SearchResult domain objects to API response format.
 * Handles search result formatting with highlighting, excerpts, and content metadata.
 */

import type { Formatter } from "../../../shared/formatters";
import { formatDate } from "../../../shared/formatters";
import type { SearchResult, SearchResultContent } from "../models";

/**
 * API Response interfaces for SearchResult formatting
 */
export interface ApiSearchResultResponse {
  id: string;
  type: "page" | "blogpost" | "comment" | "attachment";
  status: string;
  title: string;
  space?: {
    id?: string;
    key?: string;
    name?: string;
  };
  author: {
    id: string;
    displayName?: string;
  };
  createdAt: string;
  updatedAt: string;
  version: {
    number: number;
    createdAt: string;
  };
  links: {
    webui: string;
    self: string;
    editui?: string;
  };
  excerpt?: string;
  score: number;
  highlights?: {
    title?: string[];
    content?: string[];
  };
}

export interface ApiSearchResultListResponse {
  results: ApiSearchResultResponse[];
  totalResults: number;
  searchTime?: number;
}

/**
 * SearchResultFormatter class that transforms SearchResult domain objects to API response format
 *
 * Provides formatting for:
 * - Individual search results with content metadata
 * - Search highlighting and excerpts
 * - Content type-specific formatting
 * - Score and relevance information
 */
export class SearchResultFormatter
  implements Formatter<SearchResult, ApiSearchResultResponse>
{
  /**
   * Formats a SearchResult domain object into an API response format
   *
   * @param searchResult - The SearchResult domain object to format
   * @returns Formatted API response object
   */
  format(searchResult: SearchResult): ApiSearchResultResponse {
    return {
      id: searchResult.content.id,
      type: searchResult.content.type,
      status: searchResult.content.status,
      title: searchResult.content.title,
      space: this.formatSpace(searchResult.content),
      author: this.formatAuthor(searchResult.content),
      createdAt: formatDate(searchResult.content.createdAt),
      updatedAt: formatDate(searchResult.content.updatedAt),
      version: {
        number: searchResult.content.version.number,
        createdAt: formatDate(searchResult.content.version.createdAt),
      },
      links: this.formatLinks(searchResult.content.links),
      excerpt: searchResult.excerpt,
      score: searchResult.score,
      highlights: searchResult.highlights,
    };
  }

  /**
   * Formats a list of SearchResult objects
   *
   * @param results - Array of SearchResult objects
   * @param totalResults - Total number of results available
   * @param searchTime - Optional search execution time in milliseconds
   * @returns Formatted list response
   */
  formatList(
    results: SearchResult[],
    totalResults: number,
    searchTime?: number,
  ): ApiSearchResultListResponse {
    return {
      results: results.map((result) => this.format(result)),
      totalResults,
      searchTime,
    };
  }

  /**
   * Formats space information from search result content
   */
  private formatSpace(
    content: SearchResultContent,
  ): { id?: string; key?: string; name?: string } | undefined {
    if (!content.spaceId && !content.spaceKey && !content.spaceName) {
      return undefined;
    }

    return {
      id: content.spaceId,
      key: content.spaceKey,
      name: content.spaceName,
    };
  }

  /**
   * Formats author information from search result content
   */
  private formatAuthor(content: SearchResultContent): {
    id: string;
    displayName?: string;
  } {
    return {
      id: content.authorId,
      displayName: content.authorDisplayName,
    };
  }

  /**
   * Formats links from search result content
   */
  private formatLinks(
    links: SearchResultContent["links"],
  ): ApiSearchResultResponse["links"] {
    return {
      webui: links.webui,
      self: links.self,
      editui: links.editui,
    };
  }
}
