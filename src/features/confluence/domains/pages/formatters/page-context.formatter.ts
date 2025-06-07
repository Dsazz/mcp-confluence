/**
 * Page Context Formatter
 *
 * Transforms PageContext domain objects to API response format.
 * Handles hierarchical page structure formatting including breadcrumbs and space information.
 */

import type { Formatter } from "../../../shared/formatters";
import { formatDate } from "../../../shared/formatters";
import type { PageBreadcrumb, PageContext, PageSummary } from "../models";

/**
 * API Response interfaces for PageContext formatting
 */
export interface ApiPageContextResponse {
  space: {
    id: string;
    key: string;
    name: string;
    type: "global" | "personal";
    links: {
      webui: string;
    };
  };
  breadcrumbs: ApiPageBreadcrumbResponse[];
  parent?: ApiPageSummaryResponse;
  children: ApiPageSummaryResponse[];
}

export interface ApiPageBreadcrumbResponse {
  id: string;
  title: string;
  links: {
    webui: string;
  };
}

export interface ApiPageSummaryResponse {
  id: string;
  title: string;
  status: "current" | "draft" | "trashed" | "deleted";
  spaceId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  version: {
    number: number;
    createdAt: string;
  };
  links: {
    webui: string;
  };
}

/**
 * PageContextFormatter class that transforms PageContext domain objects to API response format
 *
 * Provides formatting for:
 * - Space information
 * - Breadcrumb navigation
 * - Parent page information
 * - Child pages list
 */
export class PageContextFormatter
  implements Formatter<PageContext, ApiPageContextResponse>
{
  /**
   * Formats a PageContext domain object into an API response format
   *
   * @param context - The PageContext domain object to format
   * @returns Formatted API response object
   */
  format(context: PageContext): ApiPageContextResponse {
    return {
      space: {
        id: context.space.id,
        key: context.space.key,
        name: context.space.name,
        type: context.space.type,
        links: {
          webui: context.space.links.webui,
        },
      },
      breadcrumbs: context.breadcrumbs.map((breadcrumb) =>
        this.formatBreadcrumb(breadcrumb),
      ),
      parent: context.parent
        ? this.formatPageSummary(context.parent)
        : undefined,
      children: context.children.map((child) => this.formatPageSummary(child)),
    };
  }

  /**
   * Formats a PageBreadcrumb object to API response format
   *
   * @param breadcrumb - PageBreadcrumb object to format
   * @returns Formatted breadcrumb response
   */
  private formatBreadcrumb(
    breadcrumb: PageBreadcrumb,
  ): ApiPageBreadcrumbResponse {
    return {
      id: breadcrumb.id.value,
      title: breadcrumb.title.value,
      links: {
        webui: breadcrumb.links.webui,
      },
    };
  }

  /**
   * Formats a PageSummary object to API response format
   *
   * @param pageSummary - PageSummary object to format
   * @returns Formatted page summary response
   */
  private formatPageSummary(pageSummary: PageSummary): ApiPageSummaryResponse {
    return {
      id: pageSummary.id.value,
      title: pageSummary.title.value,
      status: pageSummary.status,
      spaceId: pageSummary.spaceId,
      authorId: pageSummary.authorId,
      createdAt: formatDate(pageSummary.createdAt),
      updatedAt: formatDate(pageSummary.updatedAt),
      version: {
        number: pageSummary.version.number,
        createdAt: formatDate(pageSummary.version.createdAt),
      },
      links: {
        webui: pageSummary.links.webui,
      },
    };
  }
}
