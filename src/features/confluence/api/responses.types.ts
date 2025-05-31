import type {
  Space,
  Page,
  SearchResult,
  PaginationInfo,
  ResponseMetadata,
  SuggestedAction,
  BasicSpaceInfo,
  BasicPageInfo,
  PageBreadcrumb,
  Comment,
} from "./models.types";

// Base response structure for all tools
export interface BaseToolResponse<T> {
  success: boolean;
  data: T;
  metadata: ResponseMetadata;
  pagination?: PaginationInfo;
  context?: ContextInfo;
  actions?: SuggestedAction[];
}

export interface ContextInfo {
  space?: BasicSpaceInfo;
  breadcrumbs?: PageBreadcrumb[];
  userPermissions?: string[];
}

// Tool-specific response types based on creative phase decisions

export interface GetSpacesResponse {
  spaces: Space[];
  pagination: PaginationInfo;
  summary: {
    total: number;
    globalSpaces: number;
    personalSpaces: number;
  };
}

export interface GetPageResponse {
  page: Page;
  relationships?: {
    parent?: BasicPageInfo;
    children: BasicPageInfo[];
    commentCount: number;
  };
  context: {
    space: BasicSpaceInfo;
    breadcrumbs: PageBreadcrumb[];
  };
}

export interface SearchPagesResponse {
  results: SearchResult[];
  pagination: PaginationInfo;
  summary: {
    total: number;
    searchQuery: string;
    executionTime: number;
  };
  suggestions?: string[];
}

export interface CreatePageResponse {
  page: Page;
  created: boolean;
  timestamp: string;
  context: {
    space: BasicSpaceInfo;
    breadcrumbs: PageBreadcrumb[];
  };
}

export interface UpdatePageResponse {
  page: Page;
  updated: boolean;
  timestamp: string;
  previousVersion: number;
  currentVersion: number;
  changes: {
    title?: boolean;
    content?: boolean;
    status?: boolean;
  };
  context: {
    space: BasicSpaceInfo;
    breadcrumbs: PageBreadcrumb[];
  };
}

export interface GetPageCommentsResponse {
  comments: Comment[];
  pagination: PaginationInfo;
  summary: {
    total: number;
    pageId: string;
    pageTitle: string;
  };
}

// Error response type
export interface ToolErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    suggestions: string[];
    helpUrl?: string;
  };
  metadata: ResponseMetadata;
}

// API response types (direct from Confluence API)
export interface ConfluenceApiSpacesResponse {
  results: Space[];
  start: number;
  limit: number;
  size: number;
  _links: {
    next?: string;
    prev?: string;
    self: string;
  };
}

export interface ConfluenceApiSearchResponse {
  results: SearchResult[];
  start: number;
  limit: number;
  size: number;
  totalSize: number;
  searchDuration: number;
  _links: {
    next?: string;
    prev?: string;
    self: string;
  };
}

export interface ConfluenceApiCommentsResponse {
  results: Comment[];
  start: number;
  limit: number;
  size: number;
  _links: {
    next?: string;
    prev?: string;
    self: string;
  };
}
