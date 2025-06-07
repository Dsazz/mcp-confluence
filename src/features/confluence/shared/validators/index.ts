// Export all error types and utilities
export * from "./errors";

// Re-export for convenience
export {
  ConfluenceError,
  ClientError,
  DomainError,
  ValidationError,
  InfrastructureError,
  isConfluenceError,
  isClientError,
  isDomainError,
  isValidationError,
  isInfrastructureError,
} from "./errors";
