// Export main client
export { ConfluenceClient } from "./client.impl";

// Export configuration types
export type {
  ConfluenceConfig,
  ConfluenceAuthHeaders,
  ConfluenceRequestConfig,
} from "./config.types";

// Export API response types
export type {
  ConfluenceApiSpacesResponse,
  ConfluenceApiSearchResponse,
  ConfluenceApiCommentsResponse,
  GetSpacesResponse,
  SearchPagesResponse,
  GetPageCommentsResponse,
  CreatePageResponse,
  UpdatePageResponse,
  GetPageResponse,
} from "./responses.types";

// Export model types
export type {
  Space,
  Page,
  SearchResult,
  Comment,
  PaginationInfo,
  ResponseMetadata,
  SuggestedAction,
  BasicSpaceInfo,
  BasicPageInfo,
  PageBreadcrumb,
} from "./models.types";

// Export HTTP client types and factory
export type {
  IConfluenceHttpClient,
  HttpClientOptions,
} from "./http-client.abstract.base";

export {
  ConfluenceHttpClientFactory,
  createV1Client,
  createV2Client,
  createConfluenceHttpClient,
} from "./http-client.factory";

export { ConfluenceHttpClientV1 } from "./http-client-v1.impl";

export { ConfluenceHttpClientV2 } from "./http-client-v2.impl";

// Export operation router
export {
  ConfluenceOperationRouter,
  type ConfluenceOperation,
} from "./operation.router";
