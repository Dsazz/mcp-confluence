/**
 * Page Converter Utility
 *
 * Converts between different page representations
 */

import type { Page, PageSummary } from "../models/index";

/**
 * Converts a Page object to a PageSummary object
 */
export function convertPageToSummary(page: Page): PageSummary {
  return {
    id: page.id,
    title: page.title,
    status: page.status,
    spaceId: page.spaceId,
    authorId: page.authorId,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    version: {
      number: page.version.number,
      createdAt: page.version.createdAt,
    },
    links: {
      webui: page.links.webui,
    },
  };
}

/**
 * Converts an array of Page objects to PageSummary objects
 */
export function convertPagesToSummaries(pages: Page[]): PageSummary[] {
  return pages.map(convertPageToSummary);
}

/**
 * Page converter class for dependency injection scenarios
 */
export class PageConverter {
  /**
   * Convert a single page to summary
   */
  toSummary(page: Page): PageSummary {
    return convertPageToSummary(page);
  }

  /**
   * Convert multiple pages to summaries
   */
  toSummaries(pages: Page[]): PageSummary[] {
    return convertPagesToSummaries(pages);
  }
}
