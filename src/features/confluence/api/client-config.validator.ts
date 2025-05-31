import type { ConfluenceConfig } from "./config.types";

/**
 * Validate the provided Confluence configuration
 * @param config - Configuration to validate
 * @throws Error if configuration is invalid
 */
export function validateConfluenceConfig(config: ConfluenceConfig): void {
  const errors: string[] = [];

  if (!config.hostUrl) {
    errors.push("Confluence host URL is required");
  }
  if (!config.apiToken) {
    errors.push("Confluence API token is required");
  }
  if (!config.userEmail) {
    errors.push("User email is required for API token authentication");
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(", ")}`);
  }
}

/**
 * Check if configuration is valid without throwing
 * @param config - Configuration to check
 * @returns true if valid, false otherwise
 */
export function isValidConfluenceConfig(config: ConfluenceConfig): boolean {
  try {
    validateConfluenceConfig(config);
    return true;
  } catch {
    return false;
  }
}
