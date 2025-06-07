import { beforeEach, describe, expect, mock, test } from "bun:test";
import { CreatePageHandler } from "@features/confluence/domains/pages/handlers/create-page.handler";
import type { CreatePageUseCase } from "@features/confluence/domains/pages/use-cases";
import { ValidationError } from "@features/confluence/shared/validators";
import { PagesMockFactory } from "@test/__mocks__/v2/domains/pages/pages-mock-factory";

describe("CreatePageHandler", () => {
  let handler: CreatePageHandler;
  let mockCreatePageUseCase: CreatePageUseCase;
  let pagesMockFactory: PagesMockFactory;
  let mockExecute: ReturnType<typeof mock>;

  beforeEach(() => {
    // Initialize mock factory
    pagesMockFactory = new PagesMockFactory();

    // Create mock execute function
    mockExecute = mock();

    // Create mock use case with just the execute method
    mockCreatePageUseCase = {
      execute: mockExecute,
    } as unknown as CreatePageUseCase;

    // Initialize handler with dependency injection
    handler = new CreatePageHandler(mockCreatePageUseCase);
  });

  describe("Constructor", () => {
    test("should initialize with injected use case", () => {
      expect(handler).toBeInstanceOf(CreatePageHandler);
      expect(mockCreatePageUseCase).toBeDefined();
    });
  });

  describe("Parameter Validation", () => {
    test("should throw ValidationError when spaceId is missing", async () => {
      const request = pagesMockFactory.createCreatePageRequest({
        spaceId: "",
      });

      await expect(handler.handle(request)).rejects.toThrow(ValidationError);
    });

    test("should throw ValidationError when title is missing", async () => {
      const request = pagesMockFactory.createCreatePageRequest({
        title: "",
      });

      await expect(handler.handle(request)).rejects.toThrow(ValidationError);
    });

    test("should throw ValidationError when content is missing", async () => {
      const request = pagesMockFactory.createCreatePageRequest({
        content: "",
      });

      await expect(handler.handle(request)).rejects.toThrow(ValidationError);
    });

    test("should accept valid request with required fields", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      const mockResponse = pagesMockFactory.createCreatePageResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should accept valid request with all fields", async () => {
      const request = pagesMockFactory.createCreatePageRequest({
        parentPageId: "parent-123",
        status: "draft",
        contentFormat: "editor",
      });
      const mockResponse = pagesMockFactory.createCreatePageResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });
  });

  describe("Use Case Integration", () => {
    test("should call use case with correct parameters", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      const mockResponse = pagesMockFactory.createCreatePageResponse();
      mockExecute.mockResolvedValue(mockResponse);

      await handler.handle(request);

      expect(mockExecute).toHaveBeenCalledWith(request);
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });

    test("should return response from use case", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      const mockResponse = pagesMockFactory.createCreatePageResponse({
        page: pagesMockFactory.createPage({
          title: pagesMockFactory.createPageTitle("Test Page"),
        }),
        message: "Page created successfully",
      });
      mockExecute.mockResolvedValue(mockResponse);

      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(response.page.title.value).toBe("Test Page");
      expect(response.message).toBe("Page created successfully");
    });

    test("should handle use case errors and wrap them in ValidationError", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      const originalError = new Error("Use case failed");
      mockExecute.mockRejectedValue(originalError);

      await expect(handler.handle(request)).rejects.toThrow(
        "Failed to create page: Use case failed",
      );
    });

    test("should preserve ValidationError from use case", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      const validationError = new ValidationError("Space not found");
      mockExecute.mockRejectedValue(validationError);

      await expect(handler.handle(request)).rejects.toThrow(validationError);
    });

    test("should handle unknown errors gracefully", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      const unknownError = "Unknown error string";
      mockExecute.mockRejectedValue(unknownError);

      await expect(handler.handle(request)).rejects.toThrow(
        "Failed to create page: Unknown error",
      );
    });
  });

  describe("Response Structure", () => {
    test("should return response with page, context, and message", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      const mockResponse = pagesMockFactory.createCreatePageResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const response = await handler.handle(request);

      expect(response).toHaveProperty("page");
      expect(response).toHaveProperty("context");
      expect(response).toHaveProperty("message");
      expect(response.page).toBeDefined();
      expect(response.context).toBeDefined();
      expect(typeof response.message).toBe("string");
    });

    test("should handle page creation response", async () => {
      const request = pagesMockFactory.createCreatePageRequest({
        title: "New Page",
        content: "<p>New content</p>",
      });
      const mockResponse = pagesMockFactory.createCreatePageResponse({
        page: pagesMockFactory.createPage({
          title: pagesMockFactory.createPageTitle("New Page"),
          body: pagesMockFactory.createPageBody({
            storage: {
              value: "<p>New content</p>",
              representation: "storage",
            },
          }),
        }),
      });
      mockExecute.mockResolvedValue(mockResponse);

      const response = await handler.handle(request);

      expect(response.page.title.value).toBe("New Page");
      expect(response.page.body?.storage?.value).toBe("<p>New content</p>");
    });

    test("should handle blog post creation", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      const mockResponse = pagesMockFactory.createCreatePageResponse({
        page: pagesMockFactory.createPage({
          type: "blogpost",
        }),
      });
      mockExecute.mockResolvedValue(mockResponse);

      const response = await handler.handle(request);

      expect(response.page.type).toBe("blogpost");
    });

    test("should handle draft page creation", async () => {
      const request = pagesMockFactory.createCreatePageRequest({
        status: "draft",
      });
      const mockResponse = pagesMockFactory.createCreatePageResponse({
        page: pagesMockFactory.createPage({
          status: "draft",
        }),
      });
      mockExecute.mockResolvedValue(mockResponse);

      const response = await handler.handle(request);

      expect(response.page.status).toBe("draft");
    });
  });

  describe("Edge Cases", () => {
    test("should handle null response from use case", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      mockExecute.mockResolvedValue(null);

      const response = await handler.handle(request);
      expect(response).toBeNull();
    });

    test("should handle undefined response from use case", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      mockExecute.mockResolvedValue(undefined);

      const response = await handler.handle(request);
      expect(response).toBeUndefined();
    });

    test("should handle page with long title", async () => {
      const longTitle = "A".repeat(500);
      const request = pagesMockFactory.createCreatePageRequest({
        title: longTitle,
      });

      // The validator should catch this and throw a ValidationError
      await expect(handler.handle(request)).rejects.toThrow(
        "Page title is too long (maximum 255 characters)",
      );
    });

    test("should handle page with long content", async () => {
      const longContent = `<p>${"A".repeat(10000)}</p>`;
      const request = pagesMockFactory.createCreatePageRequest({
        content: longContent,
      });
      const mockResponse = pagesMockFactory.createCreatePageResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
    });

    test("should handle page with parent", async () => {
      const request = pagesMockFactory.createCreatePageRequest({
        parentPageId: "parent-page-123",
      });
      const mockResponse = pagesMockFactory.createCreatePageResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should handle different content formats", async () => {
      const formats: Array<"storage" | "editor" | "wiki" | "atlas_doc_format"> =
        ["storage", "editor", "wiki", "atlas_doc_format"];

      for (const format of formats) {
        const request = pagesMockFactory.createCreatePageRequest({
          contentFormat: format,
        });
        const mockResponse = pagesMockFactory.createCreatePageResponse();
        mockExecute.mockResolvedValue(mockResponse);

        const response = await handler.handle(request);
        expect(response).toEqual(mockResponse);
      }
    });
  });

  describe("Error Handling", () => {
    test("should preserve error context from use case", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      const originalError = new Error("Database connection failed");
      mockExecute.mockRejectedValue(originalError);

      try {
        await handler.handle(request);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Database connection failed",
        );
      }
    });

    test("should handle space not found error", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      const notFoundError = new Error("Space not found");
      mockExecute.mockRejectedValue(notFoundError);

      await expect(handler.handle(request)).rejects.toThrow("Space not found");
    });

    test("should handle permission denied error", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      const permissionError = new Error("Permission denied");
      mockExecute.mockRejectedValue(permissionError);

      await expect(handler.handle(request)).rejects.toThrow(
        "Permission denied",
      );
    });

    test("should handle parent page not found error", async () => {
      const request = pagesMockFactory.createCreatePageRequest({
        parentPageId: "non-existent-parent",
      });
      const parentError = new Error("Parent page not found");
      mockExecute.mockRejectedValue(parentError);

      await expect(handler.handle(request)).rejects.toThrow(
        "Parent page not found",
      );
    });

    test("should validate handler flow with error", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      const error = new Error("Service unavailable");
      mockExecute.mockRejectedValue(error);

      await expect(handler.handle(request)).rejects.toThrow();
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });
  });

  describe("Business Logic", () => {
    test("should handle standard page creation", async () => {
      const request = pagesMockFactory.createCreatePageRequest({
        title: "Standard Page",
        content: "<p>Standard content</p>",
        status: "current",
      });
      const mockResponse = pagesMockFactory.createCreatePageResponse({
        page: pagesMockFactory.createPage({
          title: pagesMockFactory.createPageTitle("Standard Page"),
          status: "current",
        }),
      });
      mockExecute.mockResolvedValue(mockResponse);

      const response = await handler.handle(request);

      expect(response.page.title.value).toBe("Standard Page");
      expect(response.page.status).toBe("current");
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should handle child page creation", async () => {
      const request = pagesMockFactory.createCreatePageRequest({
        title: "Child Page",
        parentPageId: "parent-123",
      });
      const mockResponse = pagesMockFactory.createCreatePageResponse();
      mockExecute.mockResolvedValue(mockResponse);

      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should handle blog post creation with different format", async () => {
      const request = pagesMockFactory.createCreatePageRequest({
        title: "Blog Post",
        content: "# Blog Content",
        contentFormat: "wiki",
      });
      const mockResponse = pagesMockFactory.createCreatePageResponse({
        page: pagesMockFactory.createPage({
          type: "blogpost",
        }),
      });
      mockExecute.mockResolvedValue(mockResponse);

      const response = await handler.handle(request);

      expect(response.page.type).toBe("blogpost");
    });

    test("should handle page creation with context", async () => {
      const request = pagesMockFactory.createCreatePageRequest();
      const mockResponse = pagesMockFactory.createCreatePageResponse({
        context: pagesMockFactory.createPageContext({
          space: {
            id: "space-123",
            key: "TEST",
            name: "Test Space",
            type: "global",
            links: { webui: "/spaces/TEST" },
          },
        }),
      });
      mockExecute.mockResolvedValue(mockResponse);

      const response = await handler.handle(request);

      expect(response.context.space.key).toBe("TEST");
      expect(response.context.space.name).toBe("Test Space");
    });
  });
});
