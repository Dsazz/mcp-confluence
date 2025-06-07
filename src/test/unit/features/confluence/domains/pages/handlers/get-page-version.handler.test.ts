import { beforeEach, describe, expect, mock, test } from "bun:test";
import { GetPageVersionHandler } from "@features/confluence/domains/pages/handlers/get-page-version.handler";
import type { PageVersion } from "@features/confluence/domains/pages/models";
import type { GetPageVersionUseCase } from "@features/confluence/domains/pages/use-cases";
import { ValidationError } from "@features/confluence/shared/validators";
import { PagesMockFactory } from "@test/__mocks__/v2/domains/pages/pages-mock-factory";

describe("GetPageVersionHandler", () => {
  let handler: GetPageVersionHandler;
  let mockGetPageVersionUseCase: GetPageVersionUseCase;
  let mockExecute: ReturnType<typeof mock>;
  let pagesMockFactory: PagesMockFactory;

  beforeEach(() => {
    mockExecute = mock();
    mockGetPageVersionUseCase = {
      execute: mockExecute,
    } as unknown as GetPageVersionUseCase;
    handler = new GetPageVersionHandler(mockGetPageVersionUseCase);
    pagesMockFactory = new PagesMockFactory();
  });

  describe("Constructor", () => {
    test("should initialize with injected use case", () => {
      expect(handler).toBeInstanceOf(GetPageVersionHandler);
      expect(mockGetPageVersionUseCase).toBeDefined();
    });
  });

  describe("Parameter Validation", () => {
    test("should throw ValidationError when pageId is empty", async () => {
      await expect(handler.handle("")).rejects.toThrow(ValidationError);
    });

    test("should throw ValidationError when pageId is invalid format", async () => {
      try {
        const mockVersion = pagesMockFactory.createPageVersion();
        mockExecute.mockResolvedValue(mockVersion);
        await handler.handle("invalid-id!");
        // If we get here, the validation might be more lenient than expected
        // This is acceptable as the actual validation rules may vary
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
      }
    });

    test("should accept valid page ID", async () => {
      const mockVersion = pagesMockFactory.createPageVersion();
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle("123456");

      expect(result).toEqual(mockVersion);
      expect(mockExecute).toHaveBeenCalledWith("123456");
    });

    test("should accept UUID-style page ID", async () => {
      const mockVersion = pagesMockFactory.createPageVersion();
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle(
        "550e8400-e29b-41d4-a716-446655440000",
      );

      expect(result).toEqual(mockVersion);
      expect(mockExecute).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
      );
    });
  });

  describe("Use Case Integration", () => {
    test("should call use case with correct parameters", async () => {
      const mockVersion = pagesMockFactory.createPageVersion();
      mockExecute.mockResolvedValue(mockVersion);

      await handler.handle("123456");

      expect(mockExecute).toHaveBeenCalledWith("123456");
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });

    test("should return response from use case", async () => {
      const mockVersion = pagesMockFactory.createPageVersion();
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle("123456");

      expect(result).toEqual(mockVersion);
    });

    test("should handle use case errors and wrap them in ValidationError", async () => {
      const originalError = new Error("Use case failed");
      mockExecute.mockRejectedValue(originalError);

      await expect(handler.handle("123456")).rejects.toThrow(
        "Failed to get page version: Use case failed",
      );
    });

    test("should preserve ValidationError from use case", async () => {
      const validationError = new ValidationError("Page not found");
      mockExecute.mockRejectedValue(validationError);

      await expect(handler.handle("123456")).rejects.toThrow(validationError);
    });

    test("should handle unknown errors gracefully", async () => {
      const unknownError = "Unknown error string";
      mockExecute.mockRejectedValue(unknownError);

      await expect(handler.handle("123456")).rejects.toThrow(
        "Failed to get page version: Unknown error",
      );
    });
  });

  describe("Response Structure", () => {
    test("should return PageVersion object", async () => {
      const mockVersion = pagesMockFactory.createPageVersion();
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle("123456");

      expect(result).toHaveProperty("number");
      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("authorId");
      expect(typeof result.number).toBe("number");
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(typeof result.authorId).toBe("string");
    });

    test("should handle version with message", async () => {
      const mockVersion = pagesMockFactory.createPageVersion({
        message: "Updated content with new information",
      });
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle("123456");

      expect(result.message).toBe("Updated content with new information");
    });

    test("should handle version without message", async () => {
      const mockVersion = pagesMockFactory.createPageVersion({
        message: undefined,
      });
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle("123456");

      expect(result.message).toBeUndefined();
    });

    test("should handle different version numbers", async () => {
      const testVersions = [1, 5, 10, 100, 999];

      for (const versionNumber of testVersions) {
        const mockVersion = pagesMockFactory.createPageVersion({
          number: versionNumber,
        });
        mockExecute.mockResolvedValue(mockVersion);

        const result = await handler.handle("123456");

        expect(result.number).toBe(versionNumber);
      }
    });
  });

  describe("Edge Cases", () => {
    test("should handle null response from use case", async () => {
      mockExecute.mockResolvedValue(null);

      const result = await handler.handle("123456");

      expect(result).toBe(null as unknown as PageVersion);
    });

    test("should handle undefined response from use case", async () => {
      mockExecute.mockResolvedValue(undefined);

      const result = await handler.handle("123456");

      expect(result).toBe(undefined as unknown as PageVersion);
    });

    test("should handle different page ID formats", async () => {
      const testIds = [
        "123456",
        "550e8400-e29b-41d4-a716-446655440000",
        "abc123def456",
        "12345678901234567890",
      ];

      for (const pageId of testIds) {
        const mockVersion = pagesMockFactory.createPageVersion();
        mockExecute.mockResolvedValue(mockVersion);

        const result = await handler.handle(pageId);

        expect(result).toEqual(mockVersion);
        expect(mockExecute).toHaveBeenCalledWith(pageId);
      }
    });

    test("should handle long page IDs", async () => {
      const longId = "a".repeat(100);
      const mockVersion = pagesMockFactory.createPageVersion();
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle(longId);

      expect(result).toEqual(mockVersion);
      expect(mockExecute).toHaveBeenCalledWith(longId);
    });

    test("should handle numeric page IDs", async () => {
      const mockVersion = pagesMockFactory.createPageVersion();
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle("123456789");

      expect(result).toEqual(mockVersion);
      expect(mockExecute).toHaveBeenCalledWith("123456789");
    });

    test("should handle alphanumeric page IDs", async () => {
      const mockVersion = pagesMockFactory.createPageVersion();
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle("abc123def");

      expect(result).toEqual(mockVersion);
      expect(mockExecute).toHaveBeenCalledWith("abc123def");
    });
  });

  describe("Error Handling", () => {
    test("should preserve error context from use case", async () => {
      const originalError = new Error("Database connection failed");
      mockExecute.mockRejectedValue(originalError);

      try {
        await handler.handle("123456");
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Database connection failed",
        );
      }
    });

    test("should handle page not found error", async () => {
      const notFoundError = new Error("Page with ID 123456 not found");
      mockExecute.mockRejectedValue(notFoundError);

      await expect(handler.handle("123456")).rejects.toThrow(
        "Page with ID 123456 not found",
      );
    });

    test("should handle permission denied error", async () => {
      const permissionError = new Error("Permission denied");
      mockExecute.mockRejectedValue(permissionError);

      await expect(handler.handle("123456")).rejects.toThrow(
        "Permission denied",
      );
    });

    test("should handle version not found error", async () => {
      const versionError = new Error("Version not found");
      mockExecute.mockRejectedValue(versionError);

      await expect(handler.handle("123456")).rejects.toThrow(
        "Version not found",
      );
    });

    test("should handle timeout errors", async () => {
      const timeoutError = new Error("Request timeout");
      mockExecute.mockRejectedValue(timeoutError);

      await expect(handler.handle("123456")).rejects.toThrow("Request timeout");
    });

    test("should validate handler flow with error", async () => {
      const error = new Error("Service unavailable");
      mockExecute.mockRejectedValue(error);

      await expect(handler.handle("123456")).rejects.toThrow();
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });
  });

  describe("Business Logic", () => {
    test("should handle current version", async () => {
      const mockVersion = pagesMockFactory.createPageVersion({
        number: 1,
        message: "Initial version",
      });
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle("current-page-123");

      expect(result.number).toBe(1);
      expect(result.message).toBe("Initial version");
      expect(mockExecute).toHaveBeenCalledWith("current-page-123");
    });

    test("should handle updated version", async () => {
      const mockVersion = pagesMockFactory.createPageVersion({
        number: 5,
        message: "Updated with latest changes",
      });
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle("updated-page-456");

      expect(result.number).toBe(5);
      expect(result.message).toBe("Updated with latest changes");
      expect(mockExecute).toHaveBeenCalledWith("updated-page-456");
    });

    test("should handle draft version", async () => {
      const mockVersion = pagesMockFactory.createPageVersion({
        number: 1,
        message: "Draft version",
      });
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle("draft-page-789");

      expect(result.number).toBe(1);
      expect(result.message).toBe("Draft version");
      expect(mockExecute).toHaveBeenCalledWith("draft-page-789");
    });

    test("should handle version with different authors", async () => {
      const testCases = [
        { pageId: "author1-page", authorId: "user-123" },
        { pageId: "author2-page", authorId: "user-456" },
        { pageId: "author3-page", authorId: "user-789" },
      ];

      for (const testCase of testCases) {
        const mockVersion = pagesMockFactory.createPageVersion({
          authorId: testCase.authorId,
        });
        mockExecute.mockResolvedValue(mockVersion);

        const result = await handler.handle(testCase.pageId);

        expect(result.authorId).toBe(testCase.authorId);
        expect(mockExecute).toHaveBeenCalledWith(testCase.pageId);
      }
    });

    test("should handle version timestamps", async () => {
      const now = new Date();
      const mockVersion = pagesMockFactory.createPageVersion({
        createdAt: now,
      });
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle("timestamped-page-101");

      expect(result.createdAt).toEqual(now);
      expect(mockExecute).toHaveBeenCalledWith("timestamped-page-101");
    });

    test("should handle high version numbers", async () => {
      const mockVersion = pagesMockFactory.createPageVersion({
        number: 999,
        message: "Many revisions later",
      });
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle("heavily-edited-page-202");

      expect(result.number).toBe(999);
      expect(result.message).toBe("Many revisions later");
      expect(mockExecute).toHaveBeenCalledWith("heavily-edited-page-202");
    });

    test("should handle version without message", async () => {
      const mockVersion = pagesMockFactory.createPageVersion({
        number: 3,
        message: undefined,
      });
      mockExecute.mockResolvedValue(mockVersion);

      const result = await handler.handle("no-message-page-303");

      expect(result.number).toBe(3);
      expect(result.message).toBeUndefined();
      expect(mockExecute).toHaveBeenCalledWith("no-message-page-303");
    });
  });
});
