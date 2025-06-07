/**
 * Shared formatting utilities for Confluence data
 */

/**
 * Base formatter interface with default string return type
 */
export interface Formatter<T, R = string> {
  format(input: T): R;
}

/**
 * Type alias for string formatters (most common case)
 */
export type StringFormatter<T> = Formatter<T, string>;

/**
 * Date formatting implementations
 */
export class DateFormatter implements StringFormatter<string | Date> {
  format(date: string | Date): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

export class DateTimeFormatter implements StringFormatter<string | Date> {
  format(date: string | Date): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

export class RelativeTimeFormatter implements StringFormatter<string | Date> {
  format(date: string | Date): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return "just now";
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    }
    if (diffDays < 30) {
      return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    }

    return new DateFormatter().format(dateObj);
  }
}

/**
 * Content formatting implementations
 */
export class HtmlToTextFormatter implements StringFormatter<string> {
  format(html: string): string {
    return html
      .replace(/<[^>]*>/g, " ") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
      .replace(/&amp;/g, "&") // Decode ampersands
      .replace(/&lt;/g, "<") // Decode less than
      .replace(/&gt;/g, ">") // Decode greater than
      .replace(/&quot;/g, '"') // Decode quotes
      .replace(/&#39;/g, "'") // Decode apostrophes
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .trim(); // Remove leading/trailing whitespace
  }
}

export class ContentPreviewFormatter
  implements Formatter<{ content: string; maxLength?: number }, string>
{
  format(input: { content: string; maxLength?: number }): string {
    const { content, maxLength = 200 } = input;
    const cleanContent = new HtmlToTextFormatter().format(content);

    if (cleanContent.length <= maxLength) {
      return cleanContent;
    }

    // Find the last space before the max length to avoid cutting words
    const truncateAt = cleanContent.lastIndexOf(" ", maxLength);
    const cutPoint = truncateAt > 0 ? truncateAt : maxLength;

    return `${cleanContent.substring(0, cutPoint)}...`;
  }
}

export class TextTruncateFormatter
  implements Formatter<{ text: string; maxLength: number }, string>
{
  format(input: { text: string; maxLength: number }): string {
    const { text, maxLength } = input;

    if (text.length <= maxLength) {
      return text;
    }

    return `${text.substring(0, maxLength - 3)}...`;
  }
}

/**
 * URL and navigation formatting implementations
 */
export class BaseUrlFormatter
  implements Formatter<{ webuiLink: string; fallbackUrl?: string }, string>
{
  format(input: { webuiLink: string; fallbackUrl?: string }): string {
    const { webuiLink, fallbackUrl } = input;

    try {
      const url = new URL(webuiLink, fallbackUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      // Fallback for relative URLs or malformed URLs
      if (webuiLink.includes("/wiki/")) {
        const parts = webuiLink.split("/wiki/");
        return `${parts[0]}/wiki`;
      }
      return (
        fallbackUrl || "https://your-confluence-instance.atlassian.net/wiki"
      );
    }
  }
}

export class BreadcrumbFormatter
  implements StringFormatter<Array<{ title: string }>>
{
  format(breadcrumbs: Array<{ title: string }>): string {
    return breadcrumbs.map((crumb) => crumb.title).join(" > ");
  }
}

/**
 * General text formatting implementations
 */
export class CapitalizeFormatter implements StringFormatter<string> {
  format(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}

export class HumanizeStringFormatter implements StringFormatter<string> {
  format(text: string): string {
    return text
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  }
}

export class ListFormatter
  implements Formatter<{ items: string[]; conjunction?: string }, string>
{
  format(input: { items: string[]; conjunction?: string }): string {
    const { items, conjunction = "and" } = input;

    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

    const lastItem = items[items.length - 1];
    const otherItems = items.slice(0, -1);
    return `${otherItems.join(", ")}, ${conjunction} ${lastItem}`;
  }
}

export class CountFormatter
  implements
    Formatter<{ count: number; singular: string; plural?: string }, string>
{
  format(input: { count: number; singular: string; plural?: string }): string {
    const { count, singular, plural } = input;
    const pluralForm = plural || `${singular}s`;
    return `${count} ${count === 1 ? singular : pluralForm}`;
  }
}

/**
 * File and size formatting implementations
 */
export class FileSizeFormatter implements StringFormatter<number> {
  format(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  }
}

/**
 * Status and permission formatting implementations
 */
export class StatusFormatter implements StringFormatter<string> {
  format(status: string): string {
    const statusMap: Record<string, string> = {
      current: "✅ Current",
      draft: "📝 Draft",
      archived: "📦 Archived",
      deleted: "🗑️ Deleted",
      trashed: "🗑️ Trashed",
    };

    return (
      statusMap[status.toLowerCase()] ||
      new CapitalizeFormatter().format(status)
    );
  }
}

export class PermissionsFormatter
  implements StringFormatter<Record<string, boolean>>
{
  format(permissions: Record<string, boolean>): string {
    const activePermissions = Object.entries(permissions)
      .filter(([, value]) => value)
      .map(([key]) => new HumanizeStringFormatter().format(key));

    if (activePermissions.length === 0) {
      return "No permissions";
    }

    return new ListFormatter().format({ items: activePermissions });
  }
}

export { FormatterError } from "./base.formatter";
export type {
  FormatterInput,
  FormatterOutput,
} from "./base.formatter";

// Date formatting utilities
export { formatDate, formatDates } from "./date.helper";
