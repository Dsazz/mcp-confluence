/**
 * Formatter Interface
 *
 * Simple, flexible interface for all domain-specific formatters in the confluence system.
 * Provides type safety through generics without rigid implementation constraints.
 *
 * @template T - The input type to be formatted
 * @template R - The output type (defaults to string)
 */
export interface Formatter<T, R = string> {
  /**
   * Formats the input into the desired output format
   *
   * @param input - The input to format
   * @returns The formatted output
   */
  format(input: T): R;
}

/**
 * Custom error class for formatter-related errors
 */
export class FormatterError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "FormatterError";
  }
}

/**
 * Type utility for extracting the input type from a formatter
 */
export type FormatterInput<T> = T extends Formatter<infer U, unknown>
  ? U
  : never;

/**
 * Type utility for extracting the output type from a formatter
 */
export type FormatterOutput<T> = T extends Formatter<unknown, infer U>
  ? U
  : never;
