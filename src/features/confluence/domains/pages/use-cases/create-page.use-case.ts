import {
  PageError,
  PageNotFoundError,
  ValidationError,
} from "../../../shared/validators";
import type {
  CreatePageRequest,
  CreatePageResponse,
  PageRepository,
} from "../models";
import { PageId, PageTitle } from "../models";

import type { SpaceRepository } from "../../spaces/models";
import {
  PageContextBuilder,
  buildSimplifiedPageContext,
} from "../utils/context-builder";

/**
 * Use case for creating a new page
 */
export class CreatePageUseCase {
  private contextBuilder?: PageContextBuilder;

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
  }

  async execute(request: CreatePageRequest): Promise<CreatePageResponse> {
    try {
      // Check if a page with the same title already exists in the space
      const pageTitle = PageTitle.fromString(request.title);
      const existingPage = await this.pageRepository.findByTitle(
        request.spaceId,
        pageTitle,
      );

      if (existingPage) {
        throw new ValidationError(
          `A page with title "${request.title}" already exists in this space`,
        );
      }

      // Validate parent page exists if specified
      if (request.parentPageId) {
        const parentId = PageId.fromString(request.parentPageId);
        const parentExists = await this.pageRepository.exists(parentId);
        if (!parentExists) {
          throw new PageNotFoundError(request.parentPageId);
        }
      }

      const page = await this.pageRepository.create(request);

      // Build context using full context builder if available, otherwise fallback to simplified
      const context = this.contextBuilder
        ? await this.contextBuilder.buildContext(page)
        : buildSimplifiedPageContext(page);

      return {
        page,
        context,
        message: `Page "${page.title.value}" created successfully`,
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof PageNotFoundError
      ) {
        throw error;
      }

      throw new PageError(
        `Failed to create page: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        error,
      );
    }
  }
}
