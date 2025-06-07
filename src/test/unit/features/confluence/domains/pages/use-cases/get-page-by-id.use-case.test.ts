import { beforeEach, describe, expect, test } from "bun:test";
import type {
  GetPageRequest,
  PageRepository,
} from "@features/confluence/domains/pages/models";
import { GetPageByIdUseCase } from "@features/confluence/domains/pages/use-cases/get-page-by-id.use-case";
import type { SpaceRepository } from "@features/confluence/domains/spaces/models";
import {
  PageError,
  PageNotFoundError,
} from "@features/confluence/shared/validators";
import { PagesMockFactory } from "@test/__mocks__/v2/domains/pages/pages-mock-factory";
import { SpacesMockFactory } from "@test/__mocks__/v2/domains/spaces/spaces-mock-factory";

describe("GetPageByIdUseCase", () => {
  let useCase: GetPageByIdUseCase;
  let mockPageRepository: PageRepository;
  let mockSpaceRepository: SpaceRepository;
  let pagesMockFactory: PagesMockFactory;
  let spacesMockFactory: SpacesMockFactory;

  beforeEach(() => {
    pagesMockFactory = new PagesMockFactory();
    spacesMockFactory = new SpacesMockFactory();

    // Mock PageRepository with all required methods
    mockPageRepository = {
      findById: async () => null,
      findByTitle: async () => null,
      findBySpaceId: async () => ({
        pages: [],
        pagination: { size: 0, start: 0 },
      }),
      findChildren: async () => ({
        pages: [],
        pagination: { size: 0, start: 0 },
      }),
      create: async () => pagesMockFactory.createPage(),
      update: async () => pagesMockFactory.createPage(),
      delete: async () => {},
      exists: async () => false,
      search: async () => ({ pages: [], pagination: { size: 0, start: 0 } }),
      getVersion: async () => pagesMockFactory.createPageVersion(),
      getCommentCount: async () => 0,
    } as unknown as PageRepository;

    // Mock SpaceRepository
    mockSpaceRepository = {
      findAll: async () => ({
        spaces: [],
        summary: {
          total: 0,
          globalSpaces: 0,
          personalSpaces: 0,
          archivedSpaces: 0,
        },
      }),
      findByKey: async () => null,
      findById: async () => null,
      create: async () => spacesMockFactory.createSpace(),
      update: async () => spacesMockFactory.createSpace(),
      delete: async () => {},
      exists: async () => false,
      getStatistics: async () => ({
        total: 0,
        globalSpaces: 0,
        personalSpaces: 0,
        archivedSpaces: 0,
      }),
    } as unknown as SpaceRepository;

    useCase = new GetPageByIdUseCase(mockPageRepository, mockSpaceRepository);
  });

  describe("Successful Retrieval", () => {
    test("should retrieve page by ID successfully", async () => {
      // Arrange
      const request: GetPageRequest = pagesMockFactory.createGetPageRequest();
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
      expect(result.context).toBeDefined();
      expect(result.commentCount).toBeUndefined(); // Not requested
    });

    test("should retrieve page with comment count when requested", async () => {
      // Arrange
      const request: GetPageRequest = {
        ...pagesMockFactory.createGetPageRequest(),
        includeComments: true,
      };
      const expectedPage = pagesMockFactory.createPage();
      const expectedCommentCount = 5;
      mockPageRepository.findById = async () => expectedPage;
      mockPageRepository.getCommentCount = async () => expectedCommentCount;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
      expect(result.context).toBeDefined();
      expect(result.commentCount).toBe(expectedCommentCount);
    });

    test("should retrieve page with content when requested", async () => {
      // Arrange
      const request: GetPageRequest = {
        ...pagesMockFactory.createGetPageRequest(),
        includeContent: true,
      };
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
      expect(result.context).toBeDefined();
    });

    test("should retrieve page with expanded properties", async () => {
      // Arrange
      const request: GetPageRequest = {
        ...pagesMockFactory.createGetPageRequest(),
        expand: "version,space,ancestors",
      };
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
      expect(result.context).toBeDefined();
    });
  });

  describe("Page Not Found", () => {
    test("should throw PageNotFoundError when page does not exist", async () => {
      // Arrange
      const request: GetPageRequest = pagesMockFactory.createGetPageRequest();
      mockPageRepository.findById = async () => null;

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(PageNotFoundError);
    });

    test("should throw PageNotFoundError with correct page ID", async () => {
      // Arrange
      const request: GetPageRequest = pagesMockFactory.createGetPageRequest();
      mockPageRepository.findById = async () => null;

      // Act & Assert
      try {
        await useCase.execute(request);
      } catch (error) {
        expect(error).toBeInstanceOf(PageNotFoundError);
        expect((error as PageNotFoundError).message).toContain(request.pageId);
      }
    });
  });

  describe("Repository Errors", () => {
    test("should wrap repository errors in PageError", async () => {
      // Arrange
      const request: GetPageRequest = pagesMockFactory.createGetPageRequest();
      const repositoryError = new Error("Database connection failed");
      mockPageRepository.findById = async () => {
        throw repositoryError;
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(PageError);
    });

    test("should preserve error context in PageError", async () => {
      // Arrange
      const request: GetPageRequest = pagesMockFactory.createGetPageRequest();
      const repositoryError = new Error("Database connection failed");
      mockPageRepository.findById = async () => {
        throw repositoryError;
      };

      // Act & Assert
      try {
        await useCase.execute(request);
      } catch (error) {
        expect(error).toBeInstanceOf(PageError);
        expect((error as PageError).message).toContain(
          "Failed to retrieve page",
        );
        expect((error as PageError).message).toContain(
          "Database connection failed",
        );
      }
    });

    test("should handle comment count retrieval errors", async () => {
      // Arrange
      const request: GetPageRequest = {
        ...pagesMockFactory.createGetPageRequest(),
        includeComments: true,
      };
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => expectedPage;
      mockPageRepository.getCommentCount = async () => {
        throw new Error("Comment service unavailable");
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(PageError);
    });
  });

  describe("Context Building", () => {
    test("should build simplified context when repositories not provided", async () => {
      // Arrange
      const useCaseWithoutRepos = new GetPageByIdUseCase(mockPageRepository);
      const request: GetPageRequest = pagesMockFactory.createGetPageRequest();
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => expectedPage;

      // Act
      const result = await useCaseWithoutRepos.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
      expect(result.context).toBeDefined();
    });

    test("should build full context when all repositories provided", async () => {
      // Arrange
      const request: GetPageRequest = pagesMockFactory.createGetPageRequest();
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
      expect(result.context).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    test("should handle different page ID formats", async () => {
      // Arrange
      const request: GetPageRequest = {
        ...pagesMockFactory.createGetPageRequest(),
        pageId: "123456789",
      };
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
    });

    test("should handle zero comment count", async () => {
      // Arrange
      const request: GetPageRequest = {
        ...pagesMockFactory.createGetPageRequest(),
        includeComments: true,
      };
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => expectedPage;
      mockPageRepository.getCommentCount = async () => 0;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.commentCount).toBe(0);
    });

    test("should handle large comment counts", async () => {
      // Arrange
      const request: GetPageRequest = {
        ...pagesMockFactory.createGetPageRequest(),
        includeComments: true,
      };
      const expectedPage = pagesMockFactory.createPage();
      const largeCommentCount = 9999;
      mockPageRepository.findById = async () => expectedPage;
      mockPageRepository.getCommentCount = async () => largeCommentCount;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.commentCount).toBe(largeCommentCount);
    });
  });

  describe("Business Logic", () => {
    test("should handle draft page retrieval", async () => {
      // Arrange
      const request: GetPageRequest = pagesMockFactory.createGetPageRequest();
      const draftPage = pagesMockFactory.createPage({ status: "draft" });
      mockPageRepository.findById = async () => draftPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page.status).toBe("draft");
    });

    test("should handle archived page retrieval", async () => {
      // Arrange
      const request: GetPageRequest = pagesMockFactory.createGetPageRequest();
      const archivedPage = pagesMockFactory.createPage({ status: "trashed" });
      mockPageRepository.findById = async () => archivedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page.status).toBe("trashed");
    });

    test("should handle blog post retrieval", async () => {
      // Arrange
      const request: GetPageRequest = pagesMockFactory.createGetPageRequest();
      const blogPost = pagesMockFactory.createPage({ type: "blogpost" });
      mockPageRepository.findById = async () => blogPost;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page.type).toBe("blogpost");
    });
  });
});
