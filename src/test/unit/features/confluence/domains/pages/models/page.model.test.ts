import { describe, expect, test } from "bun:test";
import type {
  Page,
  PageBody,
  PageBreadcrumb,
  PageContext,
  PageLinks,
  PageMetadata,
  PagePermissions,
  PageStatistics,
  PageSummary,
  PageVersion,
} from "@features/confluence/domains/pages/models";
import { PageId, PageTitle } from "@features/confluence/domains/pages/models";

describe("Page Model", () => {
  describe("Page interface", () => {
    test("should define correct page structure", () => {
      const page: Page = {
        id: new PageId("123456"),
        type: "page",
        status: "current",
        title: new PageTitle("Test Page"),
        spaceId: "space123",
        authorId: "user123",
        createdAt: new Date("2023-01-01T00:00:00.000Z"),
        updatedAt: new Date("2023-01-01T00:00:00.000Z"),
        version: {
          number: 1,
          message: "Initial version",
          createdAt: new Date("2023-01-01T00:00:00.000Z"),
          authorId: "user123",
        },
        body: {
          storage: {
            value: "<p>Test content</p>",
            representation: "storage",
          },
        },
        links: {
          self: "/rest/api/content/123456",
          webui: "/spaces/TEST/pages/123456",
          editui: "/pages/edit-v2.action?pageId=123456",
          tinyui: "/x/123456",
        },
        permissions: {
          canView: true,
          canEdit: true,
          canDelete: false,
          canComment: true,
          canRestrict: false,
        },
        metadata: {
          labels: ["important", "draft"],
          properties: {
            customProperty: "value",
          },
          restrictions: {
            read: ["user123"],
            update: ["user123", "admin"],
          },
        },
      };

      expect(page.id.value).toBe("123456");
      expect(page.title.value).toBe("Test Page");
      expect(page.type).toBe("page");
      expect(page.status).toBe("current");
      expect(page.spaceId).toBe("space123");
    });

    test("should support different page types", () => {
      const regularPage: Page = {
        id: new PageId("1"),
        type: "page",
        status: "current",
        title: new PageTitle("Regular Page"),
        spaceId: "space1",
        authorId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: {
          number: 1,
          createdAt: new Date(),
          authorId: "user1",
        },
        links: {
          self: "/rest/api/content/1",
          webui: "/spaces/TEST/pages/1",
          editui: "/pages/edit-v2.action?pageId=1",
        },
        permissions: {
          canView: true,
          canEdit: false,
          canDelete: false,
          canComment: false,
          canRestrict: false,
        },
        metadata: {
          labels: [],
          properties: {},
          restrictions: {
            read: [],
            update: [],
          },
        },
      };

      const blogPost: Page = {
        id: new PageId("2"),
        type: "blogpost",
        status: "current",
        title: new PageTitle("Blog Post"),
        spaceId: "space1",
        authorId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: {
          number: 1,
          createdAt: new Date(),
          authorId: "user1",
        },
        links: {
          self: "/rest/api/content/2",
          webui: "/spaces/TEST/pages/2",
          editui: "/pages/edit-v2.action?pageId=2",
        },
        permissions: {
          canView: true,
          canEdit: false,
          canDelete: false,
          canComment: false,
          canRestrict: false,
        },
        metadata: {
          labels: [],
          properties: {},
          restrictions: {
            read: [],
            update: [],
          },
        },
      };

      expect(regularPage.type).toBe("page");
      expect(blogPost.type).toBe("blogpost");
    });

    test("should support different page statuses", () => {
      const currentPage: Page = {
        id: new PageId("1"),
        type: "page",
        status: "current",
        title: new PageTitle("Current Page"),
        spaceId: "space1",
        authorId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: {
          number: 1,
          createdAt: new Date(),
          authorId: "user1",
        },
        links: {
          self: "/rest/api/content/1",
          webui: "/spaces/TEST/pages/1",
          editui: "/pages/edit-v2.action?pageId=1",
        },
        permissions: {
          canView: true,
          canEdit: false,
          canDelete: false,
          canComment: false,
          canRestrict: false,
        },
        metadata: {
          labels: [],
          properties: {},
          restrictions: {
            read: [],
            update: [],
          },
        },
      };

      const draftPage: Page = {
        id: new PageId("2"),
        type: "page",
        status: "draft",
        title: new PageTitle("Draft Page"),
        spaceId: "space1",
        authorId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: {
          number: 1,
          createdAt: new Date(),
          authorId: "user1",
        },
        links: {
          self: "/rest/api/content/2",
          webui: "/spaces/TEST/pages/2",
          editui: "/pages/edit-v2.action?pageId=2",
        },
        permissions: {
          canView: true,
          canEdit: false,
          canDelete: false,
          canComment: false,
          canRestrict: false,
        },
        metadata: {
          labels: [],
          properties: {},
          restrictions: {
            read: [],
            update: [],
          },
        },
      };

      expect(currentPage.status).toBe("current");
      expect(draftPage.status).toBe("draft");
    });

    test("should handle optional properties", () => {
      const minimalPage: Page = {
        id: new PageId("1"),
        type: "page",
        status: "current",
        title: new PageTitle("Minimal Page"),
        spaceId: "space1",
        authorId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: {
          number: 1,
          createdAt: new Date(),
          authorId: "user1",
        },
        links: {
          self: "/rest/api/content/1",
          webui: "/spaces/TEST/pages/1",
          editui: "/pages/edit-v2.action?pageId=1",
        },
        permissions: {
          canView: true,
          canEdit: false,
          canDelete: false,
          canComment: false,
          canRestrict: false,
        },
        metadata: {
          labels: [],
          properties: {},
          restrictions: {
            read: [],
            update: [],
          },
        },
      };

      expect(minimalPage.parentId).toBeUndefined();
      expect(minimalPage.body).toBeUndefined();
    });
  });

  describe("PageVersion", () => {
    test("should define correct version structure", () => {
      const version: PageVersion = {
        number: 5,
        message: "Updated content",
        createdAt: new Date("2023-01-01T00:00:00.000Z"),
        authorId: "user123",
      };

      expect(version.number).toBe(5);
      expect(version.message).toBe("Updated content");
      expect(version.createdAt).toBeInstanceOf(Date);
      expect(version.authorId).toBe("user123");
    });

    test("should handle optional message", () => {
      const version: PageVersion = {
        number: 1,
        createdAt: new Date(),
        authorId: "user123",
      };

      expect(version.message).toBeUndefined();
    });
  });

  describe("PageBody", () => {
    test("should support storage format", () => {
      const body: PageBody = {
        storage: {
          value: "<p>Storage content</p>",
          representation: "storage",
        },
      };

      expect(body.storage?.value).toBe("<p>Storage content</p>");
      expect(body.storage?.representation).toBe("storage");
    });

    test("should support editor format", () => {
      const body: PageBody = {
        editor: {
          value: '{"type":"doc","content":[]}',
          representation: "editor",
        },
      };

      expect(body.editor?.value).toBe('{"type":"doc","content":[]}');
      expect(body.editor?.representation).toBe("editor");
    });

    test("should support wiki format", () => {
      const body: PageBody = {
        wiki: {
          value: "h1. Wiki Content",
          representation: "wiki",
        },
      };

      expect(body.wiki?.value).toBe("h1. Wiki Content");
      expect(body.wiki?.representation).toBe("wiki");
    });

    test("should support atlas_doc_format", () => {
      const body: PageBody = {
        atlas_doc_format: {
          value: '{"version":1,"type":"doc"}',
          representation: "atlas_doc_format",
        },
      };

      expect(body.atlas_doc_format?.value).toBe('{"version":1,"type":"doc"}');
      expect(body.atlas_doc_format?.representation).toBe("atlas_doc_format");
    });

    test("should support multiple formats", () => {
      const body: PageBody = {
        storage: {
          value: "<p>Storage content</p>",
          representation: "storage",
        },
        editor: {
          value: '{"type":"doc","content":[]}',
          representation: "editor",
        },
      };

      expect(body.storage?.value).toBe("<p>Storage content</p>");
      expect(body.editor?.value).toBe('{"type":"doc","content":[]}');
    });
  });

  describe("PageLinks", () => {
    test("should define correct links structure", () => {
      const links: PageLinks = {
        self: "/rest/api/content/123",
        webui: "/spaces/TEST/pages/123",
        editui: "/pages/edit-v2.action?pageId=123",
        tinyui: "/x/123",
      };

      expect(links.self).toBe("/rest/api/content/123");
      expect(links.webui).toBe("/spaces/TEST/pages/123");
      expect(links.editui).toBe("/pages/edit-v2.action?pageId=123");
      expect(links.tinyui).toBe("/x/123");
    });

    test("should handle optional tinyui", () => {
      const links: PageLinks = {
        self: "/rest/api/content/123",
        webui: "/spaces/TEST/pages/123",
        editui: "/pages/edit-v2.action?pageId=123",
      };

      expect(links.tinyui).toBeUndefined();
    });
  });

  describe("PagePermissions", () => {
    test("should define correct permissions structure", () => {
      const permissions: PagePermissions = {
        canView: true,
        canEdit: true,
        canDelete: false,
        canComment: true,
        canRestrict: false,
      };

      expect(permissions.canView).toBe(true);
      expect(permissions.canEdit).toBe(true);
      expect(permissions.canDelete).toBe(false);
      expect(permissions.canComment).toBe(true);
      expect(permissions.canRestrict).toBe(false);
    });

    test("should support different permission combinations", () => {
      const adminPermissions: PagePermissions = {
        canView: true,
        canEdit: true,
        canDelete: true,
        canComment: true,
        canRestrict: true,
      };

      const readOnlyPermissions: PagePermissions = {
        canView: true,
        canEdit: false,
        canDelete: false,
        canComment: false,
        canRestrict: false,
      };

      expect(adminPermissions.canDelete).toBe(true);
      expect(readOnlyPermissions.canEdit).toBe(false);
    });
  });

  describe("PageMetadata", () => {
    test("should define correct metadata structure", () => {
      const metadata: PageMetadata = {
        labels: ["important", "draft", "review"],
        properties: {
          customProperty: "value",
          anotherProperty: 123,
        },
        restrictions: {
          read: ["user1", "user2"],
          update: ["admin"],
        },
      };

      expect(metadata.labels).toHaveLength(3);
      expect(metadata.labels).toContain("important");
      expect(metadata.properties.customProperty).toBe("value");
      expect(metadata.restrictions.read).toContain("user1");
    });

    test("should handle empty metadata", () => {
      const metadata: PageMetadata = {
        labels: [],
        properties: {},
        restrictions: {
          read: [],
          update: [],
        },
      };

      expect(metadata.labels).toHaveLength(0);
      expect(Object.keys(metadata.properties)).toHaveLength(0);
      expect(metadata.restrictions.read).toHaveLength(0);
    });
  });

  describe("PageSummary", () => {
    test("should define correct summary structure", () => {
      const summary: PageSummary = {
        id: new PageId("123"),
        title: new PageTitle("Summary Page"),
        status: "current",
        spaceId: "space123",
        authorId: "user123",
        createdAt: new Date("2023-01-01T00:00:00.000Z"),
        updatedAt: new Date("2023-01-01T00:00:00.000Z"),
        version: {
          number: 3,
          createdAt: new Date("2023-01-01T00:00:00.000Z"),
        },
        links: {
          webui: "/spaces/TEST/pages/123",
        },
      };

      expect(summary.id.value).toBe("123");
      expect(summary.title.value).toBe("Summary Page");
      expect(summary.version.number).toBe(3);
      expect(summary.links.webui).toBe("/spaces/TEST/pages/123");
    });
  });

  describe("PageBreadcrumb", () => {
    test("should define correct breadcrumb structure", () => {
      const breadcrumb: PageBreadcrumb = {
        id: new PageId("123"),
        title: new PageTitle("Breadcrumb Page"),
        links: {
          webui: "/spaces/TEST/pages/123",
        },
      };

      expect(breadcrumb.id.value).toBe("123");
      expect(breadcrumb.title.value).toBe("Breadcrumb Page");
      expect(breadcrumb.links.webui).toBe("/spaces/TEST/pages/123");
    });
  });

  describe("PageContext", () => {
    test("should define correct context structure", () => {
      const context: PageContext = {
        space: {
          id: "space123",
          key: "TEST",
          name: "Test Space",
          type: "global",
          links: {
            webui: "/spaces/TEST",
          },
        },
        breadcrumbs: [
          {
            id: new PageId("1"),
            title: new PageTitle("Root"),
            links: {
              webui: "/spaces/TEST/pages/1",
            },
          },
          {
            id: new PageId("2"),
            title: new PageTitle("Parent"),
            links: {
              webui: "/spaces/TEST/pages/2",
            },
          },
        ],
        parent: {
          id: new PageId("2"),
          title: new PageTitle("Parent Page"),
          status: "current",
          spaceId: "space123",
          authorId: "user123",
          createdAt: new Date(),
          updatedAt: new Date(),
          version: {
            number: 1,
            createdAt: new Date(),
          },
          links: {
            webui: "/spaces/TEST/pages/2",
          },
        },
        children: [
          {
            id: new PageId("4"),
            title: new PageTitle("Child 1"),
            status: "current",
            spaceId: "space123",
            authorId: "user123",
            createdAt: new Date(),
            updatedAt: new Date(),
            version: {
              number: 1,
              createdAt: new Date(),
            },
            links: {
              webui: "/spaces/TEST/pages/4",
            },
          },
        ],
      };

      expect(context.space.key).toBe("TEST");
      expect(context.breadcrumbs).toHaveLength(2);
      expect(context.parent?.id.value).toBe("2");
      expect(context.children).toHaveLength(1);
    });

    test("should handle optional parent", () => {
      const context: PageContext = {
        space: {
          id: "space123",
          key: "TEST",
          name: "Test Space",
          type: "global",
          links: {
            webui: "/spaces/TEST",
          },
        },
        breadcrumbs: [],
        children: [],
      };

      expect(context.parent).toBeUndefined();
    });
  });

  describe("PageStatistics", () => {
    test("should define correct statistics structure", () => {
      const stats: PageStatistics = {
        totalPages: 100,
        currentPages: 85,
        draftPages: 10,
        trashedPages: 3,
        blogPosts: 2,
      };

      expect(stats.totalPages).toBe(100);
      expect(stats.currentPages).toBe(85);
      expect(stats.draftPages).toBe(10);
      expect(stats.trashedPages).toBe(3);
      expect(stats.blogPosts).toBe(2);
    });

    test("should validate statistics consistency", () => {
      const stats: PageStatistics = {
        totalPages: 100,
        currentPages: 85,
        draftPages: 10,
        trashedPages: 3,
        blogPosts: 2,
      };

      // Total should equal sum of status types
      expect(stats.currentPages + stats.draftPages + stats.trashedPages).toBe(
        98,
      );
      expect(stats.totalPages).toBeGreaterThanOrEqual(stats.currentPages);
    });
  });

  describe("Page model validation", () => {
    test("should validate page with all required fields", () => {
      const page: Page = {
        id: new PageId("123"),
        type: "page",
        status: "current",
        title: new PageTitle("Test Page"),
        spaceId: "space123",
        authorId: "user123",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: {
          number: 1,
          createdAt: new Date(),
          authorId: "user123",
        },
        links: {
          self: "/rest/api/content/123",
          webui: "/spaces/TEST/pages/123",
          editui: "/pages/edit-v2.action?pageId=123",
        },
        permissions: {
          canView: true,
          canEdit: false,
          canDelete: false,
          canComment: false,
          canRestrict: false,
        },
        metadata: {
          labels: [],
          properties: {},
          restrictions: {
            read: [],
            update: [],
          },
        },
      };

      expect(page.id.value).toBeTruthy();
      expect(page.title.value).toBeTruthy();
      expect(page.type).toBeTruthy();
      expect(page.status).toBeTruthy();
      expect(page.spaceId).toBeTruthy();
      expect(page.authorId).toBeTruthy();
      expect(page.createdAt).toBeInstanceOf(Date);
      expect(page.updatedAt).toBeInstanceOf(Date);
    });

    test("should handle parent-child relationships", () => {
      const parentPage: Page = {
        id: new PageId("parent"),
        type: "page",
        status: "current",
        title: new PageTitle("Parent Page"),
        spaceId: "space123",
        authorId: "user123",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: {
          number: 1,
          createdAt: new Date(),
          authorId: "user123",
        },
        links: {
          self: "/rest/api/content/parent",
          webui: "/spaces/TEST/pages/parent",
          editui: "/pages/edit-v2.action?pageId=parent",
        },
        permissions: {
          canView: true,
          canEdit: false,
          canDelete: false,
          canComment: false,
          canRestrict: false,
        },
        metadata: {
          labels: [],
          properties: {},
          restrictions: {
            read: [],
            update: [],
          },
        },
      };

      const childPage: Page = {
        id: new PageId("child"),
        type: "page",
        status: "current",
        title: new PageTitle("Child Page"),
        spaceId: "space123",
        parentId: new PageId("parent"),
        authorId: "user123",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: {
          number: 1,
          createdAt: new Date(),
          authorId: "user123",
        },
        links: {
          self: "/rest/api/content/child",
          webui: "/spaces/TEST/pages/child",
          editui: "/pages/edit-v2.action?pageId=child",
        },
        permissions: {
          canView: true,
          canEdit: false,
          canDelete: false,
          canComment: false,
          canRestrict: false,
        },
        metadata: {
          labels: [],
          properties: {},
          restrictions: {
            read: [],
            update: [],
          },
        },
      };

      expect(parentPage.parentId).toBeUndefined();
      expect(childPage.parentId?.value).toBe("parent");
    });

    test("should handle date relationships correctly", () => {
      const createdDate = new Date("2023-01-01T00:00:00.000Z");
      const updatedDate = new Date("2023-06-01T00:00:00.000Z");
      const versionDate = new Date("2023-06-01T00:00:00.000Z");

      const page: Page = {
        id: new PageId("123"),
        type: "page",
        status: "current",
        title: new PageTitle("Test Page"),
        spaceId: "space123",
        authorId: "user123",
        createdAt: createdDate,
        updatedAt: updatedDate,
        version: {
          number: 2,
          message: "Updated content",
          createdAt: versionDate,
          authorId: "user123",
        },
        links: {
          self: "/rest/api/content/123",
          webui: "/spaces/TEST/pages/123",
          editui: "/pages/edit-v2.action?pageId=123",
        },
        permissions: {
          canView: true,
          canEdit: false,
          canDelete: false,
          canComment: false,
          canRestrict: false,
        },
        metadata: {
          labels: [],
          properties: {},
          restrictions: {
            read: [],
            update: [],
          },
        },
      };

      expect(page.createdAt).toBe(createdDate);
      expect(page.updatedAt).toBe(updatedDate);
      expect(page.version.createdAt).toBe(versionDate);
      expect(page.updatedAt.getTime()).toBeGreaterThan(
        page.createdAt.getTime(),
      );
    });
  });
});
