/**
 * Get Child Pages Validator Tests
 *
 * Comprehensive test suite for GetChildPagesValidator
 */

import { describe, expect, test } from "bun:test";
import { GetChildPagesValidator } from "@features/confluence/domains/pages/validators/get-child-pages-validator";
import { ValidationError } from "@features/confluence/shared/validators";

describe("GetChildPagesValidator", () => {
  const validator = new GetChildPagesValidator();

  describe("Constructor", () => {
    test("should initialize validator instance", () => {
      expect(validator).toBeInstanceOf(GetChildPagesValidator);
      expect(validator.validate).toBeFunction();
    });
  });

  describe("Valid Requests", () => {
    test("should accept valid request with required fields only", () => {
      expect(() => validator.validate("PAGE123")).not.toThrow();
    });

    test("should accept request with pagination options", () => {
      expect(() =>
        validator.validate("PAGE123", { limit: 25, start: 0 }),
      ).not.toThrow();
    });

    test("should accept request with only limit", () => {
      expect(() => validator.validate("PAGE123", { limit: 50 })).not.toThrow();
    });

    test("should accept request with only start", () => {
      expect(() => validator.validate("PAGE123", { start: 10 })).not.toThrow();
    });

    test("should accept request with undefined options", () => {
      expect(() => validator.validate("PAGE123", undefined)).not.toThrow();
    });

    test("should accept request with minimum limit", () => {
      expect(() => validator.validate("PAGE123", { limit: 1 })).not.toThrow();
    });

    test("should accept request with maximum limit", () => {
      expect(() => validator.validate("PAGE123", { limit: 250 })).not.toThrow();
    });

    test("should accept request with zero start", () => {
      expect(() => validator.validate("PAGE123", { start: 0 })).not.toThrow();
    });

    test("should accept request with large start value", () => {
      expect(() =>
        validator.validate("PAGE123", { start: 1000 }),
      ).not.toThrow();
    });

    test("should accept UUID-style parent page ID", () => {
      expect(() =>
        validator.validate("550e8400-e29b-41d4-a716-446655440000"),
      ).not.toThrow();
    });

    test("should trim whitespace from parent page ID", () => {
      expect(() => validator.validate("  PAGE123  ")).not.toThrow();
    });
  });

  describe("Invalid Required Fields", () => {
    test("should throw ValidationError for empty parent page ID", () => {
      expect(() => validator.validate("")).toThrow(ValidationError);
    });

    test("should throw ValidationError for whitespace-only parent page ID", () => {
      expect(() => validator.validate("   ")).toThrow(ValidationError);
    });

    test("should throw ValidationError for null parent page ID", () => {
      expect(() => validator.validate(null as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for undefined parent page ID", () => {
      expect(() => validator.validate(undefined as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for numeric parent page ID", () => {
      expect(() => validator.validate(123456 as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for boolean parent page ID", () => {
      expect(() => validator.validate(true as unknown as string)).toThrow(
        ValidationError,
      );
    });
  });

  describe("Invalid Optional Fields", () => {
    test("should throw ValidationError for zero limit", () => {
      expect(() => validator.validate("PAGE123", { limit: 0 })).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for negative limit", () => {
      expect(() => validator.validate("PAGE123", { limit: -1 })).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for limit exceeding maximum", () => {
      expect(() => validator.validate("PAGE123", { limit: 251 })).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for negative start", () => {
      expect(() => validator.validate("PAGE123", { start: -1 })).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for non-integer limit", () => {
      expect(() => validator.validate("PAGE123", { limit: 25.5 })).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for non-integer start", () => {
      expect(() => validator.validate("PAGE123", { start: 10.5 })).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for string limit", () => {
      expect(() =>
        validator.validate("PAGE123", { limit: "25" as unknown as number }),
      ).toThrow(ValidationError);
    });

    test("should throw ValidationError for string start", () => {
      expect(() =>
        validator.validate("PAGE123", { start: "10" as unknown as number }),
      ).toThrow(ValidationError);
    });
  });

  describe("Edge Cases", () => {
    test("should handle parent page ID with special characters", () => {
      expect(() => validator.validate("PAGE-123_ABC")).not.toThrow();
    });

    test("should handle parent page ID with numbers only", () => {
      expect(() => validator.validate("1234567890")).not.toThrow();
    });

    test("should handle parent page ID with letters only", () => {
      expect(() => validator.validate("PAGENAME")).not.toThrow();
    });

    test("should handle very long parent page ID", () => {
      const longPageId = `PAGE${"A".repeat(100)}`;
      expect(() => validator.validate(longPageId)).not.toThrow();
    });

    test("should handle options with extra properties", () => {
      const options = { limit: 25, start: 0, extra: "ignored" };
      expect(() => validator.validate("PAGE123", options)).not.toThrow();
    });

    test("should handle empty options object", () => {
      expect(() => validator.validate("PAGE123", {})).not.toThrow();
    });
  });

  describe("Error Messages", () => {
    test("should provide meaningful error message for empty parent page ID", () => {
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

    test("should provide meaningful error message for invalid limit", () => {
      try {
        validator.validate("PAGE123", { limit: 0 });
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Number must be greater than or equal to 1",
        );
      }
    });

    test("should provide meaningful error message for invalid start", () => {
      try {
        validator.validate("PAGE123", { start: -1 });
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Number must be greater than or equal to 0",
        );
      }
    });

    test("should provide meaningful error message for null parent page ID", () => {
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
  });

  describe("Boundary Conditions", () => {
    test("should accept minimum valid parent page ID", () => {
      expect(() => validator.validate("A")).not.toThrow();
    });

    test("should accept single digit parent page ID", () => {
      expect(() => validator.validate("1")).not.toThrow();
    });

    test("should handle parent page ID with consecutive separators", () => {
      expect(() => validator.validate("PAGE--123__ABC")).not.toThrow();
    });

    test("should handle parent page ID with mixed case", () => {
      expect(() => validator.validate("PageId123ABC")).not.toThrow();
    });

    test("should handle boundary limit values", () => {
      const limitValues = [1, 125, 250];

      for (const limit of limitValues) {
        expect(() => validator.validate("PAGE123", { limit })).not.toThrow();
      }
    });

    test("should handle boundary start values", () => {
      const startValues = [0, 100, 1000];

      for (const start of startValues) {
        expect(() => validator.validate("PAGE123", { start })).not.toThrow();
      }
    });
  });

  describe("Business Logic Validation", () => {
    test("should accept typical child pages request", () => {
      expect(() =>
        validator.validate("PARENT123", { limit: 25, start: 0 }),
      ).not.toThrow();
    });

    test("should accept paginated child pages request", () => {
      expect(() =>
        validator.validate("PARENT123", { limit: 50, start: 100 }),
      ).not.toThrow();
    });

    test("should accept child pages request without pagination", () => {
      expect(() => validator.validate("PARENT123")).not.toThrow();
    });

    test("should accept large child pages request", () => {
      expect(() =>
        validator.validate("PARENT123", { limit: 250 }),
      ).not.toThrow();
    });
  });
});
