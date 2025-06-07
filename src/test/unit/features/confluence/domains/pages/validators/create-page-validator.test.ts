/**
 * Create Page Validator Tests
 *
 * Comprehensive tests for CreatePageValidator class
 */

import { beforeEach, describe, expect, test } from "bun:test";
import type { CreatePageRequest } from "@features/confluence/domains/pages/models";
import { CreatePageValidator } from "@features/confluence/domains/pages/validators/create-page-validator";
import { ValidationError } from "@features/confluence/shared/validators";

describe("CreatePageValidator", () => {
  let validator: CreatePageValidator;

  beforeEach(() => {
    validator = new CreatePageValidator();
  });

  describe("Constructor", () => {
    test("should initialize validator instance", () => {
      expect(validator).toBeInstanceOf(CreatePageValidator);
      expect(validator.validate).toBeFunction();
    });
  });

  describe("Valid Requests", () => {
    test("should accept valid request with required fields only", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: "Page content here",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with all optional fields", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: "Page content here",
        parentPageId: "456789",
        status: "draft",
        contentFormat: "storage",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with parentPageId", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "Child Page",
        content: "Child page content",
        parentPageId: "123456",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with draft status", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "Draft Page",
        content: "Draft content",
        status: "draft",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with current status", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "Published Page",
        content: "Published content",
        status: "current",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with storage content format", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "Storage Page",
        content: "<p>HTML content</p>",
        contentFormat: "storage",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with editor content format", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "Editor Page",
        content: "Editor content",
        contentFormat: "editor",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with wiki content format", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "Wiki Page",
        content: "h1. Wiki content",
        contentFormat: "wiki",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with atlas_doc_format", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "Atlas Page",
        content: "Atlas document content",
        contentFormat: "atlas_doc_format",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with maximum length title", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "a".repeat(255),
        content: "Content for long title page",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with long content", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "Long Content Page",
        content: "Very long content ".repeat(1000),
      };

      expect(() => validator.validate(request)).not.toThrow();
    });
  });

  describe("Invalid Required Fields", () => {
    test("should throw ValidationError for missing spaceId", () => {
      const request = {
        title: "My Page Title",
        content: "Page content here",
      } as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for empty spaceId", () => {
      const request: CreatePageRequest = {
        spaceId: "",
        title: "My Page Title",
        content: "Page content here",
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for whitespace-only spaceId", () => {
      const request: CreatePageRequest = {
        spaceId: "   ",
        title: "My Page Title",
        content: "Page content here",
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for missing title", () => {
      const request = {
        spaceId: "SPACE123",
        content: "Page content here",
      } as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for empty title", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "",
        content: "Page content here",
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for whitespace-only title", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "   ",
        content: "Page content here",
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for missing content", () => {
      const request = {
        spaceId: "SPACE123",
        title: "My Page Title",
      } as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for empty content", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: "",
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });
  });

  describe("Invalid Field Types", () => {
    test("should throw ValidationError for numeric spaceId", () => {
      const request = {
        spaceId: 123,
        title: "My Page Title",
        content: "Page content here",
      } as unknown as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for boolean spaceId", () => {
      const request = {
        spaceId: true,
        title: "My Page Title",
        content: "Page content here",
      } as unknown as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for null spaceId", () => {
      const request = {
        spaceId: null,
        title: "My Page Title",
        content: "Page content here",
      } as unknown as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric title", () => {
      const request = {
        spaceId: "SPACE123",
        title: 123,
        content: "Page content here",
      } as unknown as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for boolean title", () => {
      const request = {
        spaceId: "SPACE123",
        title: true,
        content: "Page content here",
      } as unknown as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for null title", () => {
      const request = {
        spaceId: "SPACE123",
        title: null,
        content: "Page content here",
      } as unknown as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric content", () => {
      const request = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: 123,
      } as unknown as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for boolean content", () => {
      const request = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: true,
      } as unknown as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for null content", () => {
      const request = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: null,
      } as unknown as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });
  });

  describe("Invalid Optional Fields", () => {
    test("should throw ValidationError for empty parentPageId", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: "Page content here",
        parentPageId: "",
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric parentPageId", () => {
      const request = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: "Page content here",
        parentPageId: 123,
      } as unknown as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for invalid status", () => {
      const request = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: "Page content here",
        status: "published",
      } as unknown as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric status", () => {
      const request = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: "Page content here",
        status: 1,
      } as unknown as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for invalid contentFormat", () => {
      const request = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: "Page content here",
        contentFormat: "markdown",
      } as unknown as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for numeric contentFormat", () => {
      const request = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: "Page content here",
        contentFormat: 1,
      } as unknown as CreatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });
  });

  describe("Boundary Conditions", () => {
    test("should reject title exceeding maximum length", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "a".repeat(256),
        content: "Page content here",
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should accept minimum valid title", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "a",
        content: "Page content here",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept minimum valid content", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: "a",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept minimum valid spaceId", () => {
      const request: CreatePageRequest = {
        spaceId: "S",
        title: "My Page Title",
        content: "Page content here",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should trim whitespace from fields", () => {
      const request: CreatePageRequest = {
        spaceId: "  SPACE123  ",
        title: "  My Page Title  ",
        content: "Page content here",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    test("should handle request with extra properties", () => {
      const request = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: "Page content here",
        extraProperty: "should be ignored",
      } as CreatePageRequest;

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle request with undefined optional fields", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: "Page content here",
        parentPageId: undefined,
        status: undefined,
        contentFormat: undefined,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle title with special characters", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "Page: Title & More! (2024)",
        content: "Page content here",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle content with HTML", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "HTML Page",
        content: "<h1>Title</h1><p>Content with <strong>bold</strong> text</p>",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should handle content with special characters", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "Special Content",
        content: "Content with émojis 🚀 and spëcial characters: @#$%^&*()",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });
  });

  describe("Error Messages", () => {
    test("should provide meaningful error message for missing spaceId", () => {
      const request = {
        title: "My Page Title",
        content: "Page content here",
      } as CreatePageRequest;

      try {
        validator.validate(request);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("Required");
      }
    });

    test("should provide meaningful error message for empty title", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "",
        content: "Page content here",
      };

      try {
        validator.validate(request);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("cannot be empty");
      }
    });

    test("should provide meaningful error message for empty content", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "My Page Title",
        content: "",
      };

      try {
        validator.validate(request);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("cannot be empty");
      }
    });

    test("should provide meaningful error message for title too long", () => {
      const request: CreatePageRequest = {
        spaceId: "SPACE123",
        title: "a".repeat(256),
        content: "Page content here",
      };

      try {
        validator.validate(request);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("too long");
      }
    });
  });

  describe("Business Logic Validation", () => {
    test("should accept typical page creation request", () => {
      const request: CreatePageRequest = {
        spaceId: "DOCS",
        title: "API Documentation",
        content:
          "<h1>API Documentation</h1><p>This page contains API documentation.</p>",
        status: "current",
        contentFormat: "storage",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept child page creation request", () => {
      const request: CreatePageRequest = {
        spaceId: "DOCS",
        title: "Sub-section",
        content: "This is a sub-section of the main documentation.",
        parentPageId: "123456",
        status: "current",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept draft page creation request", () => {
      const request: CreatePageRequest = {
        spaceId: "DRAFTS",
        title: "Work in Progress",
        content: "This page is still being worked on.",
        status: "draft",
        contentFormat: "editor",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept wiki format page creation", () => {
      const request: CreatePageRequest = {
        spaceId: "WIKI",
        title: "Wiki Style Page",
        content: "h1. Main Title\n\nThis is wiki markup content.",
        contentFormat: "wiki",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });
  });
});
