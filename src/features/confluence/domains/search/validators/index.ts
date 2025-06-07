/**
 * Search Validators Index
 *
 * Exports all search validation interfaces and implementations
 */

// Schemas
export {
  ContentTypeSchema,
  OrderBySchema,
  PaginationOptionsSchema,
  SearchContentRequestSchema,
  AdvancedSearchRequestSchema,
  SearchInSpaceRequestSchema,
  SearchByTypeRequestSchema,
  SearchSuggestionsRequestSchema,
} from "./schemas";

export type {
  SearchContentRequestInput,
  AdvancedSearchRequestInput,
  SearchInSpaceRequestInput,
  SearchByTypeRequestInput,
  SearchSuggestionsRequestInput,
} from "./schemas";

// Validator implementations with their interfaces
export {
  SearchContentValidator,
  type SearchContentRequestValidator,
} from "./search-content-validator";

export {
  AdvancedSearchValidator,
  type AdvancedSearchRequestValidator,
} from "./advanced-search-validator";

export {
  SearchInSpaceValidator,
  type SearchInSpaceRequestValidator,
} from "./search-in-space-validator";

export {
  SearchByTypeValidator,
  type SearchByTypeRequestValidator,
} from "./search-by-type-validator";

export {
  SearchSuggestionsValidator,
  type SearchSuggestionsRequestValidator,
} from "./search-suggestions-validator";
