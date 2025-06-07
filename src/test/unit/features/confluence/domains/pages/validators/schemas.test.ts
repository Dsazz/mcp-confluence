/**
 * Pages Validation Schemas Tests
 *
 * Comprehensive tests for pages domain Zod schemas
 */

import { describe, expect, test } from "bun:test";
import {
  ContentFormatSchema,
  CreatePageRequestSchema,
  GetChildPagesRequestSchema,
  GetPageCommentCountRequestSchema,
  GetPageRequestSchema,
  GetPagesBySpaceRequestSchema,
  PageIdSchema,
  PageStatusSchema,
  PageTitleSchema,
  PaginationOptionsSchema,
  SearchPagesRequestSchema,
  SpaceIdSchema,
  UpdatePageRequestSchema,
} from "@features/confluence/domains/pages/validators/schemas";

describe("Pages Validation Schemas", () => {
  describe("PageIdSchema", () => {
    test("should accept valid page ID", () => {
      expect(() => PageIdSchema.parse("123456")).not.toThrow();
    });

    test("should accept UUID-style ID", () => {
      expect(() => PageIdSchema.parse("abc-123-def-456")).not.toThrow();
    });

    test("should trim whitespace", () => {
      const result = PageIdSchema.parse("  123456  ");
      expect(result).toBe("123456");
    });

    test("should reject empty string", () => {
      expect(() => PageIdSchema.parse("")).toThrow("Page ID cannot be empty");
    });

    test("should reject whitespace-only string", () => {
      expect(() => PageIdSchema.parse("   ")).toThrow(
        "Page ID cannot be empty",
      );
    });

    test("should reject null", () => {
      expect(() => PageIdSchema.parse(null)).toThrow();
    });

    test("should reject number", () => {
      expect(() => PageIdSchema.parse(123)).toThrow();
    });
  });

  describe("PageTitleSchema", () => {
    test("should accept valid page title", () => {
      expect(() => PageTitleSchema.parse("My Page Title")).not.toThrow();
    });

    test("should accept title with special characters", () => {
      expect(() => PageTitleSchema.parse("Page: Title & More!")).not.toThrow();
    });

    test("should accept maximum length title", () => {
      const maxTitle = "a".repeat(255);
      expect(() => PageTitleSchema.parse(maxTitle)).not.toThrow();
    });

    test("should trim whitespace", () => {
      const result = PageTitleSchema.parse("  My Title  ");
      expect(result).toBe("My Title");
    });

    test("should reject empty string", () => {
      expect(() => PageTitleSchema.parse("")).toThrow(
        "Page title cannot be empty",
      );
    });

    test("should reject whitespace-only string", () => {
      expect(() => PageTitleSchema.parse("   ")).toThrow(
        "Page title cannot be empty",
      );
    });

    test("should reject title exceeding maximum length", () => {
      const longTitle = "a".repeat(256);
      expect(() => PageTitleSchema.parse(longTitle)).toThrow(
        "Page title is too long",
      );
    });

    test("should reject null", () => {
      expect(() => PageTitleSchema.parse(null)).toThrow();
    });

    test("should reject number", () => {
      expect(() => PageTitleSchema.parse(123)).toThrow();
    });
  });

  describe("SpaceIdSchema", () => {
    test("should accept valid space ID", () => {
      expect(() => SpaceIdSchema.parse("SPACE123")).not.toThrow();
    });

    test("should accept UUID-style ID", () => {
      expect(() => SpaceIdSchema.parse("abc-123-def-456")).not.toThrow();
    });

    test("should trim whitespace", () => {
      const result = SpaceIdSchema.parse("  SPACE123  ");
      expect(result).toBe("SPACE123");
    });

    test("should reject empty string", () => {
      expect(() => SpaceIdSchema.parse("")).toThrow("Space ID cannot be empty");
    });

    test("should reject whitespace-only string", () => {
      expect(() => SpaceIdSchema.parse("   ")).toThrow(
        "Space ID cannot be empty",
      );
    });

    test("should reject null", () => {
      expect(() => SpaceIdSchema.parse(null)).toThrow();
    });

    test("should reject number", () => {
      expect(() => SpaceIdSchema.parse(123)).toThrow();
    });
  });

  describe("ContentFormatSchema", () => {
    test("should accept storage format", () => {
      expect(() => ContentFormatSchema.parse("storage")).not.toThrow();
    });

    test("should accept editor format", () => {
      expect(() => ContentFormatSchema.parse("editor")).not.toThrow();
    });

    test("should accept wiki format", () => {
      expect(() => ContentFormatSchema.parse("wiki")).not.toThrow();
    });

    test("should accept atlas_doc_format", () => {
      expect(() => ContentFormatSchema.parse("atlas_doc_format")).not.toThrow();
    });

    test("should reject invalid format", () => {
      expect(() => ContentFormatSchema.parse("invalid")).toThrow();
    });

    test("should reject empty string", () => {
      expect(() => ContentFormatSchema.parse("")).toThrow();
    });

    test("should reject null", () => {
      expect(() => ContentFormatSchema.parse(null)).toThrow();
    });

    test("should reject number", () => {
      expect(() => ContentFormatSchema.parse(123)).toThrow();
    });

    test("should reject boolean", () => {
      expect(() => ContentFormatSchema.parse(true)).toThrow();
    });
  });

  describe("PageStatusSchema", () => {
    test("should accept current status", () => {
      expect(() => PageStatusSchema.parse("current")).not.toThrow();
    });

    test("should accept draft status", () => {
      expect(() => PageStatusSchema.parse("draft")).not.toThrow();
    });

    test("should reject invalid status", () => {
      expect(() => PageStatusSchema.parse("published")).toThrow();
    });

    test("should reject empty string", () => {
      expect(() => PageStatusSchema.parse("")).toThrow();
    });

    test("should reject null", () => {
      expect(() => PageStatusSchema.parse(null)).toThrow();
    });

    test("should reject number", () => {
      expect(() => PageStatusSchema.parse(123)).toThrow();
    });

    test("should reject boolean", () => {
      expect(() => PageStatusSchema.parse(true)).toThrow();
    });
  });

  describe("PaginationOptionsSchema", () => {
    test("should accept valid pagination options", () => {
      expect(() =>
        PaginationOptionsSchema.parse({ limit: 50, start: 0 }),
      ).not.toThrow();
    });

    test("should accept options with only limit", () => {
      expect(() => PaginationOptionsSchema.parse({ limit: 25 })).not.toThrow();
    });

    test("should accept options with only start", () => {
      expect(() => PaginationOptionsSchema.parse({ start: 10 })).not.toThrow();
    });

    test("should accept empty object", () => {
      expect(() => PaginationOptionsSchema.parse({})).not.toThrow();
    });

    test("should accept undefined", () => {
      expect(() => PaginationOptionsSchema.parse(undefined)).not.toThrow();
    });

    test("should accept minimum limit", () => {
      expect(() => PaginationOptionsSchema.parse({ limit: 1 })).not.toThrow();
    });

    test("should accept maximum limit", () => {
      expect(() => PaginationOptionsSchema.parse({ limit: 250 })).not.toThrow();
    });

    test("should reject zero limit", () => {
      expect(() => PaginationOptionsSchema.parse({ limit: 0 })).toThrow();
    });

    test("should reject negative limit", () => {
      expect(() => PaginationOptionsSchema.parse({ limit: -1 })).toThrow();
    });

    test("should reject limit exceeding maximum", () => {
      expect(() => PaginationOptionsSchema.parse({ limit: 251 })).toThrow();
    });

    test("should reject negative start", () => {
      expect(() => PaginationOptionsSchema.parse({ start: -1 })).toThrow();
    });

    test("should reject non-integer limit", () => {
      expect(() => PaginationOptionsSchema.parse({ limit: 25.5 })).toThrow();
    });

    test("should reject non-integer start", () => {
      expect(() => PaginationOptionsSchema.parse({ start: 10.5 })).toThrow();
    });
  });

  describe("GetPageRequestSchema", () => {
    test("should accept valid request", () => {
      expect(() =>
        GetPageRequestSchema.parse({ pageId: "123456" }),
      ).not.toThrow();
    });

    test("should accept request with all optional fields", () => {
      expect(() =>
        GetPageRequestSchema.parse({
          pageId: "123456",
          includeContent: true,
          includeComments: false,
          expand: "body.storage,version",
        }),
      ).not.toThrow();
    });

    test("should accept request with only pageId", () => {
      expect(() =>
        GetPageRequestSchema.parse({ pageId: "123456" }),
      ).not.toThrow();
    });

    test("should reject request missing pageId", () => {
      expect(() => GetPageRequestSchema.parse({})).toThrow();
    });

    test("should reject empty pageId", () => {
      expect(() => GetPageRequestSchema.parse({ pageId: "" })).toThrow();
    });

    test("should reject invalid includeContent type", () => {
      expect(() =>
        GetPageRequestSchema.parse({
          pageId: "123456",
          includeContent: "true",
        }),
      ).toThrow();
    });

    test("should reject invalid includeComments type", () => {
      expect(() =>
        GetPageRequestSchema.parse({
          pageId: "123456",
          includeComments: "false",
        }),
      ).toThrow();
    });
  });

  describe("GetPageCommentCountRequestSchema", () => {
    test("should accept valid request", () => {
      expect(() =>
        GetPageCommentCountRequestSchema.parse({ pageId: "123456" }),
      ).not.toThrow();
    });

    test("should reject request missing pageId", () => {
      expect(() => GetPageCommentCountRequestSchema.parse({})).toThrow();
    });

    test("should reject empty pageId", () => {
      expect(() =>
        GetPageCommentCountRequestSchema.parse({ pageId: "" }),
      ).toThrow();
    });
  });

  describe("CreatePageRequestSchema", () => {
    test("should accept valid request with required fields", () => {
      expect(() =>
        CreatePageRequestSchema.parse({
          spaceId: "SPACE123",
          title: "My Page",
          content: "Page content here",
        }),
      ).not.toThrow();
    });

    test("should accept request with all fields", () => {
      expect(() =>
        CreatePageRequestSchema.parse({
          spaceId: "SPACE123",
          title: "My Page",
          content: "Page content here",
          parentPageId: "456789",
          status: "draft",
          contentFormat: "storage",
        }),
      ).not.toThrow();
    });

    test("should reject request missing spaceId", () => {
      expect(() =>
        CreatePageRequestSchema.parse({
          title: "My Page",
          content: "Page content here",
        }),
      ).toThrow();
    });

    test("should reject request missing title", () => {
      expect(() =>
        CreatePageRequestSchema.parse({
          spaceId: "SPACE123",
          content: "Page content here",
        }),
      ).toThrow();
    });

    test("should reject request missing content", () => {
      expect(() =>
        CreatePageRequestSchema.parse({
          spaceId: "SPACE123",
          title: "My Page",
        }),
      ).toThrow();
    });

    test("should reject empty content", () => {
      expect(() =>
        CreatePageRequestSchema.parse({
          spaceId: "SPACE123",
          title: "My Page",
          content: "",
        }),
      ).toThrow("Page content cannot be empty");
    });

    test("should reject invalid status", () => {
      expect(() =>
        CreatePageRequestSchema.parse({
          spaceId: "SPACE123",
          title: "My Page",
          content: "Page content here",
          status: "published",
        }),
      ).toThrow();
    });

    test("should reject invalid contentFormat", () => {
      expect(() =>
        CreatePageRequestSchema.parse({
          spaceId: "SPACE123",
          title: "My Page",
          content: "Page content here",
          contentFormat: "markdown",
        }),
      ).toThrow();
    });
  });

  describe("UpdatePageRequestSchema", () => {
    test("should accept valid request with pageId and versionNumber", () => {
      expect(() =>
        UpdatePageRequestSchema.parse({
          pageId: "123456",
          versionNumber: 2,
        }),
      ).not.toThrow();
    });

    test("should accept request with all fields", () => {
      expect(() =>
        UpdatePageRequestSchema.parse({
          pageId: "123456",
          title: "Updated Title",
          content: "Updated content",
          status: "current",
          contentFormat: "storage",
          versionNumber: 3,
          versionMessage: "Updated page content",
        }),
      ).not.toThrow();
    });

    test("should reject request missing pageId", () => {
      expect(() =>
        UpdatePageRequestSchema.parse({
          versionNumber: 2,
        }),
      ).toThrow();
    });

    test("should reject request missing versionNumber", () => {
      expect(() =>
        UpdatePageRequestSchema.parse({
          pageId: "123456",
        }),
      ).toThrow();
    });

    test("should reject zero versionNumber", () => {
      expect(() =>
        UpdatePageRequestSchema.parse({
          pageId: "123456",
          versionNumber: 0,
        }),
      ).toThrow("Version number must be positive");
    });

    test("should reject negative versionNumber", () => {
      expect(() =>
        UpdatePageRequestSchema.parse({
          pageId: "123456",
          versionNumber: -1,
        }),
      ).toThrow("Version number must be positive");
    });

    test("should reject non-integer versionNumber", () => {
      expect(() =>
        UpdatePageRequestSchema.parse({
          pageId: "123456",
          versionNumber: 2.5,
        }),
      ).toThrow();
    });
  });

  describe("SearchPagesRequestSchema", () => {
    test("should accept valid request", () => {
      expect(() =>
        SearchPagesRequestSchema.parse({
          query: "search term",
        }),
      ).not.toThrow();
    });

    test("should accept request with all optional fields", () => {
      expect(() =>
        SearchPagesRequestSchema.parse({
          query: "search term",
          spaceKey: "SPACE",
          limit: 50,
          start: 10,
          orderBy: "relevance",
        }),
      ).not.toThrow();
    });

    test("should reject request missing query", () => {
      expect(() => SearchPagesRequestSchema.parse({})).toThrow();
    });

    test("should reject empty query", () => {
      expect(() => SearchPagesRequestSchema.parse({ query: "" })).toThrow(
        "Search query cannot be empty",
      );
    });

    test("should reject whitespace-only query", () => {
      expect(() => SearchPagesRequestSchema.parse({ query: "   " })).toThrow(
        "Search query cannot be empty",
      );
    });

    test("should reject invalid orderBy", () => {
      expect(() =>
        SearchPagesRequestSchema.parse({
          query: "search term",
          orderBy: "popularity",
        }),
      ).toThrow();
    });

    test("should reject invalid limit", () => {
      expect(() =>
        SearchPagesRequestSchema.parse({
          query: "search term",
          limit: 0,
        }),
      ).toThrow();
    });

    test("should reject invalid start", () => {
      expect(() =>
        SearchPagesRequestSchema.parse({
          query: "search term",
          start: -1,
        }),
      ).toThrow();
    });
  });

  describe("GetPagesBySpaceRequestSchema", () => {
    test("should accept valid request", () => {
      expect(() =>
        GetPagesBySpaceRequestSchema.parse({
          spaceId: "SPACE123",
          options: { limit: 50, start: 0 },
        }),
      ).not.toThrow();
    });

    test("should accept request with undefined options", () => {
      expect(() =>
        GetPagesBySpaceRequestSchema.parse({
          spaceId: "SPACE123",
          options: undefined,
        }),
      ).not.toThrow();
    });

    test("should reject request missing spaceId", () => {
      expect(() =>
        GetPagesBySpaceRequestSchema.parse({
          options: { limit: 50 },
        }),
      ).toThrow();
    });

    test("should reject empty spaceId", () => {
      expect(() =>
        GetPagesBySpaceRequestSchema.parse({
          spaceId: "",
          options: { limit: 50 },
        }),
      ).toThrow();
    });
  });

  describe("GetChildPagesRequestSchema", () => {
    test("should accept valid request", () => {
      expect(() =>
        GetChildPagesRequestSchema.parse({
          parentPageId: "123456",
          options: { limit: 50, start: 0 },
        }),
      ).not.toThrow();
    });

    test("should accept request with undefined options", () => {
      expect(() =>
        GetChildPagesRequestSchema.parse({
          parentPageId: "123456",
          options: undefined,
        }),
      ).not.toThrow();
    });

    test("should reject request missing parentPageId", () => {
      expect(() =>
        GetChildPagesRequestSchema.parse({
          options: { limit: 50 },
        }),
      ).toThrow();
    });

    test("should reject empty parentPageId", () => {
      expect(() =>
        GetChildPagesRequestSchema.parse({
          parentPageId: "",
          options: { limit: 50 },
        }),
      ).toThrow();
    });
  });

  describe("Schema Integration", () => {
    test("should work together for complete validation flow", () => {
      const createRequest = {
        spaceId: "SPACE123",
        title: "Test Page",
        content: "Test content",
        status: "draft" as const,
        contentFormat: "storage" as const,
      };

      const updateRequest = {
        pageId: "123456",
        title: "Updated Test Page",
        content: "Updated content",
        versionNumber: 2,
        versionMessage: "Updated for testing",
      };

      expect(() => CreatePageRequestSchema.parse(createRequest)).not.toThrow();
      expect(() => UpdatePageRequestSchema.parse(updateRequest)).not.toThrow();
    });

    test("should handle complex pagination scenarios", () => {
      const searchRequest = {
        query: "confluence pages",
        spaceKey: "DOCS",
        limit: 100,
        start: 50,
        orderBy: "modified" as const,
      };

      const pagesRequest = {
        spaceId: "SPACE123",
        options: { limit: 25, start: 0 },
      };

      expect(() => SearchPagesRequestSchema.parse(searchRequest)).not.toThrow();
      expect(() =>
        GetPagesBySpaceRequestSchema.parse(pagesRequest),
      ).not.toThrow();
    });
  });
});
