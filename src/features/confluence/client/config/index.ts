import { ConfigurationError } from "@confluence/shared/validators";

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
   * @throws ConfigurationError if required environment variables are missing
   */
  static fromEnv(): ConfluenceConfig {
    const hostUrl = process.env.CONFLUENCE_HOST_URL;
    const apiToken = process.env.CONFLUENCE_API_TOKEN;
    const userEmail = process.env.CONFLUENCE_USER_EMAIL;

    const missingVars: string[] = [];
    if (!hostUrl) missingVars.push("CONFLUENCE_HOST_URL");
    if (!apiToken) missingVars.push("CONFLUENCE_API_TOKEN");
    if (!userEmail) missingVars.push("CONFLUENCE_USER_EMAIL");

    if (missingVars.length > 0) {
      throw new ConfigurationError(
        `Missing required environment variables: ${missingVars.join(", ")}`,
        missingVars[0] || "unknown",
      );
    }

    // At this point, all variables are guaranteed to be defined
    return new ConfluenceConfig(
      hostUrl as string,
      apiToken as string,
      userEmail as string,
    );
  }

  /**
   * Validates the configuration
   * @returns ConfigValidationResult
   */
  validate(): ConfigValidationResult {
    const errors: string[] = [];

    if (!this.hostUrl) {
      errors.push("hostUrl is required");
    } else if (!this.isValidUrl(this.hostUrl)) {
      errors.push("hostUrl must be a valid URL");
    }

    if (!this.apiToken) {
      errors.push("apiToken is required");
    } else if (this.apiToken.length < 10) {
      errors.push("apiToken appears to be invalid (too short)");
    }

    if (!this.userEmail) {
      errors.push("userEmail is required");
    } else if (!this.isValidEmail(this.userEmail)) {
      errors.push("userEmail must be a valid email address");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Gets the base API URL for Confluence
   */
  get baseApiUrl(): string {
    return `${this.hostUrl.replace(/\/$/, "")}/rest/api`;
  }

  /**
   * Gets the base API URL for Confluence v2
   */
  get baseApiV2Url(): string {
    return `${this.hostUrl.replace(/\/$/, "")}/api/v2`;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
  method: "GET" | "POST" | "PUT" | "DELETE" | "HEAD";
  url: string;
  headers?: ConfluenceAuthHeaders;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
}

export interface ConfluenceClientOptions {
  config: ConfluenceConfig;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

// Configuration factory functions
export function createConfluenceConfig(
  hostUrl: string,
  apiToken: string,
  userEmail: string,
): ConfluenceConfig {
  return new ConfluenceConfig(hostUrl, apiToken, userEmail);
}

export function createConfluenceConfigFromEnv(): ConfluenceConfig {
  return ConfluenceConfig.fromEnv();
}

// Configuration validation utilities
export function validateConfig(config: ConfluenceConfig): void {
  const result = config.validate();
  if (!result.isValid) {
    throw new ConfigurationError(
      `Configuration validation failed: ${result.errors.join(", ")}`,
    );
  }
}

export function createAuthHeaders(
  config: ConfluenceConfig,
): ConfluenceAuthHeaders {
  const auth = Buffer.from(`${config.userEmail}:${config.apiToken}`).toString(
    "base64",
  );

  return {
    Authorization: `Basic ${auth}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}
