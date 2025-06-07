// Base Error Classes
export abstract class ConfluenceError extends Error {
  abstract readonly type: string;
  abstract readonly code: string;

  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Client Layer Errors
export class ClientError extends ConfluenceError {
  readonly type = "client_error" as const;
  readonly code = "CLIENT_ERROR" as const;
}

export class HttpError extends ConfluenceError {
  readonly type = "client_error" as const;
  readonly code = "HTTP_ERROR" as const;

  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response?: unknown,
    cause?: unknown,
  ) {
    super(message, cause);
  }
}

export class ConfigurationError extends ConfluenceError {
  readonly type = "client_error" as const;
  readonly code = "CONFIGURATION_ERROR" as const;

  constructor(
    message: string,
    public readonly configKey?: string,
    cause?: unknown,
  ) {
    super(message, cause);
  }
}

export class AuthenticationError extends ConfluenceError {
  readonly type = "client_error" as const;
  readonly code = "AUTHENTICATION_ERROR" as const;

  constructor(
    message: string,
    public readonly authType?: string,
    cause?: unknown,
  ) {
    super(message, cause);
  }
}

// Domain Layer Errors
export class DomainError extends ConfluenceError {
  readonly type = "domain_error" as const;
  readonly code = "DOMAIN_ERROR" as const;
}

export class SpaceError extends ConfluenceError {
  readonly type = "domain_error" as const;
  readonly code = "SPACE_ERROR" as const;

  constructor(
    message: string,
    public readonly spaceKey?: string,
    cause?: unknown,
  ) {
    super(message, cause);
  }
}

export class SpaceNotFoundError extends ConfluenceError {
  readonly type = "domain_error" as const;
  readonly code = "SPACE_NOT_FOUND" as const;

  constructor(spaceKey: string, cause?: unknown) {
    super(`Space not found: ${spaceKey}`, cause);
  }

  get spaceKey(): string {
    return this.message.replace("Space not found: ", "");
  }
}

export class SpaceAlreadyExistsError extends ConfluenceError {
  readonly type = "domain_error" as const;
  readonly code = "SPACE_ALREADY_EXISTS" as const;

  constructor(spaceKey: string, cause?: unknown) {
    super(`Space already exists: ${spaceKey}`, cause);
  }

  get spaceKey(): string {
    return this.message.replace("Space already exists: ", "");
  }
}

export class PageError extends ConfluenceError {
  readonly type = "domain_error" as const;
  readonly code = "PAGE_ERROR" as const;

  constructor(
    message: string,
    public readonly pageId?: string,
    cause?: unknown,
  ) {
    super(message, cause);
  }
}

export class PageNotFoundError extends ConfluenceError {
  readonly type = "domain_error" as const;
  readonly code = "PAGE_NOT_FOUND" as const;

  constructor(pageId: string, cause?: unknown) {
    super(`Page not found: ${pageId}`, cause);
  }

  get pageId(): string {
    return this.message.replace("Page not found: ", "");
  }
}

export class SearchError extends ConfluenceError {
  readonly type = "domain_error" as const;
  readonly code = "SEARCH_ERROR" as const;

  constructor(
    message: string,
    public readonly query?: string,
    cause?: unknown,
  ) {
    super(message, cause);
  }
}

export class ContentError extends ConfluenceError {
  readonly type = "domain_error" as const;
  readonly code = "CONTENT_ERROR" as const;

  constructor(
    message: string,
    public readonly contentId?: string,
    cause?: unknown,
  ) {
    super(message, cause);
  }
}

// Validation Layer Errors
export class ValidationError extends ConfluenceError {
  readonly type = "validation_error" as const;
  readonly code = "VALIDATION_ERROR" as const;
}

export class SchemaValidationError extends ConfluenceError {
  readonly type = "validation_error" as const;
  readonly code = "SCHEMA_VALIDATION_ERROR" as const;

  constructor(
    message: string,
    public readonly validationErrors?: unknown,
    cause?: unknown,
  ) {
    super(message, cause);
  }
}

export class BusinessRuleError extends ConfluenceError {
  readonly type = "validation_error" as const;
  readonly code = "BUSINESS_RULE_ERROR" as const;

  constructor(
    message: string,
    public readonly rule?: string,
    cause?: unknown,
  ) {
    super(message, cause);
  }
}

