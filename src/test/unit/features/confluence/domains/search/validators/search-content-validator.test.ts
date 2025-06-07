/**
 * Search Content Validator Tests
 *
 * Comprehensive tests for SearchContentValidator class
 */

import { describe, expect, test } from "bun:test";
import type { SearchContentRequest } from "@features/confluence/domains/search/models";
import { SearchContentValidator } from "@features/confluence/domains/search/validators/search-content-validator";
import { ValidationError } from "@features/confluence/shared/validators";

describe("SearchContentValidator", () => {
  const validator = new SearchContentValidator();

  describe("validate", () => {
    test("should accept valid search content request with minimal fields", () => {
      const request: SearchContentRequest = {
        query: "test query",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept valid search content request with all fields", () => {
      const request: SearchContentRequest = {
        query: "test query",
        spaceKey: "TEST",
        type: "page",
        limit: 10,
        start: 0,
        orderBy: "relevance",
        includeArchivedSpaces: true,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept all valid content types", () => {
      const contentTypes = [
        "page",
        "blogpost",
        "comment",
        "attachment",
      ] as const;

      for (const type of contentTypes) {
        const request: SearchContentRequest = {
          query: "test query",
          type,
        };
        expect(() => validator.validate(request)).not.toThrow();
      }
    });

    test("should accept all valid order by values", () => {
      const orderByValues = [
        "relevance",
        "created",
        "modified",
        "title",
      ] as const;

      for (const orderBy of orderByValues) {
        const request: SearchContentRequest = {
          query: "test query",
          orderBy,
        };
        expect(() => validator.validate(request)).not.toThrow();
      }
    });

    test("should accept valid limit values", () => {
      const validLimits = [1, 10, 50, 100, 250];

      for (const limit of validLimits) {
        const request: SearchContentRequest = {
          query: "test query",
          limit,
        };
        expect(() => validator.validate(request)).not.toThrow();
      }
    });

    test("should accept valid start values", () => {
      const validStarts = [0, 10, 100, 1000];

      for (const start of validStarts) {
        const request: SearchContentRequest = {
          query: "test query",
          start,
        };
        expect(() => validator.validate(request)).not.toThrow();
      }
    });

    test("should accept optional spaceKey", () => {
      const request: SearchContentRequest = {
        query: "test query",
        spaceKey: "MYSPACE",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept includeArchivedSpaces boolean values", () => {
      const request1: SearchContentRequest = {
        query: "test query",
        includeArchivedSpaces: true,
      };

      const request2: SearchContentRequest = {
        query: "test query",
        includeArchivedSpaces: false,
      };

      expect(() => validator.validate(request1)).not.toThrow();
      expect(() => validator.validate(request2)).not.toThrow();
    });

    test("should trim query field", () => {
      const request = {
        query: "  test query  ",
      };

      expect(() =>
        validator.validate(request as SearchContentRequest),
      ).not.toThrow();
    });

    test("should reject missing query field", () => {
      const request = {} as SearchContentRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should reject empty query field", () => {
      const request: SearchContentRequest = {
        query: "",
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should reject whitespace-only query field", () => {
      const request: SearchContentRequest = {
        query: "   ",
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should reject invalid content type", () => {
      const request = {
        query: "test query",
        type: "invalid",
      } as unknown as SearchContentRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should reject invalid order by value", () => {
      const request = {
        query: "test query",
        orderBy: "invalid",
      } as unknown as SearchContentRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should reject invalid limit values", () => {
      const invalidLimits = [0, -1, 251, 1000];

      for (const limit of invalidLimits) {
        const request: SearchContentRequest = {
          query: "test query",
          limit,
        };
        expect(() => validator.validate(request)).toThrow(ValidationError);
      }
    });

    test("should reject invalid start values", () => {
      const invalidStarts = [-1, -10];

      for (const start of invalidStarts) {
        const request: SearchContentRequest = {
          query: "test query",
          start,
        };
        expect(() => validator.validate(request)).toThrow(ValidationError);
      }
    });

    test("should reject non-string query", () => {
      const request = {
        query: 123,
      } as unknown as SearchContentRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should reject non-number limit", () => {
      const request = {
        query: "test query",
        limit: "10",
      } as unknown as SearchContentRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should reject non-number start", () => {
      const request = {
        query: "test query",
        start: "0",
      } as unknown as SearchContentRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should reject non-boolean includeArchivedSpaces", () => {
      const request = {
        query: "test query",
        includeArchivedSpaces: "true",
      } as unknown as SearchContentRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should provide meaningful error message for validation errors", () => {
      const request = {} as SearchContentRequest;

      try {
        validator.validate(request);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("Required");
      }
    });

    test("should handle edge case with all optional fields undefined", () => {
      const request: SearchContentRequest = {
        query: "test query",
        spaceKey: undefined,
        type: undefined,
        limit: undefined,
        start: undefined,
        orderBy: undefined,
        includeArchivedSpaces: undefined,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle complex query strings", () => {
      const complexQueries = [
        "test AND query",
        "test OR query",
        '"exact phrase"',
        "test* wildcard",
        "test query with special chars: @#$%",
        "very long query ".repeat(10),
      ];

      for (const query of complexQueries) {
        const request: SearchContentRequest = { query };
        expect(() => validator.validate(request)).not.toThrow();
      }
    });

    test("should handle boundary values", () => {
      const request: SearchContentRequest = {
        query: "test",
        limit: 250,
        start: 0,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });
  });
});
