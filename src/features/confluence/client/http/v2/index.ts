import type { ConfluenceConfig } from "@confluence/client/config";
import { BaseConfluenceHttpClient, type HttpClientOptions } from "../index";

/**
 * Confluence API v2 HTTP client implementation
 * Handles modern REST API endpoints (/api/v2/)
 * Used for newer API features and improved response formats
 */
export class ConfluenceHttpClientV2 extends BaseConfluenceHttpClient {
  private readonly baseUrl: string;

  constructor(config: ConfluenceConfig, options: HttpClientOptions) {
    super(config, { ...options, apiVersion: "v2" });
    this.baseUrl =
      this.options.customBasePath ||
      `${config.hostUrl.replace(/\/$/, "")}/api/v2`;
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

/**
 * Factory function to create a V2 HTTP client
 */
export function createV2HttpClient(
  config: ConfluenceConfig,
  options?: Partial<HttpClientOptions>,
): ConfluenceHttpClientV2 {
  return new ConfluenceHttpClientV2(config, {
    apiVersion: "v2",
    ...options,
  });
}
