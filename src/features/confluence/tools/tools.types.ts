// Tool parameter types based on Creative Phase 3 decisions

export interface GetSpacesParams {
  type?: "global" | "personal";
  limit?: number;
  start?: number;
}

export interface GetPageParams {
  pageId: string;
  includeContent?: boolean;
  includeComments?: boolean;
  expand?: string[];
}

export interface SearchPagesParams {
  query: string;
  spaceKey?: string;
  type?: "page" | "blogpost";
  limit?: number;
  start?: number;
  orderBy?: "relevance" | "created" | "modified" | "title";
}

export interface CreatePageParams {
  spaceId: string;
  title: string;
  content: string;
  parentPageId?: string;
  status?: "current" | "draft";
  contentFormat?: "storage" | "editor" | "wiki";
}

export interface UpdatePageParams {
  pageId: string;
  title?: string;
  content?: string;
  versionNumber: number;
  status?: "current" | "draft";
  contentFormat?: "storage" | "editor" | "wiki";
  versionMessage?: string;
}

// Tool names as constants for consistency
export const CONFLUENCE_TOOLS = {
  GET_SPACES: "confluence_get_spaces",
  GET_PAGE: "confluence_get_page",
  SEARCH_PAGES: "confluence_search_pages",
  CREATE_PAGE: "confluence_create_page",
  UPDATE_PAGE: "confluence_update_page",
} as const;

export type ConfluenceToolName =
  (typeof CONFLUENCE_TOOLS)[keyof typeof CONFLUENCE_TOOLS];
