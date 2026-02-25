import type { ConfluenceConfig, ConfluenceRequestConfig } from "../config";
import type { ConfluenceHttpClient, HttpClientOptions } from "./index";
import { ConfluenceHttpClientV1 } from "./v1";
import { ConfluenceHttpClientV2 } from "./v2";

/**
 * V1-only endpoint prefixes.
 * CQL search and legacy content creation are not available in the V2 API.
 */
const V1_ENDPOINT_PREFIXES = ["/search", "/content"] as const;

/**
 * Dual-version HTTP client that transparently routes requests
 * to V1 or V2 based on the endpoint path.
 *
 * - /search*, /content* → V1 (/wiki/rest/api/)
 * - everything else     → V2 (/wiki/api/v2/)
 */
export class ConfluenceDualClient implements ConfluenceHttpClient {
  private readonly v1: ConfluenceHttpClient;
  private readonly v2: ConfluenceHttpClient;

  constructor(config: ConfluenceConfig, options?: Partial<HttpClientOptions>) {
    this.v1 = new ConfluenceHttpClientV1(config, {
      apiVersion: "v1",
      ...options,
    });
    this.v2 = new ConfluenceHttpClientV2(config, {
      apiVersion: "v2",
      ...options,
    });
  }

  async sendRequest<T>(request: ConfluenceRequestConfig): Promise<T> {
    return this.clientFor(request.url).sendRequest<T>(request);
  }

  getApiVersion(): string {
    return "dual";
  }

  getBaseApiUrl(): string {
    return this.v2.getBaseApiUrl();
  }

  getWebBaseUrl(): string {
    return this.v2.getWebBaseUrl();
  }

  private clientFor(url: string): ConfluenceHttpClient {
    const normalized = url.split("?")[0];
    for (const prefix of V1_ENDPOINT_PREFIXES) {
      if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
        return this.v1;
      }
    }
    return this.v2;
  }
}

export function createDualHttpClient(
  config: ConfluenceConfig,
  options?: Partial<HttpClientOptions>,
): ConfluenceDualClient {
  return new ConfluenceDualClient(config, options);
}
