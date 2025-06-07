import type { ConfluenceConfig } from "@confluence/client/config";
import { BaseConfluenceHttpClient, type HttpClientOptions } from "../index";

/**
 * Confluence API v1 HTTP client implementation
 * Handles legacy REST API endpoints (/wiki/rest/api/)
 * Primarily used for search functionality with CQL support
 */
export class ConfluenceHttpClientV1 extends BaseConfluenceHttpClient {
  private readonly baseUrl: string;

  constructor(config: ConfluenceConfig, options: HttpClientOptions) {
    super(config, { ...options, apiVersion: "v1" });
    this.baseUrl =
      this.options.customBasePath ||
      `${config.hostUrl.replace(/\/$/, "")}/wiki/rest/api`;
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

/**
 * Factory function to create a V1 HTTP client
 */
export function createV1HttpClient(
  config: ConfluenceConfig,
  options?: Partial<HttpClientOptions>,
): ConfluenceHttpClientV1 {
  return new ConfluenceHttpClientV1(config, {
    apiVersion: "v1",
    ...options,
  });
}
