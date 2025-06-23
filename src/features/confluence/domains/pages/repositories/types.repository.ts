/**
 * Type definitions for Confluence API responses
 * Used by the PageRepository implementation
 */

export interface ConfluencePagesResponse {
  results: ConfluencePageData[];
  start?: number;
  limit?: number;
  size: number;
  totalSize?: number;
  _links: {
    self: string;
    next?: string;
    prev?: string;
  };
}

export interface ConfluencePageResponse extends ConfluencePageData {}

export interface ConfluenceV1ContentResponse {
  id: string;
  type: string;
  status: string;
  title: string;
  space: {
    id: string;
    key: string;
    name: string;
  };
  ancestors?: Array<{ id: string }>;
  version: {
    by: {
      type: string;
      accountId: string;
      displayName: string;
    };
    when: string;
    number: number;
    message?: string;
  };
  body?: {
    storage?: {
      value: string;
      representation: string;
    };
  };
  _links: {
    self: string;
    webui: string;
    edit: string;
    tinyui: string;
  };
}

export interface ConfluencePageData {
  id: string;
  type: string;
  status: string;
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
    self?: string;
    webui?: string;
    editui?: string;
    tinyui?: string;
  };
  labels?: string[];
  properties?: Record<string, unknown>;
}

export interface ConfluenceSearchResponse {
  results: ConfluenceSearchResult[];
  start?: number;
  limit?: number;
  size: number;
  totalSize?: number;
  _links: {
    self: string;
    next?: string;
    prev?: string;
  };
}

export interface ConfluenceSearchResult {
  content: {
    id: string;
    type: string;
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
      webui?: string;
      self?: string;
    };
  };
  excerpt?: string;
  score: number;
}

export interface ConfluenceCommentsResponse {
  results: unknown[];
  start?: number;
  limit?: number;
  size: number;
  totalSize?: number;
}
