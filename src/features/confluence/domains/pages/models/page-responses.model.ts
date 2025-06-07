import type {
  Page,
  PageContext,
  PageStatistics,
  PageSummary,
  PaginationInfo,
} from "./page.model";

/**
 * Response Types
 */
export interface GetPageResponse {
  page: Page;
  context: PageContext;
  commentCount?: number;
}

export interface CreatePageResponse {
  page: Page;
  context: PageContext;
  message: string;
}

export interface UpdatePageResponse {
  page: Page;
  context: PageContext;
  previousVersion: number;
  currentVersion: number;
  changes: string[];
  message: string;
}

export interface SearchPagesResponse {
  pages: PageSummary[];
  pagination: PaginationInfo;
  query: string;
  statistics: PageStatistics;
}
