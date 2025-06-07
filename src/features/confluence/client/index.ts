// Configuration exports
export * from "./config";

// Error handling exports
export * from "./errors";

// HTTP client exports
export * from "./http";
export * from "./http/v1";
export * from "./http/v2";

// Response types (to be implemented)
// export * from './responses/index.js';

// Re-export commonly used types and functions
export type {
  ConfluenceConfig,
  ConfluenceAuthHeaders,
  ConfluenceRequestConfig,
  ConfluenceClientOptions,
  ConfigValidationResult,
} from "./config";

export type {
  ConfluenceHttpClient,
  HttpClientOptions,
} from "./http";

export {
  createConfluenceConfig,
  createConfluenceConfigFromEnv,
  validateConfig,
  createAuthHeaders,
} from "./config";

export { createHttpClient } from "./http";

export { createV1HttpClient } from "./http/v1";

export { createV2HttpClient } from "./http/v2";

export {
  mapClientError,
  mapHttpResponseError,
  mapNetworkError,
  mapConfigError,
  createHttpError,
  createNetworkError,
  createAuthError,
  createConfigError,
} from "./errors";
