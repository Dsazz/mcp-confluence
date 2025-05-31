import type {
  ConfluenceAuthHeaders,
  ConfluenceConfig,
  ConfluenceRequestConfig,
} from "./config.types";

/**
 * Abstract interface for Confluence HTTP clients
 * Provides a common contract for different API versions
 */
export interface IConfluenceHttpClient {
  /**
   * Send an HTTP request to the Confluence API
   * @param request - Request configuration
   * @returns Promise resolving to the response data
   */
  sendRequest<T>(request: ConfluenceRequestConfig): Promise<T>;

  /**
   * Get the web base URL for constructing UI links
   * @returns The base URL for web UI links
   */
  getWebBaseUrl(): string;

  /**
   * Get the API version this client handles
   * @returns The API version (e.g., "v1", "v2")
   */
  getApiVersion(): string;

  /**
   * Get the base API URL for this client
   * @returns The base API URL
   */
  getBaseApiUrl(): string;
}

/**
 * Configuration options for HTTP client creation
 */
export interface HttpClientOptions {
  /** The API version to use */
  apiVersion: "v1" | "v2";
  /** Optional custom base path override */
  customBasePath?: string;
}

/**
 * Error class for Confluence API errors
 */
export class ConfluenceApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown,
    public apiVersion?: string,
  ) {
    super(message);
    this.name = "ConfluenceApiError";
  }
}

/**
 * Base abstract class for Confluence HTTP clients
 * Provides common functionality for authentication and error handling
 */
export abstract class BaseConfluenceHttpClient
  implements IConfluenceHttpClient
{
  protected readonly config: ConfluenceConfig;
  protected readonly headers: ConfluenceAuthHeaders;

  constructor(config: ConfluenceConfig) {
    this.config = config;
    this.headers = this.createAuthHeaders();
  }

  abstract sendRequest<T>(request: ConfluenceRequestConfig): Promise<T>;
  abstract getApiVersion(): string;
  abstract getBaseApiUrl(): string;

  /**
   * Create authentication headers for API requests
   */
  protected createAuthHeaders(): ConfluenceAuthHeaders {
    const credentials = Buffer.from(
      `${this.config.userEmail}:${this.config.apiToken}`,
    ).toString("base64");

    return {
      Authorization: `Basic ${credentials}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  /**
   * Handle HTTP errors and convert to ConfluenceApiError
   */
  protected async handleHttpErrors(response: Response): Promise<void> {
    if (response.ok) {
      return;
    }

    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorDetails: unknown;

    try {
      const errorResponse = await response.text();
      if (errorResponse) {
        const parsed = JSON.parse(errorResponse);
        errorDetails = parsed;
        errorMessage = parsed.message || parsed.detail || errorMessage;
      }
    } catch {
      // Failed to parse error response, use default message
    }

    switch (response.status) {
      case 401:
        throw new ConfluenceApiError(
          "Authentication failed - check API token and email",
          401,
          errorDetails,
          this.getApiVersion(),
        );
      case 403:
        throw new ConfluenceApiError(
          "Access denied - insufficient permissions",
          403,
          errorDetails,
          this.getApiVersion(),
        );
      case 404:
        throw new ConfluenceApiError(
          "Resource not found",
          404,
          errorDetails,
          this.getApiVersion(),
        );
      case 429:
        throw new ConfluenceApiError(
          "Rate limit exceeded - please retry later",
          429,
          errorDetails,
          this.getApiVersion(),
        );
      case 500:
        throw new ConfluenceApiError(
          "Confluence server error - please try again",
          500,
          errorDetails,
          this.getApiVersion(),
        );
      default:
        throw new ConfluenceApiError(
          errorMessage,
          response.status,
          errorDetails,
          this.getApiVersion(),
        );
    }
  }

  /**
   * Get the web base URL for constructing UI links
   */
  getWebBaseUrl(): string {
    const baseUrl = this.config.hostUrl.replace(/\/$/, "");
    // Check if the URL already ends with /wiki to prevent duplication
    return baseUrl.endsWith("/wiki") ? baseUrl : `${baseUrl}/wiki`;
  }
}
