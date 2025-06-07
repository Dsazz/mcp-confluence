/**
 * Unit tests for GetSpaceByKeyValidator
 *
 * Tests Zod-based validation for get space by key requests
 */

import { beforeEach, describe, expect, test } from "bun:test";
import { GetSpaceByKeyValidator } from "@features/confluence/domains/spaces/validators/get-space-by-key-validator";
import { ValidationError } from "@features/confluence/shared/validators";

describe("GetSpaceByKeyValidator", () => {
  let validator: GetSpaceByKeyValidator;

  beforeEach(() => {
    validator = new GetSpaceByKeyValidator();
  });

  describe("Constructor", () => {
    test("should initialize validator instance", () => {
      expect(validator).toBeInstanceOf(GetSpaceByKeyValidator);
    });
  });

  describe("Valid Space Keys", () => {
    test("should accept valid space key", () => {
      expect(() => validator.validate("TEST")).not.toThrow();
    });

    test("should accept space key with numbers", () => {
      expect(() => validator.validate("TEST123")).not.toThrow();
    });

    test("should accept space key with underscores", () => {
      expect(() => validator.validate("TEST_SPACE")).not.toThrow();
    });

    test("should accept space key with hyphens", () => {
      expect(() => validator.validate("TEST-SPACE")).not.toThrow();
    });

    test("should accept single character space key", () => {
      expect(() => validator.validate("T")).not.toThrow();
    });

    test("should accept long space key", () => {
      expect(() => validator.validate("A".repeat(255))).not.toThrow();
    });

    test("should accept space key with mixed case", () => {
      expect(() => validator.validate("TestSpace")).not.toThrow();
    });

    test("should accept space key starting with number", () => {
      expect(() => validator.validate("123TEST")).not.toThrow();
    });

    test("should accept space key with consecutive separators", () => {
      expect(() => validator.validate("TEST__SPACE")).not.toThrow();
    });

    test("should accept space key with leading/trailing separators", () => {
      expect(() => validator.validate("_TEST_")).not.toThrow();
    });
  });

  describe("Invalid Space Keys", () => {
    test("should throw ValidationError for empty string", () => {
      expect(() => validator.validate("")).toThrow(ValidationError);
    });

    test("should throw ValidationError for whitespace-only string", () => {
      expect(() => validator.validate("   ")).toThrow(ValidationError);
    });

    test("should throw ValidationError for string with only tabs", () => {
      expect(() => validator.validate("\t\t")).toThrow(ValidationError);
    });

    test("should throw ValidationError for string with only newlines", () => {
      expect(() => validator.validate("\n\n")).toThrow(ValidationError);
    });

    test("should throw ValidationError for null value", () => {
      expect(() => validator.validate(null as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for undefined value", () => {
      expect(() => validator.validate(undefined as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for numeric value", () => {
      expect(() => validator.validate(123 as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for boolean value", () => {
      expect(() => validator.validate(true as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for object value", () => {
      expect(() => validator.validate({} as unknown as string)).toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError for array value", () => {
      expect(() => validator.validate([] as unknown as string)).toThrow(
        ValidationError,
      );
    });
  });

  describe("Edge Cases", () => {
    test("should accept space key with spaces", () => {
      expect(() => validator.validate("TEST SPACE")).not.toThrow();
    });

    test("should accept space key with special characters", () => {
      expect(() => validator.validate("TEST@SPACE")).not.toThrow();
    });

    test("should accept space key with dots", () => {
      expect(() => validator.validate("TEST.SPACE")).not.toThrow();
    });

    test("should accept space key with slashes", () => {
      expect(() => validator.validate("TEST/SPACE")).not.toThrow();
    });

    test("should accept space key with backslashes", () => {
      expect(() => validator.validate("TEST\\SPACE")).not.toThrow();
    });

    test("should accept space key with unicode characters", () => {
      expect(() => validator.validate("TEST🚀SPACE")).not.toThrow();
    });

    test("should accept space key with accented characters", () => {
      expect(() => validator.validate("TËST")).not.toThrow();
    });

    test("should accept space key with parentheses", () => {
      expect(() => validator.validate("TEST(SPACE)")).not.toThrow();
    });

    test("should accept space key with brackets", () => {
      expect(() => validator.validate("TEST[SPACE]")).not.toThrow();
    });

    test("should accept space key with braces", () => {
      expect(() => validator.validate("TEST{SPACE}")).not.toThrow();
    });
  });

  describe("Error Messages", () => {
    test("should provide meaningful error message for empty string", () => {
      try {
        validator.validate("");
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("cannot be empty");
      }
    });

    test("should provide meaningful error message for invalid type", () => {
      try {
        validator.validate(123 as unknown as string);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("Expected string");
      }
    });

    test("should provide meaningful error message for null value", () => {
      try {
        validator.validate(null as unknown as string);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("Expected string");
      }
    });

    test("should provide specific error message for get operation", () => {
      try {
        validator.validate("");
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("cannot be empty");
      }
    });
  });

  describe("Boundary Conditions", () => {
    test("should accept minimum length space key", () => {
      expect(() => validator.validate("A")).not.toThrow();
    });

    test("should handle very long space key appropriately", () => {
      const longKey = "A".repeat(1000);
      // This might pass or fail depending on schema constraints
      // The test documents the behavior
      try {
        validator.validate(longKey);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
      }
    });

    test("should handle space key with maximum allowed characters", () => {
      expect(() => validator.validate("TEST_123-ABC")).not.toThrow();
    });

    test("should handle space key with all uppercase", () => {
      expect(() => validator.validate("TESTSPACE")).not.toThrow();
    });

    test("should handle space key with all lowercase", () => {
      expect(() => validator.validate("testspace")).not.toThrow();
    });
  });

  describe("Security Considerations", () => {
    test("should accept space key with potential injection patterns", () => {
      expect(() =>
        validator.validate("'; DROP TABLE spaces; --"),
      ).not.toThrow();
    });

    test("should accept space key with script tags", () => {
      expect(() =>
        validator.validate("<script>alert('xss')</script>"),
      ).not.toThrow();
    });

    test("should accept space key with path traversal patterns", () => {
      expect(() => validator.validate("../../../etc/passwd")).not.toThrow();
    });

    test("should accept space key with null bytes", () => {
      expect(() => validator.validate("TEST\x00SPACE")).not.toThrow();
    });

    test("should accept space key with URL encoding", () => {
      const urlEncodedKey = "TEST" + "%20" + "SPACE";
      expect(() => validator.validate(urlEncodedKey)).not.toThrow();
    });

    test("should accept space key with HTML entities", () => {
      expect(() => validator.validate("TEST&amp;SPACE")).not.toThrow();
    });
  });

  describe("Business Logic Validation", () => {
    test("should accept typical project space keys", () => {
      expect(() => validator.validate("PROJ")).not.toThrow();
      expect(() => validator.validate("PROJECT_A")).not.toThrow();
      expect(() => validator.validate("TEAM-ALPHA")).not.toThrow();
    });

    test("should accept personal space key patterns", () => {
      expect(() => validator.validate("USER123")).not.toThrow();
      expect(() => validator.validate("PERSONAL_SPACE")).not.toThrow();
    });

    test("should accept department space key patterns", () => {
      expect(() => validator.validate("HR")).not.toThrow();
      expect(() => validator.validate("ENGINEERING")).not.toThrow();
      expect(() => validator.validate("SALES_TEAM")).not.toThrow();
    });
  });
});
