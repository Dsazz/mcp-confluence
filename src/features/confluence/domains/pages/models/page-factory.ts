import { PageId, PageTitle } from "./page-value-objects.model";
import type {
  Page,
  PageBody,
  PageLinks,
  PageMetadata,
  PagePermissions,
  PageStatistics,
  PageSummary,
} from "./page.model";

/**
 * Factory Functions
 */
export function createPage(data: {
  id: string;
  type: "page" | "blogpost";
  status: "current" | "draft" | "trashed" | "deleted";
  title: string;
  spaceId: string;
  parentId?: string;
  authorId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  version: {
    number: number;
    message?: string;
    createdAt: string | Date;
    authorId: string;
  };
  body?: PageBody;
  links: PageLinks;
  permissions: PagePermissions;
  metadata: PageMetadata;
}): Page {
  return {
    id: PageId.fromString(data.id),
    type: data.type,
    status: data.status,
    title: PageTitle.fromString(data.title),
    spaceId: data.spaceId,
    parentId: data.parentId ? PageId.fromString(data.parentId) : undefined,
    authorId: data.authorId,
    createdAt:
      typeof data.createdAt === "string"
        ? new Date(data.createdAt)
        : data.createdAt,
    updatedAt:
      typeof data.updatedAt === "string"
        ? new Date(data.updatedAt)
        : data.updatedAt,
    version: {
      number: data.version.number,
      message: data.version.message,
      createdAt:
        typeof data.version.createdAt === "string"
          ? new Date(data.version.createdAt)
          : data.version.createdAt,
      authorId: data.version.authorId,
    },
    body: data.body,
    links: data.links,
    permissions: data.permissions,
    metadata: data.metadata,
  };
}

export function createPageSummary(data: {
  id: string;
  title: string;
  status: "current" | "draft" | "trashed" | "deleted";
  spaceId: string;
  authorId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  version: {
    number: number;
    createdAt: string | Date;
  };
  links: {
    webui: string;
  };
}): PageSummary {
  return {
    id: PageId.fromString(data.id),
    title: PageTitle.fromString(data.title),
    status: data.status,
    spaceId: data.spaceId,
    authorId: data.authorId,
    createdAt:
      typeof data.createdAt === "string"
        ? new Date(data.createdAt)
        : data.createdAt,
    updatedAt:
      typeof data.updatedAt === "string"
        ? new Date(data.updatedAt)
        : data.updatedAt,
    version: {
      number: data.version.number,
      createdAt:
        typeof data.version.createdAt === "string"
          ? new Date(data.version.createdAt)
          : data.version.createdAt,
    },
    links: {
      webui: data.links.webui,
    },
  };
}

export function createPageStatistics(pages: Page[]): PageStatistics {
  return {
    totalPages: pages.length,
    currentPages: pages.filter((p) => p.status === "current").length,
    draftPages: pages.filter((p) => p.status === "draft").length,
    trashedPages: pages.filter((p) => p.status === "trashed").length,
    blogPosts: pages.filter((p) => p.type === "blogpost").length,
  };
}
