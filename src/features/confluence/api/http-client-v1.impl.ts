import { logger } from "@core/logging";
import type { ConfluenceConfig, ConfluenceRequestConfig } from "./config.types";
import {
  BaseConfluenceHttpClient,
  ConfluenceApiError,
} from "./http-client.abstract.base";

/**
 * Confluence API v1 HTTP client implementation
 * Handles legacy REST API endpoints (/wiki/rest/api/)
 * Primarily used for search functionality with CQL support
 */
export class ConfluenceHttpClientV1 extends BaseConfluenceHttpClient {
  private readonly baseUrl: string;

  constructor(config: ConfluenceConfig) {
    super(config);
    this.baseUrl = `${config.hostUrl.replace(/\/$/, "")}/wiki/rest/api`;
  }

  /**
   * Send a request to the Confluence v1 API
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
        `Making ${request.method} request to v1 API: ${finalUrl.toString()}`,
        { prefix: "CONFLUENCE-V1" },
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
        `v1 API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        { prefix: "CONFLUENCE-V1" },
      );
      throw new ConfluenceApiError(
        `v1 API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        error,
        "v1",
      );
    }
  }

  /**
   * Get the API version this client handles
   */
  getApiVersion(): string {
    return "v1";
  }

  /**
   * Get the base API URL for this client
   */
  getBaseApiUrl(): string {
    return this.baseUrl;
  }
}
