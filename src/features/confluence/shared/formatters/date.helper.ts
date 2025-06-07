/**
 * Date Formatting Helper
 *
 * Shared utility functions for consistent date formatting across all formatters
 */

/**
 * Formats a date to ISO string format
 *
 * @param date - Date to format (Date object or ISO string)
 * @returns ISO string representation of the date
 */
export function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

/**
 * Formats multiple dates to ISO string format
 *
 * @param dates - Array of dates to format
 * @returns Array of ISO string representations
 */
export function formatDates(dates: (Date | string)[]): string[] {
  return dates.map(formatDate);
}
