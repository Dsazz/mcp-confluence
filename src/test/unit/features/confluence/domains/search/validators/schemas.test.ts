/**
 * Search Validation Schemas Tests
 *
 * Comprehensive tests for all search validation schemas
 */

import { describe, expect, test } from "bun:test";
import {
  AdvancedSearchRequestSchema,
  ContentTypeSchema,
  OrderBySchema,
  PaginationOptionsSchema,
  SearchByTypeRequestSchema,
  SearchContentRequestSchema,
  SearchInSpaceRequestSchema,
  SearchSuggestionsRequestSchema,
} from "@features/confluence/domains/search/validators/schemas";
import { ZodError } from "zod";

describe("Search Validation Schemas", () => {
  describe("ContentTypeSchema", () => {
    test("should accept valid content types", () => {
      expect(() => ContentTypeSchema.parse("page")).not.toThrow();
      expect(() => ContentTypeSchema.parse("blogpost")).not.toThrow();
      expect(() => ContentTypeSchema.parse("comment")).not.toThrow();
      expect(() => ContentTypeSchema.parse("attachment")).not.toThrow();
    });

    test("should reject invalid content types", () => {
      expect(() => ContentTypeSchema.parse("invalid")).toThrow();
      expect(() => ContentTypeSchema.parse("")).toThrow();
      expect(() => ContentTypeSchema.parse(null)).toThrow();
      expect(() => ContentTypeSchema.parse(undefined)).toThrow();
      expect(() => ContentTypeSchema.parse(123)).toThrow();
    });
  });

  describe("OrderBySchema", () => {
    test("should accept valid order by values", () => {
      expect(() => OrderBySchema.parse("relevance")).not.toThrow();
      expect(() => OrderBySchema.parse("created")).not.toThrow();
      expect(() => OrderBySchema.parse("modified")).not.toThrow();
      expect(() => OrderBySchema.parse("title")).not.toThrow();
    });

    test("should reject invalid order by values", () => {
      expect(() => OrderBySchema.parse("invalid")).toThrow();
      expect(() => OrderBySchema.parse("")).toThrow();
      expect(() => OrderBySchema.parse(null)).toThrow();
      expect(() => OrderBySchema.parse(undefined)).toThrow();
      expect(() => OrderBySchema.parse(123)).toThrow();
    });
  });

  describe("PaginationOptionsSchema", () => {
    test("should accept valid pagination options", () => {
      expect(() =>
        PaginationOptionsSchema.parse({ limit: 10, start: 0 }),
      ).not.toThrow();
      expect(() => PaginationOptionsSchema.parse({ limit: 250 })).not.toThrow();
      expect(() => PaginationOptionsSchema.parse({ start: 100 })).not.toThrow();
      expect(() => PaginationOptionsSchema.parse({})).not.toThrow();
      expect(() => PaginationOptionsSchema.parse(undefined)).not.toThrow();
    });

    test("should reject invalid pagination options", () => {
      expect(() => PaginationOptionsSchema.parse({ limit: 0 })).toThrow();
      expect(() => PaginationOptionsSchema.parse({ limit: 251 })).toThrow();
      expect(() => PaginationOptionsSchema.parse({ start: -1 })).toThrow();
      expect(() => PaginationOptionsSchema.parse({ limit: "10" })).toThrow();
      expect(() => PaginationOptionsSchema.parse({ start: "0" })).toThrow();
    });

    test("should validate limit boundaries", () => {
      expect(() => PaginationOptionsSchema.parse({ limit: 1 })).not.toThrow();
      expect(() => PaginationOptionsSchema.parse({ limit: 250 })).not.toThrow();
      expect(() => PaginationOptionsSchema.parse({ limit: 0 })).toThrow();
      expect(() => PaginationOptionsSchema.parse({ limit: 251 })).toThrow();
    });

    test("should validate start boundaries", () => {
      expect(() => PaginationOptionsSchema.parse({ start: 0 })).not.toThrow();
      expect(() =>
        PaginationOptionsSchema.parse({ start: 1000 }),
      ).not.toThrow();
      expect(() => PaginationOptionsSchema.parse({ start: -1 })).toThrow();
    });
  });

  describe("SearchContentRequestSchema", () => {
    test("should accept valid search content requests", () => {
      expect(() =>
        SearchContentRequestSchema.parse({
          query: "test query",
        }),
      ).not.toThrow();

      expect(() =>
        SearchContentRequestSchema.parse({
          query: "test query",
          spaceKey: "TEST",
          type: "page",
          limit: 10,
          start: 0,
          orderBy: "relevance",
          includeArchivedSpaces: true,
        }),
      ).not.toThrow();
    });

    test("should require query field", () => {
      expect(() => SearchContentRequestSchema.parse({})).toThrow();
      expect(() =>
        SearchContentRequestSchema.parse({ spaceKey: "TEST" }),
      ).toThrow();
    });

    test("should validate query field", () => {
      expect(() => SearchContentRequestSchema.parse({ query: "" })).toThrow();
      expect(() =>
        SearchContentRequestSchema.parse({ query: "   " }),
      ).toThrow();
      expect(() => SearchContentRequestSchema.parse({ query: null })).toThrow();
      expect(() =>
        SearchContentRequestSchema.parse({ query: undefined }),
      ).toThrow();
    });

    test("should trim and validate query", () => {
      expect(() =>
        SearchContentRequestSchema.parse({ query: "  test  " }),
      ).not.toThrow();
      const result = SearchContentRequestSchema.parse({ query: "  test  " });
      expect(result.query).toBe("test");
    });

    test("should validate optional fields", () => {
      expect(() =>
        SearchContentRequestSchema.parse({
          query: "test",
          type: "invalid",
        }),
      ).toThrow();

      expect(() =>
        SearchContentRequestSchema.parse({
          query: "test",
          limit: 0,
        }),
      ).toThrow();

      expect(() =>
        SearchContentRequestSchema.parse({
          query: "test",
          limit: 251,
        }),
      ).toThrow();

      expect(() =>
        SearchContentRequestSchema.parse({
          query: "test",
          start: -1,
        }),
      ).toThrow();

      expect(() =>
        SearchContentRequestSchema.parse({
          query: "test",
          orderBy: "invalid",
        }),
      ).toThrow();
    });

    test("should accept all valid content types", () => {
      const contentTypes = ["page", "blogpost", "comment", "attachment"];
      for (const type of contentTypes) {
        expect(() =>
          SearchContentRequestSchema.parse({
            query: "test",
            type,
          }),
        ).not.toThrow();
      }
    });

    test("should accept all valid order by values", () => {
      const orderByValues = ["relevance", "created", "modified", "title"];
      for (const orderBy of orderByValues) {
        expect(() =>
          SearchContentRequestSchema.parse({
            query: "test",
            orderBy,
          }),
        ).not.toThrow();
      }
    });
  });

  describe("AdvancedSearchRequestSchema", () => {
    test("should accept valid advanced search requests", () => {
      expect(() =>
        AdvancedSearchRequestSchema.parse({
          cql: "type=page",
        }),
      ).not.toThrow();

      expect(() =>
        AdvancedSearchRequestSchema.parse({
          cql: "type=page AND space=TEST",
          limit: 10,
          start: 0,
          expand: "body.storage,version",
        }),
      ).not.toThrow();
    });

    test("should require cql field", () => {
      expect(() => AdvancedSearchRequestSchema.parse({})).toThrow();
      expect(() => AdvancedSearchRequestSchema.parse({ limit: 10 })).toThrow();
    });

    test("should validate cql field", () => {
      expect(() => AdvancedSearchRequestSchema.parse({ cql: "" })).toThrow();
      expect(() => AdvancedSearchRequestSchema.parse({ cql: "   " })).toThrow();
      expect(() => AdvancedSearchRequestSchema.parse({ cql: null })).toThrow();
      expect(() =>
        AdvancedSearchRequestSchema.parse({ cql: undefined }),
      ).toThrow();
    });

    test("should trim and validate cql", () => {
      expect(() =>
        AdvancedSearchRequestSchema.parse({ cql: "  type=page  " }),
      ).not.toThrow();
      const result = AdvancedSearchRequestSchema.parse({
        cql: "  type=page  ",
      });
      expect(result.cql).toBe("type=page");
    });

    test("should validate optional fields", () => {
      expect(() =>
        AdvancedSearchRequestSchema.parse({
          cql: "type=page",
          limit: 0,
        }),
      ).toThrow();

      expect(() =>
        AdvancedSearchRequestSchema.parse({
          cql: "type=page",
          limit: 251,
        }),
      ).toThrow();

      expect(() =>
        AdvancedSearchRequestSchema.parse({
          cql: "type=page",
          start: -1,
        }),
      ).toThrow();
    });

    test("should accept valid limit and start values", () => {
      expect(() =>
        AdvancedSearchRequestSchema.parse({
          cql: "type=page",
          limit: 1,
          start: 0,
        }),
      ).not.toThrow();

      expect(() =>
        AdvancedSearchRequestSchema.parse({
          cql: "type=page",
          limit: 250,
          start: 1000,
        }),
      ).not.toThrow();
    });
  });

  describe("SearchInSpaceRequestSchema", () => {
    test("should accept valid search in space requests", () => {
      expect(() =>
        SearchInSpaceRequestSchema.parse({
          spaceKey: "TEST",
          query: "test query",
          options: { limit: 10, start: 0 },
        }),
      ).not.toThrow();

      expect(() =>
        SearchInSpaceRequestSchema.parse({
          spaceKey: "TEST",
          query: "test query",
          options: undefined,
        }),
      ).not.toThrow();
    });

    test("should require spaceKey and query fields", () => {
      expect(() => SearchInSpaceRequestSchema.parse({})).toThrow();
      expect(() =>
        SearchInSpaceRequestSchema.parse({ spaceKey: "TEST" }),
      ).toThrow();
      expect(() =>
        SearchInSpaceRequestSchema.parse({ query: "test" }),
      ).toThrow();
    });

    test("should validate spaceKey field", () => {
      expect(() =>
        SearchInSpaceRequestSchema.parse({
          spaceKey: "",
          query: "test",
          options: {},
        }),
      ).toThrow();

      expect(() =>
        SearchInSpaceRequestSchema.parse({
          spaceKey: "   ",
          query: "test",
          options: {},
        }),
      ).toThrow();

      expect(() =>
        SearchInSpaceRequestSchema.parse({
          spaceKey: null,
          query: "test",
          options: {},
        }),
      ).toThrow();
    });

    test("should validate query field", () => {
      expect(() =>
        SearchInSpaceRequestSchema.parse({
          spaceKey: "TEST",
          query: "",
          options: {},
        }),
      ).toThrow();

      expect(() =>
        SearchInSpaceRequestSchema.parse({
          spaceKey: "TEST",
          query: "   ",
          options: {},
        }),
      ).toThrow();

      expect(() =>
        SearchInSpaceRequestSchema.parse({
          spaceKey: "TEST",
          query: null,
          options: {},
        }),
      ).toThrow();
    });

    test("should trim spaceKey and query", () => {
      const result = SearchInSpaceRequestSchema.parse({
        spaceKey: "  TEST  ",
        query: "  test query  ",
        options: {},
      });
      expect(result.spaceKey).toBe("TEST");
      expect(result.query).toBe("test query");
    });

    test("should validate options field", () => {
      expect(() =>
        SearchInSpaceRequestSchema.parse({
          spaceKey: "TEST",
          query: "test",
          options: { limit: 0 },
        }),
      ).toThrow();

      expect(() =>
        SearchInSpaceRequestSchema.parse({
          spaceKey: "TEST",
          query: "test",
          options: { limit: 251 },
        }),
      ).toThrow();

      expect(() =>
        SearchInSpaceRequestSchema.parse({
          spaceKey: "TEST",
          query: "test",
          options: { start: -1 },
        }),
      ).toThrow();
    });
  });

  describe("SearchByTypeRequestSchema", () => {
    test("should accept valid search by type requests", () => {
      expect(() =>
        SearchByTypeRequestSchema.parse({
          contentType: "page",
          query: "test query",
          options: { limit: 10, start: 0 },
        }),
      ).not.toThrow();

      expect(() =>
        SearchByTypeRequestSchema.parse({
          contentType: "blogpost",
          query: "test query",
          options: undefined,
        }),
      ).not.toThrow();
    });

    test("should require contentType and query fields", () => {
      expect(() => SearchByTypeRequestSchema.parse({})).toThrow();
      expect(() =>
        SearchByTypeRequestSchema.parse({ contentType: "page" }),
      ).toThrow();
      expect(() =>
        SearchByTypeRequestSchema.parse({ query: "test" }),
      ).toThrow();
    });

    test("should validate contentType field", () => {
      expect(() =>
        SearchByTypeRequestSchema.parse({
          contentType: "invalid",
          query: "test",
          options: {},
        }),
      ).toThrow();

      expect(() =>
        SearchByTypeRequestSchema.parse({
          contentType: "",
          query: "test",
          options: {},
        }),
      ).toThrow();

      expect(() =>
        SearchByTypeRequestSchema.parse({
          contentType: null,
          query: "test",
          options: {},
        }),
      ).toThrow();
    });

    test("should validate query field", () => {
      expect(() =>
        SearchByTypeRequestSchema.parse({
          contentType: "page",
          query: "",
          options: {},
        }),
      ).toThrow();

      expect(() =>
        SearchByTypeRequestSchema.parse({
          contentType: "page",
          query: "   ",
          options: {},
        }),
      ).toThrow();

      expect(() =>
        SearchByTypeRequestSchema.parse({
          contentType: "page",
          query: null,
          options: {},
        }),
      ).toThrow();
    });

    test("should accept all valid content types", () => {
      const contentTypes = ["page", "blogpost", "comment", "attachment"];
      for (const contentType of contentTypes) {
        expect(() =>
          SearchByTypeRequestSchema.parse({
            contentType,
            query: "test",
            options: {},
          }),
        ).not.toThrow();
      }
    });

    test("should trim query", () => {
      const result = SearchByTypeRequestSchema.parse({
        contentType: "page",
        query: "  test query  ",
        options: {},
      });
      expect(result.query).toBe("test query");
    });

    test("should validate options field", () => {
      expect(() =>
        SearchByTypeRequestSchema.parse({
          contentType: "page",
          query: "test",
          options: { limit: 0 },
        }),
      ).toThrow();

      expect(() =>
        SearchByTypeRequestSchema.parse({
          contentType: "page",
          query: "test",
          options: { limit: 251 },
        }),
      ).toThrow();

      expect(() =>
        SearchByTypeRequestSchema.parse({
          contentType: "page",
          query: "test",
          options: { start: -1 },
        }),
      ).toThrow();
    });
  });

  describe("SearchSuggestionsRequestSchema", () => {
    test("should accept valid search suggestions requests", () => {
      expect(() =>
        SearchSuggestionsRequestSchema.parse({
          query: "test",
        }),
      ).not.toThrow();

      expect(() =>
        SearchSuggestionsRequestSchema.parse({
          query: "a".repeat(100),
        }),
      ).not.toThrow();
    });

    test("should require query field", () => {
      expect(() => SearchSuggestionsRequestSchema.parse({})).toThrow();
    });

    test("should validate query field", () => {
      expect(() =>
        SearchSuggestionsRequestSchema.parse({ query: "" }),
      ).toThrow();
      expect(() =>
        SearchSuggestionsRequestSchema.parse({ query: "   " }),
      ).toThrow();
      expect(() =>
        SearchSuggestionsRequestSchema.parse({ query: null }),
      ).toThrow();
      expect(() =>
        SearchSuggestionsRequestSchema.parse({ query: undefined }),
      ).toThrow();
    });

    test("should validate query length", () => {
      expect(() =>
        SearchSuggestionsRequestSchema.parse({
          query: "a".repeat(101),
        }),
      ).toThrow();

      expect(() =>
        SearchSuggestionsRequestSchema.parse({
          query: "a".repeat(100),
        }),
      ).not.toThrow();
    });

    test("should trim query", () => {
      const result = SearchSuggestionsRequestSchema.parse({
        query: "  test  ",
      });
      expect(result.query).toBe("test");
    });

    test("should provide meaningful error messages", () => {
      try {
        SearchSuggestionsRequestSchema.parse({ query: "" });
      } catch (error) {
        if (error instanceof ZodError) {
          expect(error.errors[0].message).toBe("Search query cannot be empty");
        }
      }

      try {
        SearchSuggestionsRequestSchema.parse({ query: "a".repeat(101) });
      } catch (error) {
        if (error instanceof ZodError) {
          expect(error.errors[0].message).toBe(
            "Search query is too long (maximum 100 characters)",
          );
        }
      }
    });
  });
});
