/**
 * HTTP utility functions for Confluence API clients
 */

/**
 * Build a complete URL from base URL and endpoint
 */
export function buildApiUrl(baseUrl: string, endpoint: string): string {
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanEndpoint = endpoint.replace(/^\//, "");
  return `${cleanBase}/${cleanEndpoint}`;
}

/**
 * Add query parameters to a URL
 */
export function addQueryParams(
  url: string,
  params?: Record<string, string | number | boolean>,
): string {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const urlObj = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    urlObj.searchParams.append(key, String(value));
  }

  return urlObj.toString();
}

/**
 * Prepare request options for fetch
 */
export function prepareRequestOptions(
  method: string,
  headers?: Record<string, string>,
  data?: unknown,
): RequestInit {
  const options: RequestInit = {
    method,
    headers: headers || {},
  };

  // Add body for POST/PUT requests
  if (data && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(data);
  }

  return options;
}

/**
 * Parse response based on content type and status
 */
export async function parseResponse<T>(response: Response): Promise<T> {
  // Handle empty responses
  if (response.status === 204 || response.status === 202) {
    return {} as T;
  }

  const responseText = await response.text();

  if (!responseText) {
    return {} as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse response as JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Check if a URL is absolute
 */
export function isAbsoluteUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize URL by removing trailing slashes and ensuring proper format
 */
export function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "").replace(/\/+/g, "/");
}

/**
 * Extract error message from response
 */
export async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const errorText = await response.text();
    if (errorText) {
      const parsed = JSON.parse(errorText);
      return (
        parsed.message ||
        parsed.detail ||
        parsed.error ||
        `HTTP ${response.status}: ${response.statusText}`
      );
    }
  } catch {
    // Failed to parse error response
  }

  return `HTTP ${response.status}: ${response.statusText}`;
}

/**
 * Create a delay for retry mechanisms
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (attempt === maxAttempts) {
        break;
      }

      // Exponential backoff: baseDelay * 2^(attempt-1)
      const delayMs = baseDelay * 2 ** (attempt - 1);
      await delay(delayMs);
    }
  }

  if (!lastError) {
    throw new Error("Retry failed with no error captured");
  }

  throw lastError;
}
