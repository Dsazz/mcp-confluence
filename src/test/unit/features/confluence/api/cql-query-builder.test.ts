import { CqlQueryBuilder } from "@features/confluence/api/cql-query.builder";
import { describe, test, expect } from "bun:test";

describe("CqlQueryBuilder", () => {
  describe("Direct CQL Passthrough", () => {
    test("should pass through simple CQL query unchanged", () => {
      const result = CqlQueryBuilder.buildQuery("text~test");
      expect(result).toBe("text~test");
    });

    test("should pass through complex CQL query unchanged", () => {
      const result = CqlQueryBuilder.buildQuery('text~"Test Hub"');
      expect(result).toBe('text~"Test Hub"');
    });

    test("should pass through CQL with operators", () => {
      const result = CqlQueryBuilder.buildQuery("text~test AND title~config");
      expect(result).toBe("text~test AND title~config");
    });

    test("should trim whitespace from query", () => {
      const result = CqlQueryBuilder.buildQuery("  text~test  ");
      expect(result).toBe("text~test");
    });

    test("should handle empty query with default", () => {
      const result = CqlQueryBuilder.buildQuery("");
      expect(result).toBe("text ~ *");
    });

    test("should handle query with only spaces", () => {
      const result = CqlQueryBuilder.buildQuery("   ");
      expect(result).toBe("text ~ *");
    });

    test("should pass through natural language as-is", () => {
      const result = CqlQueryBuilder.buildQuery("Test Hub");
      expect(result).toBe("Test Hub");
    });
  });

  describe("Space Key Filtering", () => {
    test("should add space key filter to CQL query", () => {
      const result = CqlQueryBuilder.buildQuery("text~test", { spaceKey: "DEV" });
      expect(result).toBe('text~test AND space.key = "DEV"');
    });

    test("should add space key filter to complex query", () => {
      const result = CqlQueryBuilder.buildQuery('text~"Partner Hub"', { spaceKey: "DOCS" });
      expect(result).toBe('text~"Partner Hub" AND space.key = "DOCS"');
    });

    test("should handle space key with special characters", () => {
      const result = CqlQueryBuilder.buildQuery("text~test", { spaceKey: "DEV-TEAM" });
      expect(result).toBe('text~test AND space.key = "DEV-TEAM"');
    });
  });

  describe("Content Type Filtering", () => {
    test("should add type filter for page", () => {
      const result = CqlQueryBuilder.buildQuery("text~test", { type: "page" });
      expect(result).toBe('text~test AND type = "page"');
    });

    test("should add type filter for blogpost", () => {
      const result = CqlQueryBuilder.buildQuery("text~test", { type: "blogpost" });
      expect(result).toBe('text~test AND type = "blogpost"');
    });

    test("should add type filter to complex query", () => {
      const result = CqlQueryBuilder.buildQuery('text~"Test Hub"', { type: "page" });
      expect(result).toBe('text~"Test Hub" AND type = "page"');
    });
  });

  describe("Order By Clauses", () => {
    test("should add ORDER BY created", () => {
      const result = CqlQueryBuilder.buildQuery("text~test", { orderBy: "created" });
      expect(result).toBe("text~test ORDER BY created");
    });

    test("should add ORDER BY lastModified for modified option", () => {
      const result = CqlQueryBuilder.buildQuery("text~test", { orderBy: "modified" });
      expect(result).toBe("text~test ORDER BY lastModified");
    });

    test("should add ORDER BY title", () => {
      const result = CqlQueryBuilder.buildQuery("text~test", { orderBy: "title" });
      expect(result).toBe("text~test ORDER BY title");
    });

    test("should not add ORDER BY for relevance", () => {
      const result = CqlQueryBuilder.buildQuery("text~test", { orderBy: "relevance" });
      expect(result).toBe("text~test");
    });

    test("should handle undefined orderBy", () => {
      const result = CqlQueryBuilder.buildQuery("text~test", { orderBy: undefined });
      expect(result).toBe("text~test");
    });

    test("should add ORDER BY to complex query", () => {
      const result = CqlQueryBuilder.buildQuery('text~"Test Hub"', { orderBy: "created" });
      expect(result).toBe('text~"Test Hub" ORDER BY created');
    });
  });

  describe("Complex Queries", () => {
    test("should build query with all options", () => {
      const result = CqlQueryBuilder.buildQuery('text~"Test Hub"', {
        spaceKey: "DOCS",
        type: "page",
        orderBy: "created",
      });
      expect(result).toBe('text~"Test Hub" AND space.key = "DOCS" AND type = "page" ORDER BY created');
    });

    test("should build query with space and type only", () => {
      const result = CqlQueryBuilder.buildQuery("text~test", {
        spaceKey: "DEV",
        type: "blogpost",
      });
      expect(result).toBe('text~test AND space.key = "DEV" AND type = "blogpost"');
    });

    test("should build query with order by only", () => {
      const result = CqlQueryBuilder.buildQuery('text~"Test Hub"', {
        orderBy: "modified",
      });
      expect(result).toBe('text~"Test Hub" ORDER BY lastModified');
    });
  });

  describe("Builder Pattern", () => {
    test("should work with create factory method", () => {
      const builder = CqlQueryBuilder.create("text~test", { spaceKey: "DEV" });
      const result = builder.build();
      expect(result).toBe('text~test AND space.key = "DEV"');
    });

    test("should work with constructor", () => {
      const builder = new CqlQueryBuilder('text~"Test Hub"', { type: "page" });
      const result = builder.build();
      expect(result).toBe('text~"Test Hub" AND type = "page"');
    });

    test("should work with empty options", () => {
      const builder = new CqlQueryBuilder("text~test");
      const result = builder.build();
      expect(result).toBe("text~test");
    });
  });

  describe("Edge Cases", () => {
    test("should handle CQL with special characters", () => {
      const result = CqlQueryBuilder.buildQuery("text~test AND title~query");
      expect(result).toBe("text~test AND title~query");
    });

    test("should handle CQL with parentheses", () => {
      const result = CqlQueryBuilder.buildQuery("(text~test OR title~config)");
      expect(result).toBe("(text~test OR title~config)");
    });

    test("should handle CQL with colons", () => {
      const result = CqlQueryBuilder.buildQuery("space.key:TEST");
      expect(result).toBe("space.key:TEST");
    });

    test("should handle query with multiple spaces", () => {
      const result = CqlQueryBuilder.buildQuery("text~test    AND    title~config");
      expect(result).toBe("text~test    AND    title~config");
    });

    test("should handle CQL with quoted phrases", () => {
      const result = CqlQueryBuilder.buildQuery('text~"quoted phrase" AND title~test');
      expect(result).toBe('text~"quoted phrase" AND title~test');
    });
  });
}); 