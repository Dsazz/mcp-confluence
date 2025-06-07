/**
 * Shared utilities for Confluence v2 architecture
 */

// Validation utilities
export * from "./validators";

// Formatting utilities - Class-based implementations
export {
  // Date formatters
  DateFormatter,
  DateTimeFormatter,
  RelativeTimeFormatter,
  // Content formatters
  HtmlToTextFormatter,
  ContentPreviewFormatter,
  TextTruncateFormatter,
  // URL formatters
  BaseUrlFormatter,
  BreadcrumbFormatter,
  // Text formatters
  CapitalizeFormatter,
  HumanizeStringFormatter,
  ListFormatter,
  CountFormatter,
  // File formatters
  FileSizeFormatter,
  // Status formatters
  StatusFormatter,
  PermissionsFormatter,
} from "./formatters";

// Type exports for interfaces
export type { Formatter, StringFormatter } from "./formatters";

// Re-export commonly used utilities
export {
  // Error types
  ConfluenceError,
  ClientError,
  DomainError,
  ValidationError,
  InfrastructureError,
  // Error type guards
  isConfluenceError,
  isClientError,
  isDomainError,
  isValidationError,
  isInfrastructureError,
} from "./validators";
