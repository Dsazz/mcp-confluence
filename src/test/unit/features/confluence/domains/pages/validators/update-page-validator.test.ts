/**
 * Update Page Validator Tests
 *
 * Comprehensive tests for UpdatePageValidator and related classes
 */

import { beforeEach, describe, expect, test } from "bun:test";
import type {
  Page,
  PageRepository,
  PageVersion,
  UpdatePageRequest,
} from "@features/confluence/domains/pages/models";
import { PageId, PageTitle } from "@features/confluence/domains/pages/models";
import {
  UpdatePageChangeTracker,
  UpdatePageRequestValidator,
  UpdatePageValidator,
} from "@features/confluence/domains/pages/validators/update-page-validator";
import { ValidationError } from "@features/confluence/shared/validators";

describe("UpdatePageValidator", () => {
  let validator: UpdatePageValidator;

  beforeEach(() => {
    validator = new UpdatePageValidator();
  });

  describe("Constructor", () => {
    test("should initialize validator instance", () => {
      expect(validator).toBeInstanceOf(UpdatePageValidator);
      expect(validator.validate).toBeFunction();
    });
  });

  describe("Valid Requests", () => {
    test("should accept valid request with required fields only", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        versionNumber: 2,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with all optional fields", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        title: "Updated Title",
        content: "Updated content",
        status: "current",
        contentFormat: "storage",
        versionNumber: 3,
        versionMessage: "Updated page content",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with only title update", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        title: "New Title",
        versionNumber: 2,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with only content update", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        content: "New content",
        versionNumber: 2,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with status change", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        status: "draft",
        versionNumber: 2,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with content format change", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        contentFormat: "wiki",
        versionNumber: 2,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with version message", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        versionNumber: 2,
        versionMessage: "Fixed typos and updated examples",
      };

      expect(() => validator.validate(request)).not.toThrow();
    });

    test("should accept request with maximum version number", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        versionNumber: 999999,
      };

      expect(() => validator.validate(request)).not.toThrow();
    });
  });

  describe("Invalid Required Fields", () => {
    test("should throw ValidationError for missing pageId", () => {
      const request = {
        versionNumber: 2,
      } as UpdatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for empty pageId", () => {
      const request: UpdatePageRequest = {
        pageId: "",
        versionNumber: 2,
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for missing versionNumber", () => {
      const request = {
        pageId: "123456",
      } as UpdatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for zero versionNumber", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        versionNumber: 0,
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for negative versionNumber", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        versionNumber: -1,
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for non-integer versionNumber", () => {
      const request = {
        pageId: "123456",
        versionNumber: 2.5,
      } as unknown as UpdatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });
  });

  describe("Invalid Optional Fields", () => {
    test("should throw ValidationError for empty title", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        title: "",
        versionNumber: 2,
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for title exceeding maximum length", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        title: "a".repeat(256),
        versionNumber: 2,
      };

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for invalid status", () => {
      const request = {
        pageId: "123456",
        status: "published",
        versionNumber: 2,
      } as unknown as UpdatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });

    test("should throw ValidationError for invalid contentFormat", () => {
      const request = {
        pageId: "123456",
        contentFormat: "markdown",
        versionNumber: 2,
      } as unknown as UpdatePageRequest;

      expect(() => validator.validate(request)).toThrow(ValidationError);
    });
  });

  describe("Error Messages", () => {
    test("should provide meaningful error message for missing pageId", () => {
      const request = {
        versionNumber: 2,
      } as UpdatePageRequest;

      try {
        validator.validate(request);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("Required");
      }
    });

    test("should provide meaningful error message for invalid versionNumber", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        versionNumber: 0,
      };

      try {
        validator.validate(request);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "must be positive",
        );
      }
    });
  });
});

