import type { CQLQuery, SearchQuery } from "./search-value-objects.model";

/**
 * Domain Models
 */
export interface SearchResultContent {
  id: string;
  type: "page" | "blogpost" | "comment" | "attachment";
  status: string;
  title: string;
  spaceId?: string;
  spaceKey?: string;
  spaceName?: string;
  authorId: string;
  authorDisplayName?: string;
  createdAt: Date;
  updatedAt: Date;
  version: {
    number: number;
    createdAt: Date;
  };
  links: {
    webui: string;
    self: string;
    editui?: string;
  };
}

export interface SearchResult {
  content: SearchResultContent;
  excerpt?: string;
  score: number;
  highlights?: {
    title?: string[];
    content?: string[];
  };
}

export interface SearchContext {
  query: SearchQuery | CQLQuery;
  filters: {
    spaceKey?: string;
    contentType?: "page" | "blogpost" | "comment" | "attachment";
    dateRange?: {
      from?: Date;
      to?: Date;
    };
    author?: string;
  };
  sorting: {
    field: "relevance" | "created" | "modified" | "title";
    direction: "ASC" | "DESC";
  };
}

export interface SearchStatistics {
  totalResults: number;
  searchTime: number;
  resultsByType: {
    pages: number;
    blogposts: number;
    comments: number;
    attachments: number;
  };
  resultsBySpace: Array<{
    spaceKey: string;
    spaceName: string;
    count: number;
  }>;
}

/**
 * Supporting Types
 */
export interface PaginationInfo {
  start: number;
  limit: number;
  size: number;
  hasMore: boolean;
  total?: number;
}
