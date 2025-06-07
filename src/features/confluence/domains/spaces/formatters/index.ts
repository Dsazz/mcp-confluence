/**
 * Spaces Domain Formatters
 *
 * Exports all formatters and types for the spaces domain
 */

// Space Formatter
export { SpaceFormatter } from "./space.formatter";
export type {
  ApiSpaceResponse,
  ApiSpacePermissionsResponse,
  ApiSpaceSettingsResponse,
  ApiSpaceLinksResponse,
} from "./space.formatter";

// Space Summary Formatter
export { SpaceSummaryFormatter } from "./space-summary.formatter";
export type {
  ApiSpaceSummaryResponse,
  ApiSpaceListResponse,
  ApiSpaceItemResponse,
  ApiPaginationResponse,
} from "./space-summary.formatter";
