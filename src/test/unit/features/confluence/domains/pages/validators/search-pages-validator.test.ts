/**
 * Search Pages Validator Tests
 *
 * Comprehensive tests for SearchPagesValidator class
 */

import { beforeEach, describe, expect, test } from "bun:test";
import type { SearchPagesRequest } from "@features/confluence/domains/pages/models";
import { SearchPagesValidator } from "@features/confluence/domains/pages/validators/search-pages-validator";
import { ValidationError } from "@features/confluence/shared/validators";

describe("SearchPagesValidator", () => {
  let validator: SearchPagesValidator;

  beforeEach(() => {
    validator = new SearchPagesValidator();
  });

  describe("Constructor", () => {
    test("should initialize validator instance", () => {
      expect(validator).toBeInstanceOf(SearchPagesValidator);
      expect(validator.validate).toBeFunction();
    });
  });

  describe("Valid Requests", () => {
    test("should accept valid request with required fields only", () => {
      const request: SearchPagesRequest = {
        query: "test search",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with all optional fields", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        spaceKey: "SPACE123",
        orderBy: "relevance",
        limit: 25,
        start: 0,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with spaceKey", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        spaceKey: "SPACE123",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with orderBy relevance", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        orderBy: "relevance",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with orderBy created", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        orderBy: "created",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with orderBy modified", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        orderBy: "modified",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with orderBy title", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        orderBy: "title",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with minimum limit", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        limit: 1,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with maximum limit", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        limit: 100,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with start parameter", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        start: 50,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with complex query", () => {
      const request: SearchPagesRequest = {
        query: 'text~"multi word phrase" AND space.key="SPACE"',
      };

      expect(() => validator.validate(request)).not.toThrow();
    });
  });

  describe("Invalid Required Fields", () => {
    test("should throw ValidationError for missing query", () => {
      const request = {} as SearchPagesRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for empty query", () => {
      const request: SearchPagesRequest = {
        query: "",
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for whitespace-only query", () => {
      const request: SearchPagesRequest = {
        query: "   ",
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for null query", () => {
      const request = {
        query: null,
      } as unknown as SearchPagesRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for undefined query", () => {
      const request = {
        query: undefined,
      } as unknown as SearchPagesRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric query", () => {
      const request = {
        query: 123,
      } as unknown as SearchPagesRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for boolean query", () => {
      const request = {
        query: true,
      } as unknown as SearchPagesRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });
  });

  describe("Invalid Optional Fields", () => {
    test("should accept empty spaceKey", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        spaceKey: "",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should throw ValidationError for invalid orderBy", () => {
      const request = {
        query: "test search",
        orderBy: "popularity",
      } as unknown as SearchPagesRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric orderBy", () => {
      const request = {
        query: "test search",
        orderBy: 123,
      } as unknown as SearchPagesRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for zero limit", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        limit: 0,
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for negative limit", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        limit: -1,
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for limit exceeding maximum", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        limit: 251,
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for negative start", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        start: -1,
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for non-integer limit", () => {
      const request = {
        query: "test search",
        limit: 25.5,
      } as unknown as SearchPagesRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for non-integer start", () => {
      const request = {
        query: "test search",
        start: 10.5,
      } as unknown as SearchPagesRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });
  });

  describe("Edge Cases", () => {
    test("should handle request with extra properties", () => {
      const request = {
        query: "test search",
        extraProperty: "should be ignored",
      } as unknown as SearchPagesRequest;

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle request with undefined optional fields", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        spaceKey: undefined,
        orderBy: undefined,
        limit: undefined,
        start: undefined,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should trim whitespace from query", () => {
      const request: SearchPagesRequest = {
        query: "  test search  ",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle query with special characters", () => {
      const request: SearchPagesRequest = {
        query: "test & search | with * special ? characters",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle query with CQL syntax", () => {
      const request: SearchPagesRequest = {
        query: 'text~"phrase" AND space.key="SPACE" AND type="page"',
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle very long query", () => {
      const request: SearchPagesRequest = {
        query: "a".repeat(1000),
      };

      expect(() => validator.validate(request)).not.toThrow();
    });
  });

  describe("Error Messages", () => {
    test("should provide meaningful error message for missing query", () => {
      const request = {} as SearchPagesRequest;

      try {
        validator.validate(request);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("Required");
      }
    });

    test("should provide meaningful error message for empty query", () => {
      const request: SearchPagesRequest = {
        query: "",
      };

      try {
        validator.validate(request);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("cannot be empty");
      }
    });

    test("should provide meaningful error message for invalid limit", () => {
      const request: SearchPagesRequest = {
        query: "test search",
        limit: 0,
      };

      try {
        validator.validate(request);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "greater than or equal to 1",
        );
      }
    });

    test("should provide meaningful error message for invalid orderBy", () => {
      const request = {
        query: "test search",
        orderBy: "invalid",
      } as unknown as SearchPagesRequest;

      try {
        validator.validate(request);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Invalid enum value",
        );
      }
    });
  });

  describe("Boundary Conditions", () => {
    test("should accept minimum valid query", () => {
      const request: SearchPagesRequest = {
        query: "a",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept query with leading/trailing whitespace", () => {
      const request: SearchPagesRequest = {
        query: "  test search  ",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle all valid orderBy values", () => {
      const orderByValues = ["relevance", "created", "modified", "title"];

      for (const orderBy of orderByValues) {
        const request = {
          query: "test search",
          orderBy,
        } as SearchPagesRequest;

        expect(() => validator.validate(request)).not.toThrow();
      }
    });

    test("should handle boundary limit values", () => {
      const limitValues = [1, 50, 250];

      for (const limit of limitValues) {
        const request: SearchPagesRequest = {
          query: "test search",
          limit,
        };

        expect(() => validator.validate(request)).not.toThrow();
      }
    });
  });

  describe("Business Logic Validation", () => {
    test("should accept typical search request", () => {
      const request: SearchPagesRequest = {
        query: "confluence documentation",
        spaceKey: "DOC",
        orderBy: "relevance",
        limit: 25,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept CQL search request", () => {
      const request: SearchPagesRequest = {
        query: 'text~"API documentation" AND space.key="DEV"',
        orderBy: "modified",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept paginated search request", () => {
      const request: SearchPagesRequest = {
        query: "user guide",
        limit: 10,
        start: 20,
        orderBy: "title",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept blog post search request", () => {
      const request: SearchPagesRequest = {
        query: "release notes",
        orderBy: "created",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });
  });
});
