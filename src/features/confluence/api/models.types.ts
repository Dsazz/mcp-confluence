// Core Confluence entities based on API v2 specifications

export interface Space {
  id: string;
  key: string;
  name: string;
  type: "global" | "personal";
  status: "current" | "archived";
  description?: {
    plain: {
      value: string;
      representation: "plain";
    };
  };
  homepage?: {
    id: string;
    title: string;
    _links: {
      webui: string;
    };
  };
  _links: {
    webui: string;
    self: string;
  };
  createdAt: string;
  authorId?: string;
}

export interface Page {
  id: string;
  type: "page" | "blogpost";
  status: "current" | "trashed" | "deleted" | "draft";
  title: string;
  spaceId: string;
  parentId?: string;
  authorId: string;
  createdAt: string;
  version: {
    number: number;
    message?: string;
    createdAt: string;
    authorId: string;
  };
  body?: {
    storage?: {
      value: string;
      representation: "storage";
    };
    atlas_doc_format?: {
      value: string;
      representation: "atlas_doc_format";
    };
  };
  _links: {
    webui: string;
    editui: string;
    self: string;
  };
}

export interface Comment {
  id: string;
  status: "current" | "deleted";
  title?: string;
  parentCommentId?: string;
  version: {
    number: number;
    createdAt: string;
    authorId: string;
  };
  body: {
    storage: {
      value: string;
      representation: "storage";
    };
  };
  _links: {
    self: string;
  };
}

export interface SearchResult {
  content: {
    id: string;
    type: "page" | "blogpost" | "comment";
    status: string;
    title: string;
    spaceId?: string;
    authorId: string;
    createdAt: string;
    version: {
      number: number;
      createdAt: string;
    };
    _links: {
      webui: string;
      self: string;
    };
  };
  excerpt?: string;
  score: number;
}

// Basic info types for relationships
export interface BasicSpaceInfo {
  id: string;
  key: string;
  name: string;
  type: "global" | "personal";
  _links: {
    webui: string;
  };
}

export interface BasicPageInfo {
  id: string;
  title: string;
  status: string;
  _links: {
    webui: string;
  };
}

export interface PageBreadcrumb {
  id: string;
  title: string;
  _links: {
    webui: string;
  };
}

// Pagination support
export interface PaginationInfo {
  limit: number;
  start: number;
  size: number;
  hasMore: boolean;
}

// Response metadata
export interface ResponseMetadata {
  timestamp: string;
  executionTime: number;
  apiVersion: string;
}

export interface SuggestedAction {
  action: string;
  description: string;
  url?: string;
}
