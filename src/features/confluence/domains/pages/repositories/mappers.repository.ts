import type {
  CreatePageRequest,
  Page,
  PageSummary,
  PaginationInfo,
  UpdatePageRequest,
} from "../models";
import { createPage as createPageFactory, createPageSummary } from "../models";
import type {
  ConfluencePageData,
  ConfluencePagesResponse,
  ConfluenceSearchResponse,
  ConfluenceSearchResult,
  ConfluenceV1ContentResponse,
} from "./types.repository";

/**
 * Utility functions for mapping between Confluence API responses and domain models
 */

export function mapToPage(pageData: ConfluencePageData): Page {
  return createPageFactory({
    id: pageData.id,
    type: pageData.type as "page" | "blogpost",
    status: pageData.status as "current" | "draft" | "trashed" | "deleted",
    title: pageData.title,
    spaceId: pageData.spaceId,
    parentId: pageData.parentId,
    authorId: pageData.authorId,
    createdAt: pageData.createdAt,
    updatedAt: pageData.version.createdAt,
    version: {
      number: pageData.version.number,
      message: pageData.version.message,
      createdAt: pageData.version.createdAt,
      authorId: pageData.version.authorId,
    },
    body: pageData.body,
    links: {
      self: pageData._links.self || "",
      webui: pageData._links.webui || "",
      editui: pageData._links.editui || "",
      tinyui: pageData._links.tinyui,
    },
    permissions: mapPermissions(),
    metadata: mapMetadata(pageData),
  });
}

export function mapToPageSummary(pageData: ConfluencePageData): PageSummary {
  return createPageSummary({
    id: pageData.id,
    title: pageData.title,
    status: pageData.status as "current" | "draft" | "trashed" | "deleted",
    spaceId: pageData.spaceId,
    authorId: pageData.authorId,
    createdAt: pageData.createdAt,
    updatedAt: pageData.version.createdAt,
    version: {
      number: pageData.version.number,
      createdAt: pageData.version.createdAt,
    },
    links: {
      webui: pageData._links.webui || "",
    },
  });
}

export function mapSearchResultToPageSummary(
  result: ConfluenceSearchResult,
): PageSummary {
  return createPageSummary({
    id: result.content.id,
    title: result.content.title,
    status: result.content.status as
      | "current"
      | "draft"
      | "trashed"
      | "deleted",
    spaceId: result.content.spaceId || "",
    authorId: result.content.authorId,
    createdAt: result.content.createdAt,
    updatedAt: result.content.version.createdAt,
    version: {
      number: result.content.version.number,
      createdAt: result.content.version.createdAt,
    },
    links: {
      webui: result.content._links.webui || "",
    },
  });
}

export function mapSearchResultToPageData(
  result: ConfluenceSearchResult,
  fallbackSpaceId: string,
): ConfluencePageData {
  return {
    id: result.content.id,
    type: result.content.type,
    status: result.content.status,
    title: result.content.title,
    spaceId: result.content.spaceId || fallbackSpaceId,
    authorId: result.content.authorId,
    createdAt: result.content.createdAt,
    version: {
      number: result.content.version.number,
      createdAt: result.content.version.createdAt,
      authorId: result.content.authorId,
    },
    _links: {
      webui: result.content._links.webui,
      self: result.content._links.self,
    },
  };
}

export function mapV1ContentResponseToPageData(
  response: ConfluenceV1ContentResponse,
): ConfluencePageData {
  return {
    id: response.id,
    type: response.type,
    status: response.status,
    title: response.title,
    spaceId: response.space.id,
    parentId: response.ancestors?.[response.ancestors.length - 1]?.id,
    authorId: response.version.by.accountId,
    createdAt: response.version.when,
    version: {
      number: response.version.number,
      message: response.version.message,
      createdAt: response.version.when,
      authorId: response.version.by.accountId,
    },
    body: response.body
      ? {
          storage: response.body.storage
            ? {
                value: response.body.storage.value,
                representation: response.body.storage
                  .representation as "storage",
              }
            : undefined,
        }
      : undefined,
    _links: {
      self: response._links.self,
      webui: response._links.webui,
      editui: response._links.edit,
      tinyui: response._links.tinyui,
    },
  };
}

export function mapToPagination(
  response: ConfluencePagesResponse | ConfluenceSearchResponse,
): PaginationInfo {
  return {
    start: response.start || 0,
    limit: response.limit || 25,
    size: response.size || response.results.length,
    hasMore: response.size === (response.limit || 25),
    total: response.totalSize,
  };
}

export function mapCreateRequest(request: CreatePageRequest): unknown {
  const data: Record<string, unknown> = {
    type: "page",
    title: request.title,
    space: {
      id: request.spaceId,
    },
    body: {
      storage: {
        value: request.content,
        representation: request.contentFormat || "storage",
      },
    },
    status: request.status || "current",
  };

  if (request.parentPageId) {
    data.ancestors = [{ id: request.parentPageId }];
  }

  return data;
}

export function mapUpdateRequest(updates: UpdatePageRequest): unknown {
  const data: Record<string, unknown> = {
    id: updates.pageId,
    type: "page",
    version: {
      number: updates.versionNumber + 1,
      message: updates.versionMessage,
    },
  };

  if (updates.title) {
    data.title = updates.title;
  }

  if (updates.content) {
    data.body = {
      storage: {
        value: updates.content,
        representation: updates.contentFormat || "storage",
      },
    };
  }

  if (updates.status) {
    data.status = updates.status;
  }

  return data;
}

function mapPermissions(): Page["permissions"] {
  // Default permissions - would need actual permission data from API
  return {
    canView: true,
    canEdit: true,
    canDelete: true,
    canComment: true,
    canRestrict: false,
  };
}

function mapMetadata(pageData: ConfluencePageData): Page["metadata"] {
  return {
    labels: pageData.labels || [],
    properties: pageData.properties || {},
    restrictions: {
      read: [],
      update: [],
    },
  };
}
