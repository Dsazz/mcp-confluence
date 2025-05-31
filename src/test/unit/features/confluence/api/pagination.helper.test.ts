import { describe, test, expect } from "bun:test";
import { createPaginationParams, createPaginationInfo } from "../../../../../features/confluence/api/pagination.helper";

describe("createPaginationParams", () => {
  describe("Default Parameters", () => {
    test("should return default pagination parameters when no options provided", () => {
      const params = createPaginationParams();
      expect(params).toEqual({
        limit: 25,
        start: 0
      });
    });

    test("should return default pagination parameters when empty options provided", () => {
      const params = createPaginationParams({});
      expect(params).toEqual({
        limit: 25,
        start: 0
      });
    });
  });

  describe("Custom Parameters", () => {
    test("should use custom limit when provided", () => {
      const params = createPaginationParams({ limit: 50 });
      expect(params).toEqual({
        limit: 50,
        start: 0
      });
    });

    test("should use custom start when provided", () => {
      const params = createPaginationParams({ start: 100 });
      expect(params).toEqual({
        limit: 25,
        start: 100
      });
    });

    test("should use both custom limit and start when provided", () => {
      const params = createPaginationParams({ limit: 10, start: 50 });
      expect(params).toEqual({
        limit: 10,
        start: 50
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle zero limit", () => {
      const params = createPaginationParams({ limit: 0 });
      expect(params).toEqual({
        limit: 25,
        start: 0
      });
    });

    test("should handle zero start", () => {
      const params = createPaginationParams({ start: 0 });
      expect(params).toEqual({
        limit: 25,
        start: 0
      });
    });

    test("should handle large numbers", () => {
      const params = createPaginationParams({ limit: 1000, start: 999999 });
      expect(params).toEqual({
        limit: 1000,
        start: 999999
      });
    });

    test("should handle undefined values", () => {
      const params = createPaginationParams({ limit: undefined, start: undefined });
      expect(params).toEqual({
        limit: 25,
        start: 0
      });
    });
  });
});

describe("createPaginationInfo", () => {
  describe("Basic Transformation", () => {
    test("should transform response with all required fields", () => {
      const response = {
        start: 0,
        limit: 25,
        size: 10,
        _links: {}
      };

      const result = createPaginationInfo(response);
      expect(result).toEqual({
        start: 0,
        limit: 25,
        size: 10,
        hasMore: false
      });
    });

    test("should detect hasMore when next link exists", () => {
      const response = {
        start: 0,
        limit: 25,
        size: 25,
        _links: {
          next: "/api/v2/spaces?start=25"
        }
      };

      const result = createPaginationInfo(response);
      expect(result).toEqual({
        start: 0,
        limit: 25,
        size: 25,
        hasMore: true
      });
    });

    test("should not have more when no next link", () => {
      const response = {
        start: 0,
        limit: 25,
        size: 15,
        _links: {}
      };

      const result = createPaginationInfo(response);
      expect(result).toEqual({
        start: 0,
        limit: 25,
        size: 15,
        hasMore: false
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle zero size", () => {
      const response = {
        start: 0,
        limit: 25,
        size: 0,
        _links: {}
      };

      const result = createPaginationInfo(response);
      expect(result).toEqual({
        start: 0,
        limit: 25,
        size: 0,
        hasMore: false
      });
    });

    test("should handle zero limit", () => {
      const response = {
        start: 0,
        limit: 0,
        size: 0,
        _links: {}
      };

      const result = createPaginationInfo(response);
      expect(result).toEqual({
        start: 0,
        limit: 0,
        size: 0,
        hasMore: false
      });
    });

    test("should handle large start values", () => {
      const response = {
        start: 1000,
        limit: 25,
        size: 10,
        _links: {}
      };

      const result = createPaginationInfo(response);
      expect(result).toEqual({
        start: 1000,
        limit: 25,
        size: 10,
        hasMore: false
      });
    });
  });

  describe("Real-world Scenarios", () => {
    test("should handle first page with more results", () => {
      const response = {
        start: 0,
        limit: 10,
        size: 10,
        _links: {
          next: "/wiki/api/v2/spaces?start=10&limit=10"
        }
      };

      const result = createPaginationInfo(response);
      expect(result).toEqual({
        start: 0,
        limit: 10,
        size: 10,
        hasMore: true
      });
    });

    test("should handle last page", () => {
      const response = {
        start: 90,
        limit: 10,
        size: 5,
        _links: {}
      };

      const result = createPaginationInfo(response);
      expect(result).toEqual({
        start: 90,
        limit: 10,
        size: 5,
        hasMore: false
      });
    });
  });
}); 