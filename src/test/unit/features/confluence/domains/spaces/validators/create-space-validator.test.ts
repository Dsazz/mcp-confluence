/**
 * Unit tests for CreateSpaceValidator
 *
 * Tests Zod-based validation for create space requests
 */

import { beforeEach, describe, expect, test } from "bun:test";
import type { CreateSpaceRequest } from "@features/confluence/domains/spaces/models";
import { CreateSpaceValidator } from "@features/confluence/domains/spaces/validators/create-space-validator";
import { ValidationError } from "@features/confluence/shared/validators";

describe("CreateSpaceValidator", () => {
  let validator: CreateSpaceValidator;

  beforeEach(() => {
    validator = new CreateSpaceValidator();
  });

  describe("Constructor", () => {
    test("should initialize validator instance", () => {
      expect(validator).toBeInstanceOf(CreateSpaceValidator);
    });
  });

  describe("Valid Requests", () => {
    test("should accept request with required fields only", () => {
      const request: CreateSpaceRequest = {
        key: "TEST",
        name: "Test Space",
      };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with all fields", () => {
      const request: CreateSpaceRequest = {
        key: "TEST",
        name: "Test Space",
        type: "global",
        description: "A test space for validation",
      };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with personal type", () => {
      const request: CreateSpaceRequest = {
        key: "PERSONAL",
        name: "Personal Space",
        type: "personal",
      };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with long description", () => {
      const request: CreateSpaceRequest = {
        key: "LONG",
        name: "Space with Long Description",
        description:
          "This is a very long description that should be accepted by the validator because there is no maximum length restriction on descriptions in the schema",
      };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with empty description", () => {
      const request: CreateSpaceRequest = {
        key: "EMPTY",
        name: "Space with Empty Description",
        description: "",
      };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with special characters in name", () => {
      const request: CreateSpaceRequest = {
        key: "SPECIAL",
        name: "Test Space with Special Characters: @#$%",
      };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with maximum length name", () => {
      const request: CreateSpaceRequest = {
        key: "MAX",
        name: "A".repeat(255),
      };
      expect(() => validator.validate(request)).not.toThrow();
    });
  });

  describe("Missing Required Fields", () => {
    test("should throw ValidationError when key is missing", () => {
      const request = {
        name: "Test Space",
      } as unknown as CreateSpaceRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError when name is missing", () => {
      const request = {
        key: "TEST",
      } as unknown as CreateSpaceRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError when both key and name are missing", () => {
      const request = {} as unknown as CreateSpaceRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError when request is undefined", () => {
      expect(() =>
        validator.validate(undefined as unknown as CreateSpaceRequest),
      ).toThrow(ValidationError);
    });

    test("should throw ValidationError when request is null", () => {
      expect(() =>
        validator.validate(null as unknown as CreateSpaceRequest),
      ).toThrow(ValidationError);
    });
  });

  describe("Invalid Key Field", () => {
    test("should throw ValidationError for empty key", () => {
      const request: CreateSpaceRequest = {
        key: "",
        name: "Test Space",
      };
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for whitespace-only key", () => {
      const request: CreateSpaceRequest = {
        key: "   ",
        name: "Test Space",
      };
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for null key", () => {
      const request = {
        key: null,
        name: "Test Space",
      } as unknown as CreateSpaceRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric key", () => {
      const request = {
        key: 123,
        name: "Test Space",
      } as unknown as CreateSpaceRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for boolean key", () => {
      const request = {
        key: true,
        name: "Test Space",
      } as unknown as CreateSpaceRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });
  });

  describe("Invalid Name Field", () => {
    test("should throw ValidationError for empty name", () => {
      const request: CreateSpaceRequest = {
        key: "TEST",
        name: "",
      };
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for whitespace-only name", () => {
      const request: CreateSpaceRequest = {
        key: "TEST",
        name: "   ",
      };
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for name exceeding maximum length", () => {
      const request: CreateSpaceRequest = {
        key: "TEST",
        name: "A".repeat(256),
      };
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for null name", () => {
      const request = {
        key: "TEST",
        name: null,
      } as unknown as CreateSpaceRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric name", () => {
      const request = {
        key: "TEST",
        name: 123,
      } as unknown as CreateSpaceRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });
  });

  describe("Invalid Type Field", () => {
    test("should throw ValidationError for invalid type", () => {
      const request = {
        key: "TEST",
        name: "Test Space",
        type: "invalid",
      } as unknown as CreateSpaceRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric type", () => {
      const request = {
        key: "TEST",
        name: "Test Space",
        type: 123,
      } as unknown as CreateSpaceRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for boolean type", () => {
      const request = {
        key: "TEST",
        name: "Test Space",
        type: true,
      } as unknown as CreateSpaceRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for null type", () => {
      const request = {
        key: "TEST",
        name: "Test Space",
        type: null,
      } as unknown as CreateSpaceRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });
  });

  describe("Edge Cases", () => {
    test("should handle request with extra properties", () => {
      const request = {
        key: "TEST",
        name: "Test Space",
        extraProperty: "should be ignored",
      } as unknown as CreateSpaceRequest;
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle request with undefined optional fields", () => {
      const request: CreateSpaceRequest = {
        key: "TEST",
        name: "Test Space",
        type: undefined,
        description: undefined,
      };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should trim whitespace from key", () => {
      const request: CreateSpaceRequest = {
        key: "  TEST  ",
        name: "Test Space",
      };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should trim whitespace from name", () => {
      const request: CreateSpaceRequest = {
        key: "TEST",
        name: "  Test Space  ",
      };
      expect(() => validator.validate(request)).not.toThrow();
    });
  });

  describe("Error Messages", () => {
    test("should provide meaningful error message for missing key", () => {
      const request = {
        name: "Test Space",
      } as unknown as CreateSpaceRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should provide meaningful error message for empty key", () => {
      const request: CreateSpaceRequest = {
        key: "",
        name: "Test Space",
      };
      expect(() => validator.validate(request)).toThrow(
        expect.objectContaining({
          message: expect.stringContaining("cannot be empty"),
        }),
      );
    });

    test("should provide meaningful error message for empty name", () => {
      const request: CreateSpaceRequest = {
        key: "TEST",
        name: "",
      };
      expect(() => validator.validate(request)).toThrow(
        expect.objectContaining({
          message: expect.stringContaining("cannot be empty"),
        }),
      );
    });

    test("should provide meaningful error message for name too long", () => {
      const request: CreateSpaceRequest = {
        key: "TEST",
        name: "A".repeat(256),
      };
      expect(() => validator.validate(request)).toThrow(
        expect.objectContaining({
          message: expect.stringContaining("too long"),
        }),
      );
    });
  });

  describe("Business Logic Validation", () => {
    test("should accept typical space creation request", () => {
      const request: CreateSpaceRequest = {
        key: "PROJ",
        name: "Project Space",
        type: "global",
        description: "A space for project collaboration",
      };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept personal space creation", () => {
      const request: CreateSpaceRequest = {
        key: "PERSONAL",
        name: "My Personal Space",
        type: "personal",
      };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept space with minimal information", () => {
      const request: CreateSpaceRequest = {
        key: "MIN",
        name: "Minimal Space",
      };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept space with complex name", () => {
      const request: CreateSpaceRequest = {
        key: "COMPLEX",
        name: "Complex Space Name with Numbers 123 and Symbols !@#",
      };
      expect(() => validator.validate(request)).not.toThrow();
    });
  });
});
