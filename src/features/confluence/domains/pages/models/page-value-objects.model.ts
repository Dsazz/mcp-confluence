import { z } from "zod";
import {
  InvalidPageContentError,
  InvalidPageIdError,
  InvalidPageTitleError,
} from "../../../shared/validators";

/**
 * Validation Schemas for Value Objects
 */
const PageIdSchema = z.string().min(1, "Page ID cannot be empty");
const PageTitleSchema = z.string().min(1).max(500);
const PageContentSchema = z.string().min(1, "Page content cannot be empty");

/**
 * Value Objects
 */
export class PageId {
  private readonly _value: string;

  constructor(value: string) {
    const result = PageIdSchema.safeParse(value);
    if (!result.success) {
      throw new InvalidPageIdError(
        `Invalid page ID: ${value}. Must be a non-empty string.`,
        result.error,
      );
    }
    this._value = result.data;
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: PageId): boolean {
    return this._value === other._value;
  }

  static fromString(value: string): PageId {
    return new PageId(value);
  }
}

export class PageTitle {
  private readonly _value: string;

  constructor(value: string) {
    const result = PageTitleSchema.safeParse(value);
    if (!result.success) {
      throw new InvalidPageTitleError(
        `Invalid page title: ${value}. Must be 1-500 characters.`,
        result.error,
      );
    }
    this._value = result.data;
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: PageTitle): boolean {
    return this._value === other._value;
  }

  static fromString(value: string): PageTitle {
    return new PageTitle(value);
  }
}

export class PageContent {
  private readonly _value: string;
  private readonly _format: "storage" | "editor" | "wiki" | "atlas_doc_format";

  constructor(
    value: string,
    format: "storage" | "editor" | "wiki" | "atlas_doc_format" = "storage",
  ) {
    const result = PageContentSchema.safeParse(value);
    if (!result.success) {
      throw new InvalidPageContentError(
        "Invalid page content: Content cannot be empty.",
        result.error,
      );
    }
    this._value = result.data;
    this._format = format;
  }

  get value(): string {
    return this._value;
  }

  get format(): "storage" | "editor" | "wiki" | "atlas_doc_format" {
    return this._format;
  }

  toString(): string {
    return this._value;
  }

  equals(other: PageContent): boolean {
    return this._value === other._value && this._format === other._format;
  }

  static fromString(
    value: string,
    format?: "storage" | "editor" | "wiki" | "atlas_doc_format",
  ): PageContent {
    return new PageContent(value, format);
  }
}