// Infrastructure Layer Errors
export class InfrastructureError extends ConfluenceError {
  readonly type = "infrastructure_error" as const;
  readonly code = "INFRASTRUCTURE_ERROR" as const;
}

export class NetworkError extends ConfluenceError {
  readonly type = "infrastructure_error" as const;
  readonly code = "NETWORK_ERROR" as const;

  constructor(
    message: string,
    public readonly endpoint?: string,
    cause?: unknown,
  ) {
    super(message, cause);
  }
}

export class ServiceUnavailableError extends ConfluenceError {
  readonly type = "infrastructure_error" as const;
  readonly code = "SERVICE_UNAVAILABLE" as const;

  constructor(
    message: string,
    public readonly service?: string,
    cause?: unknown,
  ) {
    super(message, cause);
  }
}

// Repository Layer Errors
export class RepositoryError extends ConfluenceError {
  readonly type = "infrastructure_error" as const;
  readonly code = "REPOSITORY_ERROR" as const;
}

export class SpaceRepositoryError extends ConfluenceError {
  readonly type = "infrastructure_error" as const;
  readonly code = "SPACE_REPOSITORY_ERROR" as const;
}

export class PageRepositoryError extends ConfluenceError {
  readonly type = "infrastructure_error" as const;
  readonly code = "PAGE_REPOSITORY_ERROR" as const;
}

export class SearchRepositoryError extends ConfluenceError {
  readonly type = "infrastructure_error" as const;
  readonly code = "SEARCH_REPOSITORY_ERROR" as const;
}

export class ContentRepositoryError extends ConfluenceError {
  readonly type = "infrastructure_error" as const;
  readonly code = "CONTENT_REPOSITORY_ERROR" as const;
}

// Value Object Errors
export class InvalidSpaceKeyError extends ConfluenceError {
  readonly type = "validation_error" as const;
  readonly code = "INVALID_SPACE_KEY" as const;
}

export class InvalidSpaceNameError extends ConfluenceError {
  readonly type = "validation_error" as const;
  readonly code = "INVALID_SPACE_NAME" as const;
}

export class InvalidPageIdError extends ConfluenceError {
  readonly type = "validation_error" as const;
  readonly code = "INVALID_PAGE_ID" as const;
}

export class InvalidPageVersionError extends ConfluenceError {
  readonly type = "validation_error" as const;
  readonly code = "INVALID_PAGE_VERSION" as const;
}

export class InvalidPageTitleError extends ConfluenceError {
  readonly type = "validation_error" as const;
  readonly code = "INVALID_PAGE_TITLE" as const;
}

export class InvalidPageContentError extends ConfluenceError {
  readonly type = "validation_error" as const;
  readonly code = "INVALID_PAGE_CONTENT" as const;
}

export class InvalidSearchQueryError extends ConfluenceError {
  readonly type = "validation_error" as const;
  readonly code = "INVALID_SEARCH_QUERY" as const;
}

export class InvalidContentFormatError extends ConfluenceError {
  readonly type = "validation_error" as const;
  readonly code = "INVALID_CONTENT_FORMAT" as const;
}

export class InvalidContentIdError extends ConfluenceError {
  readonly type = "validation_error" as const;
  readonly code = "INVALID_CONTENT_ID" as const;
}

export class InvalidContentTitleError extends ConfluenceError {
  readonly type = "validation_error" as const;
  readonly code = "INVALID_CONTENT_TITLE" as const;
}

export class InvalidContentBodyError extends ConfluenceError {
  readonly type = "validation_error" as const;
  readonly code = "INVALID_CONTENT_BODY" as const;
}

// Error Utility Functions
export function isConfluenceError(error: unknown): error is ConfluenceError {
  return error instanceof ConfluenceError;
}

export function isClientError(error: unknown): error is ConfluenceError {
  return error instanceof ConfluenceError && error.type === "client_error";
}

export function isDomainError(error: unknown): error is ConfluenceError {
  return error instanceof ConfluenceError && error.type === "domain_error";
}

export function isValidationError(error: unknown): error is ConfluenceError {
  return error instanceof ConfluenceError && error.type === "validation_error";
}

export function isInfrastructureError(
  error: unknown,
): error is ConfluenceError {
  return (
    error instanceof ConfluenceError && error.type === "infrastructure_error"
  );
}
