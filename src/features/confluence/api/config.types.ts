/**
 * Confluence configuration class with environment variable loading
 */
export class ConfluenceConfig {
  constructor(
    public readonly hostUrl: string,
    public readonly apiToken: string,
    public readonly userEmail: string,
  ) {}

  /**
   * Creates a ConfluenceConfig instance from environment variables
   * @returns ConfluenceConfig instance
   * @throws Error if required environment variables are missing
   */
  static fromEnv(): ConfluenceConfig {
    const hostUrl = process.env.CONFLUENCE_HOST_URL;
    const apiToken = process.env.CONFLUENCE_API_TOKEN;
    const userEmail = process.env.CONFLUENCE_USER_EMAIL;

    if (!hostUrl || !apiToken || !userEmail) {
      throw new Error(
        "Missing required environment variables: CONFLUENCE_HOST_URL, CONFLUENCE_API_TOKEN, CONFLUENCE_USER_EMAIL",
      );
    }

    return new ConfluenceConfig(hostUrl, apiToken, userEmail);
  }

  /**
   * Validates the configuration
   * @returns ConfigValidationResult
   */
  validate(): ConfigValidationResult {
    const errors: string[] = [];

    if (!this.hostUrl) {
      errors.push("hostUrl is required");
    }
    if (!this.apiToken) {
      errors.push("apiToken is required");
    }
    if (!this.userEmail) {
      errors.push("userEmail is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ConfluenceAuthHeaders {
  Authorization: string;
  Accept: string;
  "Content-Type": string;
}

export interface ConfluenceRequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  headers?: ConfluenceAuthHeaders;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
}
