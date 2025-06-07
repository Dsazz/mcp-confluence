/**
 * Search Domain Formatters
 *
 * Exports all formatters and types for the search domain
 */

// Search Result Formatter
export { SearchResultFormatter } from "./search-result.formatter";
export type {
  ApiSearchResultResponse,
  ApiSearchResultListResponse,
} from "./search-result.formatter";

// Search Statistics Formatter
export { SearchStatisticsFormatter } from "./search-statistics.formatter";
export type { ApiSearchStatisticsResponse } from "./search-statistics.formatter";
