/**
 * Unit tests for GetSpacesValidator
 *
 * Tests Zod-based validation for get spaces requests
 */

import { beforeEach, describe, expect, test } from "bun:test";
import type { GetSpacesRequest } from "@features/confluence/domains/spaces/models";
import { GetSpacesValidator } from "@features/confluence/domains/spaces/validators/get-spaces-validator";
import { ValidationError } from "@features/confluence/shared/validators";

describe("GetSpacesValidator", () => {
  let validator: GetSpacesValidator;

  beforeEach(() => {
    validator = new GetSpacesValidator();
  });

  describe("Constructor", () => {
    test("should initialize validator instance", () => {
      expect(validator).toBeInstanceOf(GetSpacesValidator);
    });
  });

  describe("Valid Requests", () => {
    test("should accept undefined request", () => {
      expect(() => validator.validate(undefined)).not.toThrow();
    });

    test("should accept empty request object", () => {
      const request: GetSpacesRequest = {};
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with valid type", () => {
      const request: GetSpacesRequest = { type: "global" };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with personal type", () => {
      const request: GetSpacesRequest = { type: "personal" };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with valid limit", () => {
      const request: GetSpacesRequest = { limit: 50 };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with minimum limit", () => {
      const request: GetSpacesRequest = { limit: 1 };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with maximum limit", () => {
      const request: GetSpacesRequest = { limit: 250 };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with valid start", () => {
      const request: GetSpacesRequest = { start: 0 };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with positive start", () => {
      const request: GetSpacesRequest = { start: 100 };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with all valid parameters", () => {
      const request: GetSpacesRequest = {
        type: "global",
        limit: 100,
        start: 50,
      };
      expect(() => validator.validate(request)).not.toThrow();
    });
  });

  describe("Invalid Type Parameter", () => {
    test("should throw ValidationError for invalid type", () => {
      const request = { type: "invalid" } as unknown as GetSpacesRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric type", () => {
      const request = { type: 123 } as unknown as GetSpacesRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for boolean type", () => {
      const request = { type: true } as unknown as GetSpacesRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for null type", () => {
      const request = { type: null } as unknown as GetSpacesRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });
  });

  describe("Invalid Limit Parameter", () => {
    test("should throw ValidationError for zero limit", () => {
      const request: GetSpacesRequest = { limit: 0 };
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for negative limit", () => {
      const request: GetSpacesRequest = { limit: -1 };
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for limit exceeding maximum", () => {
      const request: GetSpacesRequest = { limit: 251 };
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for very large limit", () => {
      const request: GetSpacesRequest = { limit: 1000 };
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for non-integer limit", () => {
      const request: GetSpacesRequest = { limit: 50.5 };
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for string limit", () => {
      const request = { limit: "50" } as unknown as GetSpacesRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });
  });

  describe("Invalid Start Parameter", () => {
    test("should throw ValidationError for negative start", () => {
      const request: GetSpacesRequest = { start: -1 };
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for very negative start", () => {
      const request: GetSpacesRequest = { start: -100 };
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for non-integer start", () => {
      const request: GetSpacesRequest = { start: 10.5 };
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for string start", () => {
      const request = { start: "10" } as unknown as GetSpacesRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for boolean start", () => {
      const request = { start: true } as unknown as GetSpacesRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });
  });

  describe("Edge Cases", () => {
    test("should handle request with extra properties", () => {
      const request = {
        type: "global",
        limit: 50,
        start: 0,
        extraProperty: "should be ignored",
      } as unknown as GetSpacesRequest;
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle request with null values", () => {
      const request = {
        type: null,
        limit: null,
        start: null,
      } as unknown as GetSpacesRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should handle request with undefined values", () => {
      const request: GetSpacesRequest = {
        type: undefined,
        limit: undefined,
        start: undefined,
      };
      expect(() => validator.validate(request)).not.toThrow();
    });
  });

  describe("Error Messages", () => {
    test("should provide meaningful error message for invalid type", () => {
      const request = { type: "invalid" } as unknown as GetSpacesRequest;
      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should provide meaningful error message for invalid limit", () => {
      const request: GetSpacesRequest = { limit: 0 };
      expect(() => validator.validate(request)).toThrow(
        expect.objectContaining({
          message: expect.stringContaining("greater than or equal to 1"),
        }),
      );
    });

    test("should provide meaningful error message for invalid start", () => {
      const request: GetSpacesRequest = { start: -1 };
      expect(() => validator.validate(request)).toThrow(
        expect.objectContaining({
          message: expect.stringContaining("greater than or equal to 0"),
        }),
      );
    });
  });

  describe("Business Logic Validation", () => {
    test("should accept typical pagination scenario", () => {
      const request: GetSpacesRequest = {
        type: "global",
        limit: 25,
        start: 0,
      };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept large pagination offset", () => {
      const request: GetSpacesRequest = {
        limit: 50,
        start: 1000,
      };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept minimal request for personal spaces", () => {
      const request: GetSpacesRequest = {
        type: "personal",
      };
      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with only pagination", () => {
      const request: GetSpacesRequest = {
        limit: 10,
        start: 20,
      };
      expect(() => validator.validate(request)).not.toThrow();
    });
  });
});
