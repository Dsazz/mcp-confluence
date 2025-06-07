import { describe, expect, test } from "bun:test";
import {
  CQLQuery,
  SearchQuery,
} from "@features/confluence/domains/search/models";
import { InvalidSearchQueryError } from "@features/confluence/shared/validators";

describe("Search Value Objects", () => {
  describe("SearchQuery", () => {
    describe("constructor", () => {
      test("should create valid search query", () => {
        const searchQuery = new SearchQuery("test query");
        expect(searchQuery.value).toBe("test query");
      });

      test("should accept various valid queries", () => {
        const validQueries = [
          "test",
          "confluence documentation",
          "API guide",
          "user management",
          "search with numbers 123",
          "special chars: !@#$%",
          "unicode: 测试查询",
          "emoji: 📄 search",
          "multi\nline\nquery",
          "query\twith\ttabs",
          " ", // whitespace only (schema allows)
          "  ", // multiple whitespace (schema allows)
          "\t", // tab only (schema allows)
          "\n", // newline only (schema allows)
        ];

        for (const query of validQueries) {
          const searchQuery = new SearchQuery(query);
          expect(searchQuery.value).toBe(query);
        }
      });

      test("should reject invalid search queries", () => {
        const invalidQueries = [
          "", // empty string only
        ];

        for (const query of invalidQueries) {
          expect(() => new SearchQuery(query)).toThrow(InvalidSearchQueryError);
        }
      });

      test("should provide meaningful error messages", () => {
        expect(() => new SearchQuery("")).toThrow(
          "Invalid search query: . Query cannot be empty.",
        );
      });
    });

    describe("methods", () => {
      test("should return correct value", () => {
        const searchQuery = new SearchQuery("test query");
        expect(searchQuery.value).toBe("test query");
      });

      test("should convert to string", () => {
        const searchQuery = new SearchQuery("test query");
        expect(searchQuery.toString()).toBe("test query");
        expect(String(searchQuery)).toBe("test query");
      });

      test("should compare equality correctly", () => {
        const query1 = new SearchQuery("test query");
        const query2 = new SearchQuery("test query");
        const query3 = new SearchQuery("different query");

        expect(query1.equals(query2)).toBe(true);
        expect(query1.equals(query3)).toBe(false);
      });

      test("should create from string", () => {
        const searchQuery = SearchQuery.fromString("test query");
        expect(searchQuery.value).toBe("test query");
        expect(searchQuery).toBeInstanceOf(SearchQuery);
      });
    });

    describe("edge cases", () => {
      test("should handle long queries", () => {
        const longQuery = "a".repeat(1000);
        const searchQuery = new SearchQuery(longQuery);
        expect(searchQuery.value).toBe(longQuery);
        expect(searchQuery.value.length).toBe(1000);
      });

      test("should handle queries with special characters", () => {
        const specialQuery = 'search: "quoted text" AND (term1 OR term2)';
        const searchQuery = new SearchQuery(specialQuery);
        expect(searchQuery.value).toBe(specialQuery);
      });

      test("should handle unicode queries", () => {
        const unicodeQuery = "搜索查询 search query";
        const searchQuery = new SearchQuery(unicodeQuery);
        expect(searchQuery.value).toBe(unicodeQuery);
      });

      test("should handle whitespace-only queries", () => {
        const whitespaceQuery = new SearchQuery(" ");
        expect(whitespaceQuery.value).toBe(" ");
      });
    });
  });

  describe("CQLQuery", () => {
    describe("constructor", () => {
      test("should create valid CQL query", () => {
        const cqlQuery = new CQLQuery('text ~ "test"');
        expect(cqlQuery.value).toBe('text ~ "test"');
      });

      test("should trim whitespace from query", () => {
        const cqlQuery = new CQLQuery('  text ~ "test"  ');
        expect(cqlQuery.value).toBe('text ~ "test"');
      });

      test("should accept various valid CQL queries", () => {
        const validQueries = [
          'text ~ "test"',
          'title ~ "documentation"',
          'space.key = "TEST"',
          'type = "page"',
          'creator = "john.doe"',
          'created >= "2023-01-01"',
          'lastModified < "2023-12-31"',
          'text ~ "test" AND space.key = "DEV"',
          'title ~ "API" OR text ~ "documentation"',
          'text ~ "test" ORDER BY created DESC',
          '(text ~ "confluence" AND type = "page") OR (text ~ "jira" AND type = "blogpost")',
        ];

        for (const query of validQueries) {
          const cqlQuery = new CQLQuery(query);
          expect(cqlQuery.value).toBe(query);
        }
      });

      test("should reject invalid CQL queries", () => {
        const invalidQueries = [
          "", // empty
          " ", // whitespace only
          "  ", // multiple whitespace
          "\t", // tab only
          "\n", // newline only
        ];

        for (const query of invalidQueries) {
          expect(() => new CQLQuery(query)).toThrow(InvalidSearchQueryError);
        }
      });

      test("should provide meaningful error messages", () => {
        expect(() => new CQLQuery("")).toThrow("CQL query cannot be empty");
        expect(() => new CQLQuery(" ")).toThrow("CQL query cannot be empty");
      });
    });

    describe("methods", () => {
      test("should return correct value", () => {
        const cqlQuery = new CQLQuery('text ~ "test"');
        expect(cqlQuery.value).toBe('text ~ "test"');
      });

      test("should convert to string", () => {
        const cqlQuery = new CQLQuery('text ~ "test"');
        expect(cqlQuery.toString()).toBe('text ~ "test"');
        expect(String(cqlQuery)).toBe('text ~ "test"');
      });

      test("should compare equality correctly", () => {
        const query1 = new CQLQuery('text ~ "test"');
        const query2 = new CQLQuery('text ~ "test"');
        const query3 = new CQLQuery('title ~ "test"');

        expect(query1.equals(query2)).toBe(true);
        expect(query1.equals(query3)).toBe(false);
      });

      test("should create from string", () => {
        const cqlQuery = CQLQuery.fromString('text ~ "test"');
        expect(cqlQuery.value).toBe('text ~ "test"');
        expect(cqlQuery).toBeInstanceOf(CQLQuery);
      });
    });

    describe("static helper methods", () => {
      test("should create text query", () => {
        const cqlQuery = CQLQuery.text("confluence");
        expect(cqlQuery.value).toBe('text ~ "confluence"');
      });

      test("should create title query", () => {
        const cqlQuery = CQLQuery.title("documentation");
        expect(cqlQuery.value).toBe('title ~ "documentation"');
      });

      test("should create space query", () => {
        const cqlQuery = CQLQuery.space("TEST");
        expect(cqlQuery.value).toBe('space.key = "TEST"');
      });

      test("should create type queries for different content types", () => {
        const pageQuery = CQLQuery.type("page");
        const blogQuery = CQLQuery.type("blogpost");
        const commentQuery = CQLQuery.type("comment");
        const attachmentQuery = CQLQuery.type("attachment");

        expect(pageQuery.value).toBe('type = "page"');
        expect(blogQuery.value).toBe('type = "blogpost"');
        expect(commentQuery.value).toBe('type = "comment"');
        expect(attachmentQuery.value).toBe('type = "attachment"');
      });

      test("should create creator query", () => {
        const cqlQuery = CQLQuery.creator("john.doe");
        expect(cqlQuery.value).toBe('creator = "john.doe"');
      });

      test("should create created date queries with different operators", () => {
        const equalQuery = CQLQuery.created("2023-01-01");
        const greaterQuery = CQLQuery.created("2023-01-01", ">");
        const lessQuery = CQLQuery.created("2023-12-31", "<");
        const greaterEqualQuery = CQLQuery.created("2023-01-01", ">=");
        const lessEqualQuery = CQLQuery.created("2023-12-31", "<=");

        expect(equalQuery.value).toBe('created = "2023-01-01"');
        expect(greaterQuery.value).toBe('created > "2023-01-01"');
        expect(lessQuery.value).toBe('created < "2023-12-31"');
        expect(greaterEqualQuery.value).toBe('created >= "2023-01-01"');
        expect(lessEqualQuery.value).toBe('created <= "2023-12-31"');
      });

      test("should create lastModified date queries with different operators", () => {
        const equalQuery = CQLQuery.lastModified("2023-06-01");
        const greaterQuery = CQLQuery.lastModified("2023-06-01", ">");
        const lessQuery = CQLQuery.lastModified("2023-06-01", "<");
        const greaterEqualQuery = CQLQuery.lastModified("2023-06-01", ">=");
        const lessEqualQuery = CQLQuery.lastModified("2023-06-01", "<=");

        expect(equalQuery.value).toBe('lastModified = "2023-06-01"');
        expect(greaterQuery.value).toBe('lastModified > "2023-06-01"');
        expect(lessQuery.value).toBe('lastModified < "2023-06-01"');
        expect(greaterEqualQuery.value).toBe('lastModified >= "2023-06-01"');
        expect(lessEqualQuery.value).toBe('lastModified <= "2023-06-01"');
      });
    });

    describe("query combination methods", () => {
      test("should combine queries with AND", () => {
        const query1 = CQLQuery.text("confluence");
        const query2 = CQLQuery.space("TEST");
        const combined = query1.and(query2);

        expect(combined.value).toBe(
          '(text ~ "confluence") AND (space.key = "TEST")',
        );
      });

      test("should combine queries with OR", () => {
        const query1 = CQLQuery.text("confluence");
        const query2 = CQLQuery.text("jira");
        const combined = query1.or(query2);

        expect(combined.value).toBe('(text ~ "confluence") OR (text ~ "jira")');
      });

      test("should chain multiple combinations", () => {
        const textQuery = CQLQuery.text("documentation");
        const spaceQuery = CQLQuery.space("DEV");
        const typeQuery = CQLQuery.type("page");

        const combined = textQuery.and(spaceQuery).and(typeQuery);

        expect(combined.value).toBe(
          '((text ~ "documentation") AND (space.key = "DEV")) AND (type = "page")',
        );
      });

      test("should handle complex combinations", () => {
        const query1 = CQLQuery.text("confluence").and(CQLQuery.type("page"));
        const query2 = CQLQuery.text("jira").and(CQLQuery.type("blogpost"));
        const combined = query1.or(query2);

        expect(combined.value).toBe(
          '((text ~ "confluence") AND (type = "page")) OR ((text ~ "jira") AND (type = "blogpost"))',
        );
      });
    });

    describe("ordering methods", () => {
      test("should add order by with default direction", () => {
        const query = CQLQuery.text("test");
        const ordered = query.orderBy("created");

        expect(ordered.value).toBe('text ~ "test" ORDER BY created DESC');
      });

      test("should add order by with specified direction", () => {
        const ascQuery = CQLQuery.text("test").orderBy("created", "ASC");
        const descQuery = CQLQuery.text("test").orderBy("lastModified", "DESC");

        expect(ascQuery.value).toBe('text ~ "test" ORDER BY created ASC');
        expect(descQuery.value).toBe(
          'text ~ "test" ORDER BY lastModified DESC',
        );
      });

      test("should support different order fields", () => {
        const createdOrder = CQLQuery.text("test").orderBy("created");
        const modifiedOrder = CQLQuery.text("test").orderBy("lastModified");
        const titleOrder = CQLQuery.text("test").orderBy("title");

        expect(createdOrder.value).toBe('text ~ "test" ORDER BY created DESC');
        expect(modifiedOrder.value).toBe(
          'text ~ "test" ORDER BY lastModified DESC',
        );
        expect(titleOrder.value).toBe('text ~ "test" ORDER BY title DESC');
      });
    });

    describe("complex query building", () => {
      test("should build complex search query", () => {
        const query = CQLQuery.text("API documentation")
          .and(CQLQuery.space("DEV"))
          .and(CQLQuery.type("page"))
          .and(CQLQuery.created("2023-01-01", ">="))
          .orderBy("lastModified", "DESC");

        const expected =
          '(((text ~ "API documentation") AND (space.key = "DEV")) AND (type = "page")) AND (created >= "2023-01-01") ORDER BY lastModified DESC';
        expect(query.value).toBe(expected);
      });

      test("should build query with OR conditions", () => {
        const confluencePages = CQLQuery.text("confluence").and(
          CQLQuery.type("page"),
        );
        const jiraBlogposts = CQLQuery.text("jira").and(
          CQLQuery.type("blogpost"),
        );
        const query = confluencePages
          .or(jiraBlogposts)
          .orderBy("created", "ASC");

        const expected =
          '((text ~ "confluence") AND (type = "page")) OR ((text ~ "jira") AND (type = "blogpost")) ORDER BY created ASC';
        expect(query.value).toBe(expected);
      });

      test("should build date range query", () => {
        const query = CQLQuery.text("documentation")
          .and(CQLQuery.created("2023-01-01", ">="))
          .and(CQLQuery.created("2023-12-31", "<="))
          .and(CQLQuery.space("DOCS"));

        const expected =
          '(((text ~ "documentation") AND (created >= "2023-01-01")) AND (created <= "2023-12-31")) AND (space.key = "DOCS")';
        expect(query.value).toBe(expected);
      });

      test("should build multi-space query", () => {
        const devSpace = CQLQuery.space("DEV");
        const testSpace = CQLQuery.space("TEST");
        const docsSpace = CQLQuery.space("DOCS");

        const query = CQLQuery.text("API")
          .and(devSpace.or(testSpace).or(docsSpace))
          .orderBy("title", "ASC");

        const expected =
          '(text ~ "API") AND (((space.key = "DEV") OR (space.key = "TEST")) OR (space.key = "DOCS")) ORDER BY title ASC';
        expect(query.value).toBe(expected);
      });
    });

    describe("edge cases", () => {
      test("should handle queries with special characters", () => {
        const query = CQLQuery.text("API: REST & GraphQL");
        expect(query.value).toBe('text ~ "API: REST & GraphQL"');
      });

      test("should handle queries with quotes", () => {
        const query = CQLQuery.text('Documentation "best practices"');
        expect(query.value).toBe('text ~ "Documentation "best practices""');
      });

      test("should handle unicode in queries", () => {
        const query = CQLQuery.text("文档搜索");
        expect(query.value).toBe('text ~ "文档搜索"');
      });

      test("should handle long query chains", () => {
        let query = CQLQuery.text("test");
        for (let i = 0; i < 5; i++) {
          query = query.and(CQLQuery.space(`SPACE${i}`));
        }

        expect(query.value).toContain('text ~ "test"');
        expect(query.value).toContain('space.key = "SPACE0"');
        expect(query.value).toContain('space.key = "SPACE4"');
      });
    });
  });

  describe("Value Object Patterns", () => {
    test("should be immutable", () => {
      const searchQuery = new SearchQuery("test");
      const cqlQuery = new CQLQuery('text ~ "test"');

      // Value objects should not have setters
      expect(
        typeof (searchQuery as unknown as { setValue?: unknown }).setValue,
      ).toBe("undefined");
      expect(
        typeof (cqlQuery as unknown as { setValue?: unknown }).setValue,
      ).toBe("undefined");

      // Values should be readonly - the value should remain unchanged
      expect(searchQuery.value).toBe("test");
      expect(cqlQuery.value).toBe('text ~ "test"');
    });

    test("should support value equality", () => {
      const searchQuery1 = new SearchQuery("test");
      const searchQuery2 = new SearchQuery("test");
      const cqlQuery1 = new CQLQuery('text ~ "test"');
      const cqlQuery2 = new CQLQuery('text ~ "test"');

      expect(searchQuery1.equals(searchQuery2)).toBe(true);
      expect(cqlQuery1.equals(cqlQuery2)).toBe(true);
      expect(searchQuery1 === searchQuery2).toBe(false); // Different object references
      expect(cqlQuery1 === cqlQuery2).toBe(false); // Different object references
    });

    test("should have consistent string representation", () => {
      const searchQuery = new SearchQuery("test query");
      const cqlQuery = new CQLQuery('text ~ "test"');

      expect(searchQuery.toString()).toBe(searchQuery.value);
      expect(cqlQuery.toString()).toBe(cqlQuery.value);
      expect(String(searchQuery)).toBe(searchQuery.value);
      expect(String(cqlQuery)).toBe(cqlQuery.value);
    });

    test("should support factory methods", () => {
      const searchQueryFromFactory = SearchQuery.fromString("test");
      const cqlQueryFromFactory = CQLQuery.fromString('text ~ "test"');

      expect(searchQueryFromFactory).toBeInstanceOf(SearchQuery);
      expect(cqlQueryFromFactory).toBeInstanceOf(CQLQuery);
      expect(searchQueryFromFactory.value).toBe("test");
      expect(cqlQueryFromFactory.value).toBe('text ~ "test"');
    });

    test("should maintain immutability in query building", () => {
      const originalQuery = CQLQuery.text("test");
      const combinedQuery = originalQuery.and(CQLQuery.space("DEV"));
      const orderedQuery = originalQuery.orderBy("created");

      // Original query should remain unchanged
      expect(originalQuery.value).toBe('text ~ "test"');
      expect(combinedQuery.value).toBe(
        '(text ~ "test") AND (space.key = "DEV")',
      );
      expect(orderedQuery.value).toBe('text ~ "test" ORDER BY created DESC');
    });
  });
});
