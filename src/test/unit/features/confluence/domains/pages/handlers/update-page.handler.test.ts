import { beforeEach, describe, expect, mock, test } from "bun:test";
import { UpdatePageHandler } from "@features/confluence/domains/pages/handlers/update-page.handler";
import type {
  UpdatePageRequest,
  UpdatePageResponse,
} from "@features/confluence/domains/pages/models";
import type { UpdatePageUseCase } from "@features/confluence/domains/pages/use-cases";
import { ValidationError } from "@features/confluence/shared/validators";
import { PagesMockFactory } from "@test/__mocks__/v2/domains/pages/pages-mock-factory";

describe("UpdatePageHandler", () => {
  let handler: UpdatePageHandler;
  let mockUpdatePageUseCase: UpdatePageUseCase;
  let mockExecute: ReturnType<typeof mock>;
  let pagesMockFactory: PagesMockFactory;

  beforeEach(() => {
    mockExecute = mock();
    mockUpdatePageUseCase = {
      execute: mockExecute,
    } as unknown as UpdatePageUseCase;
    handler = new UpdatePageHandler(mockUpdatePageUseCase);
    pagesMockFactory = new PagesMockFactory();
  });

  describe("Constructor", () => {
    test("should initialize with injected use case", () => {
      expect(handler).toBeInstanceOf(UpdatePageHandler);
      expect(mockUpdatePageUseCase).toBeDefined();
    });
  });

  describe("Parameter Validation", () => {
    test("should throw ValidationError when request is invalid", async () => {
      const invalidRequest = {} as UpdatePageRequest;

      await expect(handler.handle(invalidRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    test("should throw ValidationError when pageId is empty", async () => {
      const request = pagesMockFactory.createUpdatePageRequest({ pageId: "" });

      await expect(handler.handle(request)).rejects.toThrow(ValidationError);
    });

    test("should throw ValidationError when versionNumber is invalid", async () => {
      const request = pagesMockFactory.createUpdatePageRequest({
        versionNumber: 0,
      });

      await expect(handler.handle(request)).rejects.toThrow(ValidationError);
    });

    test("should accept valid update request", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const mockResponse = pagesMockFactory.createUpdatePageResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should accept update request with all parameters", async () => {
      const request = pagesMockFactory.createUpdatePageRequest({
        pageId: "123456",
        versionNumber: 2,
        title: "Updated Page Title",
        content: "<p>Updated content</p>",
        status: "current",
        contentFormat: "storage",
        versionMessage: "Updated page content",
      });
      const mockResponse = pagesMockFactory.createUpdatePageResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should accept update request with partial data", async () => {
      const request = pagesMockFactory.createUpdatePageRequest({
        pageId: "123456",
        versionNumber: 1,
        title: "New Title Only",
      });
      const mockResponse = pagesMockFactory.createUpdatePageResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should throw ValidationError for very long title", async () => {
      const longTitle = "a".repeat(501);
      const request = pagesMockFactory.createUpdatePageRequest({
        title: longTitle,
      });

      await expect(handler.handle(request)).rejects.toThrow(ValidationError);
    });

    test("should accept empty content when provided", async () => {
      const request = pagesMockFactory.createUpdatePageRequest({ content: "" });
      const mockResponse = pagesMockFactory.createUpdatePageResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result).toBe(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should accept valid content formats", async () => {
      const formats = [
        "storage",
        "editor",
        "wiki",
        "atlas_doc_format",
      ] as const;

      for (const format of formats) {
        const request = pagesMockFactory.createUpdatePageRequest({
          contentFormat: format,
        });
        const mockResponse = pagesMockFactory.createUpdatePageResponse();
        mockExecute.mockResolvedValue(mockResponse);

        const result = await handler.handle(request);

        expect(result).toEqual(mockResponse);
        expect(mockExecute).toHaveBeenCalledWith(request);
      }
    });

    test("should accept valid status values", async () => {
      const statuses = ["current", "draft"] as const;

      for (const status of statuses) {
        const request = pagesMockFactory.createUpdatePageRequest({ status });
        const mockResponse = pagesMockFactory.createUpdatePageResponse();
        mockExecute.mockResolvedValue(mockResponse);

        const result = await handler.handle(request);

        expect(result).toEqual(mockResponse);
        expect(mockExecute).toHaveBeenCalledWith(request);
      }
    });
  });

  describe("Use Case Integration", () => {
    test("should call use case with correct parameters", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const mockResponse = pagesMockFactory.createUpdatePageResponse();
      mockExecute.mockResolvedValue(mockResponse);

      await handler.handle(request);

      expect(mockExecute).toHaveBeenCalledWith(request);
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });

    test("should return response from use case", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const mockResponse = pagesMockFactory.createUpdatePageResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result).toEqual(mockResponse);
    });

    test("should handle use case errors and wrap them in ValidationError", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const originalError = new Error("Use case failed");
      mockExecute.mockRejectedValue(originalError);

      await expect(handler.handle(request)).rejects.toThrow(
        "Failed to update page: Use case failed",
      );
    });

    test("should preserve ValidationError from use case", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const validationError = new ValidationError("Invalid page data");
      mockExecute.mockRejectedValue(validationError);

      await expect(handler.handle(request)).rejects.toThrow(validationError);
    });

    test("should handle unknown errors gracefully", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const unknownError = "Unknown error string";
      mockExecute.mockRejectedValue(unknownError);

      await expect(handler.handle(request)).rejects.toThrow(
        "Failed to update page: Unknown error",
      );
    });
  });

  describe("Response Structure", () => {
    test("should return UpdatePageResponse object", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const mockResponse = pagesMockFactory.createUpdatePageResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result).toHaveProperty("page");
      expect(result).toHaveProperty("context");
      expect(result).toHaveProperty("previousVersion");
      expect(result).toHaveProperty("currentVersion");
      expect(result).toHaveProperty("changes");
      expect(result).toHaveProperty("message");
      expect(Array.isArray(result.changes)).toBe(true);
    });

    test("should handle response with version changes", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const mockResponse = pagesMockFactory.createUpdatePageResponse({
        previousVersion: 1,
        currentVersion: 2,
        changes: ["title", "content"],
        message: "Page updated successfully",
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.previousVersion).toBe(1);
      expect(result.currentVersion).toBe(2);
      expect(result.changes).toEqual(["title", "content"]);
      expect(result.message).toBe("Page updated successfully");
    });

    test("should handle response with no changes", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const mockResponse = pagesMockFactory.createUpdatePageResponse({
        previousVersion: 1,
        currentVersion: 1,
        changes: [],
        message: "No changes detected",
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.previousVersion).toBe(1);
      expect(result.currentVersion).toBe(1);
      expect(result.changes).toEqual([]);
      expect(result.message).toBe("No changes detected");
    });

    test("should handle response with multiple changes", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const mockResponse = pagesMockFactory.createUpdatePageResponse({
        changes: ["title", "content", "status", "metadata"],
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.changes).toHaveLength(4);
      expect(result.changes).toContain("title");
      expect(result.changes).toContain("content");
      expect(result.changes).toContain("status");
      expect(result.changes).toContain("metadata");
    });
  });

  describe("Edge Cases", () => {
    test("should handle null response from use case", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      mockExecute.mockResolvedValue(null);

      const result = await handler.handle(request);

      expect(result).toBe(null as unknown as UpdatePageResponse);
    });

    test("should handle undefined response from use case", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      mockExecute.mockResolvedValue(undefined);

      const result = await handler.handle(request);

      expect(result).toBe(undefined as unknown as UpdatePageResponse);
    });

    test("should handle different page IDs", async () => {
      const testPageIds = [
        "123456",
        "page-abc-123",
        "98765432101234567890",
        "short",
        "very-long-page-id-with-many-characters",
      ];

      for (const pageId of testPageIds) {
        const request = pagesMockFactory.createUpdatePageRequest({ pageId });
        const mockResponse = pagesMockFactory.createUpdatePageResponse();
        mockExecute.mockResolvedValue(mockResponse);

        const result = await handler.handle(request);

        expect(result).toEqual(mockResponse);
        expect(mockExecute).toHaveBeenCalledWith(request);
      }
    });

    test("should handle different version numbers", async () => {
      const testVersions = [1, 2, 5, 10, 100, 999];

      for (const versionNumber of testVersions) {
        const request = pagesMockFactory.createUpdatePageRequest({
          versionNumber,
        });
        const mockResponse = pagesMockFactory.createUpdatePageResponse();
        mockExecute.mockResolvedValue(mockResponse);

        const result = await handler.handle(request);

        expect(result).toEqual(mockResponse);
        expect(mockExecute).toHaveBeenCalledWith(request);
      }
    });

    test("should handle various title lengths", async () => {
      const validTitles = [
        "Short",
        "Medium length title",
        "A".repeat(100),
        "A".repeat(255), // Max valid length
      ];

      for (const title of validTitles) {
        const request = pagesMockFactory.createUpdatePageRequest({ title });
        const mockResponse = pagesMockFactory.createUpdatePageResponse();
        mockExecute.mockResolvedValue(mockResponse);

        const result = await handler.handle(request);

        expect(result).toEqual(mockResponse);
        expect(mockExecute).toHaveBeenCalledWith(request);
      }

      // Test invalid long title
      const longTitle = "A".repeat(500); // Over 255 char limit
      const invalidRequest = pagesMockFactory.createUpdatePageRequest({
        title: longTitle,
      });

      await expect(handler.handle(invalidRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    test("should handle different content types", async () => {
      const testContents = [
        "<p>Simple HTML</p>",
        "<h1>Title</h1><p>Content with <strong>formatting</strong></p>",
        "Plain text content",
        "<div><ul><li>List item 1</li><li>List item 2</li></ul></div>",
        "Content with special characters: @#$%^&*()",
      ];

      for (const content of testContents) {
        const request = pagesMockFactory.createUpdatePageRequest({ content });
        const mockResponse = pagesMockFactory.createUpdatePageResponse();
        mockExecute.mockResolvedValue(mockResponse);

        const result = await handler.handle(request);

        expect(result).toEqual(mockResponse);
        expect(mockExecute).toHaveBeenCalledWith(request);
      }
    });

    test("should handle optional version messages", async () => {
      const testMessages = [
        undefined,
        "",
        "Minor update",
        "Major content revision",
        "Fixed typos and formatting",
        "Updated based on feedback",
      ];

      for (const versionMessage of testMessages) {
        const request = pagesMockFactory.createUpdatePageRequest({
          versionMessage,
        });
        const mockResponse = pagesMockFactory.createUpdatePageResponse();
        mockExecute.mockResolvedValue(mockResponse);

        const result = await handler.handle(request);

        expect(result).toEqual(mockResponse);
        expect(mockExecute).toHaveBeenCalledWith(request);
      }
    });
  });

  describe("Error Handling", () => {
    test("should preserve error context from use case", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const originalError = new Error("Page not found");
      mockExecute.mockRejectedValue(originalError);

      try {
        await handler.handle(request);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("Page not found");
      }
    });

    test("should handle version conflict error", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const versionError = new Error("Version conflict");
      mockExecute.mockRejectedValue(versionError);

      await expect(handler.handle(request)).rejects.toThrow("Version conflict");
    });

    test("should handle permission denied error", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const permissionError = new Error("Permission denied");
      mockExecute.mockRejectedValue(permissionError);

      await expect(handler.handle(request)).rejects.toThrow(
        "Permission denied",
      );
    });

    test("should handle page not found error", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const notFoundError = new Error("Page not found");
      mockExecute.mockRejectedValue(notFoundError);

      await expect(handler.handle(request)).rejects.toThrow("Page not found");
    });

    test("should handle content validation error", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const contentError = new Error("Invalid content format");
      mockExecute.mockRejectedValue(contentError);

      await expect(handler.handle(request)).rejects.toThrow(
        "Invalid content format",
      );
    });

    test("should validate handler flow with error", async () => {
      const request = pagesMockFactory.createUpdatePageRequest();
      const error = new Error("Internal server error");
      mockExecute.mockRejectedValue(error);

      await expect(handler.handle(request)).rejects.toThrow();
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });
  });

  describe("Business Logic", () => {
    test("should handle title-only update", async () => {
      const request = pagesMockFactory.createUpdatePageRequest({
        pageId: "123456",
        versionNumber: 1,
        title: "New Title",
      });
      const mockResponse = pagesMockFactory.createUpdatePageResponse({
        changes: ["title"],
        message: "Title updated",
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.changes).toEqual(["title"]);
      expect(result.message).toBe("Title updated");
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should handle content-only update", async () => {
      const request = pagesMockFactory.createUpdatePageRequest({
        pageId: "123456",
        versionNumber: 1,
        content: "<p>New content</p>",
      });
      const mockResponse = pagesMockFactory.createUpdatePageResponse({
        changes: ["content"],
        message: "Content updated",
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.changes).toEqual(["content"]);
      expect(result.message).toBe("Content updated");
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should handle status change", async () => {
      const request = pagesMockFactory.createUpdatePageRequest({
        pageId: "123456",
        versionNumber: 1,
        status: "draft",
      });
      const mockResponse = pagesMockFactory.createUpdatePageResponse({
        changes: ["status"],
        message: "Status changed to draft",
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.changes).toEqual(["status"]);
      expect(result.message).toBe("Status changed to draft");
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should handle complete page update", async () => {
      const request = pagesMockFactory.createUpdatePageRequest({
        pageId: "123456",
        versionNumber: 1,
        title: "Updated Title",
        content: "<p>Updated content</p>",
        status: "current",
        contentFormat: "storage",
        versionMessage: "Complete update",
      });
      const mockResponse = pagesMockFactory.createUpdatePageResponse({
        changes: ["title", "content", "status"],
        message: "Page fully updated",
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.changes).toContain("title");
      expect(result.changes).toContain("content");
      expect(result.changes).toContain("status");
      expect(result.message).toBe("Page fully updated");
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should handle version increment", async () => {
      const request = pagesMockFactory.createUpdatePageRequest({
        versionNumber: 5,
      });
      const mockResponse = pagesMockFactory.createUpdatePageResponse({
        previousVersion: 5,
        currentVersion: 6,
        changes: ["content"],
        message: "Version incremented",
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.previousVersion).toBe(5);
      expect(result.currentVersion).toBe(6);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should handle different content formats", async () => {
      const formats = [
        { format: "storage", content: "<p>Storage format</p>" },
        { format: "editor", content: '{"type":"doc","content":[]}' },
        { format: "wiki", content: "h1. Wiki format" },
        { format: "atlas_doc_format", content: '{"version":1,"type":"doc"}' },
      ] as const;

      for (const { format, content } of formats) {
        const request = pagesMockFactory.createUpdatePageRequest({
          content,
          contentFormat: format,
        });
        const mockResponse = pagesMockFactory.createUpdatePageResponse();
        mockExecute.mockResolvedValue(mockResponse);

        const result = await handler.handle(request);

        expect(result).toEqual(mockResponse);
        expect(mockExecute).toHaveBeenCalledWith(request);
      }
    });

    test("should handle update with version message", async () => {
      const request = pagesMockFactory.createUpdatePageRequest({
        versionMessage: "Fixed formatting issues",
      });
      const mockResponse = pagesMockFactory.createUpdatePageResponse({
        message: "Page updated with version message",
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.message).toBe("Page updated with version message");
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should handle minimal update request", async () => {
      const request = pagesMockFactory.createUpdatePageRequest({
        pageId: "123456",
        versionNumber: 1,
      });
      const mockResponse = pagesMockFactory.createUpdatePageResponse({
        changes: [],
        message: "No changes detected",
      });
      mockExecute.mockResolvedValue(mockResponse);

      const result = await handler.handle(request);

      expect(result.changes).toEqual([]);
      expect(result.message).toBe("No changes detected");
      expect(mockExecute).toHaveBeenCalledWith(request);
    });
  });
});
