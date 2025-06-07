import {
  AuthenticationError,
  ConfigurationError,
  ConfluenceError,
  HttpError,
  NetworkError,
  ServiceUnavailableError,
} from "@confluence/shared/validators";

/**
 * Error mapper for HTTP responses
 */
export function mapHttpResponseError(
  statusCode: number,
  response: unknown,
  endpoint?: string,
): ConfluenceError {
  switch (statusCode) {
    case 401:
      return new AuthenticationError(
        "Authentication failed. Please check your credentials.",
        "basic_auth",
        response,
      );

    case 403:
      return new AuthenticationError(
        "Access forbidden. Insufficient permissions.",
        "permissions",
        response,
      );

    case 404:
      return new HttpError(
        `Resource not found: ${endpoint || "unknown endpoint"}`,
        statusCode,
        response,
      );

    case 429:
      return new HttpError(
        "Rate limit exceeded. Please try again later.",
        statusCode,
        response,
      );

    case 500:
    case 502:
    case 503:
    case 504:
      return new ServiceUnavailableError(
        `Confluence service unavailable (${statusCode})`,
        "confluence_api",
        response,
      );

    default:
      return new HttpError(`HTTP error ${statusCode}`, statusCode, response);
  }
}

/**
 * Error mapper for network-level errors
 */
export function mapNetworkError(
  error: unknown,
  endpoint?: string,
): ConfluenceError {
  if (error instanceof Error) {
    // Connection timeout
    if (error.message.includes("timeout")) {
      return new NetworkError(
        `Request timeout for endpoint: ${endpoint || "unknown"}`,
        endpoint,
        error,
      );
    }

    // Connection refused
    if (error.message.includes("ECONNREFUSED")) {
      return new NetworkError(
        `Connection refused to endpoint: ${endpoint || "unknown"}`,
        endpoint,
        error,
      );
    }

    // DNS resolution failed
    if (error.message.includes("ENOTFOUND")) {
      return new NetworkError(
        `DNS resolution failed for endpoint: ${endpoint || "unknown"}`,
        endpoint,
        error,
      );
    }

    // Generic network error
    return new NetworkError(`Network error: ${error.message}`, endpoint, error);
  }

  return new NetworkError(
    `Unknown network error for endpoint: ${endpoint || "unknown"}`,
    endpoint,
    error,
  );
}

/**
 * Error mapper for configuration errors
 */
export function mapConfigError(
  error: unknown,
  configKey?: string,
): ConfluenceError {
  if (error instanceof Error) {
    return new ConfigurationError(
      `Configuration error: ${error.message}`,
      configKey,
      error,
    );
  }

  return new ConfigurationError(
    "Unknown configuration error",
    configKey,
    error,
  );
}

/**
 * Check if an error is a network-related error
 */
function isNetworkError(error: Error): boolean {
  const networkErrorPatterns = [
    "timeout",
    "ECONNREFUSED",
    "ENOTFOUND",
    "ECONNRESET",
    "ETIMEDOUT",
    "socket hang up",
  ];

  return networkErrorPatterns.some((pattern) =>
    error.message.toLowerCase().includes(pattern.toLowerCase()),
  );
}

/**
 * Generic error mapper that routes errors to appropriate mappers
 */
export function mapClientError(
  error: unknown,
  context?: {
    endpoint?: string;
    statusCode?: number;
    response?: unknown;
    configKey?: string;
  },
): ConfluenceError {
  // If it's already a ConfluenceError, return as-is
  if (error instanceof ConfluenceError) {
    return error;
  }

  // Map HTTP errors
  if (context?.statusCode) {
    return mapHttpResponseError(
      context.statusCode,
      context.response,
      context.endpoint,
    );
  }

  // Map configuration errors
  if (context?.configKey) {
    return mapConfigError(error, context.configKey);
  }

  // Map network errors
  if (error instanceof Error && isNetworkError(error)) {
    return mapNetworkError(error, context?.endpoint);
  }

  // Fallback to generic HTTP error
  return new HttpError(
    error instanceof Error ? error.message : "Unknown error",
    500,
    error,
  );
}

// Convenience functions for common error scenarios
export function createHttpError(
  statusCode: number,
  message?: string,
  response?: unknown,
): HttpError {
  return new HttpError(
    message || `HTTP ${statusCode} error`,
    statusCode,
    response,
  );
}

export function createNetworkError(
  message: string,
  endpoint?: string,
  cause?: unknown,
): NetworkError {
  return new NetworkError(message, endpoint, cause);
}

export function createAuthError(
  message: string,
  authType?: string,
  cause?: unknown,
): AuthenticationError {
  return new AuthenticationError(message, authType, cause);
}

export function createConfigError(
  message: string,
  configKey?: string,
  cause?: unknown,
): ConfigurationError {
  return new ConfigurationError(message, configKey, cause);
}

// Re-export error types for convenience
export {
  ConfluenceError,
  HttpError,
  NetworkError,
  AuthenticationError,
  ConfigurationError,
  ServiceUnavailableError,
} from "@confluence/shared/validators";
