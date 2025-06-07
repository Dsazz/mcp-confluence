import { describe, expect, test } from "bun:test";
import type {
  PaginationInfo,
  SearchContext,
  SearchResult,
  SearchResultContent,
  SearchStatistics,
} from "@features/confluence/domains/search/models";
import {
  CQLQuery,
  SearchQuery,
} from "@features/confluence/domains/search/models";

describe("Search Model", () => {
  describe("SearchResultContent", () => {
    test("should define correct search result content structure", () => {
      const content: SearchResultContent = {
        id: "123456",
        type: "page",
        status: "current",
        title: "Test Page",
        spaceId: "space123",
        spaceKey: "TEST",
        spaceName: "Test Space",
        authorId: "user123",
        authorDisplayName: "John Doe",
        createdAt: new Date("2023-01-01T00:00:00.000Z"),
        updatedAt: new Date("2023-06-01T00:00:00.000Z"),
        version: {
          number: 3,
          createdAt: new Date("2023-06-01T00:00:00.000Z"),
        },
        links: {
          webui: "/spaces/TEST/pages/123456",
          self: "/rest/api/content/123456",
          editui: "/pages/edit-v2.action?pageId=123456",
        },
      };

      expect(content.id).toBe("123456");
      expect(content.type).toBe("page");
      expect(content.title).toBe("Test Page");
      expect(content.spaceKey).toBe("TEST");
      expect(content.authorDisplayName).toBe("John Doe");
    });

    test("should support different content types", () => {
      const pageContent: SearchResultContent = {
        id: "1",
        type: "page",
        status: "current",
        title: "Page Title",
        authorId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: { number: 1, createdAt: new Date() },
        links: { webui: "/page/1", self: "/api/content/1" },
      };

      const blogContent: SearchResultContent = {
        id: "2",
        type: "blogpost",
        status: "current",
        title: "Blog Post Title",
        authorId: "user2",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: { number: 1, createdAt: new Date() },
        links: { webui: "/blog/2", self: "/api/content/2" },
      };

      const commentContent: SearchResultContent = {
        id: "3",
        type: "comment",
        status: "current",
        title: "Comment Title",
        authorId: "user3",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: { number: 1, createdAt: new Date() },
        links: { webui: "/comment/3", self: "/api/content/3" },
      };

      const attachmentContent: SearchResultContent = {
        id: "4",
        type: "attachment",
        status: "current",
        title: "attachment.pdf",
        authorId: "user4",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: { number: 1, createdAt: new Date() },
        links: { webui: "/attachment/4", self: "/api/content/4" },
      };

      expect(pageContent.type).toBe("page");
      expect(blogContent.type).toBe("blogpost");
      expect(commentContent.type).toBe("comment");
      expect(attachmentContent.type).toBe("attachment");
    });

    test("should handle optional properties", () => {
      const minimalContent: SearchResultContent = {
        id: "123",
        type: "page",
        status: "current",
        title: "Minimal Page",
        authorId: "user123",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: { number: 1, createdAt: new Date() },
        links: { webui: "/page/123", self: "/api/content/123" },
      };

      expect(minimalContent.spaceId).toBeUndefined();
      expect(minimalContent.spaceKey).toBeUndefined();
      expect(minimalContent.spaceName).toBeUndefined();
      expect(minimalContent.authorDisplayName).toBeUndefined();
      expect(minimalContent.links.editui).toBeUndefined();
    });
  });

  describe("SearchResult", () => {
    test("should define correct search result structure", () => {
      const result: SearchResult = {
        content: {
          id: "123",
          type: "page",
          status: "current",
          title: "Test Page",
          authorId: "user123",
          createdAt: new Date(),
          updatedAt: new Date(),
          version: { number: 1, createdAt: new Date() },
          links: { webui: "/page/123", self: "/api/content/123" },
        },
        excerpt: "This is a test page with some content...",
        score: 0.85,
        highlights: {
          title: ["<mark>Test</mark> Page"],
          content: ["This is a <mark>test</mark> page with some content"],
        },
      };

      expect(result.content.id).toBe("123");
      expect(result.excerpt).toBe("This is a test page with some content...");
      expect(result.score).toBe(0.85);
      expect(result.highlights?.title).toContain("<mark>Test</mark> Page");
    });

    test("should handle optional properties", () => {
      const minimalResult: SearchResult = {
        content: {
          id: "123",
          type: "page",
          status: "current",
          title: "Test Page",
          authorId: "user123",
          createdAt: new Date(),
          updatedAt: new Date(),
          version: { number: 1, createdAt: new Date() },
          links: { webui: "/page/123", self: "/api/content/123" },
        },
        score: 0.75,
      };

      expect(minimalResult.excerpt).toBeUndefined();
      expect(minimalResult.highlights).toBeUndefined();
    });

    test("should support different score ranges", () => {
      const highScore: SearchResult = {
        content: {
          id: "1",
          type: "page",
          status: "current",
          title: "High Relevance",
          authorId: "user1",
          createdAt: new Date(),
          updatedAt: new Date(),
          version: { number: 1, createdAt: new Date() },
          links: { webui: "/page/1", self: "/api/content/1" },
        },
        score: 0.95,
      };

      const lowScore: SearchResult = {
        content: {
          id: "2",
          type: "page",
          status: "current",
          title: "Low Relevance",
          authorId: "user2",
          createdAt: new Date(),
          updatedAt: new Date(),
          version: { number: 1, createdAt: new Date() },
          links: { webui: "/page/2", self: "/api/content/2" },
        },
        score: 0.15,
      };

      expect(highScore.score).toBeGreaterThan(lowScore.score);
      expect(highScore.score).toBeLessThanOrEqual(1.0);
      expect(lowScore.score).toBeGreaterThanOrEqual(0.0);
    });
  });

  describe("SearchContext", () => {
    test("should define correct search context structure with SearchQuery", () => {
      const context: SearchContext = {
        query: new SearchQuery("test query"),
        filters: {
          spaceKey: "TEST",
          contentType: "page",
          dateRange: {
            from: new Date("2023-01-01"),
            to: new Date("2023-12-31"),
          },
          author: "john.doe",
        },
        sorting: {
          field: "relevance",
          direction: "DESC",
        },
      };

      expect(context.query.value).toBe("test query");
      expect(context.filters.spaceKey).toBe("TEST");
      expect(context.filters.contentType).toBe("page");
      expect(context.sorting.field).toBe("relevance");
    });

    test("should define correct search context structure with CQLQuery", () => {
      const context: SearchContext = {
        query: new CQLQuery('text ~ "test" AND space.key = "TEST"'),
        filters: {
          contentType: "blogpost",
        },
        sorting: {
          field: "created",
          direction: "ASC",
        },
      };

      expect(context.query.value).toBe('text ~ "test" AND space.key = "TEST"');
      expect(context.filters.contentType).toBe("blogpost");
      expect(context.sorting.direction).toBe("ASC");
    });

    test("should support different sorting options", () => {
      const relevanceSort: SearchContext = {
        query: new SearchQuery("test"),
        filters: {},
        sorting: { field: "relevance", direction: "DESC" },
      };

      const createdSort: SearchContext = {
        query: new SearchQuery("test"),
        filters: {},
        sorting: { field: "created", direction: "ASC" },
      };

      const modifiedSort: SearchContext = {
        query: new SearchQuery("test"),
        filters: {},
        sorting: { field: "modified", direction: "DESC" },
      };

      const titleSort: SearchContext = {
        query: new SearchQuery("test"),
        filters: {},
        sorting: { field: "title", direction: "ASC" },
      };

      expect(relevanceSort.sorting.field).toBe("relevance");
      expect(createdSort.sorting.field).toBe("created");
      expect(modifiedSort.sorting.field).toBe("modified");
      expect(titleSort.sorting.field).toBe("title");
    });

    test("should handle optional filters", () => {
      const minimalContext: SearchContext = {
        query: new SearchQuery("test"),
        filters: {},
        sorting: { field: "relevance", direction: "DESC" },
      };

      expect(minimalContext.filters.spaceKey).toBeUndefined();
      expect(minimalContext.filters.contentType).toBeUndefined();
      expect(minimalContext.filters.dateRange).toBeUndefined();
      expect(minimalContext.filters.author).toBeUndefined();
    });

    test("should handle partial date ranges", () => {
      const fromOnlyContext: SearchContext = {
        query: new SearchQuery("test"),
        filters: {
          dateRange: {
            from: new Date("2023-01-01"),
          },
        },
        sorting: { field: "relevance", direction: "DESC" },
      };

      const toOnlyContext: SearchContext = {
        query: new SearchQuery("test"),
        filters: {
          dateRange: {
            to: new Date("2023-12-31"),
          },
        },
        sorting: { field: "relevance", direction: "DESC" },
      };

      expect(fromOnlyContext.filters.dateRange?.from).toBeInstanceOf(Date);
      expect(fromOnlyContext.filters.dateRange?.to).toBeUndefined();
      expect(toOnlyContext.filters.dateRange?.from).toBeUndefined();
      expect(toOnlyContext.filters.dateRange?.to).toBeInstanceOf(Date);
    });
  });

  describe("SearchStatistics", () => {
    test("should define correct search statistics structure", () => {
      const stats: SearchStatistics = {
        totalResults: 150,
        searchTime: 0.045,
        resultsByType: {
          pages: 120,
          blogposts: 20,
          comments: 8,
          attachments: 2,
        },
        resultsBySpace: [
          {
            spaceKey: "TEST",
            spaceName: "Test Space",
            count: 100,
          },
          {
            spaceKey: "DEV",
            spaceName: "Development Space",
            count: 50,
          },
        ],
      };

      expect(stats.totalResults).toBe(150);
      expect(stats.searchTime).toBe(0.045);
      expect(stats.resultsByType.pages).toBe(120);
      expect(stats.resultsBySpace).toHaveLength(2);
      expect(stats.resultsBySpace[0].spaceKey).toBe("TEST");
    });

    test("should validate statistics consistency", () => {
      const stats: SearchStatistics = {
        totalResults: 100,
        searchTime: 0.025,
        resultsByType: {
          pages: 70,
          blogposts: 20,
          comments: 8,
          attachments: 2,
        },
        resultsBySpace: [
          {
            spaceKey: "SPACE1",
            spaceName: "Space 1",
            count: 60,
          },
          {
            spaceKey: "SPACE2",
            spaceName: "Space 2",
            count: 40,
          },
        ],
      };

      const typeTotal =
        stats.resultsByType.pages +
        stats.resultsByType.blogposts +
        stats.resultsByType.comments +
        stats.resultsByType.attachments;

      const spaceTotal = stats.resultsBySpace.reduce(
        (sum, space) => sum + space.count,
        0,
      );

      expect(typeTotal).toBe(100);
      expect(spaceTotal).toBe(100);
      expect(stats.totalResults).toBe(typeTotal);
      expect(stats.totalResults).toBe(spaceTotal);
    });

    test("should handle empty results", () => {
      const emptyStats: SearchStatistics = {
        totalResults: 0,
        searchTime: 0.001,
        resultsByType: {
          pages: 0,
          blogposts: 0,
          comments: 0,
          attachments: 0,
        },
        resultsBySpace: [],
      };

      expect(emptyStats.totalResults).toBe(0);
      expect(emptyStats.resultsBySpace).toHaveLength(0);
    });

    test("should handle performance metrics", () => {
      const fastSearch: SearchStatistics = {
        totalResults: 10,
        searchTime: 0.005,
        resultsByType: { pages: 10, blogposts: 0, comments: 0, attachments: 0 },
        resultsBySpace: [],
      };

      const slowSearch: SearchStatistics = {
        totalResults: 1000,
        searchTime: 2.5,
        resultsByType: {
          pages: 800,
          blogposts: 150,
          comments: 40,
          attachments: 10,
        },
        resultsBySpace: [],
      };

      expect(fastSearch.searchTime).toBeLessThan(0.01);
      expect(slowSearch.searchTime).toBeGreaterThan(1.0);
      expect(slowSearch.totalResults).toBeGreaterThan(fastSearch.totalResults);
    });
  });

  describe("PaginationInfo", () => {
    test("should define correct pagination structure", () => {
      const pagination: PaginationInfo = {
        start: 0,
        limit: 25,
        size: 25,
        hasMore: true,
        total: 150,
      };

      expect(pagination.start).toBe(0);
      expect(pagination.limit).toBe(25);
      expect(pagination.size).toBe(25);
      expect(pagination.hasMore).toBe(true);
      expect(pagination.total).toBe(150);
    });

    test("should handle different pagination scenarios", () => {
      const firstPage: PaginationInfo = {
        start: 0,
        limit: 10,
        size: 10,
        hasMore: true,
        total: 50,
      };

      const middlePage: PaginationInfo = {
        start: 20,
        limit: 10,
        size: 10,
        hasMore: true,
        total: 50,
      };

      const lastPage: PaginationInfo = {
        start: 40,
        limit: 10,
        size: 10,
        hasMore: false,
        total: 50,
      };

      const partialPage: PaginationInfo = {
        start: 45,
        limit: 10,
        size: 5,
        hasMore: false,
        total: 50,
      };

      expect(firstPage.start).toBe(0);
      expect(middlePage.start).toBe(20);
      expect(lastPage.hasMore).toBe(false);
      expect(partialPage.size).toBeLessThan(partialPage.limit);
    });

    test("should handle optional total", () => {
      const paginationWithoutTotal: PaginationInfo = {
        start: 0,
        limit: 25,
        size: 25,
        hasMore: true,
      };

      expect(paginationWithoutTotal.total).toBeUndefined();
    });

    test("should validate pagination logic", () => {
      const pagination: PaginationInfo = {
        start: 20,
        limit: 10,
        size: 10,
        hasMore: true,
        total: 100,
      };

      const currentPage = Math.floor(pagination.start / pagination.limit) + 1;
      const totalPages = pagination.total
        ? Math.ceil(pagination.total / pagination.limit)
        : undefined;

      expect(currentPage).toBe(3); // Page 3 (start=20, limit=10)
      expect(totalPages).toBe(10); // 100 total / 10 per page
      expect(pagination.hasMore).toBe(true);
    });
  });

  describe("Search model integration", () => {
    test("should work together in a complete search scenario", () => {
      const searchContext: SearchContext = {
        query: new SearchQuery("confluence documentation"),
        filters: {
          spaceKey: "DOC",
          contentType: "page",
          dateRange: {
            from: new Date("2023-01-01"),
            to: new Date("2023-12-31"),
          },
        },
        sorting: {
          field: "relevance",
          direction: "DESC",
        },
      };

      const searchResults: SearchResult[] = [
        {
          content: {
            id: "1",
            type: "page",
            status: "current",
            title: "Confluence Documentation Guide",
            spaceKey: "DOC",
            spaceName: "Documentation",
            authorId: "admin",
            authorDisplayName: "Administrator",
            createdAt: new Date("2023-06-01"),
            updatedAt: new Date("2023-06-15"),
            version: { number: 3, createdAt: new Date("2023-06-15") },
            links: {
              webui: "/spaces/DOC/pages/1",
              self: "/rest/api/content/1",
              editui: "/pages/edit-v2.action?pageId=1",
            },
          },
          excerpt: "Complete guide to Confluence documentation...",
          score: 0.95,
          highlights: {
            title: ["<mark>Confluence</mark> <mark>Documentation</mark> Guide"],
            content: [
              "Complete guide to <mark>Confluence</mark> <mark>documentation</mark>",
            ],
          },
        },
      ];

      const searchStats: SearchStatistics = {
        totalResults: 25,
        searchTime: 0.032,
        resultsByType: {
          pages: 25,
          blogposts: 0,
          comments: 0,
          attachments: 0,
        },
        resultsBySpace: [
          {
            spaceKey: "DOC",
            spaceName: "Documentation",
            count: 25,
          },
        ],
      };

      const pagination: PaginationInfo = {
        start: 0,
        limit: 10,
        size: 10,
        hasMore: true,
        total: 25,
      };

      expect(searchContext.query.value).toBe("confluence documentation");
      expect(searchResults[0].content.spaceKey).toBe("DOC");
      expect(searchStats.totalResults).toBe(25);
      expect(pagination.hasMore).toBe(true);
    });

    test("should handle CQL-based search scenario", () => {
      const cqlQuery = CQLQuery.text("API documentation")
        .and(CQLQuery.space("DEV"))
        .and(CQLQuery.type("page"))
        .orderBy("lastModified", "DESC");

      const searchContext: SearchContext = {
        query: cqlQuery,
        filters: {},
        sorting: {
          field: "modified",
          direction: "DESC",
        },
      };

      expect(searchContext.query.value).toContain('text ~ "API documentation"');
      expect(searchContext.query.value).toContain('space.key = "DEV"');
      expect(searchContext.query.value).toContain('type = "page"');
      expect(searchContext.query.value).toContain("ORDER BY lastModified DESC");
    });
  });
});
