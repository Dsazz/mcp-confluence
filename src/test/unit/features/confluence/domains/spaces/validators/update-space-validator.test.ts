/**
 * Unit tests for UpdateSpaceValidator
 *
 * Tests Zod-based validation for update space requests
 */

import { beforeEach, describe, expect, test } from "bun:test";
import type { CreateSpaceRequest } from "@features/confluence/domains/spaces/models";
import { UpdateSpaceValidator } from "@features/confluence/domains/spaces/validators/update-space-validator";
import { ValidationError } from "@features/confluence/shared/validators";

describe("UpdateSpaceValidator", () => {
  let validator: UpdateSpaceValidator;

  beforeEach(() => {
    validator = new UpdateSpaceValidator();
  });

  describe("Constructor", () => {
    test("should initialize validator instance", () => {
      expect(validator).toBeInstanceOf(UpdateSpaceValidator);
    });
  });

  describe("Valid Requests", () => {
    test("should accept valid key with name update", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Space Name",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should accept valid key with type update", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {
        type: "personal",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should accept valid key with description update", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {
        description: "Updated description",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should accept valid key with all updates", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Space",
        type: "global",
        description: "Updated description",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should accept valid key with empty updates", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {};
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should accept key with numbers", () => {
      const key = "TEST123";
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Space",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should accept updates with empty description", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {
        description: "",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should accept updates with long description", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {
        description:
          "This is a very long description that should be accepted by the validator because there is no maximum length restriction on descriptions in the schema",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should accept updates with maximum length name", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {
        name: "A".repeat(255),
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });
  });

  describe("Invalid Space Key", () => {
    test("should throw ValidationError for empty key", () => {
      const key = "";
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Space",
      };
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });

    test("should throw ValidationError for whitespace-only key", () => {
      const key = "   ";
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Space",
      };
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });

    test("should throw ValidationError for null key", () => {
      const key = null as unknown as string;
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Space",
      };
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });

    test("should throw ValidationError for undefined key", () => {
      const key = undefined as unknown as string;
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Space",
      };
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric key", () => {
      const key = 123 as unknown as string;
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Space",
      };
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });

    test("should throw ValidationError for boolean key", () => {
      const key = true as unknown as string;
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Space",
      };
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });
  });

  describe("Invalid Update Name", () => {
    test("should throw ValidationError for empty name", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {
        name: "",
      };
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });

    test("should throw ValidationError for whitespace-only name", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {
        name: "   ",
      };
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });

    test("should throw ValidationError for name exceeding maximum length", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {
        name: "A".repeat(256),
      };
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });

    test("should throw ValidationError for null name", () => {
      const key = "TEST";
      const updates = {
        name: null,
      } as unknown as Partial<CreateSpaceRequest>;
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric name", () => {
      const key = "TEST";
      const updates = {
        name: 123,
      } as unknown as Partial<CreateSpaceRequest>;
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });
  });

  describe("Invalid Update Type", () => {
    test("should throw ValidationError for invalid type", () => {
      const key = "TEST";
      const updates = {
        type: "invalid",
      } as unknown as Partial<CreateSpaceRequest>;
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric type", () => {
      const key = "TEST";
      const updates = {
        type: 123,
      } as unknown as Partial<CreateSpaceRequest>;
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });

    test("should throw ValidationError for boolean type", () => {
      const key = "TEST";
      const updates = {
        type: true,
      } as unknown as Partial<CreateSpaceRequest>;
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });

    test("should throw ValidationError for null type", () => {
      const key = "TEST";
      const updates = {
        type: null,
      } as unknown as Partial<CreateSpaceRequest>;
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });

    test("should throw ValidationError for empty string type", () => {
      const key = "TEST";
      const updates = {
        type: "",
      } as unknown as Partial<CreateSpaceRequest>;
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });
  });

  describe("Edge Cases", () => {
    test("should handle updates with extra properties", () => {
      const key = "TEST";
      const updates = {
        name: "Updated Space",
        extraProperty: "should be ignored",
      } as unknown as Partial<CreateSpaceRequest>;
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should handle updates with undefined optional fields", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Space",
        type: undefined,
        description: undefined,
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should trim whitespace from key", () => {
      const key = "  TEST  ";
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Space",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should trim whitespace from name in updates", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {
        name: "  Updated Space  ",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should handle null updates object", () => {
      const key = "TEST";
      const updates = null as unknown as Partial<CreateSpaceRequest>;
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });

    test("should handle undefined updates object", () => {
      const key = "TEST";
      const updates = undefined as unknown as Partial<CreateSpaceRequest>;
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });
  });

  describe("Error Messages", () => {
    test("should provide meaningful error message for empty key", () => {
      const key = "";
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Space",
      };
      expect(() => validator.validate(key, updates)).toThrow(
        expect.objectContaining({
          message: expect.stringContaining("cannot be empty"),
        }),
      );
    });

    test("should provide meaningful error message for empty name", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {
        name: "",
      };
      expect(() => validator.validate(key, updates)).toThrow(
        expect.objectContaining({
          message: expect.stringContaining("cannot be empty"),
        }),
      );
    });

    test("should provide meaningful error message for name too long", () => {
      const key = "TEST";
      const updates: Partial<CreateSpaceRequest> = {
        name: "A".repeat(256),
      };
      expect(() => validator.validate(key, updates)).toThrow(
        expect.objectContaining({
          message: expect.stringContaining("too long"),
        }),
      );
    });

    test("should provide meaningful error message for invalid type", () => {
      const key = "TEST";
      const updates = {
        type: "invalid",
      } as unknown as Partial<CreateSpaceRequest>;
      expect(() => validator.validate(key, updates)).toThrow(ValidationError);
    });
  });

  describe("Business Logic Validation", () => {
    test("should accept typical space update request", () => {
      const key = "PROJ";
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Project Space",
        description: "Updated description for project collaboration",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should accept space type change", () => {
      const key = "PERSONAL";
      const updates: Partial<CreateSpaceRequest> = {
        type: "global",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should accept minimal update", () => {
      const key = "MIN";
      const updates: Partial<CreateSpaceRequest> = {
        name: "Minimal Update",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should accept description-only update", () => {
      const key = "DESC";
      const updates: Partial<CreateSpaceRequest> = {
        description: "New description only",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should accept complex name update", () => {
      const key = "COMPLEX";
      const updates: Partial<CreateSpaceRequest> = {
        name: "Complex Updated Space Name with Numbers 123 and Symbols !@#",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });

    test("should handle multiple field updates", () => {
      const key = "MULTI";
      const updates: Partial<CreateSpaceRequest> = {
        name: "Multi-field Update",
        type: "personal",
        description: "Updated with multiple fields",
      };
      expect(() => validator.validate(key, updates)).not.toThrow();
    });
  });
});
