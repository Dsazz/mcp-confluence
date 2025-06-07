/**
 * Get Page Validator Tests
 *
 * Comprehensive test suite for GetPageValidator
 */

import { describe, expect, test } from "bun:test";
import type { GetPageRequest } from "@features/confluence/domains/pages/models";
import { GetPageValidator } from "@features/confluence/domains/pages/validators/get-page-validator";
import { ValidationError } from "@features/confluence/shared/validators";

describe("GetPageValidator", () => {
  const validator = new GetPageValidator();

  describe("Constructor", () => {
    test("should initialize validator instance", () => {
      expect(validator).toBeInstanceOf(GetPageValidator);
      expect(validator.validate).toBeFunction();
    });
  });

  describe("Valid Requests", () => {
    test("should accept valid request with required fields only", () => {
      const request: GetPageRequest = {
        pageId: "123456",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with UUID-style page ID", () => {
      const request: GetPageRequest = {
        pageId: "550e8400-e29b-41d4-a716-446655440000",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with alphanumeric page ID", () => {
      const request: GetPageRequest = {
        pageId: "PAGE123ABC",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with page ID containing hyphens", () => {
      const request: GetPageRequest = {
        pageId: "page-123-abc",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with page ID containing underscores", () => {
      const request: GetPageRequest = {
        pageId: "page_123_abc",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with minimum length page ID", () => {
      const request: GetPageRequest = {
        pageId: "a",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with long page ID", () => {
      const request: GetPageRequest = {
        pageId: `page${"a".repeat(100)}`,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should trim whitespace from page ID", () => {
      const request: GetPageRequest = {
        pageId: "  PAGE123  ",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with optional expand fields", () => {
      const request: GetPageRequest = {
        pageId: "123456",
        expand: "body.storage,version,space",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with includeContent flag", () => {
      const request: GetPageRequest = {
        pageId: "123456",
        includeContent: true,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with includeComments flag", () => {
      const request: GetPageRequest = {
        pageId: "123456",
        includeComments: false,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });
  });

  describe("Invalid Required Fields", () => {
    test("should throw ValidationError for missing pageId", () => {
      const request = {} as GetPageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for empty pageId", () => {
      const request: GetPageRequest = {
        pageId: "",
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for whitespace-only pageId", () => {
      const request: GetPageRequest = {
        pageId: "   ",
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for null pageId", () => {
      const request = {
        pageId: null,
      } as unknown as GetPageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for undefined pageId", () => {
      const request = {
        pageId: undefined,
      } as unknown as GetPageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric pageId", () => {
      const request = {
        pageId: 123456,
      } as unknown as GetPageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for boolean pageId", () => {
      const request = {
        pageId: true,
      } as unknown as GetPageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for object pageId", () => {
      const request = {
        pageId: { id: "123" },
      } as unknown as GetPageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for array pageId", () => {
      const request = {
        pageId: ["123"],
      } as unknown as GetPageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for null request", () => {
      expect(() =>
        validator.validate(null as unknown as GetPageRequest),
      ).toThrow(ValidationError);
    });

    test("should throw ValidationError for undefined request", () => {
      expect(() =>
        validator.validate(undefined as unknown as GetPageRequest),
      ).toThrow(ValidationError);
    });
  });

  describe("Optional Fields Validation", () => {
    test("should accept valid expand string", () => {
      const request: GetPageRequest = {
        pageId: "123456",
        expand: "body.storage,version",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept empty expand string", () => {
      const request: GetPageRequest = {
        pageId: "123456",
        expand: "",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept boolean includeContent", () => {
      const request: GetPageRequest = {
        pageId: "123456",
        includeContent: true,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept boolean includeComments", () => {
      const request: GetPageRequest = {
        pageId: "123456",
        includeComments: false,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    test("should handle request with extra properties", () => {
      const request = {
        pageId: "PAGE123",
        extra: "ignored",
      } as GetPageRequest;

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle page ID with special characters", () => {
      const request: GetPageRequest = {
        pageId: "page-123_ABC.test",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle page ID with numbers only", () => {
      const request: GetPageRequest = {
        pageId: "1234567890",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle page ID with letters only", () => {
      const request: GetPageRequest = {
        pageId: "PAGENAME",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle very long page ID", () => {
      const request: GetPageRequest = {
        pageId: `page${"a".repeat(1000)}`,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle all optional fields together", () => {
      const request: GetPageRequest = {
        pageId: "123456",
        expand: "body.storage,version,space",
        includeContent: true,
        includeComments: false,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });
  });

  describe("Error Messages", () => {
    test("should provide meaningful error message for missing pageId", () => {
      try {
        validator.validate({} as GetPageRequest);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("Required");
      }
    });

    test("should provide meaningful error message for empty pageId", () => {
      try {
        validator.validate({ pageId: "" });
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Page ID cannot be empty",
        );
      }
    });

    test("should provide meaningful error message for null pageId", () => {
      try {
        validator.validate({ pageId: null } as unknown as GetPageRequest);
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
        validator.validate({ pageId: 123456 } as unknown as GetPageRequest);
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
      const request: GetPageRequest = {
        pageId: "A",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept single digit page ID", () => {
      const request: GetPageRequest = {
        pageId: "1",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle page ID with consecutive separators", () => {
      const request: GetPageRequest = {
        pageId: "page--123__ABC",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle page ID with mixed case", () => {
      const request: GetPageRequest = {
        pageId: "PageId123ABC",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });
  });

  describe("Business Logic Validation", () => {
    test("should accept typical get page request", () => {
      const request: GetPageRequest = {
        pageId: "PAGE123",
        expand: "body.storage",
        includeContent: true,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept UUID get page request", () => {
      const request: GetPageRequest = {
        pageId: "550e8400-e29b-41d4-a716-446655440000",
        includeComments: true,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept legacy page ID format", () => {
      const request: GetPageRequest = {
        pageId: "12345",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept modern page ID format", () => {
      const request: GetPageRequest = {
        pageId: "confluence-page-123-abc",
        expand: "version,space",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });
  });
});
