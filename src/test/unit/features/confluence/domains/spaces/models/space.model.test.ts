import { describe, expect, test } from "bun:test";
import type {
  Space,
  SpaceLinks,
  SpacePermissions,
  SpaceSettings,
} from "@features/confluence/domains/spaces/models";
import {
  SpaceKey,
  SpaceName,
} from "@features/confluence/domains/spaces/models";

describe("Space Model", () => {
  describe("Space interface", () => {
    test("should define correct space structure", () => {
      const space: Space = {
        id: "123456",
        key: new SpaceKey("TEST"),
        name: new SpaceName("Test Space"),
        type: "global",
        status: "current",
        description: "A test space",
        createdAt: new Date("2023-01-01T00:00:00.000Z"),
        updatedAt: new Date("2023-01-01T00:00:00.000Z"),
        permissions: {
          canView: true,
          canEdit: true,
          canAdmin: false,
          canCreatePages: true,
          canDeletePages: false,
        },
        settings: {
          isPublic: false,
          allowAnonymousAccess: false,
          enableComments: true,
          enableAttachments: true,
        },
        links: {
          self: "/rest/api/space/TEST",
          webui: "/spaces/TEST",
          editui: "/spaces/TEST/edit",
        },
        homepage: {
          id: "789",
          title: "Home",
          webui: "/spaces/TEST/pages/789",
        },
        icon: {
          path: "/path/to/icon",
          width: 48,
          height: 48,
          isDefault: false,
        },
      };

      expect(space.id).toBe("123456");
      expect(space.key.value).toBe("TEST");
      expect(space.name.value).toBe("Test Space");
      expect(space.type).toBe("global");
      expect(space.status).toBe("current");
    });

    test("should support different space types", () => {
      const globalSpace: Space = {
        id: "1",
        key: new SpaceKey("GLOBAL"),
        name: new SpaceName("Global Space"),
        type: "global",
        status: "current",
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: {
          canView: true,
          canEdit: false,
          canAdmin: false,
          canCreatePages: false,
          canDeletePages: false,
        },
        settings: {
          isPublic: true,
          allowAnonymousAccess: true,
          enableComments: true,
          enableAttachments: true,
        },
        links: {
          self: "/rest/api/space/GLOBAL",
          webui: "/spaces/GLOBAL",
        },
      };

      const personalSpace: Space = {
        id: "2",
        key: new SpaceKey("PERSONAL"),
        name: new SpaceName("Personal Space"),
        type: "personal",
        status: "current",
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: {
          canView: true,
          canEdit: true,
          canAdmin: true,
          canCreatePages: true,
          canDeletePages: true,
        },
        settings: {
          isPublic: false,
          allowAnonymousAccess: false,
          enableComments: true,
          enableAttachments: true,
        },
        links: {
          self: "/rest/api/space/PERSONAL",
          webui: "/spaces/PERSONAL",
        },
      };

      expect(globalSpace.type).toBe("global");
      expect(personalSpace.type).toBe("personal");
    });

    test("should support different space statuses", () => {
      const currentSpace: Space = {
        id: "1",
        key: new SpaceKey("CURRENT"),
        name: new SpaceName("Current Space"),
        type: "global",
        status: "current",
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: {
          canView: true,
          canEdit: false,
          canAdmin: false,
          canCreatePages: false,
          canDeletePages: false,
        },
        settings: {
          isPublic: true,
          allowAnonymousAccess: false,
          enableComments: true,
          enableAttachments: true,
        },
        links: {
          self: "/rest/api/space/CURRENT",
          webui: "/spaces/CURRENT",
        },
      };

      const archivedSpace: Space = {
        id: "2",
        key: new SpaceKey("ARCHIVED"),
        name: new SpaceName("Archived Space"),
        type: "global",
        status: "archived",
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: {
          canView: true,
          canEdit: false,
          canAdmin: false,
          canCreatePages: false,
          canDeletePages: false,
        },
        settings: {
          isPublic: false,
          allowAnonymousAccess: false,
          enableComments: false,
          enableAttachments: false,
        },
        links: {
          self: "/rest/api/space/ARCHIVED",
          webui: "/spaces/ARCHIVED",
        },
      };

      expect(currentSpace.status).toBe("current");
      expect(archivedSpace.status).toBe("archived");
    });

    test("should handle optional properties", () => {
      const minimalSpace: Space = {
        id: "1",
        key: new SpaceKey("MIN"),
        name: new SpaceName("Minimal Space"),
        type: "global",
        status: "current",
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: {
          canView: true,
          canEdit: false,
          canAdmin: false,
          canCreatePages: false,
          canDeletePages: false,
        },
        settings: {
          isPublic: false,
          allowAnonymousAccess: false,
          enableComments: true,
          enableAttachments: true,
        },
        links: {
          self: "/rest/api/space/MIN",
          webui: "/spaces/MIN",
        },
      };

      expect(minimalSpace.description).toBeUndefined();
      expect(minimalSpace.homepage).toBeUndefined();
      expect(minimalSpace.icon).toBeUndefined();
    });
  });

  describe("SpacePermissions", () => {
    test("should define correct permissions structure", () => {
      const permissions: SpacePermissions = {
        canView: true,
        canEdit: true,
        canAdmin: false,
        canCreatePages: true,
        canDeletePages: false,
      };

      expect(permissions.canView).toBe(true);
      expect(permissions.canEdit).toBe(true);
      expect(permissions.canAdmin).toBe(false);
      expect(permissions.canCreatePages).toBe(true);
      expect(permissions.canDeletePages).toBe(false);
    });

    test("should support all permission combinations", () => {
      const adminPermissions: SpacePermissions = {
        canView: true,
        canEdit: true,
        canAdmin: true,
        canCreatePages: true,
        canDeletePages: true,
      };

      const readOnlyPermissions: SpacePermissions = {
        canView: true,
        canEdit: false,
        canAdmin: false,
        canCreatePages: false,
        canDeletePages: false,
      };

      expect(adminPermissions.canAdmin).toBe(true);
      expect(readOnlyPermissions.canEdit).toBe(false);
    });
  });

  describe("SpaceSettings", () => {
    test("should define correct settings structure", () => {
      const settings: SpaceSettings = {
        isPublic: true,
        allowAnonymousAccess: false,
        enableComments: true,
        enableAttachments: true,
      };

      expect(settings.isPublic).toBe(true);
      expect(settings.allowAnonymousAccess).toBe(false);
      expect(settings.enableComments).toBe(true);
      expect(settings.enableAttachments).toBe(true);
    });

    test("should support different setting combinations", () => {
      const publicSettings: SpaceSettings = {
        isPublic: true,
        allowAnonymousAccess: true,
        enableComments: true,
        enableAttachments: true,
      };

      const privateSettings: SpaceSettings = {
        isPublic: false,
        allowAnonymousAccess: false,
        enableComments: false,
        enableAttachments: false,
      };

      expect(publicSettings.isPublic).toBe(true);
      expect(privateSettings.isPublic).toBe(false);
    });
  });

  describe("SpaceLinks", () => {
    test("should define correct links structure", () => {
      const links: SpaceLinks = {
        self: "/rest/api/space/TEST",
        webui: "/spaces/TEST",
        editui: "/spaces/TEST/edit",
        context: "/wiki",
      };

      expect(links.self).toBe("/rest/api/space/TEST");
      expect(links.webui).toBe("/spaces/TEST");
      expect(links.editui).toBe("/spaces/TEST/edit");
      expect(links.context).toBe("/wiki");
    });

    test("should handle optional link properties", () => {
      const minimalLinks: SpaceLinks = {
        self: "/rest/api/space/TEST",
        webui: "/spaces/TEST",
      };

      expect(minimalLinks.self).toBe("/rest/api/space/TEST");
      expect(minimalLinks.webui).toBe("/spaces/TEST");
      expect(minimalLinks.editui).toBeUndefined();
      expect(minimalLinks.context).toBeUndefined();
    });
  });

  describe("Space model validation", () => {
    test("should validate space with all required fields", () => {
      const space: Space = {
        id: "123",
        key: new SpaceKey("TEST"),
        name: new SpaceName("Test Space"),
        type: "global",
        status: "current",
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: {
          canView: true,
          canEdit: false,
          canAdmin: false,
          canCreatePages: false,
          canDeletePages: false,
        },
        settings: {
          isPublic: false,
          allowAnonymousAccess: false,
          enableComments: true,
          enableAttachments: true,
        },
        links: {
          self: "/rest/api/space/TEST",
          webui: "/spaces/TEST",
        },
      };

      expect(space.id).toBeTruthy();
      expect(space.key.value).toBeTruthy();
      expect(space.name.value).toBeTruthy();
      expect(space.type).toBeTruthy();
      expect(space.status).toBeTruthy();
      expect(space.createdAt).toBeInstanceOf(Date);
      expect(space.updatedAt).toBeInstanceOf(Date);
    });

    test("should handle description as string", () => {
      const space: Space = {
        id: "123",
        key: new SpaceKey("TEST"),
        name: new SpaceName("Test Space"),
        type: "global",
        status: "current",
        description: "A detailed description of the space",
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: {
          canView: true,
          canEdit: false,
          canAdmin: false,
          canCreatePages: false,
          canDeletePages: false,
        },
        settings: {
          isPublic: false,
          allowAnonymousAccess: false,
          enableComments: true,
          enableAttachments: true,
        },
        links: {
          self: "/rest/api/space/TEST",
          webui: "/spaces/TEST",
        },
      };

      expect(space.description).toBe("A detailed description of the space");
    });

    test("should handle homepage object", () => {
      const space: Space = {
        id: "123",
        key: new SpaceKey("TEST"),
        name: new SpaceName("Test Space"),
        type: "global",
        status: "current",
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: {
          canView: true,
          canEdit: false,
          canAdmin: false,
          canCreatePages: false,
          canDeletePages: false,
        },
        settings: {
          isPublic: false,
          allowAnonymousAccess: false,
          enableComments: true,
          enableAttachments: true,
        },
        links: {
          self: "/rest/api/space/TEST",
          webui: "/spaces/TEST",
        },
        homepage: {
          id: "456",
          title: "Welcome Page",
          webui: "/spaces/TEST/pages/456",
        },
      };

      expect(space.homepage?.id).toBe("456");
      expect(space.homepage?.title).toBe("Welcome Page");
      expect(space.homepage?.webui).toBe("/spaces/TEST/pages/456");
    });

    test("should handle icon object", () => {
      const space: Space = {
        id: "123",
        key: new SpaceKey("TEST"),
        name: new SpaceName("Test Space"),
        type: "global",
        status: "current",
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: {
          canView: true,
          canEdit: false,
          canAdmin: false,
          canCreatePages: false,
          canDeletePages: false,
        },
        settings: {
          isPublic: false,
          allowAnonymousAccess: false,
          enableComments: true,
          enableAttachments: true,
        },
        links: {
          self: "/rest/api/space/TEST",
          webui: "/spaces/TEST",
        },
        icon: {
          path: "/download/attachments/123/icon.png",
          width: 48,
          height: 48,
          isDefault: false,
        },
      };

      expect(space.icon?.path).toBe("/download/attachments/123/icon.png");
      expect(space.icon?.width).toBe(48);
      expect(space.icon?.height).toBe(48);
      expect(space.icon?.isDefault).toBe(false);
    });

    test("should handle date objects correctly", () => {
      const createdDate = new Date("2023-01-01T00:00:00.000Z");
      const updatedDate = new Date("2023-06-01T00:00:00.000Z");

      const space: Space = {
        id: "123",
        key: new SpaceKey("TEST"),
        name: new SpaceName("Test Space"),
        type: "global",
        status: "current",
        createdAt: createdDate,
        updatedAt: updatedDate,
        permissions: {
          canView: true,
          canEdit: false,
          canAdmin: false,
          canCreatePages: false,
          canDeletePages: false,
        },
        settings: {
          isPublic: false,
          allowAnonymousAccess: false,
          enableComments: true,
          enableAttachments: true,
        },
        links: {
          self: "/rest/api/space/TEST",
          webui: "/spaces/TEST",
        },
      };

      expect(space.createdAt).toBe(createdDate);
      expect(space.updatedAt).toBe(updatedDate);
      expect(space.updatedAt.getTime()).toBeGreaterThan(
        space.createdAt.getTime(),
      );
    });
  });
});
