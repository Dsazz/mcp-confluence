import type {
  CreatePageRequest,
  SearchPagesRequest,
  UpdatePageRequest,
} from "./page-schemas.model";
import type { PageId, PageTitle } from "./page-value-objects.model";
import type {
  Page,
  PageSummary,
  PageVersion,
  PaginationInfo,
} from "./page.model";

/**
 * Repository Interface
 */
export interface PageRepository {
  findById(
    id: PageId,
    options?: { includeContent?: boolean; expand?: string },
  ): Promise<Page | null>;
  findByTitle(spaceId: string, title: PageTitle): Promise<Page | null>;
  findBySpaceId(
    spaceId: string,
    options?: { limit?: number; start?: number },
  ): Promise<{ pages: Page[]; pagination: PaginationInfo }>;
  findChildren(
    parentId: PageId,
    options?: { limit?: number; start?: number },
  ): Promise<{ pages: PageSummary[]; pagination: PaginationInfo }>;
  search(
    query: SearchPagesRequest,
  ): Promise<{ pages: PageSummary[]; pagination: PaginationInfo }>;
  create(page: CreatePageRequest): Promise<Page>;
  update(id: PageId, updates: UpdatePageRequest): Promise<Page>;
  delete(id: PageId): Promise<void>;
  exists(id: PageId): Promise<boolean>;
  getVersion(id: PageId): Promise<PageVersion>;
  getCommentCount(id: PageId): Promise<number>;
}
