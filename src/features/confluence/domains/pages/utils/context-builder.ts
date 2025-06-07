/**
 * Page Context Builder Utility
 *
 * Builds context objects for page responses with real data
 */

import type { SpaceRepository } from "../../spaces/models";
import type { Page, PageContext, PageRepository, PageSummary } from "../models";

/**
 * Builds a simplified page context (fallback when repositories are not available)
 * This is used when space and content repositories are not provided to use-cases.
 */
export function buildSimplifiedPageContext(page: Page): PageContext {
  return {
    space: {
      id: page.spaceId,
      key: "", // Fallback - no space repository available
      name: "", // Fallback - no space repository available
      type: "global" as const,
      links: {
        webui: `/spaces/${page.spaceId}`,
      },
    },
    breadcrumbs: [
      {
        id: page.id,
        title: page.title,
        links: {
          webui: page.links.webui,
        },
      },
    ],
    children: [], // Fallback - no content repository available
  };
}

/**
 * Page context builder class with repository dependencies
 */
export class PageContextBuilder {
  constructor(
    private spaceRepository: SpaceRepository,
    private pageRepository: PageRepository,
  ) {}

  /**
   * Build full context for a page with real data from repositories
   *
   * @param page - The page to build context for
   * @returns Promise resolving to full page context
   */
  async buildContext(page: Page): Promise<PageContext> {
    try {
      // Get space details
      const space = await this.spaceRepository.findById(page.spaceId);

      // Get child pages using the page repository
      const childrenResponse = await this.pageRepository.findChildren(page.id, {
        limit: 10, // Limit to first 10 children
      });

      // Build breadcrumbs (for now just the current page, could be extended to include ancestors)
      const breadcrumbs = [
        {
          id: page.id,
          title: page.title,
          links: {
            webui: page.links.webui,
          },
        },
      ];

      // Use the actual children from the repository
      const children: PageSummary[] = childrenResponse.pages;

      return {
        space: {
          id: page.spaceId,
          key: space?.key.value || "",
          name: space?.name.value || "",
          type: space?.type || "global",
          links: {
            webui: space?.links.webui || `/spaces/${page.spaceId}`,
          },
        },
        breadcrumbs,
        children,
      };
    } catch (error) {
      // Fallback to simplified context if there are any errors
      console.warn(
        "Failed to build full page context, falling back to simplified:",
        error,
      );
      return buildSimplifiedPageContext(page);
    }
  }

  /**
   * Build simplified context for a page (backward compatibility)
   *
   * @param page - The page to build context for
   * @returns Simplified page context
   */
  buildSimplified(page: Page): PageContext {
    return buildSimplifiedPageContext(page);
  }
}
