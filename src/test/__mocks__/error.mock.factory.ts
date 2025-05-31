import type { ToolErrorResponse } from "../../features/confluence/api/confluence.responses.types.js";
import type { ErrorMockFactory } from "./mock-factory.interfaces.js";
import type { ConfluenceApiError } from "./confluence-api.mock.registry.js";

// Error Mock Factory for Comprehensive Error Testing
export class ConfluenceErrorMockFactory implements ErrorMockFactory<ToolErrorResponse> {
  private readonly errorTemplates = {
    "not-found": {
      status: 404,
      code: "NOT_FOUND",
      message: "Resource not found",
      details: "The requested resource could not be found",
    },
    "permission-denied": {
      status: 403,
      code: "PERMISSION_DENIED",
      message: "Permission denied",
      details: "You do not have permission to access this resource",
    },
    "invalid-request": {
      status: 400,
      code: "INVALID_REQUEST",
      message: "Invalid request",
      details: "The request contains invalid parameters",
    },
    "authentication-failed": {
      status: 401,
      code: "AUTHENTICATION_FAILED",
      message: "Authentication failed",
      details: "Invalid or expired authentication credentials",
    },
    "rate-limited": {
      status: 429,
      code: "RATE_LIMITED",
      message: "Rate limit exceeded",
      details: "Too many requests, please try again later",
    },
    "server-error": {
      status: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
      details: "An unexpected error occurred on the server",
    },
    "conflict": {
      status: 409,
      code: "CONFLICT",
      message: "Resource conflict",
      details: "The request conflicts with the current state of the resource",
    },
    "validation-error": {
      status: 422,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: "One or more fields failed validation",
    },
  };

  create(overrides: Partial<ToolErrorResponse> = {}): ToolErrorResponse {
    const errorType = (overrides as { type?: string }).type || "server-error";
    const template = this.errorTemplates[errorType as keyof typeof this.errorTemplates] || this.errorTemplates["server-error"];

    return {
      success: false,
      error: {
        code: template.code,
        message: template.message,
        details: template.details,
        suggestions: this.generateSuggestions(template.code),
        helpUrl: this.generateHelpUrl(template.code),
        ...overrides.error,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        executionTime: Math.random() * 100,
        apiVersion: "v2",
        ...overrides.metadata,
      },
    };
  }

  createMany(count: number, overrides: Partial<ToolErrorResponse> = {}): ToolErrorResponse[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  createWithDefaults(): ToolErrorResponse {
    return this.create();
  }

  createValid(): ToolErrorResponse {
    return this.create({ type: "validation-error" } as Partial<ToolErrorResponse>);
  }

  createMinimal(): ToolErrorResponse {
    return this.create({
      error: {
        code: "ERROR",
        message: "An error occurred",
        details: undefined,
        suggestions: [],
        helpUrl: undefined,
      },
    });
  }

  // Specific error creators
  createNotFoundError(resource: string): ToolErrorResponse {
    return this.create({
      type: "not-found",
      error: {
        code: "NOT_FOUND",
        message: `${resource} not found`,
        details: `The requested ${resource} could not be found`,
        suggestions: [
          `Verify the ${resource} ID is correct`,
          `Check if the ${resource} exists and you have access to it`,
          "Try searching for the resource using different criteria",
        ],
      },
    } as Partial<ToolErrorResponse>);
  }

  createPermissionError(action: string, resource: string): ToolErrorResponse {
    return this.create({
      type: "permission-denied",
      error: {
        code: "PERMISSION_DENIED",
        message: `Permission denied for ${action}`,
        details: `You do not have permission to ${action} ${resource}`,
        suggestions: [
          "Contact your Confluence administrator for access",
          "Verify you are logged in with the correct account",
          "Check if the space or page has restricted permissions",
        ],
      },
    } as Partial<ToolErrorResponse>);
  }

  createValidationError(field: string, value: string): ToolErrorResponse {
    return this.create({
      type: "validation-error",
      error: {
        code: "VALIDATION_ERROR",
        message: `Invalid ${field}`,
        details: `The value '${value}' is not valid for field '${field}'`,
        suggestions: [
          `Check the format requirements for ${field}`,
          "Ensure all required fields are provided",
          "Verify the data types match the expected format",
        ],
      },
    } as Partial<ToolErrorResponse>);
  }

  createServerError(message?: string): ToolErrorResponse {
    return this.create({
      type: "server-error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: message || "Internal server error",
        details: "An unexpected error occurred on the server",
        suggestions: [
          "Try the request again in a few moments",
          "Contact support if the problem persists",
          "Check the Confluence status page for known issues",
        ],
      },
    } as Partial<ToolErrorResponse>);
  }

