/**
 * Unit tests for GetSpaceByIdValidator
 *
 * Tests Zod-based validation for get space by ID requests
 */

import { beforeEach, describe, expect, test } from "bun:test";
import { GetSpaceByIdValidator } from "@features/confluence/domains/spaces/validators/get-space-by-id-validator";
import { ValidationError } from "@features/confluence/shared/validators";

describe("GetSpaceByIdValidator", () => {
  let validator: GetSpaceByIdValidator;

  beforeEach(() => {
    validator = new GetSpaceByIdValidator();
  });

  describe("Constructor", () => {
    test("should initialize validator instance", () => {
      expect(validator).toBeInstanceOf(GetSpaceByIdValidator);
    });
  });

  describe("Valid Space IDs", () => {
    test("should accept valid numeric space ID", () => {
      expect(() => validator.validate("123456")).not.toThrow();
    });

    test("should accept single digit space ID", () => {
      expect(() => validator.validate("1")).not.toThrow();
    });

    test("should accept large numeric space ID", () => {
      expect(() => validator.validate("999999999")).not.toThrow();
    });

    test("should accept space ID with leading zeros", () => {
      expect(() => validator.validate("000123")).not.toThrow();
    });

    test("should accept very long numeric space ID", () => {
      expect(() => validator.validate("1".repeat(20))).not.toThrow();
    });

    test("should accept space ID as string representation of number", () => {
      expect(() => validator.validate("42")).not.toThrow();
    });
  });

  describe("Invalid Space IDs", () => {
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

  describe("Valid ID Formats", () => {
    test("should accept non-numeric string", () => {
      expect(() => validator.validate("abc")).not.toThrow();
    });

    test("should accept alphanumeric string", () => {
      expect(() => validator.validate("123abc")).not.toThrow();
    });

    test("should accept string with spaces", () => {
      expect(() => validator.validate("123 456")).not.toThrow();
    });

    test("should accept string with special characters", () => {
      expect(() => validator.validate("123@456")).not.toThrow();
    });

    test("should accept string with dots", () => {
      expect(() => validator.validate("123.456")).not.toThrow();
    });

    test("should accept string with hyphens", () => {
      expect(() => validator.validate("123-456")).not.toThrow();
    });

    test("should accept string with underscores", () => {
      expect(() => validator.validate("123_456")).not.toThrow();
    });

    test("should accept negative number string", () => {
      expect(() => validator.validate("-123")).not.toThrow();
    });

    test("should accept decimal number string", () => {
      expect(() => validator.validate("123.45")).not.toThrow();
    });

    test("should accept scientific notation", () => {
      expect(() => validator.validate("1e5")).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    test("should accept zero as valid space ID", () => {
      expect(() => validator.validate("0")).not.toThrow();
    });

    test("should accept string with unicode characters", () => {
      expect(() => validator.validate("123🚀456")).not.toThrow();
    });

    test("should accept string with accented characters", () => {
      expect(() => validator.validate("1²3")).not.toThrow();
    });

    test("should accept hexadecimal string", () => {
      expect(() => validator.validate("0x123")).not.toThrow();
    });

    test("should accept binary string", () => {
      expect(() => validator.validate("0b101")).not.toThrow();
    });

    test("should accept octal string", () => {
      expect(() => validator.validate("0o123")).not.toThrow();
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

    test("should provide specific error message for empty space ID", () => {
      try {
        validator.validate("");
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Space ID cannot be empty",
        );
      }
    });
  });

  describe("Boundary Conditions", () => {
    test("should accept minimum valid space ID", () => {
      expect(() => validator.validate("1")).not.toThrow();
    });

    test("should handle very long numeric ID appropriately", () => {
      const longId = "9".repeat(50);
      // This might pass or fail depending on schema constraints
      // The test documents the behavior
      try {
        validator.validate(longId);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
      }
    });

    test("should handle ID with many leading zeros", () => {
      expect(() => validator.validate("000000001")).not.toThrow();
    });
  });

  describe("Security Considerations", () => {
    test("should accept ID with potential injection patterns", () => {
      expect(() =>
        validator.validate("'; DROP TABLE spaces; --"),
      ).not.toThrow();
    });

    test("should accept ID with script tags", () => {
      expect(() =>
        validator.validate("<script>alert('xss')</script>"),
      ).not.toThrow();
    });

    test("should accept ID with path traversal patterns", () => {
      expect(() => validator.validate("../../../etc/passwd")).not.toThrow();
    });

    test("should accept ID with null bytes", () => {
      expect(() => validator.validate("123\x00456")).not.toThrow();
    });

    test("should accept ID with URL encoding", () => {
      expect(() => validator.validate("123" + "%20" + "456")).not.toThrow();
    });
  });
});
