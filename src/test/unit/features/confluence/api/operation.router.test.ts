import { describe, test, expect, beforeEach } from "bun:test";
import { ConfluenceOperationRouter, defaultOperationRouter, type ConfluenceOperation } from "../../../../../features/confluence/api/operation.router";

describe("ConfluenceOperationRouter", () => {
  let router: ConfluenceOperationRouter;

  beforeEach(() => {
    router = new ConfluenceOperationRouter();
  });

  describe("Constructor", () => {
    test("should create router with default configuration", () => {
      expect(router).toBeInstanceOf(ConfluenceOperationRouter);
    });

    test("should use default operation mappings", () => {
      expect(router.getVersionForOperation("search")).toBe("v1");
      expect(router.getVersionForOperation("getSpaces")).toBe("v2");
      expect(router.getVersionForOperation("getPage")).toBe("v2");
      expect(router.getVersionForOperation("createPage")).toBe("v2");
      expect(router.getVersionForOperation("updatePage")).toBe("v2");
    });

    test("should accept custom mappings", () => {
      const customRouter = new ConfluenceOperationRouter({
        customMappings: {
          search: "v2",
          getSpaces: "v1"
        }
      });

      expect(customRouter.getVersionForOperation("search")).toBe("v2");
      expect(customRouter.getVersionForOperation("getSpaces")).toBe("v1");
      // Other operations should remain default
      expect(customRouter.getVersionForOperation("getPage")).toBe("v2");
    });

    test("should accept custom fallback version", () => {
      const customRouter = new ConfluenceOperationRouter({
        fallbackVersion: "v1"
      });

      // Test with a non-existent operation
      expect(customRouter.getVersionForOperation("nonExistent" as ConfluenceOperation)).toBe("v1");
    });
  });

  describe("getVersionForOperation", () => {
    test("should return v1 for search operations", () => {
      expect(router.getVersionForOperation("search")).toBe("v1");
    });

    test("should return v2 for CRUD operations", () => {
      expect(router.getVersionForOperation("getSpaces")).toBe("v2");
      expect(router.getVersionForOperation("getPage")).toBe("v2");
      expect(router.getVersionForOperation("createPage")).toBe("v2");
      expect(router.getVersionForOperation("updatePage")).toBe("v2");
      expect(router.getVersionForOperation("deletePage")).toBe("v2");
      expect(router.getVersionForOperation("getPageComments")).toBe("v2");
    });

    test("should return fallback version for unmapped operations", () => {
      expect(router.getVersionForOperation("nonExistent" as ConfluenceOperation)).toBe("v2");
    });
  });

  describe("isV1Operation", () => {
    test("should return true for v1 operations", () => {
      expect(router.isV1Operation("search")).toBe(true);
    });

    test("should return false for v2 operations", () => {
      expect(router.isV1Operation("getSpaces")).toBe(false);
      expect(router.isV1Operation("getPage")).toBe(false);
      expect(router.isV1Operation("createPage")).toBe(false);
    });
  });

  describe("isV2Operation", () => {
    test("should return true for v2 operations", () => {
      expect(router.isV2Operation("getSpaces")).toBe(true);
      expect(router.isV2Operation("getPage")).toBe(true);
      expect(router.isV2Operation("createPage")).toBe(true);
    });

    test("should return false for v1 operations", () => {
      expect(router.isV2Operation("search")).toBe(false);
    });
  });

  describe("getOperationsForVersion", () => {
    test("should return v1 operations", () => {
      const v1Operations = router.getOperationsForVersion("v1");
      expect(v1Operations).toContain("search");
      expect(v1Operations).not.toContain("getSpaces");
    });

    test("should return v2 operations", () => {
      const v2Operations = router.getOperationsForVersion("v2");
      expect(v2Operations).toContain("getSpaces");
      expect(v2Operations).toContain("getPage");
      expect(v2Operations).toContain("createPage");
      expect(v2Operations).not.toContain("search");
    });

    test("should return empty array for non-existent version", () => {
      const operations = router.getOperationsForVersion("v3" as "v1" | "v2");
      expect(operations).toEqual([]);
    });
  });

  describe("getOperationMap", () => {
    test("should return copy of operation mapping", () => {
      const operationMap = router.getOperationMap();
      expect(operationMap.search).toBe("v1");
      expect(operationMap.getSpaces).toBe("v2");

      // Verify it's a copy, not reference
      operationMap.search = "v2";
      expect(router.getVersionForOperation("search")).toBe("v1");
    });
  });

  describe("setOperationVersion", () => {
    test("should update operation mapping", () => {
      expect(router.getVersionForOperation("search")).toBe("v1");
      
      router.setOperationVersion("search", "v2");
      expect(router.getVersionForOperation("search")).toBe("v2");
    });

    test("should update multiple operations", () => {
      router.setOperationVersion("search", "v2");
      router.setOperationVersion("getSpaces", "v1");

      expect(router.getVersionForOperation("search")).toBe("v2");
      expect(router.getVersionForOperation("getSpaces")).toBe("v1");
    });
  });

  describe("resetToDefaults", () => {
    test("should reset all mappings to defaults", () => {
      // Modify some mappings
      router.setOperationVersion("search", "v2");
      router.setOperationVersion("getSpaces", "v1");

      expect(router.getVersionForOperation("search")).toBe("v2");
      expect(router.getVersionForOperation("getSpaces")).toBe("v1");

      // Reset to defaults
      router.resetToDefaults();

      expect(router.getVersionForOperation("search")).toBe("v1");
      expect(router.getVersionForOperation("getSpaces")).toBe("v2");
    });
  });

  describe("getVersionDistribution", () => {
    test("should return correct distribution for default mappings", () => {
      const distribution = router.getVersionDistribution();
      expect(distribution.v1).toBe(1); // Only search
      expect(distribution.v2).toBe(9); // All other operations
    });

    test("should update distribution when mappings change", () => {
      router.setOperationVersion("getSpaces", "v1");
      router.setOperationVersion("getPage", "v1");

      const distribution = router.getVersionDistribution();
      expect(distribution.v1).toBe(3); // search, getSpaces, getPage
      expect(distribution.v2).toBe(7); // Remaining operations
    });
  });
});

