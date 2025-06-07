/**
 * Unit tests for Spaces Validation Schemas
 *
 * Tests Zod schemas for spaces domain validation
 */

import { describe, expect, test } from "bun:test";
import {
  CreateSpaceRequestSchema,
  GetSpacesRequestSchema,
  PaginationOptionsSchema,
  SpaceIdSchema,
  SpaceKeySchema,
  SpaceNameSchema,
  SpaceTypeSchema,
  UpdateSpaceRequestSchema,
} from "@features/confluence/domains/spaces/validators/schemas";

describe("Spaces Validation Schemas", () => {
  describe("SpaceKeySchema", () => {
    test("should accept valid space key", () => {
      expect(() => SpaceKeySchema.parse("TEST")).not.toThrow();
    });

    test("should accept space key with numbers", () => {
      expect(() => SpaceKeySchema.parse("TEST123")).not.toThrow();
    });

    test("should trim whitespace", () => {
      const result = SpaceKeySchema.parse("  TEST  ");
      expect(result).toBe("TEST");
    });

    test("should reject empty string", () => {
      expect(() => SpaceKeySchema.parse("")).toThrow();
    });

    test("should reject whitespace-only string", () => {
      expect(() => SpaceKeySchema.parse("   ")).toThrow();
    });

    test("should reject null", () => {
      expect(() => SpaceKeySchema.parse(null)).toThrow();
    });

    test("should reject undefined", () => {
      expect(() => SpaceKeySchema.parse(undefined)).toThrow();
    });

    test("should reject number", () => {
      expect(() => SpaceKeySchema.parse(123)).toThrow();
    });
  });

  describe("SpaceIdSchema", () => {
    test("should accept valid space ID", () => {
      expect(() => SpaceIdSchema.parse("12345")).not.toThrow();
    });

    test("should accept UUID-style ID", () => {
      expect(() =>
        SpaceIdSchema.parse("550e8400-e29b-41d4-a716-446655440000"),
      ).not.toThrow();
    });

    test("should trim whitespace", () => {
      const result = SpaceIdSchema.parse("  12345  ");
      expect(result).toBe("12345");
    });

    test("should reject empty string", () => {
      expect(() => SpaceIdSchema.parse("")).toThrow();
    });

    test("should reject whitespace-only string", () => {
      expect(() => SpaceIdSchema.parse("   ")).toThrow();
    });

    test("should reject null", () => {
      expect(() => SpaceIdSchema.parse(null)).toThrow();
    });

    test("should reject number", () => {
      expect(() => SpaceIdSchema.parse(123)).toThrow();
    });
  });

  describe("SpaceNameSchema", () => {
    test("should accept valid space name", () => {
      expect(() => SpaceNameSchema.parse("Test Space")).not.toThrow();
    });

    test("should accept name with special characters", () => {
      expect(() => SpaceNameSchema.parse("Test Space @#$%")).not.toThrow();
    });

    test("should accept maximum length name", () => {
      const maxName = "A".repeat(255);
      expect(() => SpaceNameSchema.parse(maxName)).not.toThrow();
    });

    test("should trim whitespace", () => {
      const result = SpaceNameSchema.parse("  Test Space  ");
      expect(result).toBe("Test Space");
    });

    test("should reject empty string", () => {
      expect(() => SpaceNameSchema.parse("")).toThrow();
    });

    test("should reject whitespace-only string", () => {
      expect(() => SpaceNameSchema.parse("   ")).toThrow();
    });

    test("should reject name exceeding maximum length", () => {
      const tooLongName = "A".repeat(256);
      expect(() => SpaceNameSchema.parse(tooLongName)).toThrow();
    });

    test("should reject null", () => {
      expect(() => SpaceNameSchema.parse(null)).toThrow();
    });

    test("should reject number", () => {
      expect(() => SpaceNameSchema.parse(123)).toThrow();
    });
  });

  describe("SpaceTypeSchema", () => {
    test("should accept global type", () => {
      expect(() => SpaceTypeSchema.parse("global")).not.toThrow();
    });

    test("should accept personal type", () => {
      expect(() => SpaceTypeSchema.parse("personal")).not.toThrow();
    });

    test("should reject invalid type", () => {
      expect(() => SpaceTypeSchema.parse("invalid")).toThrow();
    });

    test("should reject empty string", () => {
      expect(() => SpaceTypeSchema.parse("")).toThrow();
    });

    test("should reject null", () => {
      expect(() => SpaceTypeSchema.parse(null)).toThrow();
    });

    test("should reject number", () => {
      expect(() => SpaceTypeSchema.parse(123)).toThrow();
    });

    test("should reject boolean", () => {
      expect(() => SpaceTypeSchema.parse(true)).toThrow();
    });
  });

  describe("PaginationOptionsSchema", () => {
    test("should accept valid pagination options", () => {
      const options = { limit: 50, start: 0 };
      expect(() => PaginationOptionsSchema.parse(options)).not.toThrow();
    });

    test("should accept options with only limit", () => {
      const options = { limit: 25 };
      expect(() => PaginationOptionsSchema.parse(options)).not.toThrow();
    });

    test("should accept options with only start", () => {
      const options = { start: 100 };
      expect(() => PaginationOptionsSchema.parse(options)).not.toThrow();
    });

    test("should accept empty object", () => {
      expect(() => PaginationOptionsSchema.parse({})).not.toThrow();
    });

    test("should accept undefined", () => {
      expect(() => PaginationOptionsSchema.parse(undefined)).not.toThrow();
    });

    test("should accept minimum limit", () => {
      const options = { limit: 1 };
      expect(() => PaginationOptionsSchema.parse(options)).not.toThrow();
    });

    test("should accept maximum limit", () => {
      const options = { limit: 250 };
      expect(() => PaginationOptionsSchema.parse(options)).not.toThrow();
    });

    test("should reject zero limit", () => {
      const options = { limit: 0 };
      expect(() => PaginationOptionsSchema.parse(options)).toThrow();
    });

    test("should reject negative limit", () => {
      const options = { limit: -1 };
      expect(() => PaginationOptionsSchema.parse(options)).toThrow();
    });

    test("should reject limit exceeding maximum", () => {
      const options = { limit: 251 };
      expect(() => PaginationOptionsSchema.parse(options)).toThrow();
    });

    test("should reject negative start", () => {
      const options = { start: -1 };
      expect(() => PaginationOptionsSchema.parse(options)).toThrow();
    });

    test("should reject non-integer limit", () => {
      const options = { limit: 50.5 };
      expect(() => PaginationOptionsSchema.parse(options)).toThrow();
    });

    test("should reject non-integer start", () => {
      const options = { start: 10.5 };
      expect(() => PaginationOptionsSchema.parse(options)).toThrow();
    });
  });

  describe("GetSpacesRequestSchema", () => {
    test("should accept valid request", () => {
      const request = { type: "global", limit: 50, start: 0 };
      expect(() => GetSpacesRequestSchema.parse(request)).not.toThrow();
    });

    test("should accept empty request", () => {
      expect(() => GetSpacesRequestSchema.parse({})).not.toThrow();
    });

    test("should accept undefined", () => {
      expect(() => GetSpacesRequestSchema.parse(undefined)).not.toThrow();
    });

    test("should accept request with only type", () => {
      const request = { type: "personal" };
      expect(() => GetSpacesRequestSchema.parse(request)).not.toThrow();
    });

    test("should accept request with only pagination", () => {
      const request = { limit: 25, start: 50 };
      expect(() => GetSpacesRequestSchema.parse(request)).not.toThrow();
    });

    test("should reject invalid type", () => {
      const request = { type: "invalid" };
      expect(() => GetSpacesRequestSchema.parse(request)).toThrow();
    });

    test("should reject invalid limit", () => {
      const request = { limit: 0 };
      expect(() => GetSpacesRequestSchema.parse(request)).toThrow();
    });

    test("should reject invalid start", () => {
      const request = { start: -1 };
      expect(() => GetSpacesRequestSchema.parse(request)).toThrow();
    });
  });

  describe("CreateSpaceRequestSchema", () => {
    test("should accept valid request with required fields", () => {
      const request = { key: "TEST", name: "Test Space" };
      expect(() => CreateSpaceRequestSchema.parse(request)).not.toThrow();
    });

    test("should accept request with all fields", () => {
      const request = {
        key: "TEST",
        name: "Test Space",
        type: "global",
        description: "A test space",
      };
      expect(() => CreateSpaceRequestSchema.parse(request)).not.toThrow();
    });

    test("should accept request with personal type", () => {
      const request = {
        key: "PERSONAL",
        name: "Personal Space",
        type: "personal",
      };
      expect(() => CreateSpaceRequestSchema.parse(request)).not.toThrow();
    });

    test("should reject request missing key", () => {
      const request = { name: "Test Space" };
      expect(() => CreateSpaceRequestSchema.parse(request)).toThrow();
    });

    test("should reject request missing name", () => {
      const request = { key: "TEST" };
      expect(() => CreateSpaceRequestSchema.parse(request)).toThrow();
    });

    test("should reject empty key", () => {
      const request = { key: "", name: "Test Space" };
      expect(() => CreateSpaceRequestSchema.parse(request)).toThrow();
    });

    test("should reject empty name", () => {
      const request = { key: "TEST", name: "" };
      expect(() => CreateSpaceRequestSchema.parse(request)).toThrow();
    });

    test("should reject invalid type", () => {
      const request = { key: "TEST", name: "Test Space", type: "invalid" };
      expect(() => CreateSpaceRequestSchema.parse(request)).toThrow();
    });

    test("should reject name exceeding maximum length", () => {
      const request = { key: "TEST", name: "A".repeat(256) };
      expect(() => CreateSpaceRequestSchema.parse(request)).toThrow();
    });
  });

  describe("UpdateSpaceRequestSchema", () => {
    test("should accept valid request with name only", () => {
      const request = { name: "Updated Space Name" };
      expect(() => UpdateSpaceRequestSchema.parse(request)).not.toThrow();
    });

    test("should accept request with type only", () => {
      const request = { type: "personal" };
      expect(() => UpdateSpaceRequestSchema.parse(request)).not.toThrow();
    });

    test("should accept request with description only", () => {
      const request = { description: "Updated description" };
      expect(() => UpdateSpaceRequestSchema.parse(request)).not.toThrow();
    });

    test("should accept request with all fields", () => {
      const request = {
        name: "Updated Space",
        type: "global",
        description: "Updated description",
      };
      expect(() => UpdateSpaceRequestSchema.parse(request)).not.toThrow();
    });

    test("should accept empty request", () => {
      expect(() => UpdateSpaceRequestSchema.parse({})).not.toThrow();
    });

    test("should accept request with empty description", () => {
      const request = { description: "" };
      expect(() => UpdateSpaceRequestSchema.parse(request)).not.toThrow();
    });

    test("should reject empty name", () => {
      const request = { name: "" };
      expect(() => UpdateSpaceRequestSchema.parse(request)).toThrow();
    });

    test("should reject name exceeding maximum length", () => {
      const request = { name: "A".repeat(256) };
      expect(() => UpdateSpaceRequestSchema.parse(request)).toThrow();
    });

    test("should reject invalid type", () => {
      const request = { type: "invalid" };
      expect(() => UpdateSpaceRequestSchema.parse(request)).toThrow();
    });

    test("should trim whitespace from name", () => {
      const request = { name: "  Updated Space  " };
      const result = UpdateSpaceRequestSchema.parse(request);
      expect(result.name).toBe("Updated Space");
    });
  });

  describe("Schema Integration", () => {
    test("should work together for complete validation flow", () => {
      // Test that schemas can be used together
      const spaceKey = SpaceKeySchema.parse("TEST");
      const spaceName = SpaceNameSchema.parse("Test Space");
      const spaceType = SpaceTypeSchema.parse("global");

      const createRequest = CreateSpaceRequestSchema.parse({
        key: spaceKey,
        name: spaceName,
        type: spaceType,
      });

      expect(createRequest.key).toBe("TEST");
      expect(createRequest.name).toBe("Test Space");
      expect(createRequest.type).toBe("global");
    });

    test("should handle complex pagination scenarios", () => {
      const paginationOptions = PaginationOptionsSchema.parse({
        limit: 100,
        start: 200,
      });

      const getSpacesRequest = GetSpacesRequestSchema.parse({
        type: "personal",
        ...paginationOptions,
      });

      expect(getSpacesRequest?.limit).toBe(100);
      expect(getSpacesRequest?.start).toBe(200);
      expect(getSpacesRequest?.type).toBe("personal");
    });
  });
});
