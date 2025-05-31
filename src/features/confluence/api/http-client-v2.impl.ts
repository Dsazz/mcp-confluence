import type {
  ConfluenceConfig,
  ConfluenceRequestConfig,
} from "./config.types";
import { BaseConfluenceHttpClient, ConfluenceApiError } from "./http-client.abstract.base";
import { logger } from "@core/logging";

/**
 * Confluence API v2 HTTP client implementation
 * Handles modern REST API endpoints (/wiki/api/v2/)
 * Used for spaces, pages, comments, and other CRUD operations
 */
export class ConfluenceHttpClientV2 extends BaseConfluenceHttpClient {
  private readonly baseUrl: string;

  constructor(config: ConfluenceConfig) {
    super(config);
    this.baseUrl = `${config.hostUrl.replace(/\/$/, "")}/wiki/api/v2`;
  }

  /**
   * Send a request to the Confluence v2 API
   */
  async sendRequest<T>(request: ConfluenceRequestConfig): Promise<T> {
    const url = request.url.startsWith("http")
      ? request.url
      : `${this.baseUrl}/${request.url.replace(/^\//, "")}`;

    const fetchOptions: RequestInit = {
      method: request.method,
      headers: { ...this.headers, ...request.headers },
    };

    // Add query parameters if present
    const finalUrl = new URL(url);
    if (request.params) {
      for (const [key, value] of Object.entries(request.params)) {
        finalUrl.searchParams.append(key, String(value));
      }
    }

    // Add body for POST/PUT requests
    if (
      request.data &&
      (request.method === "POST" || request.method === "PUT")
    ) {
      fetchOptions.body = JSON.stringify(request.data);
    }

    try {
      logger.debug(
        `Making ${request.method} request to v2 API: ${finalUrl.toString()}`,
        { prefix: "CONFLUENCE-V2" }
      );

      const response = await fetch(finalUrl.toString(), fetchOptions);

      await this.handleHttpErrors(response);

      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }

      const responseText = await response.text();

      if (!responseText) {
        return {} as T;
      }

      return JSON.parse(responseText) as T;
    } catch (error) {
      if (error instanceof ConfluenceApiError) {
        throw error;
      }

      logger.error(
        `v2 API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        { prefix: "CONFLUENCE-V2" }
      );
      throw new ConfluenceApiError(
        `v2 API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        error,
        "v2"
      );
    }
  }

  /**
   * Get the API version this client handles
   */
  getApiVersion(): string {
    return "v2";
  }

  /**
   * Get the base API URL for this client
   */
  getBaseApiUrl(): string {
    return this.baseUrl;
  }
} 