describe("Default Operation Router", () => {
  test("should be properly configured", () => {
    expect(defaultOperationRouter).toBeInstanceOf(ConfluenceOperationRouter);
    expect(defaultOperationRouter.getVersionForOperation("search")).toBe("v1");
    expect(defaultOperationRouter.getVersionForOperation("getSpaces")).toBe("v2");
  });

  test("should be a singleton instance", () => {
    expect(defaultOperationRouter).toBe(defaultOperationRouter);
  });
});

describe("Custom Configuration", () => {
  test("should handle partial custom mappings", () => {
    const router = new ConfluenceOperationRouter({
      customMappings: {
        search: "v2"
        // Only override search, others should remain default
      }
    });

    expect(router.getVersionForOperation("search")).toBe("v2");
    expect(router.getVersionForOperation("getSpaces")).toBe("v2");
    expect(router.getVersionForOperation("getPage")).toBe("v2");
  });

  test("should handle empty custom mappings", () => {
    const router = new ConfluenceOperationRouter({
      customMappings: {}
    });

    expect(router.getVersionForOperation("search")).toBe("v1");
    expect(router.getVersionForOperation("getSpaces")).toBe("v2");
  });

  test("should handle undefined custom mappings", () => {
    const router = new ConfluenceOperationRouter({
      customMappings: {
        search: undefined
      }
    });

    // Should ignore undefined values and keep defaults
    expect(router.getVersionForOperation("search")).toBe("v1");
  });

  test("should combine custom mappings with fallback version", () => {
    const router = new ConfluenceOperationRouter({
      customMappings: {
        search: "v2"
      },
      fallbackVersion: "v1"
    });

    expect(router.getVersionForOperation("search")).toBe("v2");
    expect(router.getVersionForOperation("nonExistent" as ConfluenceOperation)).toBe("v1");
  });
});

describe("Edge Cases", () => {
  let router: ConfluenceOperationRouter;

  beforeEach(() => {
    router = new ConfluenceOperationRouter();
  });

  test("should handle all defined operations", () => {
    const operations: ConfluenceOperation[] = [
      "search",
      "getSpaces",
      "getPage",
      "createPage",
      "updatePage",
      "getPageComments",
      "deletePage",
      "getSpace",
      "createSpace",
      "updateSpace"
    ];

    for (const operation of operations) {
      const version = router.getVersionForOperation(operation);
      expect(version === "v1" || version === "v2").toBe(true);
    }
  });

  test("should maintain consistency between is* methods", () => {
    const operations: ConfluenceOperation[] = [
      "search",
      "getSpaces",
      "getPage",
      "createPage"
    ];

    for (const operation of operations) {
      const isV1 = router.isV1Operation(operation);
      const isV2 = router.isV2Operation(operation);
      
      // Should be exactly one of v1 or v2, not both or neither
      expect(isV1 !== isV2).toBe(true);
    }
  });
}); 