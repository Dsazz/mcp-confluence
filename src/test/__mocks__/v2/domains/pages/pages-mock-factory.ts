import type {
  CreatePageRequest,
  CreatePageResponse,
  GetPageRequest,
  Page,
  PageBody,
  PageBreadcrumb,
  PageContext,
  PageLinks,
  PageMetadata,
  PagePermissions,
  PageSummary,
  PageVersion,
  PaginationInfo,
  SearchPagesRequest,
  SearchPagesResponse,
  UpdatePageRequest,
  UpdatePageResponse,
} from "@features/confluence/domains/pages/models";
import {
  PageContent,
  PageId,
  PageTitle,
} from "@features/confluence/domains/pages/models";
import { BaseMockFactory, MockDataUtils } from "../../base/base-mock-factory";

export class PagesMockFactory extends BaseMockFactory<Page> {
  /**
   * Required implementation for BaseMockFactory
   */
  create(overrides: Partial<Page> = {}): Page {
    return this.createPage(overrides);
  }

  /**
   * Required implementation for BaseMockFactory
   */
  protected generateRandomData(): Partial<Page> {
    return {
      type: MockDataUtils.randomChoice(["page", "blogpost"] as const),
      status: MockDataUtils.randomChoice(["current", "draft"] as const),
    };
  }

  /**
   * Create a mock PageId value object
   */
  createPageId(value?: string): PageId {
    return new PageId(value || MockDataUtils.generateId());
  }

  /**
   * Create a mock PageTitle value object
   */
  createPageTitle(value?: string): PageTitle {
    return new PageTitle(value || `Test Page ${MockDataUtils.generateId()}`);
  }

  /**
   * Create a mock PageContent value object
   */
  createPageContent(
    value?: string,
    format: "storage" | "editor" | "wiki" | "atlas_doc_format" = "storage",
  ): PageContent {
    return new PageContent(
      value || `<p>Test content ${MockDataUtils.generateId()}</p>`,
      format,
    );
  }

  /**
   * Create a mock PageVersion
   */
  createPageVersion(overrides: Partial<PageVersion> = {}): PageVersion {
    return {
      number: 1,
      message: "Initial version",
      createdAt: new Date(),
      authorId: MockDataUtils.generateId(),
      ...overrides,
    };
  }

  /**
   * Create a mock PageBody
   */
  createPageBody(overrides: Partial<PageBody> = {}): PageBody {
    return {
      storage: {
        value: `<p>Test content ${MockDataUtils.generateId()}</p>`,
        representation: "storage",
      },
      ...overrides,
    };
  }

  /**
   * Create a mock PageLinks
   */
  createPageLinks(
    pageId?: string,
    overrides: Partial<PageLinks> = {},
  ): PageLinks {
    const id = pageId || MockDataUtils.generateId();
    return {
      self: `/api/v2/pages/${id}`,
      webui: `/spaces/TEST/pages/${id}`,
      editui: `/pages/edit-v2.action?pageId=${id}`,
      tinyui: `/x/${id}`,
      ...overrides,
    };
  }

  /**
   * Create a mock PagePermissions
   */
  createPagePermissions(
    overrides: Partial<PagePermissions> = {},
  ): PagePermissions {
    return {
      canView: true,
      canEdit: true,
      canDelete: false,
      canComment: true,
      canRestrict: false,
      ...overrides,
    };
  }

  /**
   * Create a mock PageMetadata
   */
  createPageMetadata(overrides: Partial<PageMetadata> = {}): PageMetadata {
    return {
      labels: ["test", "mock"],
      properties: {},
      restrictions: {
        read: [],
        update: [],
      },
      ...overrides,
    };
  }

  /**
   * Create a mock Page
   */
  createPage(overrides: Partial<Page> = {}): Page {
    const pageId = this.createPageId();
    const now = new Date();

    return {
      id: pageId,
      type: "page",
      status: "current",
      title: this.createPageTitle(),
      spaceId: MockDataUtils.generateId(),
      authorId: MockDataUtils.generateId(),
      createdAt: now,
      updatedAt: now,
      version: this.createPageVersion(),
      body: this.createPageBody(),
      links: this.createPageLinks(pageId.value),
      permissions: this.createPagePermissions(),
      metadata: this.createPageMetadata(),
      ...overrides,
    };
  }

  /**
   * Create a mock PageSummary
   */
  createPageSummary(overrides: Partial<PageSummary> = {}): PageSummary {
    const pageId = this.createPageId();
    const now = new Date();

    return {
      id: pageId,
      title: this.createPageTitle(),
      status: "current",
      spaceId: MockDataUtils.generateId(),
      authorId: MockDataUtils.generateId(),
      createdAt: now,
      updatedAt: now,
      version: {
        number: 1,
        createdAt: now,
      },
      links: {
        webui: `/spaces/TEST/pages/${pageId.value}`,
      },
      ...overrides,
    };
  }

