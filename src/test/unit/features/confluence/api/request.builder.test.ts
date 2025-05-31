import { describe, expect, test } from "bun:test";
import {
  buildGetCommentsParams,
  buildGetPageParams,
  buildGetSpacesParams,
  buildSearchParams,
} from "../../../../../features/confluence/api/request.builder";

describe("buildSearchParams", () => {
  describe("Basic Parameters", () => {
    test("should build search parameters with query only", () => {
      const params = buildSearchParams("test search", {});
      expect(params).toHaveProperty("cql");
      expect(params).toHaveProperty("limit", 25);
      expect(params).toHaveProperty("start", 0);
    });

    test("should build search parameters with custom limit", () => {
      const params = buildSearchParams("test search", { limit: 50 });
      expect(params).toHaveProperty("cql");
      expect(params).toHaveProperty("limit", 50);
      expect(params).toHaveProperty("start", 0);
    });

    test("should build search parameters with custom start", () => {
      const params = buildSearchParams("test search", { start: 100 });
      expect(params).toHaveProperty("cql");
      expect(params).toHaveProperty("limit", 25);
      expect(params).toHaveProperty("start", 100);
    });

    test("should build search parameters with all options", () => {
      const params = buildSearchParams("test search", {
        limit: 10,
        start: 50,
      });
      expect(params).toHaveProperty("cql");
      expect(params).toHaveProperty("limit", 10);
      expect(params).toHaveProperty("start", 50);
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty query", () => {
      const params = buildSearchParams("", {});
      expect(params).toHaveProperty("cql");
      expect(params).toHaveProperty("limit", 25);
      expect(params).toHaveProperty("start", 0);
    });

    test("should handle zero limit", () => {
      const params = buildSearchParams("test", { limit: 0 });
      expect(params).toHaveProperty("cql");
      expect(params).toHaveProperty("limit", 25);
      expect(params).toHaveProperty("start", 0);
    });

    test("should handle undefined values", () => {
      const params = buildSearchParams("test", {
        limit: undefined,
        start: undefined,
      });
      expect(params).toHaveProperty("cql");
      expect(params).toHaveProperty("limit", 25);
      expect(params).toHaveProperty("start", 0);
    });
  });
});

