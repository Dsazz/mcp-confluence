/**
 * Unit tests for GetSpacesHandler (Confluence V2)
 *
 * This test file demonstrates the V2 testing pattern with dependency injection
 * and domain-driven architecture.
 */

import { beforeEach, describe, expect, mock, test } from "bun:test";
import { GetSpacesHandler } from "@features/confluence/domains/spaces/handlers/get-spaces.handler";
import type {
  GetSpacesRequest,
  GetSpacesResponse,
} from "@features/confluence/domains/spaces/models";
import type { GetAllSpacesUseCase } from "@features/confluence/domains/spaces/use-cases";
import { ValidationError } from "@features/confluence/shared/validators";
import { SpacesMockFactory } from "@test/__mocks__/v2/domains/spaces/spaces-mock-factory";

describe("GetSpacesHandler", () => {
  let handler: GetSpacesHandler;
  let mockGetAllSpacesUseCase: GetAllSpacesUseCase;
  let spacesMockFactory: SpacesMockFactory;
  let mockExecute: ReturnType<typeof mock>;

  beforeEach(() => {
    // Initialize mock factory
    spacesMockFactory = new SpacesMockFactory();

    // Create mock execute function
    mockExecute = mock();

    // Create mock use case with just the execute method
    mockGetAllSpacesUseCase = {
      execute: mockExecute,
    } as unknown as GetAllSpacesUseCase;

    // Initialize handler with dependency injection
    handler = new GetSpacesHandler(mockGetAllSpacesUseCase);
  });

  describe("Constructor", () => {
    test("should initialize with injected use case", () => {
      expect(handler).toBeInstanceOf(GetSpacesHandler);
      expect(mockGetAllSpacesUseCase).toBeDefined();
    });
  });

  describe("Parameter Validation", () => {
    test("should accept undefined request (all parameters optional)", async () => {
      const mockResponse = spacesMockFactory.createGetSpacesResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const response = await handler.handle(undefined);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(undefined);
    });

    test("should accept empty request object", async () => {
      const mockResponse = spacesMockFactory.createGetSpacesResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const request: GetSpacesRequest = {};
      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should throw ValidationError when type is invalid", async () => {
      const request = { type: "invalid" } as unknown as GetSpacesRequest;

      await expect(handler.handle(request)).rejects.toThrow(ValidationError);
    });

    test("should throw ValidationError when limit is too small", async () => {
      const request: GetSpacesRequest = { limit: 0 };

      await expect(handler.handle(request)).rejects.toThrow(ValidationError);
    });

    test("should throw ValidationError when limit is too large", async () => {
      const request: GetSpacesRequest = { limit: 300 };

      await expect(handler.handle(request)).rejects.toThrow(ValidationError);
    });

    test("should throw ValidationError when start is negative", async () => {
      const request: GetSpacesRequest = { start: -1 };

      await expect(handler.handle(request)).rejects.toThrow(ValidationError);
    });

    test("should accept valid type parameter", async () => {
      const mockResponse = spacesMockFactory.createGetSpacesResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const request: GetSpacesRequest = { type: "global" };
      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should accept valid limit parameter", async () => {
      const mockResponse = spacesMockFactory.createGetSpacesResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const request: GetSpacesRequest = { limit: 50 };
      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should accept valid start parameter", async () => {
      const mockResponse = spacesMockFactory.createGetSpacesResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const request: GetSpacesRequest = { start: 25 };
      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should accept valid expand parameter", async () => {
      const mockResponse = spacesMockFactory.createGetSpacesResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const request: GetSpacesRequest = { expand: "description,permissions" };
      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should accept request with all valid parameters", async () => {
      const mockResponse = spacesMockFactory.createGetSpacesResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const request: GetSpacesRequest = {
        type: "personal",
        limit: 100,
        start: 50,
        expand: "description,permissions,metadata",
      };

      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });
  });

  describe("Use Case Integration", () => {
    test("should call use case with correct parameters", async () => {
      const mockResponse = spacesMockFactory.createGetSpacesResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const request: GetSpacesRequest = {
        type: "global",
        limit: 25,
        start: 0,
        expand: "description",
      };

      await handler.handle(request);

      expect(mockExecute).toHaveBeenCalledWith(request);
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });

    test("should return response from use case", async () => {
      const mockSpaces = spacesMockFactory.createSpaces(2, {
        type: "global",
      });
      const mockResponse: GetSpacesResponse = {
        spaces: mockSpaces,
        pagination: spacesMockFactory.createPaginationInfo({
          size: mockSpaces.length,
        }),
        summary: spacesMockFactory.createSpaceSummary({
          total: mockSpaces.length,
          globalSpaces: mockSpaces.length,
          personalSpaces: 0,
        }),
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetSpacesRequest = { type: "global" };
      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(response.spaces).toHaveLength(2);
      expect(response.summary.globalSpaces).toBe(2);
      expect(response.summary.personalSpaces).toBe(0);
    });

    test("should handle use case errors and wrap them in ValidationError", async () => {
      const originalError = new Error("Use case failed");
      mockExecute.mockRejectedValue(originalError);

      const request: GetSpacesRequest = { type: "global" };

      await expect(handler.handle(request)).rejects.toThrow(
        "Failed to get spaces: Use case failed",
      );
    });

    test("should preserve ValidationError from use case", async () => {
      const validationError = new ValidationError("Invalid space type");
      mockExecute.mockRejectedValue(validationError);

      const request: GetSpacesRequest = { type: "global" };

      await expect(handler.handle(request)).rejects.toThrow(validationError);
    });

    test("should handle unknown errors gracefully", async () => {
      const unknownError = "Unknown error string";
      mockExecute.mockRejectedValue(unknownError);

      const request: GetSpacesRequest = { type: "global" };

      await expect(handler.handle(request)).rejects.toThrow(
        "Failed to get spaces: Unknown error",
      );
    });
  });

  describe("Response Structure", () => {
    test("should return response with spaces, pagination, and summary", async () => {
      const mockSpaces = spacesMockFactory.createSpaces(3);
      const mockPagination = spacesMockFactory.createPaginationInfo({
        size: mockSpaces.length,
      });
      const mockResponse: GetSpacesResponse = {
        spaces: mockSpaces,
        pagination: mockPagination,
        summary: spacesMockFactory.createSpaceSummary({
          total: mockSpaces.length,
          globalSpaces: mockSpaces.filter((s) => s.type === "global").length,
          personalSpaces: mockSpaces.filter((s) => s.type === "personal")
            .length,
        }),
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetSpacesRequest = {};
      const response = await handler.handle(request);

      expect(response).toHaveProperty("spaces");
      expect(response).toHaveProperty("pagination");
      expect(response).toHaveProperty("summary");
      expect(response.spaces).toEqual(mockSpaces);
      expect(response.pagination).toEqual(mockPagination);
      expect(response.summary).toHaveProperty("total");
      expect(response.summary).toHaveProperty("globalSpaces");
      expect(response.summary).toHaveProperty("personalSpaces");
    });

    test("should handle empty spaces response", async () => {
      const mockResponse: GetSpacesResponse = {
        spaces: [],
        pagination: spacesMockFactory.createPaginationInfo({
          size: 0,
          hasMore: false,
        }),
        summary: spacesMockFactory.createSpaceSummary({
          total: 0,
          globalSpaces: 0,
          personalSpaces: 0,
        }),
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetSpacesRequest = { type: "global" };
      const response = await handler.handle(request);

      expect(response.spaces).toHaveLength(0);
      expect(response.pagination.size).toBe(0);
      expect(response.summary.total).toBe(0);
    });

    test("should handle paginated response correctly", async () => {
      const mockSpaces = spacesMockFactory.createSpaces(25);
      const mockResponse: GetSpacesResponse = {
        spaces: mockSpaces,
        pagination: spacesMockFactory.createPaginationInfo({
          start: 0,
          limit: 25,
          size: 25,
          hasMore: true,
        }),
        summary: spacesMockFactory.createSpaceSummary({
          total: 100,
          globalSpaces: 75,
          personalSpaces: 25,
        }),
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetSpacesRequest = { limit: 25, start: 0 };
      const response = await handler.handle(request);

      expect(response.spaces).toHaveLength(25);
      expect(response.pagination.hasMore).toBe(true);
      expect(response.summary.total).toBe(100);
    });
  });

  describe("Edge Cases", () => {
    test("should handle null response from use case", async () => {
      mockExecute.mockResolvedValue(null);

      const request: GetSpacesRequest = {};

      const response = await handler.handle(request);
      expect(response).toBeNull();
    });

    test("should handle undefined response from use case", async () => {
      mockExecute.mockResolvedValue(undefined);

      const request: GetSpacesRequest = {};

      const response = await handler.handle(request);
      expect(response).toBeUndefined();
    });

    test("should handle response with mixed space types", async () => {
      const globalSpaces = spacesMockFactory.createSpaces(2, {
        type: "global",
      });
      const personalSpaces = spacesMockFactory.createSpaces(1, {
        type: "personal",
      });
      const allSpaces = [...globalSpaces, ...personalSpaces];

      const mockResponse: GetSpacesResponse = {
        spaces: allSpaces,
        pagination: spacesMockFactory.createPaginationInfo({
          size: allSpaces.length,
        }),
        summary: spacesMockFactory.createSpaceSummary({
          total: allSpaces.length,
          globalSpaces: globalSpaces.length,
          personalSpaces: personalSpaces.length,
        }),
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetSpacesRequest = {};
      const response = await handler.handle(request);

      expect(response.spaces).toHaveLength(3);
      expect(response.summary.globalSpaces).toBe(2);
      expect(response.summary.personalSpaces).toBe(1);
    });
  });
});
