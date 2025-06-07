/**
 * Update Page Request Validator
 *
 * Handles both input validation and business logic validation for update page requests
 */

import { ValidationError } from "@features/confluence/shared/validators";
import { ZodError } from "zod";
import type { Page, PageRepository, UpdatePageRequest } from "../models";
import { PageId, PageTitle } from "../models";
import { UpdatePageRequestSchema } from "./schemas";

/**
 * Interface for update page input validation
 */
export interface UpdatePageInputValidator {
  validate(request: UpdatePageRequest): void;
}

/**
 * Interface for update page business logic validation
 */
export interface UpdatePageBusinessValidator {
  validateRequest(
    request: UpdatePageRequest,
    existingPage: Page,
  ): Promise<void>;
  validateVersionMatch(request: UpdatePageRequest, existingPage: Page): void;
  validateTitleConflict(
    request: UpdatePageRequest,
    existingPage: Page,
  ): Promise<void>;
}

/**
 * Input validator for update page requests using Zod schemas
 */
export class UpdatePageValidator implements UpdatePageInputValidator {
  /**
   * Validate update page request input using Zod schema
   */
  validate(request: UpdatePageRequest): void {
    try {
      UpdatePageRequestSchema.parse(request);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message || "Invalid update page request",
        );
      }
      throw new ValidationError("Invalid update page request");
    }
  }
}

/**
 * Business logic validator for update page requests
 */
export class UpdatePageRequestValidator implements UpdatePageBusinessValidator {
  constructor(private pageRepository: PageRepository) {}

  /**
   * Validate the entire update page request
   */
  async validateRequest(
    request: UpdatePageRequest,
    existingPage: Page,
  ): Promise<void> {
    this.validateVersionMatch(request, existingPage);
    await this.validateTitleConflict(request, existingPage);
  }

  /**
   * Validate that the version number matches
   */
  validateVersionMatch(request: UpdatePageRequest, existingPage: Page): void {
    if (existingPage.version.number !== request.versionNumber) {
      throw new ValidationError(
        `Version mismatch. Current version is ${existingPage.version.number}, but you provided ${request.versionNumber}. Please refresh and try again.`,
      );
    }
  }

  /**
   * Validate that there are no title conflicts
   */
  async validateTitleConflict(
    request: UpdatePageRequest,
    existingPage: Page,
  ): Promise<void> {
    // Check for title conflicts if title is being changed
    if (request.title && request.title !== existingPage.title.value) {
      const newTitle = PageTitle.fromString(request.title);
      const pageId = PageId.fromString(request.pageId);

      const conflictingPage = await this.pageRepository.findByTitle(
        existingPage.spaceId,
        newTitle,
      );

      if (conflictingPage && !conflictingPage.id.equals(pageId)) {
        throw new ValidationError(
          `A page with title "${request.title}" already exists in this space`,
        );
      }
    }
  }
}

/**
 * Change tracker for update operations
 */
export class UpdatePageChangeTracker {
  /**
   * Track what changed between the request and existing page
   */
  trackChanges(request: UpdatePageRequest, existingPage: Page): string[] {
    const changes: string[] = [];

    if (request.title && request.title !== existingPage.title.value) {
      changes.push(
        `Title changed from "${existingPage.title.value}" to "${request.title}"`,
      );
    }

    if (request.content) {
      changes.push("Content updated");
    }

    if (request.status && request.status !== existingPage.status) {
      changes.push(
        `Status changed from "${existingPage.status}" to "${request.status}"`,
      );
    }

    return changes;
  }
}
