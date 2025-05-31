import type { ConfluenceConfig } from "./config.types";
import type { IConfluenceHttpClient, HttpClientOptions } from "./http-client.abstract.base";
import { ConfluenceHttpClientV1 } from "./http-client-v1.impl";
import { ConfluenceHttpClientV2 } from "./http-client-v2.impl";

/**
 * Factory for creating Confluence HTTP clients
 * Uses proper dependency injection instead of singleton pattern
 */
export class ConfluenceHttpClientFactory {
  private readonly config: ConfluenceConfig;

  constructor(config: ConfluenceConfig) {
    this.config = config;
  }

  /**
   * Create an HTTP client for the specified API version
   * @param options - Client options including API version
   * @returns HTTP client instance for the specified version
   */
  createClient(options: HttpClientOptions): IConfluenceHttpClient {
    switch (options.apiVersion) {
      case "v1":
        return new ConfluenceHttpClientV1(this.config);

      case "v2":
        return new ConfluenceHttpClientV2(this.config);

      default:
        throw new Error(`Unsupported API version: ${options.apiVersion}`);
    }
  }

  /**
   * Create a v1 API client (for search operations)
   * @returns v1 HTTP client instance
   */
  createV1Client(): ConfluenceHttpClientV1 {
    return new ConfluenceHttpClientV1(this.config);
  }

  /**
   * Create a v2 API client (for CRUD operations)
   * @returns v2 HTTP client instance
   */
  createV2Client(): ConfluenceHttpClientV2 {
    return new ConfluenceHttpClientV2(this.config);
  }

  /**
   * Get the configuration used by this factory
   * @returns The Confluence configuration
   */
  getConfig(): ConfluenceConfig {
    return this.config;
  }
}

/**
 * Convenience functions for creating clients without factory instance
 * These are pure functions that create new instances each time
 */

/**
 * Create a v1 API client
 * @param config - Confluence configuration
 * @returns v1 HTTP client instance
 */
export function createV1Client(config: ConfluenceConfig): ConfluenceHttpClientV1 {
  return new ConfluenceHttpClientV1(config);
}

/**
 * Create a v2 API client
 * @param config - Confluence configuration
 * @returns v2 HTTP client instance
 */
export function createV2Client(config: ConfluenceConfig): ConfluenceHttpClientV2 {
  return new ConfluenceHttpClientV2(config);
}

/**
 * Create an HTTP client for the specified API version
 * @param config - Confluence configuration
 * @param options - Client options including API version
 * @returns HTTP client instance for the specified version
 */
export function createConfluenceHttpClient(
  config: ConfluenceConfig,
  options: HttpClientOptions
): IConfluenceHttpClient {
  const factory = new ConfluenceHttpClientFactory(config);
  return factory.createClient(options);
} 