describe("buildGetPageParams", () => {
  describe("Basic Parameters", () => {
    test("should build page parameters with minimal options", () => {
      const params = buildGetPageParams({});
      expect(params).toHaveProperty("body-format", "storage");
    });

    test("should build page parameters without content when disabled", () => {
      const params = buildGetPageParams({ includeContent: false });
      expect(params).not.toHaveProperty("body-format");
    });

    test("should build page parameters with expand options", () => {
      const params = buildGetPageParams({
        expand: ["body.storage", "version"],
      });
      expect(params).toEqual({
        "body-format": "storage",
        expand: "body.storage,version",
      });
    });

    test("should build page parameters with single expand option", () => {
      const params = buildGetPageParams({
        expand: ["body.storage"],
      });
      expect(params).toEqual({
        "body-format": "storage",
        expand: "body.storage",
      });
    });

    test("should build page parameters with all options", () => {
      const params = buildGetPageParams({
        includeContent: true,
        expand: ["body.storage", "version", "space"],
      });
      expect(params).toEqual({
        "body-format": "storage",
        expand: "body.storage,version,space",
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty expand array", () => {
      const params = buildGetPageParams({ expand: [] });
      expect(params).toEqual({
        "body-format": "storage",
      });
    });

    test("should handle undefined expand", () => {
      const params = buildGetPageParams({ expand: undefined });
      expect(params).toEqual({
        "body-format": "storage",
      });
    });

    test("should handle expand with empty strings", () => {
      const params = buildGetPageParams({
        expand: ["body.storage", "", "version"],
      });
      expect(params).toEqual({
        "body-format": "storage",
        expand: "body.storage,,version",
      });
    });
  });
});

describe("buildGetSpacesParams", () => {
  describe("Basic Parameters", () => {
    test("should build space parameters with minimal options", () => {
      const params = buildGetSpacesParams({});
      expect(params).toEqual({
        limit: 25,
        start: 0,
      });
    });

    test("should build space parameters with custom limit", () => {
      const params = buildGetSpacesParams({ limit: 50 });
      expect(params).toEqual({
        limit: 50,
        start: 0,
      });
    });

    test("should build space parameters with custom start", () => {
      const params = buildGetSpacesParams({ start: 100 });
      expect(params).toEqual({
        limit: 25,
        start: 100,
      });
    });

    test("should build space parameters with type filter", () => {
      const params = buildGetSpacesParams({ type: "global" });
      expect(params).toEqual({
        limit: 25,
        start: 0,
        type: "global",
      });
    });

    test("should build space parameters with all options", () => {
      const params = buildGetSpacesParams({
        limit: 10,
        start: 50,
        type: "personal",
      });
      expect(params).toEqual({
        limit: 10,
        start: 50,
        type: "personal",
      });
    });
  });

  describe("Type Filter", () => {
    test("should handle global type", () => {
      const params = buildGetSpacesParams({ type: "global" });
      expect(params.type).toBe("global");
    });

    test("should handle personal type", () => {
      const params = buildGetSpacesParams({ type: "personal" });
      expect(params.type).toBe("personal");
    });

    test("should handle undefined type", () => {
      const params = buildGetSpacesParams({ type: undefined });
      expect(params).toEqual({
        limit: 25,
        start: 0,
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle zero values", () => {
      const params = buildGetSpacesParams({
        limit: 0,
        start: 0,
      });
      expect(params).toEqual({
        limit: 25,
        start: 0,
      });
    });

    test("should handle large numbers", () => {
      const params = buildGetSpacesParams({
        limit: 1000,
        start: 999999,
      });
      expect(params).toEqual({
        limit: 1000,
        start: 999999,
      });
    });

    test("should handle undefined values", () => {
      const params = buildGetSpacesParams({
        limit: undefined,
        start: undefined,
        type: undefined,
      });
      expect(params).toEqual({
        limit: 25,
        start: 0,
      });
    });
  });
});

describe("buildGetCommentsParams", () => {
  describe("Basic Parameters", () => {
    test("should build comment parameters with minimal options", () => {
      const params = buildGetCommentsParams({});
      expect(params).toEqual({
        limit: 25,
        start: 0,
      });
    });

    test("should build comment parameters with custom pagination", () => {
      const params = buildGetCommentsParams({
        limit: 50,
        start: 100,
      });
      expect(params).toEqual({
        limit: 50,
        start: 100,
      });
    });

    test("should build comment parameters with created order", () => {
      const params = buildGetCommentsParams({ orderBy: "created" });
      expect(params).toEqual({
        limit: 25,
        start: 0,
        sort: "created-date",
      });
    });

    test("should build comment parameters with modified order", () => {
      const params = buildGetCommentsParams({ orderBy: "updated" });
      expect(params).toEqual({
        limit: 25,
        start: 0,
        sort: "modified-date",
      });
    });

    test("should build comment parameters with all options", () => {
      const params = buildGetCommentsParams({
        limit: 10,
        start: 50,
        orderBy: "created",
      });
      expect(params).toEqual({
        limit: 10,
        start: 50,
        sort: "created-date",
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle undefined orderBy", () => {
      const params = buildGetCommentsParams({ orderBy: undefined });
      expect(params).toEqual({
        limit: 25,
        start: 0,
      });
    });

    test("should handle zero values", () => {
      const params = buildGetCommentsParams({
        limit: 0,
        start: 0,
      });
      expect(params).toEqual({
        limit: 25,
        start: 0,
      });
    });
  });
});

describe("Parameter Building Consistency", () => {
  test("should use consistent default pagination across builders", () => {
    const searchParams = buildSearchParams("test", {});
    const spacesParams = buildGetSpacesParams({});
    const commentsParams = buildGetCommentsParams({});

    expect(searchParams.limit).toBe(25);
    expect(searchParams.start).toBe(0);
    expect(spacesParams.limit).toBe(25);
    expect(spacesParams.start).toBe(0);
    expect(commentsParams.limit).toBe(25);
    expect(commentsParams.start).toBe(0);
  });

  test("should handle custom pagination consistently", () => {
    const customOptions = { limit: 50, start: 100 };

    const searchParams = buildSearchParams("test", customOptions);
    const spacesParams = buildGetSpacesParams(customOptions);
    const commentsParams = buildGetCommentsParams(customOptions);

    expect(searchParams.limit).toBe(50);
    expect(searchParams.start).toBe(100);
    expect(spacesParams.limit).toBe(50);
    expect(spacesParams.start).toBe(100);
    expect(commentsParams.limit).toBe(50);
    expect(commentsParams.start).toBe(100);
  });
});
