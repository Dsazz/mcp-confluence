import {
  PageError,
  PageNotFoundError,
  ValidationError,
  VersionConflictError,
} from "../../../shared/validators";
import type {
  Page,
  PageRepository,
  UpdatePageRequest,
  UpdatePageResponse,
} from "../models";
import { PageId } from "../models";

import type { SpaceRepository } from "../../spaces/models";
import {
  PageContextBuilder,
  buildSimplifiedPageContext,
} from "../utils/context-builder";
import {
  UpdatePageChangeTracker,
  UpdatePageRequestValidator,
} from "../validators/update-page-validator";

/**
 * Use case for updating an existing page
 */
export class UpdatePageUseCase {
  private contextBuilder?: PageContextBuilder;
  private validator: UpdatePageRequestValidator;
  private changeTracker: UpdatePageChangeTracker;

  constructor(
    private pageRepository: PageRepository,
    spaceRepository?: SpaceRepository,
  ) {
    // Only create context builder if both repositories are provided
    if (spaceRepository) {
      this.contextBuilder = new PageContextBuilder(
        spaceRepository,
        pageRepository,
      );
    }

    // Initialize validator and change tracker
    this.validator = new UpdatePageRequestValidator(pageRepository);
    this.changeTracker = new UpdatePageChangeTracker();
  }

  async execute(request: UpdatePageRequest): Promise<UpdatePageResponse> {
    try {
      const pageId = PageId.fromString(request.pageId);

      // Check if page exists and get current version
      const existingPage = await this.pageRepository.findById(pageId, {
        includeContent: true,
      });

      if (!existingPage) {
        throw new PageNotFoundError(request.pageId);
      }

      // Validate the update request using dedicated validator
      // Skip version validation as the repository will handle version conflicts automatically
      await this.validator.validateTitleConflict(request, existingPage);

      let updatedPage: Page;
      let wasVersionConflictResolved = false;
      const originalVersion = existingPage.version.number;

      try {
        // Update the page - the repository will handle version conflicts automatically
        updatedPage = await this.pageRepository.update(pageId, request);
      } catch (error) {
        if (error instanceof VersionConflictError) {
          // This shouldn't happen with our auto-recovery, but handle it gracefully
          throw new ValidationError(
            `Version conflict: The page has been updated by another user. Current version is ${error.currentVersion}, but you provided ${error.providedVersion}. Please refresh and try again.`,
          );
        }
        throw error;
      }

      // Check if version was automatically updated (indicating conflict resolution)
      if (updatedPage.version.number > originalVersion + 1) {
        wasVersionConflictResolved = true;
      }

      // Track what changed using dedicated change tracker
      const changes = this.changeTracker.trackChanges(request, existingPage);

      // Build context using full context builder if available, otherwise fallback to simplified
      const context = this.contextBuilder
        ? await this.contextBuilder.buildContext(updatedPage)
        : buildSimplifiedPageContext(updatedPage);

      // Create success message with version conflict info if applicable
      let message = `Page "${updatedPage.title.value}" updated successfully`;
      if (wasVersionConflictResolved) {
        message += " (version conflict was automatically resolved)";
      }

      return {
        page: updatedPage,
        context,
        previousVersion: originalVersion,
        currentVersion: updatedPage.version.number,
        changes,
        message,
      };
    } catch (error) {
      if (
        error instanceof PageNotFoundError ||
        error instanceof ValidationError
      ) {
        throw error;
      }

      throw new PageError(
        `Failed to update page: ${error instanceof Error ? error.message : "Unknown error"}`,
        request.pageId,
        error,
      );
    }
  }
}
