import type {
  ConfluenceAuthHeaders,
  ConfluenceConfig,
  ConfluenceRequestConfig,
} from "@confluence/client/config";
import { mapClientError } from "@confluence/client/errors";
import { logger } from "@core/logging";
import {
  addQueryParams,
  buildApiUrl,
  extractErrorMessage,
  isAbsoluteUrl,
  parseResponse,
  prepareRequestOptions,
  retryWithBackoff,
} from "./utils";

/**
 * Interface for Confluence HTTP clients
 */
export interface ConfluenceHttpClient {
  /**
   * Send an HTTP request to the Confluence API
   */
  sendRequest<T>(request: ConfluenceRequestConfig): Promise<T>;

  /**
   * Get the API version this client handles
   */
  getApiVersion(): string;

  /**
   * Get the base API URL for this client
   */
  getBaseApiUrl(): string;

  /**
   * Get the web base URL for constructing UI links
   */
  getWebBaseUrl(): string;
}

/**
 * Configuration options for HTTP client creation
 */
export interface HttpClientOptions {
  /** The API version to use */
  apiVersion: "v1" | "v2";
  /** Optional custom base path override */
  customBasePath?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts */
  retryAttempts?: number;
  /** Base delay for retry backoff in milliseconds */
  retryDelay?: number;
}

/**
 * Base abstract class for Confluence HTTP clients
 */
export abstract class BaseConfluenceHttpClient implements ConfluenceHttpClient {
  protected readonly config: ConfluenceConfig;
  protected readonly headers: ConfluenceAuthHeaders;
  protected readonly options: Required<HttpClientOptions>;

  constructor(config: ConfluenceConfig, options: HttpClientOptions) {
    this.config = config;
    this.headers = this.createAuthHeaders();
    this.options = {
      apiVersion: options.apiVersion,
      customBasePath: options.customBasePath || "",
      timeout: options.timeout || 30000,
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 1000,
    };
  }

  abstract getApiVersion(): string;
  abstract getBaseApiUrl(): string;

  /**
   * Send a request with error handling and retry logic
   */
  async sendRequest<T>(request: ConfluenceRequestConfig): Promise<T> {
    return retryWithBackoff(
      () => this.executeRequest<T>(request),
      this.options.retryAttempts,
      this.options.retryDelay,
    );
  }

  /**
   * Execute a single request attempt
   */
  protected async executeRequest<T>(
    request: ConfluenceRequestConfig,
  ): Promise<T> {
    const url = this.buildRequestUrl(request.url);
    const finalUrl = addQueryParams(url, request.params);
    const fetchOptions = prepareRequestOptions(
      request.method,
      { ...this.headers, ...request.headers },
      request.data,
    );

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.options.timeout,
    );
    fetchOptions.signal = controller.signal;

    try {
      logger.debug(
        `Making ${request.method} request to ${this.getApiVersion()} API: ${finalUrl}`,
        { prefix: `CONFLUENCE-${this.getApiVersion().toUpperCase()}` },
      );

      const response = await fetch(finalUrl, fetchOptions);
      clearTimeout(timeoutId);

      await this.handleHttpErrors(response, finalUrl);
      return await parseResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      // Map and throw the error using our error mapping system
      throw mapClientError(error, {
        endpoint: finalUrl,
        statusCode: error instanceof Response ? error.status : undefined,
      });
    }
  }

  /**
   * Build the complete request URL
   */
  protected buildRequestUrl(endpoint: string): string {
    if (isAbsoluteUrl(endpoint)) {
      return endpoint;
    }

    return buildApiUrl(this.getBaseApiUrl(), endpoint);
  }

  /**
   * Handle HTTP errors and throw appropriate errors
   */
  protected async handleHttpErrors(
    response: Response,
    url: string,
  ): Promise<void> {
    if (response.ok) {
      return;
    }

    const errorMessage = await extractErrorMessage(response);
    const error = mapClientError(new Error(errorMessage), {
      endpoint: url,
      statusCode: response.status,
      response: response.body,
    });

    throw error;
  }

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
   * Get the web base URL for constructing UI links
   */
  getWebBaseUrl(): string {
    const baseUrl = this.config.hostUrl.replace(/\/$/, "");
    // Check if the URL already ends with /wiki to prevent duplication
    return baseUrl.endsWith("/wiki") ? baseUrl : `${baseUrl}/wiki`;
  }
}

/**
 * Factory function to create HTTP clients
 */
export function createHttpClient(
  config: ConfluenceConfig,
  options: HttpClientOptions,
): ConfluenceHttpClient {
  switch (options.apiVersion) {
    case "v1":
      // Dynamic import to avoid circular dependencies
      return new (require("./v1/index").ConfluenceHttpClientV1)(
        config,
        options,
      );
    case "v2":
      return new (require("./v2/index").ConfluenceHttpClientV2)(
        config,
        options,
      );
    default:
      throw new Error(`Unsupported API version: ${options.apiVersion}`);
  }
}

// Re-export utilities for convenience
export * from "./utils";