  createConflictError(resource: string, reason: string): ToolErrorResponse {
    return this.create({
      type: "conflict",
      error: {
        code: "CONFLICT",
        message: `Conflict with ${resource}`,
        details: reason,
        suggestions: [
          "Refresh the resource and try again",
          "Check if another user has modified the resource",
          "Resolve the conflict and retry the operation",
        ],
      },
    } as Partial<ToolErrorResponse>);
  }

  createRateLimitError(): ToolErrorResponse {
    return this.create({
      type: "rate-limited",
      error: {
        code: "RATE_LIMITED",
        message: "Rate limit exceeded",
        details: "Too many requests, please try again later",
        suggestions: [
          "Wait a few minutes before making another request",
          "Reduce the frequency of your requests",
          "Consider using batch operations where available",
        ],
      },
    } as Partial<ToolErrorResponse>);
  }

  // Helper methods
  private generateSuggestions(errorCode: string): string[] {
    const suggestionMap: Record<string, string[]> = {
      NOT_FOUND: [
        "Verify the resource ID is correct",
        "Check if you have access to the resource",
        "Try searching for the resource",
      ],
      PERMISSION_DENIED: [
        "Contact your administrator for access",
        "Verify your authentication",
        "Check resource permissions",
      ],
      INVALID_REQUEST: [
        "Check the request parameters",
        "Verify the data format",
        "Review the API documentation",
      ],
      AUTHENTICATION_FAILED: [
        "Check your API token",
        "Verify your credentials",
        "Try logging in again",
      ],
      RATE_LIMITED: [
        "Wait before retrying",
        "Reduce request frequency",
        "Use batch operations",
      ],
      INTERNAL_SERVER_ERROR: [
        "Try again later",
        "Contact support",
        "Check service status",
      ],
    };

    return suggestionMap[errorCode] || ["Contact support for assistance"];
  }

  private generateHelpUrl(errorCode: string): string {
    const baseUrl = "https://developer.atlassian.com/cloud/confluence/rest/v2";
    const helpMap: Record<string, string> = {
      NOT_FOUND: `${baseUrl}/intro/#status-codes`,
      PERMISSION_DENIED: `${baseUrl}/intro/#authentication`,
      INVALID_REQUEST: `${baseUrl}/intro/#status-codes`,
      AUTHENTICATION_FAILED: `${baseUrl}/intro/#authentication`,
      RATE_LIMITED: `${baseUrl}/intro/#rate-limiting`,
      INTERNAL_SERVER_ERROR: `${baseUrl}/intro/#status-codes`,
    };

    return helpMap[errorCode] || `${baseUrl}/intro/`;
  }
}

// Confluence API Error Factory for HTTP-level errors
export class ConfluenceApiErrorFactory {
  createApiError(type: string, status: number, message: string): ConfluenceApiError {
    return {
      type,
      status,
      code: this.getErrorCode(status),
      message,
      details: this.getErrorDetails(status),
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
    };
  }

  createNetworkError(): ConfluenceApiError {
    return this.createApiError("network-error", 0, "Network connection failed");
  }

  createTimeoutError(): ConfluenceApiError {
    return this.createApiError("timeout", 408, "Request timeout");
  }

  private getErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      422: "UNPROCESSABLE_ENTITY",
      429: "TOO_MANY_REQUESTS",
      500: "INTERNAL_SERVER_ERROR",
      502: "BAD_GATEWAY",
      503: "SERVICE_UNAVAILABLE",
    };

    return codeMap[status] || "UNKNOWN_ERROR";
  }

  private getErrorDetails(status: number): string {
    const detailsMap: Record<number, string> = {
      400: "The request was invalid or malformed",
      401: "Authentication credentials are missing or invalid",
      403: "Access to the requested resource is forbidden",
      404: "The requested resource was not found",
      409: "The request conflicts with the current state of the resource",
      422: "The request was well-formed but contains semantic errors",
      429: "Too many requests have been made in a given time period",
      500: "An internal server error occurred",
      502: "The server received an invalid response from an upstream server",
      503: "The service is temporarily unavailable",
    };

    return detailsMap[status] || "An unknown error occurred";
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
} 