import {
  PageError,
  PageNotFoundError,
  ValidationError,
} from "../../../shared/validators";
import type {
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
      await this.validator.validateRequest(request, existingPage);

      // Update the page
      const updatedPage = await this.pageRepository.update(pageId, request);

      // Track what changed using dedicated change tracker
      const changes = this.changeTracker.trackChanges(request, existingPage);

      // Build context using full context builder if available, otherwise fallback to simplified
      const context = this.contextBuilder
        ? await this.contextBuilder.buildContext(updatedPage)
        : buildSimplifiedPageContext(updatedPage);

      return {
        page: updatedPage,
        context,
        previousVersion: existingPage.version.number,
        currentVersion: updatedPage.version.number,
        changes,
        message: `Page "${updatedPage.title.value}" updated successfully`,
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
