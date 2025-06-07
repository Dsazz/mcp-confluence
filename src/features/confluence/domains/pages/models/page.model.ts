import type { PageId, PageTitle } from "./page-value-objects.model";

/**
 * Domain Models
 */
export interface PageVersion {
  number: number;
  message?: string;
  createdAt: Date;
  authorId: string;
}

export interface PageBody {
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

export interface PageLinks {
  self: string;
  webui: string;
  editui: string;
  tinyui?: string;
}

export interface PagePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canComment: boolean;
  canRestrict: boolean;
}

export interface PageMetadata {
  labels: string[];
  properties: Record<string, unknown>;
  restrictions: {
    read: string[];
    update: string[];
  };
}

export interface Page {
  id: PageId;
  type: "page" | "blogpost";
  status: "current" | "draft" | "trashed" | "deleted";
  title: PageTitle;
  spaceId: string;
  parentId?: PageId;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  version: PageVersion;
  body?: PageBody;
  links: PageLinks;
  permissions: PagePermissions;
  metadata: PageMetadata;
}

export interface PageSummary {
  id: PageId;
  title: PageTitle;
  status: "current" | "draft" | "trashed" | "deleted";
  spaceId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  version: Pick<PageVersion, "number" | "createdAt">;
  links: Pick<PageLinks, "webui">;
}

export interface PageBreadcrumb {
  id: PageId;
  title: PageTitle;
  links: Pick<PageLinks, "webui">;
}

export interface PageContext {
  space: {
    id: string;
    key: string;
    name: string;
    type: "global" | "personal";
    links: {
      webui: string;
    };
  };
  breadcrumbs: PageBreadcrumb[];
  parent?: PageSummary;
  children: PageSummary[];
}

/**
 * Supporting Types
 */
export interface PaginationInfo {
  start: number;
  limit: number;
  size: number;
  hasMore: boolean;
  total?: number;
}

export interface PageStatistics {
  totalPages: number;
  currentPages: number;
  draftPages: number;
  trashedPages: number;
  blogPosts: number;
}
