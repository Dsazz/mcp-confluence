/**
 * Delete Page Validator Tests
 *
 * Comprehensive test suite for DeletePageValidator
 */

import { describe, expect, test } from "bun:test";
import { DeletePageValidator } from "@features/confluence/domains/pages/validators/delete-page-validator";
import { ValidationError } from "@features/confluence/shared/validators";

describe("DeletePageValidator", () => {
  const validator = new DeletePageValidator();

  describe("Constructor", () => {
    test("should initialize validator instance", () => {
      expect(validator).toBeInstanceOf(DeletePageValidator);
      expect(validator.validate).toBeFunction();
    });
  });

  describe("Valid Page IDs", () => {
    test("should accept valid numeric page ID", () => {
      expect(() => validator.validate("123456")).not.toThrow();
    });

    test("should accept valid alphanumeric page ID", () => {
      expect(() => validator.validate("page123")).not.toThrow();
    });

    test("should accept UUID-style page ID", () => {
      expect(() =>
        validator.validate("550e8400-e29b-41d4-a716-446655440000"),
      ).not.toThrow();
    });

    test("should accept page ID with hyphens", () => {
      expect(() => validator.validate("page-123-abc")).not.toThrow();
    });

    test("should accept page ID with underscores", () => {
      expect(() => validator.validate("page_123_abc")).not.toThrow();
    });

    test("should accept minimum length page ID", () => {
      expect(() => validator.validate("1")).not.toThrow();
    });

    test("should accept long page ID", () => {
      const longId = "a".repeat(100);
      expect(() => validator.validate(longId)).not.toThrow();
    });

    test("should trim whitespace from page ID", () => {
      expect(() => validator.validate("  123456  ")).not.toThrow();
    });
  });

  describe("Invalid Page IDs", () => {
    test("should throw ValidationError for empty string", () => {
      expect(() => validator.validate("")).toThrow(ValidationError);
    });

    test("should throw ValidationError for whitespace-only string", () => {
      expect(() => validator.validate("   ")).toThrow(ValidationError);
    });

    test("should throw ValidationError for null", () => {
      expect(() => validator.validate(null as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for undefined", () => {
      expect(() => validator.validate(undefined as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for number", () => {
      expect(() => validator.validate(123456 as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for boolean", () => {
      expect(() => validator.validate(true as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for object", () => {
      expect(() =>
        validator.validate({ id: "123" } as unknown as string),
      ).toThrow(ValidationError);
    });

    test("should throw ValidationError for array", () => {
      expect(() => validator.validate(["123"] as unknown as string)).toThrow(
        ValidationError,
      );
    });
  });

  describe("Edge Cases", () => {
    test("should handle page ID with special characters", () => {
      expect(() => validator.validate("page-123_abc.def")).not.toThrow();
    });

    test("should handle page ID with numbers only", () => {
      expect(() => validator.validate("1234567890")).not.toThrow();
    });

    test("should handle page ID with letters only", () => {
      expect(() => validator.validate("abcdefghijk")).not.toThrow();
    });

    test("should handle very long page ID", () => {
      const veryLongId = `page${"a".repeat(1000)}`;
      expect(() => validator.validate(veryLongId)).not.toThrow();
    });

    test("should handle page ID with leading/trailing valid characters", () => {
      expect(() => validator.validate("123abc456")).not.toThrow();
    });
  });

  describe("Error Messages", () => {
    test("should provide meaningful error message for empty page ID", () => {
      try {
        validator.validate("");
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Page ID cannot be empty",
        );
      }
    });

    test("should provide meaningful error message for null page ID", () => {
      try {
        validator.validate(null as unknown as string);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Expected string, received null",
        );
      }
    });

    test("should provide meaningful error message for invalid type", () => {
      try {
        validator.validate(123 as unknown as string);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Expected string, received number",
        );
      }
    });
  });

  describe("Boundary Conditions", () => {
    test("should accept single character page ID", () => {
      expect(() => validator.validate("a")).not.toThrow();
    });

    test("should accept single digit page ID", () => {
      expect(() => validator.validate("1")).not.toThrow();
    });

    test("should handle page ID with consecutive separators", () => {
      expect(() => validator.validate("page--123__abc")).not.toThrow();
    });

    test("should handle page ID with mixed case", () => {
      expect(() => validator.validate("PageId123ABC")).not.toThrow();
    });
  });

  describe("Business Logic Validation", () => {
    test("should accept typical page deletion request", () => {
      expect(() => validator.validate("123456")).not.toThrow();
    });

    test("should accept UUID page deletion request", () => {
      expect(() =>
        validator.validate("550e8400-e29b-41d4-a716-446655440000"),
      ).not.toThrow();
    });

    test("should accept legacy page ID format", () => {
      expect(() => validator.validate("CONF-123")).not.toThrow();
    });

    test("should accept modern page ID format", () => {
      expect(() => validator.validate("page_abc123def")).not.toThrow();
    });
  });
});
