import type {
  PaginationInfo,
  SearchContext,
  SearchResult,
  SearchStatistics,
} from "./search.model";

/**
 * Response Types
 */
export interface SearchContentResponse {
  results: SearchResult[];
  pagination: PaginationInfo;
  context: SearchContext;
  statistics: SearchStatistics;
}

export interface AdvancedSearchResponse {
  results: SearchResult[];
  pagination: PaginationInfo;
  cqlQuery: string;
  statistics: SearchStatistics;
}

export interface SearchSuggestionsResponse {
  query: string;
  suggestions: string[];
}
