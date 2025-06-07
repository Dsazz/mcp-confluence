/**
 * Search Suggestions Validator Tests
 *
 * Comprehensive tests for SearchSuggestionsValidator class
 */

import { describe, expect, test } from "bun:test";
import { SearchSuggestionsValidator } from "@features/confluence/domains/search/validators/search-suggestions-validator";
import { ValidationError } from "@features/confluence/shared/validators";

describe("SearchSuggestionsValidator", () => {
  const validator = new SearchSuggestionsValidator();

  describe("validate", () => {
    test("should accept valid search suggestions request", () => {
      expect(() => validator.validate("test")).not.toThrow();
    });

    test("should accept single character query", () => {
      expect(() => validator.validate("a")).not.toThrow();
    });

    test("should accept query at maximum length", () => {
      const maxLengthQuery = "a".repeat(100);
      expect(() => validator.validate(maxLengthQuery)).not.toThrow();
    });

    test("should accept various query formats", () => {
      const validQueries = [
        "test",
        "test query",
        "confluence",
        "search term",
        "project name",
        "user name",
        "space key",
        "document title",
        "tag name",
        "category",
      ];

      for (const query of validQueries) {
        expect(() => validator.validate(query)).not.toThrow();
      }
    });

    test("should accept queries with special characters", () => {
      const specialQueries = [
        "test-query",
        "test_query",
        "test.query",
        "test@domain",
        "test#tag",
        "test$var",
        "test%encode",
        "test&and",
        "test*wildcard",
        "test+plus",
      ];

      for (const query of specialQueries) {
        expect(() => validator.validate(query)).not.toThrow();
      }
    });

    test("should accept queries with numbers", () => {
      const numericQueries = [
        "test123",
        "123test",
        "test 123",
        "version 2.0",
        "project 2023",
        "release 1.5.0",
      ];

      for (const query of numericQueries) {
        expect(() => validator.validate(query)).not.toThrow();
      }
    });

    test("should accept queries with unicode characters", () => {
      const unicodeQueries = [
        "café",
        "naïve",
        "résumé",
        "piñata",
        "jalapeño",
        "ñoño",
        "测试",
        "тест",
        "テスト",
      ];

      for (const query of unicodeQueries) {
        expect(() => validator.validate(query)).not.toThrow();
      }
    });

    test("should trim query and accept", () => {
      expect(() => validator.validate("  test  ")).not.toThrow();
    });

    test("should accept queries with mixed case", () => {
      const mixedCaseQueries = [
        "Test",
        "TEST",
        "tEST",
        "Test Query",
        "CONFLUENCE",
        "CamelCase",
        "snake_case",
        "kebab-case",
      ];

      for (const query of mixedCaseQueries) {
        expect(() => validator.validate(query)).not.toThrow();
      }
    });

    test("should reject empty query", () => {
      expect(() => validator.validate("")).toThrow(ValidationError);
    });

    test("should reject whitespace-only query", () => {
      expect(() => validator.validate("   ")).toThrow(ValidationError);
    });

    test("should reject query exceeding maximum length", () => {
      const tooLongQuery = "a".repeat(101);
      expect(() => validator.validate(tooLongQuery)).toThrow(ValidationError);
    });

    test("should reject non-string query", () => {
      expect(() => validator.validate(123 as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should reject null query", () => {
      expect(() => validator.validate(null as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should reject undefined query", () => {
      expect(() => validator.validate(undefined as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should reject boolean query", () => {
      expect(() => validator.validate(true as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should reject array query", () => {
      expect(() => validator.validate(["test"] as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should reject object query", () => {
      expect(() =>
        validator.validate({ query: "test" } as unknown as string),
      ).toThrow(ValidationError);
    });

    test("should provide meaningful error message for empty query", () => {
      try {
        validator.validate("");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Search query cannot be empty",
        );
      }
    });

    test("should provide meaningful error message for too long query", () => {
      try {
        validator.validate("a".repeat(101));
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Search query is too long",
        );
      }
    });

    test("should handle boundary values", () => {
      // Test exactly at the boundary
      expect(() => validator.validate("a".repeat(100))).not.toThrow();
      expect(() => validator.validate("a".repeat(101))).toThrow(
        ValidationError,
      );
    });

    test("should handle common search terms", () => {
      const commonTerms = [
        "confluence",
        "documentation",
        "project",
        "meeting",
        "notes",
        "requirements",
        "specification",
        "design",
        "architecture",
        "implementation",
      ];

      for (const term of commonTerms) {
        expect(() => validator.validate(term)).not.toThrow();
      }
    });

    test("should handle technical terms", () => {
      const technicalTerms = [
        "API",
        "REST",
        "JSON",
        "XML",
        "HTTP",
        "HTTPS",
        "OAuth",
        "JWT",
        "SQL",
        "NoSQL",
      ];

      for (const term of technicalTerms) {
        expect(() => validator.validate(term)).not.toThrow();
      }
    });

    test("should handle queries with quotes", () => {
      const quotedQueries = [
        '"exact phrase"',
        "'single quotes'",
        'mixed "quotes" here',
        'escaped \\"quotes\\"',
        "nested \"'quotes'\" test",
      ];

      for (const query of quotedQueries) {
        expect(() => validator.validate(query)).not.toThrow();
      }
    });

    test("should handle queries with parentheses", () => {
      const parenthesesQueries = [
        "(test)",
        "test (query)",
        "(nested (parentheses))",
        "function(parameter)",
        "math (2 + 2)",
      ];

      for (const query of parenthesesQueries) {
        expect(() => validator.validate(query)).not.toThrow();
      }
    });

    test("should handle queries with brackets", () => {
      const bracketQueries = [
        "[test]",
        "test [query]",
        "[nested [brackets]]",
        "array[index]",
        "config[setting]",
      ];

      for (const query of bracketQueries) {
        expect(() => validator.validate(query)).not.toThrow();
      }
    });

    test("should handle very short queries", () => {
      const shortQueries = ["a", "b", "1", "?", "!", "@"];

      for (const query of shortQueries) {
        expect(() => validator.validate(query)).not.toThrow();
      }
    });

    test("should handle medium length queries", () => {
      const mediumQuery =
        "this is a medium length search query for testing purposes";
      expect(() => validator.validate(mediumQuery)).not.toThrow();
    });

    test("should handle queries with line breaks", () => {
      const multilineQueries = [
        "test\nquery",
        "test\r\nquery",
        "test\tquery",
        "test\n\nquery",
      ];

      for (const query of multilineQueries) {
        expect(() => validator.validate(query)).not.toThrow();
      }
    });

    test("should handle queries with multiple spaces", () => {
      const spacedQueries = [
        "test  query",
        "test   query",
        "test    query",
        "multiple  spaces   here",
      ];

      for (const query of spacedQueries) {
        expect(() => validator.validate(query)).not.toThrow();
      }
    });
  });
});