  /**
   * Create a mock PageBreadcrumb
   */
  createPageBreadcrumb(
    overrides: Partial<PageBreadcrumb> = {},
  ): PageBreadcrumb {
    const pageId = this.createPageId();

    return {
      id: pageId,
      title: this.createPageTitle(),
      links: {
        webui: `/spaces/TEST/pages/${pageId.value}`,
      },
      ...overrides,
    };
  }

  /**
   * Create a mock PageContext
   */
  createPageContext(overrides: Partial<PageContext> = {}): PageContext {
    return {
      space: {
        id: MockDataUtils.generateId(),
        key: "TEST",
        name: "Test Space",
        type: "global",
        links: {
          webui: "/spaces/TEST",
        },
      },
      breadcrumbs: [this.createPageBreadcrumb()],
      parent: this.createPageSummary(),
      children: [this.createPageSummary(), this.createPageSummary()],
      ...overrides,
    };
  }

  /**
   * Create multiple pages
   */
  createPages(count: number, overrides: Partial<Page> = {}): Page[] {
    return Array.from({ length: count }, () => this.createPage(overrides));
  }

  /**
   * Create multiple page summaries
   */
  createPageSummaries(
    count: number,
    overrides: Partial<PageSummary> = {},
  ): PageSummary[] {
    return Array.from({ length: count }, () =>
      this.createPageSummary(overrides),
    );
  }

  /**
   * Create pagination info
   */
  createPaginationInfo(
    overrides: Partial<PaginationInfo> = {},
  ): PaginationInfo {
    return {
      start: 0,
      limit: 25,
      size: 10,
      hasMore: false,
      total: 10,
      ...overrides,
    };
  }

  /**
   * Create a mock GetPageRequest
   */
  createGetPageRequest(
    overrides: Partial<GetPageRequest> = {},
  ): GetPageRequest {
    return {
      pageId: MockDataUtils.generateId(),
      includeContent: false,
      includeComments: false,
      expand: undefined,
      ...overrides,
    };
  }

  /**
   * Create a mock CreatePageRequest
   */
  createCreatePageRequest(
    overrides: Partial<CreatePageRequest> = {},
  ): CreatePageRequest {
    return {
      spaceId: MockDataUtils.generateId(),
      title: `Test Page ${MockDataUtils.generateId()}`,
      content: `<p>Test content ${MockDataUtils.generateId()}</p>`,
      status: "current",
      contentFormat: "storage",
      ...overrides,
    };
  }

  /**
   * Create a mock CreatePageResponse
   */
  createCreatePageResponse(
    overrides: Partial<CreatePageResponse> = {},
  ): CreatePageResponse {
    return {
      page: this.createPage(),
      context: this.createPageContext(),
      message: "Page created successfully",
      ...overrides,
    };
  }

  /**
   * Create a mock SearchPagesRequest
   */
  createSearchPagesRequest(
    overrides: Partial<SearchPagesRequest> = {},
  ): SearchPagesRequest {
    return {
      query: `test query ${MockDataUtils.generateId()}`,
      spaceKey: undefined,
      limit: 25,
      start: 0,
      ...overrides,
    };
  }

  /**
   * Create a mock SearchPagesResponse
   */
  createSearchPagesResponse(
    overrides: Partial<SearchPagesResponse> = {},
  ): SearchPagesResponse {
    return {
      pages: [this.createPageSummary(), this.createPageSummary()],
      pagination: this.createPaginationInfo({ total: 2 }),
      query: `test query ${MockDataUtils.generateId()}`,
      statistics: {
        totalPages: 2,
        currentPages: 2,
        draftPages: 0,
        trashedPages: 0,
        blogPosts: 0,
      },
      ...overrides,
    };
  }

  /**
   * Create a mock UpdatePageRequest
   */
  createUpdatePageRequest(
    overrides: Partial<UpdatePageRequest> = {},
  ): UpdatePageRequest {
    return {
      pageId: MockDataUtils.generateId(),
      versionNumber: 1,
      title: `Updated Page ${MockDataUtils.generateId()}`,
      content: `<p>Updated content ${MockDataUtils.generateId()}</p>`,
      status: "current",
      contentFormat: "storage",
      versionMessage: "Updated page",
      ...overrides,
    };
  }

  /**
   * Create a mock UpdatePageResponse
   */
  createUpdatePageResponse(
    overrides: Partial<UpdatePageResponse> = {},
  ): UpdatePageResponse {
    return {
      page: this.createPage(),
      context: this.createPageContext(),
      previousVersion: 1,
      currentVersion: 2,
      changes: ["content"],
      message: "Page updated successfully",
      ...overrides,
    };
  }
}
