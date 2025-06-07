/**
 * Pages Domain Formatters
 *
 * Exports all formatters and types for the pages domain
 */

// Page Formatter
export { PageFormatter } from "./page.formatter";
export type {
  ApiPageResponse,
  ApiPageVersionResponse,
  ApiPageBodyResponse,
  ApiPageLinksResponse,
  ApiPagePermissionsResponse,
  ApiPageMetadataResponse,
} from "./page.formatter";

// Page Summary Formatter
export { PageSummaryFormatter } from "./page-summary.formatter";
export type { ApiPageSummaryResponse } from "./page-summary.formatter";

// Page Summary List Formatter
export { PageSummaryListFormatter } from "./page-summary-list.formatter";
export type {
  ApiPageSummaryListResponse,
  ApiPaginationResponse,
  PageSummaryListInput,
} from "./page-summary-list.formatter";

// Page Context Formatter
export { PageContextFormatter } from "./page-context.formatter";
export type {
  ApiPageContextResponse,
  ApiPageBreadcrumbResponse,
} from "./page-context.formatter";
