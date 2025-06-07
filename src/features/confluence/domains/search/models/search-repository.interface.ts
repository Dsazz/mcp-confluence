import type {
  AdvancedSearchRequest,
  SearchContentRequest,
} from "./search-schemas.model";
import type { SearchQuery } from "./search-value-objects.model";
import type { PaginationInfo, SearchResult } from "./search.model";

/**
 * Repository Interfaces
 */
export interface SearchRepository {
  searchContent(
    request: SearchContentRequest,
  ): Promise<{ results: SearchResult[]; pagination: PaginationInfo }>;
  advancedSearch(
    request: AdvancedSearchRequest,
  ): Promise<{ results: SearchResult[]; pagination: PaginationInfo }>;
  searchInSpace(
    spaceKey: string,
    query: SearchQuery,
    options?: { limit?: number; start?: number },
  ): Promise<{ results: SearchResult[]; pagination: PaginationInfo }>;
  searchByType(
    contentType: "page" | "blogpost" | "comment" | "attachment",
    query: SearchQuery,
    options?: { limit?: number; start?: number },
  ): Promise<{ results: SearchResult[]; pagination: PaginationInfo }>;
  getSearchSuggestions(query: string): Promise<string[]>;
}
