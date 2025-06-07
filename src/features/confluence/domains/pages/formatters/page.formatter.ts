/**
 * Page Formatter
 *
 * Transforms Page domain objects to API response format for the confluence system.
 * Handles nested object formatting including PageBody, PageLinks, PagePermissions, etc.
 */

import type { Formatter } from "../../../shared/formatters";
import { formatDate } from "../../../shared/formatters";
import type {
  Page,
  PageBody,
  PageLinks,
  PageMetadata,
  PagePermissions,
  PageVersion,
} from "../models";

/**
 * API Response interfaces for Page formatting
 */
export interface ApiPageResponse {
  id: string;
  type: "page" | "blogpost";
  status: "current" | "draft" | "trashed" | "deleted";
  title: string;
  spaceId: string;
  parentId?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  version: ApiPageVersionResponse;
  body?: ApiPageBodyResponse;
  links: ApiPageLinksResponse;
  permissions: ApiPagePermissionsResponse;
  metadata: ApiPageMetadataResponse;
}

export interface ApiPageVersionResponse {
  number: number;
  message?: string;
  createdAt: string;
  authorId: string;
}

export interface ApiPageBodyResponse {
  storage?: {
    value: string;
    representation: "storage";
  };
  atlas_doc_format?: {
    value: string;
    representation: "atlas_doc_format";
  };
  editor?: {
    value: string;
    representation: "editor";
  };
  wiki?: {
    value: string;
    representation: "wiki";
  };
}

export interface ApiPageLinksResponse {
  self: string;
  webui: string;
  editui: string;
  tinyui?: string;
}

export interface ApiPagePermissionsResponse {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canComment: boolean;
  canRestrict: boolean;
}

export interface ApiPageMetadataResponse {
  labels: string[];
  properties: Record<string, unknown>;
  restrictions: {
    read: string[];
    update: string[];
  };
}

/**
 * PageFormatter class that transforms Page domain objects to API response format
 *
 * Provides comprehensive formatting for all Page-related data including:
 * - Basic page information (id, title, status, etc.)
 * - Nested objects (body, links, permissions, metadata)
 * - Date formatting to ISO strings
 * - Value object extraction (PageId, PageTitle)
 */
export class PageFormatter implements Formatter<Page, ApiPageResponse> {
  /**
   * Formats a Page domain object into an API response format
   *
   * @param page - The Page domain object to format
   * @returns Formatted API response object
   */
  format(page: Page): ApiPageResponse {
    return {
      id: page.id.value,
      type: page.type,
      status: page.status,
      title: page.title.value,
      spaceId: page.spaceId,
      parentId: page.parentId?.value,
      authorId: page.authorId,
      createdAt: formatDate(page.createdAt),
      updatedAt: formatDate(page.updatedAt),
      version: this.formatVersion(page.version),
      body: page.body ? this.formatBody(page.body) : undefined,
      links: this.formatLinks(page.links),
      permissions: this.formatPermissions(page.permissions),
      metadata: this.formatMetadata(page.metadata),
    };
  }

  /**
   * Formats a PageVersion object to API response format
   *
   * @param version - PageVersion object to format
   * @returns Formatted version response
   */
  private formatVersion(version: PageVersion): ApiPageVersionResponse {
    return {
      number: version.number,
      message: version.message,
      createdAt: formatDate(version.createdAt),
      authorId: version.authorId,
    };
  }

  /**
   * Formats a PageBody object to API response format
   *
   * @param body - PageBody object to format
   * @returns Formatted body response
   */
  private formatBody(body: PageBody): ApiPageBodyResponse {
    const formatted: ApiPageBodyResponse = {};

    if (body.storage) {
      formatted.storage = {
        value: body.storage.value,
        representation: "storage",
      };
    }

    if (body.atlas_doc_format) {
      formatted.atlas_doc_format = {
        value: body.atlas_doc_format.value,
        representation: "atlas_doc_format",
      };
    }

    if (body.editor) {
      formatted.editor = {
        value: body.editor.value,
        representation: "editor",
      };
    }

    if (body.wiki) {
      formatted.wiki = {
        value: body.wiki.value,
        representation: "wiki",
      };
    }

    return formatted;
  }

  /**
   * Formats a PageLinks object to API response format
   *
   * @param links - PageLinks object to format
   * @returns Formatted links response
   */
  private formatLinks(links: PageLinks): ApiPageLinksResponse {
    return {
      self: links.self,
      webui: links.webui,
      editui: links.editui,
      tinyui: links.tinyui,
    };
  }

  /**
   * Formats a PagePermissions object to API response format
   *
   * @param permissions - PagePermissions object to format
   * @returns Formatted permissions response
   */
  private formatPermissions(
    permissions: PagePermissions,
  ): ApiPagePermissionsResponse {
    return {
      canView: permissions.canView,
      canEdit: permissions.canEdit,
      canDelete: permissions.canDelete,
      canComment: permissions.canComment,
      canRestrict: permissions.canRestrict,
    };
  }

  /**
   * Formats a PageMetadata object to API response format
   *
   * @param metadata - PageMetadata object to format
   * @returns Formatted metadata response
   */
  private formatMetadata(metadata: PageMetadata): ApiPageMetadataResponse {
    return {
      labels: [...metadata.labels],
      properties: { ...metadata.properties },
      restrictions: {
        read: [...metadata.restrictions.read],
        update: [...metadata.restrictions.update],
      },
    };
  }
}
