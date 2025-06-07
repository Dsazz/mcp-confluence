import { PageError, PageNotFoundError } from "../../../shared/validators";
import type {
  GetPageRequest,
  GetPageResponse,
  PageRepository,
} from "../models";
import { PageId } from "../models";

import type { SpaceRepository } from "../../spaces/models";
import {
  PageContextBuilder,
  buildSimplifiedPageContext,
} from "../utils/context-builder";

/**
 * Use case for retrieving a page by ID
 */
export class GetPageByIdUseCase {
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

  async execute(request: GetPageRequest): Promise<GetPageResponse> {
    try {
      const pageId = PageId.fromString(request.pageId);
      const page = await this.pageRepository.findById(pageId, {
        includeContent: request.includeContent,
        expand: request.expand,
      });

      if (!page) {
        throw new PageNotFoundError(request.pageId);
      }

      // Get comment count if requested
      let commentCount: number | undefined;
      if (request.includeComments) {
        commentCount = await this.pageRepository.getCommentCount(pageId);
      }

      // Build context using full context builder if available, otherwise fallback to simplified
      const context = this.contextBuilder
        ? await this.contextBuilder.buildContext(page)
        : buildSimplifiedPageContext(page);

      return {
        page,
        context,
        commentCount,
      };
    } catch (error) {
      if (error instanceof PageNotFoundError) {
        throw error;
      }

      throw new PageError(
        `Failed to retrieve page: ${error instanceof Error ? error.message : "Unknown error"}`,
        request.pageId,
        error,
      );
    }
  }
}