describe("UpdatePageRequestValidator", () => {
  let validator: UpdatePageRequestValidator;
  let mockPageRepository: PageRepository;
  let existingPage: Page;

  beforeEach(() => {
    mockPageRepository = {
      findByTitle: async () => null,
    } as unknown as PageRepository;

    validator = new UpdatePageRequestValidator(mockPageRepository);

    existingPage = {
      id: PageId.fromString("123456"),
      title: PageTitle.fromString("Original Title"),
      spaceId: "SPACE123",
      version: { number: 2 } as PageVersion,
      status: "current",
    } as Page;
  });

  describe("Version Validation", () => {
    test("should accept matching version number", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        versionNumber: 2,
      };

      expect(() =>
        validator.validateVersionMatch(request, existingPage),
      ).not.toThrow();
    });

    test("should throw ValidationError for version mismatch", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        versionNumber: 1,
      };

      expect(() =>
        validator.validateVersionMatch(request, existingPage),
      ).toThrow(ValidationError);
    });

    test("should provide meaningful error message for version mismatch", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        versionNumber: 1,
      };

      try {
        validator.validateVersionMatch(request, existingPage);
        expect.unreachable("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Version mismatch",
        );
        expect((error as ValidationError).message).toContain(
          "Current version is 2",
        );
        expect((error as ValidationError).message).toContain("you provided 1");
      }
    });
  });

  describe("Title Conflict Validation", () => {
    test("should accept when title is not being changed", async () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        content: "New content",
        versionNumber: 2,
      };

      await expect(async () => {
        await validator.validateTitleConflict(request, existingPage);
      }).not.toThrow();
    });

    test("should accept when title is changed to same value", async () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        title: "Original Title",
        versionNumber: 2,
      };

      await expect(async () => {
        await validator.validateTitleConflict(request, existingPage);
      }).not.toThrow();
    });

    test("should accept when new title doesn't conflict", async () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        title: "New Unique Title",
        versionNumber: 2,
      };

      mockPageRepository.findByTitle = async () => null;

      await expect(async () => {
        await validator.validateTitleConflict(request, existingPage);
      }).not.toThrow();
    });

    test("should accept when conflicting page is the same page", async () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        title: "Conflicting Title",
        versionNumber: 2,
      };

      const conflictingPage = {
        id: PageId.fromString("123456"),
        title: PageTitle.fromString("Conflicting Title"),
      } as Page;

      mockPageRepository.findByTitle = async () => conflictingPage;

      await expect(async () => {
        await validator.validateTitleConflict(request, existingPage);
      }).not.toThrow();
    });

    test("should throw ValidationError when title conflicts with different page", async () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        title: "Conflicting Title",
        versionNumber: 2,
      };

      const conflictingPage = {
        id: PageId.fromString("789012"),
        title: PageTitle.fromString("Conflicting Title"),
      } as Page;

      mockPageRepository.findByTitle = async () => conflictingPage;

      await expect(
        validator.validateTitleConflict(request, existingPage),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("Complete Request Validation", () => {
    test("should validate complete request successfully", async () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        title: "New Unique Title",
        versionNumber: 2,
      };

      mockPageRepository.findByTitle = async () => null;

      await expect(async () => {
        await validator.validateRequest(request, existingPage);
      }).not.toThrow();
    });

    test("should fail validation on version mismatch", async () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        title: "New Title",
        versionNumber: 1,
      };

      await expect(
        validator.validateRequest(request, existingPage),
      ).rejects.toThrow(ValidationError);
    });
  });
});

describe("UpdatePageChangeTracker", () => {
  let tracker: UpdatePageChangeTracker;
  let existingPage: Page;

  beforeEach(() => {
    tracker = new UpdatePageChangeTracker();

    existingPage = {
      title: PageTitle.fromString("Original Title"),
      status: "current",
    } as Page;
  });

  describe("Change Tracking", () => {
    test("should track no changes for minimal request", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        versionNumber: 2,
      };

      const changes = tracker.trackChanges(request, existingPage);
      expect(changes).toHaveLength(0);
    });

    test("should track title change", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        title: "New Title",
        versionNumber: 2,
      };

      const changes = tracker.trackChanges(request, existingPage);
      expect(changes).toHaveLength(1);
      expect(changes[0]).toContain(
        'Title changed from "Original Title" to "New Title"',
      );
    });

    test("should track content change", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        content: "New content",
        versionNumber: 2,
      };

      const changes = tracker.trackChanges(request, existingPage);
      expect(changes).toHaveLength(1);
      expect(changes[0]).toBe("Content updated");
    });

    test("should track status change", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        status: "draft",
        versionNumber: 2,
      };

      const changes = tracker.trackChanges(request, existingPage);
      expect(changes).toHaveLength(1);
      expect(changes[0]).toContain('Status changed from "current" to "draft"');
    });

    test("should track multiple changes", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        title: "New Title",
        content: "New content",
        status: "draft",
        versionNumber: 2,
      };

      const changes = tracker.trackChanges(request, existingPage);
      expect(changes).toHaveLength(3);
      expect(changes).toContain(
        'Title changed from "Original Title" to "New Title"',
      );
      expect(changes).toContain("Content updated");
      expect(changes).toContain('Status changed from "current" to "draft"');
    });

    test("should not track unchanged title", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        title: "Original Title",
        versionNumber: 2,
      };

      const changes = tracker.trackChanges(request, existingPage);
      expect(changes).toHaveLength(0);
    });

    test("should not track unchanged status", () => {
      const request: UpdatePageRequest = {
        pageId: "123456",
        status: "current",
        versionNumber: 2,
      };

      const changes = tracker.trackChanges(request, existingPage);
      expect(changes).toHaveLength(0);
    });
  });
});
