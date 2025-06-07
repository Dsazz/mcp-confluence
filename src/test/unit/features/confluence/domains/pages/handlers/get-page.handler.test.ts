import { beforeEach, describe, expect, mock, test } from "bun:test";
import { ValidationError } from "@core/errors";
import { GetPageHandler } from "@features/confluence/domains/pages/handlers/get-page.handler";
import type {
  GetPageRequest,
  GetPageResponse,
} from "@features/confluence/domains/pages/models";
import type { GetPageByIdUseCase } from "@features/confluence/domains/pages/use-cases";
import { PagesMockFactory } from "@test/__mocks__/v2/domains/pages/pages-mock-factory";

describe("GetPageHandler", () => {
  let handler: GetPageHandler;
  let mockGetPageByIdUseCase: GetPageByIdUseCase;
  let pagesMockFactory: PagesMockFactory;
  let mockExecute: ReturnType<typeof mock>;

  beforeEach(() => {
    // Initialize mock factory
    pagesMockFactory = new PagesMockFactory();

    // Create mock execute function
    mockExecute = mock();

    // Create mock use case with just the execute method
    mockGetPageByIdUseCase = {
      execute: mockExecute,
    } as unknown as GetPageByIdUseCase;

    // Initialize handler with dependency injection
    handler = new GetPageHandler(mockGetPageByIdUseCase);
  });

  describe("Constructor", () => {
    test("should initialize with injected use case", () => {
      expect(handler).toBeInstanceOf(GetPageHandler);
      expect(mockGetPageByIdUseCase).toBeDefined();
    });
  });

  describe("Parameter Validation", () => {
    test("should throw ValidationError when pageId is missing", async () => {
      const request = {} as GetPageRequest;

      await expect(handler.handle(request)).rejects.toThrow("Required");
    });

    test("should throw ValidationError when pageId is empty", async () => {
      const request: GetPageRequest = { pageId: "" };

      await expect(handler.handle(request)).rejects.toThrow(
        "Page ID cannot be empty",
      );
    });

    test("should throw ValidationError when pageId is not a string", async () => {
      const request = { pageId: 123 } as unknown as GetPageRequest;

      await expect(handler.handle(request)).rejects.toThrow(
        "Expected string, received number",
      );
    });

    test("should accept valid minimal request", async () => {
      const mockPage = pagesMockFactory.createPage();
      const mockResponse: GetPageResponse = {
        page: mockPage,
        context: pagesMockFactory.createPageContext(),
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetPageRequest = { pageId: "123456" };
      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should accept request with all optional parameters", async () => {
      const mockPage = pagesMockFactory.createPage();
      const mockResponse: GetPageResponse = {
        page: mockPage,
        context: pagesMockFactory.createPageContext(),
        commentCount: 5,
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetPageRequest = {
        pageId: "123456",
        includeContent: true,
        includeComments: true,
        expand: "body.storage,version",
      };

      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });
  });

  describe("Use Case Integration", () => {
    test("should call use case with correct parameters", async () => {
      const mockPage = pagesMockFactory.createPage();
      const mockResponse: GetPageResponse = {
        page: mockPage,
        context: pagesMockFactory.createPageContext(),
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetPageRequest = {
        pageId: "123456",
        includeContent: true,
        expand: "body.storage",
      };

      await handler.handle(request);

      expect(mockExecute).toHaveBeenCalledWith(request);
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });

    test("should return response from use case", async () => {
      const mockPage = pagesMockFactory.createPage({
        title: pagesMockFactory.createPageTitle("Test Page"),
      });
      const mockContext = pagesMockFactory.createPageContext();
      const mockResponse: GetPageResponse = {
        page: mockPage,
        context: mockContext,
        commentCount: 3,
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetPageRequest = {
        pageId: "123456",
        includeComments: true,
      };

      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(response.page.title.value).toBe("Test Page");
      expect(response.commentCount).toBe(3);
    });

    test("should handle use case errors and wrap them in ValidationError", async () => {
      const originalError = new Error("Use case failed");
      mockExecute.mockRejectedValue(originalError);

      const request: GetPageRequest = { pageId: "123456" };

      await expect(handler.handle(request)).rejects.toThrow(
        "Failed to get page: Use case failed",
      );
    });

    test("should preserve ValidationError from use case", async () => {
      const validationError = new ValidationError("Invalid page ID format");
      mockExecute.mockRejectedValue(validationError);

      const request: GetPageRequest = { pageId: "invalid-id" };

      await expect(handler.handle(request)).rejects.toThrow(
        "Failed to get page: Invalid page ID format",
      );
    });
  });

  describe("Response Structure", () => {
    test("should return response with page and context", async () => {
      const mockPage = pagesMockFactory.createPage();
      const mockContext = pagesMockFactory.createPageContext();
      const mockResponse: GetPageResponse = {
        page: mockPage,
        context: mockContext,
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetPageRequest = { pageId: "123456" };
      const response = await handler.handle(request);

      expect(response).toHaveProperty("page");
      expect(response).toHaveProperty("context");
      expect(response.page).toEqual(mockPage);
      expect(response.context).toEqual(mockContext);
    });

    test("should include comment count when requested", async () => {
      const mockPage = pagesMockFactory.createPage();
      const mockResponse: GetPageResponse = {
        page: mockPage,
        context: pagesMockFactory.createPageContext(),
        commentCount: 7,
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetPageRequest = {
        pageId: "123456",
        includeComments: true,
      };

      const response = await handler.handle(request);

      expect(response).toHaveProperty("commentCount");
      expect(response.commentCount).toBe(7);
    });

    test("should not include comment count when not requested", async () => {
      const mockPage = pagesMockFactory.createPage();
      const mockResponse: GetPageResponse = {
        page: mockPage,
        context: pagesMockFactory.createPageContext(),
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetPageRequest = { pageId: "123456" };
      const response = await handler.handle(request);

      expect(response).toHaveProperty("page");
      expect(response).toHaveProperty("context");
      expect(response).not.toHaveProperty("commentCount");
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty expand parameter", async () => {
      const mockPage = pagesMockFactory.createPage();
      const mockResponse: GetPageResponse = {
        page: mockPage,
        context: pagesMockFactory.createPageContext(),
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetPageRequest = {
        pageId: "123456",
        expand: "",
      };

      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });

    test("should handle boolean parameters correctly", async () => {
      const mockPage = pagesMockFactory.createPage();
      const mockResponse: GetPageResponse = {
        page: mockPage,
        context: pagesMockFactory.createPageContext(),
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetPageRequest = {
        pageId: "123456",
        includeContent: false,
        includeComments: false,
      };

      const response = await handler.handle(request);

      expect(response).toEqual(mockResponse);
      expect(mockExecute).toHaveBeenCalledWith(request);
    });
  });

  describe("Value Objects Integration", () => {
    test("should work with PageId value objects", async () => {
      const pageId = pagesMockFactory.createPageId("test-page-123");
      const mockPage = pagesMockFactory.createPage({ id: pageId });
      const mockResponse: GetPageResponse = {
        page: mockPage,
        context: pagesMockFactory.createPageContext(),
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetPageRequest = { pageId: "test-page-123" };
      const response = await handler.handle(request);

      expect(response.page.id.value).toBe("test-page-123");
    });

    test("should work with PageTitle value objects", async () => {
      const pageTitle = pagesMockFactory.createPageTitle("My Test Page");
      const mockPage = pagesMockFactory.createPage({ title: pageTitle });
      const mockResponse: GetPageResponse = {
        page: mockPage,
        context: pagesMockFactory.createPageContext(),
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetPageRequest = { pageId: "123456" };
      const response = await handler.handle(request);

      expect(response.page.title.value).toBe("My Test Page");
    });
  });

  describe("Mock Factory Integration", () => {
    test("should create realistic test data using mock factory", async () => {
      const mockPage = pagesMockFactory.createPage({
        type: "page",
        status: "current",
      });
      const mockResponse: GetPageResponse = {
        page: mockPage,
        context: pagesMockFactory.createPageContext(),
      };

      mockExecute.mockResolvedValue(mockResponse);

      const request: GetPageRequest = { pageId: "123456" };
      const response = await handler.handle(request);

      expect(response.page.type).toBe("page");
      expect(response.page.status).toBe("current");
      expect(response.page.id).toBeDefined();
      expect(response.page.title).toBeDefined();
      expect(response.page.createdAt).toBeInstanceOf(Date);
      expect(response.page.links).toBeDefined();
      expect(response.page.permissions).toBeDefined();
    });

    test("should create multiple pages with different data", async () => {
      const pages = pagesMockFactory.createPages(3);

      expect(pages).toHaveLength(3);
      expect(pages[0].id.value).not.toBe(pages[1].id.value);
      expect(pages[1].id.value).not.toBe(pages[2].id.value);
      expect(pages[0].title.value).not.toBe(pages[1].title.value);
    });
  });
});
