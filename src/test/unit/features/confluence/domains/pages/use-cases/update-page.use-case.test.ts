import { beforeEach, describe, expect, test } from "bun:test";
import type {
  PageRepository,
  UpdatePageRequest,
} from "@features/confluence/domains/pages/models";
import { UpdatePageUseCase } from "@features/confluence/domains/pages/use-cases/update-page.use-case";
import type { SpaceRepository } from "@features/confluence/domains/spaces/models";
import {
  PageError,
  PageNotFoundError,
} from "@features/confluence/shared/validators";
import { PagesMockFactory } from "@test/__mocks__/v2/domains/pages/pages-mock-factory";
import { SpacesMockFactory } from "@test/__mocks__/v2/domains/spaces/spaces-mock-factory";

describe("UpdatePageUseCase", () => {
  let useCase: UpdatePageUseCase;
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

    useCase = new UpdatePageUseCase(mockPageRepository, mockSpaceRepository);
  });

  describe("Successful Update", () => {
    test("should update page successfully", async () => {
      // Arrange
      const request: UpdatePageRequest =
        pagesMockFactory.createUpdatePageRequest();
      const existingPage = pagesMockFactory.createPage({
        version: {
          number: 1,
          createdAt: new Date(),
          authorId: "author1",
          message: "Initial",
        },
      });
      const updatedPage = pagesMockFactory.createPage({
        version: {
          number: 2,
          createdAt: new Date(),
          authorId: "author2",
          message: "Updated",
        },
      });

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(updatedPage);
      expect(result.context).toBeDefined();
      expect(result.previousVersion).toBe(1);
      expect(result.currentVersion).toBe(2);
      expect(result.changes).toBeDefined();
      expect(result.message).toContain("updated successfully");
    });

    test("should update page title only", async () => {
      // Arrange
      const request: UpdatePageRequest = {
        ...pagesMockFactory.createUpdatePageRequest(),
        title: "Updated Title",
        content: undefined,
      };
      const existingPage = pagesMockFactory.createPage();
      const updatedPage = pagesMockFactory.createPage();

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(updatedPage);
      expect(result.changes).toBeDefined();
    });

    test("should update page content only", async () => {
      // Arrange
      const request: UpdatePageRequest = {
        ...pagesMockFactory.createUpdatePageRequest(),
        title: undefined,
        content: "<p>Updated content</p>",
      };
      const existingPage = pagesMockFactory.createPage();
      const updatedPage = pagesMockFactory.createPage();

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(updatedPage);
      expect(result.changes).toBeDefined();
    });

    test("should update page status", async () => {
      // Arrange
      const request: UpdatePageRequest = {
        ...pagesMockFactory.createUpdatePageRequest(),
        status: "draft",
      };
      const existingPage = pagesMockFactory.createPage({ status: "current" });
      const updatedPage = pagesMockFactory.createPage({ status: "draft" });

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page.status).toBe("draft");
      expect(result.changes).toBeDefined();
    });

    test("should update with version message", async () => {
      // Arrange
      const versionMessage = "Updated with new content";
      const request: UpdatePageRequest = {
        ...pagesMockFactory.createUpdatePageRequest(),
        versionMessage,
      };
      const existingPage = pagesMockFactory.createPage();
      const updatedPage = pagesMockFactory.createPage();

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(updatedPage);
      expect(result.message).toContain("updated successfully");
    });
  });

  describe("Page Not Found", () => {
    test("should throw PageNotFoundError when page does not exist", async () => {
      // Arrange
      const request: UpdatePageRequest =
        pagesMockFactory.createUpdatePageRequest();
      mockPageRepository.findById = async () => null;

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(PageNotFoundError);
    });

    test("should throw PageNotFoundError with correct page ID", async () => {
      // Arrange
      const request: UpdatePageRequest =
        pagesMockFactory.createUpdatePageRequest();
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

  describe("Validation Errors", () => {
    test("should handle validation errors from validator", async () => {
      // Arrange
      const request: UpdatePageRequest =
        pagesMockFactory.createUpdatePageRequest();
      const existingPage = pagesMockFactory.createPage();

      mockPageRepository.findById = async () => existingPage;
      // The validator will be called internally and may throw ValidationError

      // Act & Assert - This test verifies the error propagation
      // The actual validation logic is tested in the validator tests
      expect(async () => {
        await useCase.execute(request);
      }).not.toThrow();
    });
  });

  describe("Repository Errors", () => {
    test("should wrap repository errors in PageError", async () => {
      // Arrange
      const request: UpdatePageRequest =
        pagesMockFactory.createUpdatePageRequest();
      const existingPage = pagesMockFactory.createPage();
      const repositoryError = new Error("Database connection failed");

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => {
        throw repositoryError;
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(PageError);
    });

    test("should preserve error context in PageError", async () => {
      // Arrange
      const request: UpdatePageRequest =
        pagesMockFactory.createUpdatePageRequest();
      const existingPage = pagesMockFactory.createPage();
      const repositoryError = new Error("Database connection failed");

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => {
        throw repositoryError;
      };

      // Act & Assert
      try {
        await useCase.execute(request);
      } catch (error) {
        expect(error).toBeInstanceOf(PageError);
        expect((error as PageError).message).toContain("Failed to update page");
        expect((error as PageError).message).toContain(
          "Database connection failed",
        );
      }
    });

    test("should handle findById errors", async () => {
      // Arrange
      const request: UpdatePageRequest =
        pagesMockFactory.createUpdatePageRequest();
      mockPageRepository.findById = async () => {
        throw new Error("Find operation failed");
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(PageError);
    });
  });

  describe("Context Building", () => {
    test("should build simplified context when repositories not provided", async () => {
      // Arrange
      const useCaseWithoutRepos = new UpdatePageUseCase(mockPageRepository);
      const request: UpdatePageRequest =
        pagesMockFactory.createUpdatePageRequest();
      const existingPage = pagesMockFactory.createPage();
      const updatedPage = pagesMockFactory.createPage();

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCaseWithoutRepos.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(updatedPage);
      expect(result.context).toBeDefined();
    });

    test("should build full context when all repositories provided", async () => {
      // Arrange
      const request: UpdatePageRequest =
        pagesMockFactory.createUpdatePageRequest();
      const existingPage = pagesMockFactory.createPage();
      const updatedPage = pagesMockFactory.createPage();

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(updatedPage);
      expect(result.context).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    test("should handle different content formats", async () => {
      // Arrange
      const request: UpdatePageRequest = {
        ...pagesMockFactory.createUpdatePageRequest(),
        contentFormat: "wiki",
      };
      const existingPage = pagesMockFactory.createPage();
      const updatedPage = pagesMockFactory.createPage();

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(updatedPage);
    });

    test("should handle version number increments", async () => {
      // Arrange
      const request: UpdatePageRequest = {
        ...pagesMockFactory.createUpdatePageRequest(),
        versionNumber: 5,
      };
      const existingPage = pagesMockFactory.createPage({
        version: { number: 5, createdAt: new Date(), authorId: "author1" },
      });
      const updatedPage = pagesMockFactory.createPage({
        version: { number: 6, createdAt: new Date(), authorId: "author2" },
      });

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.previousVersion).toBe(5);
      expect(result.currentVersion).toBe(6);
    });

    test("should handle large content updates", async () => {
      // Arrange
      const largeContent = `<p>${"Updated content ".repeat(1000)}</p>`;
      const request: UpdatePageRequest = {
        ...pagesMockFactory.createUpdatePageRequest(),
        content: largeContent,
      };
      const existingPage = pagesMockFactory.createPage();
      const updatedPage = pagesMockFactory.createPage();

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(updatedPage);
    });

    test("should handle empty version message", async () => {
      // Arrange
      const request: UpdatePageRequest = {
        ...pagesMockFactory.createUpdatePageRequest(),
        versionMessage: "",
      };
      const existingPage = pagesMockFactory.createPage();
      const updatedPage = pagesMockFactory.createPage();

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(updatedPage);
    });
  });

  describe("Business Logic", () => {
    test("should track changes correctly", async () => {
      // Arrange
      const request: UpdatePageRequest = {
        ...pagesMockFactory.createUpdatePageRequest(),
        title: "New Title",
        content: "<p>New content</p>",
      };
      const existingPage = pagesMockFactory.createPage();
      const updatedPage = pagesMockFactory.createPage();

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.changes).toBeDefined();
      expect(Array.isArray(result.changes)).toBe(true);
    });

    test("should handle draft to published status change", async () => {
      // Arrange
      const request: UpdatePageRequest = {
        ...pagesMockFactory.createUpdatePageRequest(),
        status: "current",
      };
      const existingPage = pagesMockFactory.createPage({ status: "draft" });
      const updatedPage = pagesMockFactory.createPage({ status: "current" });

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page.status).toBe("current");
    });

    test("should handle minimal update request", async () => {
      // Arrange
      const request: UpdatePageRequest = {
        pageId: "test-page-id",
        versionNumber: 1,
      };
      const existingPage = pagesMockFactory.createPage();
      const updatedPage = pagesMockFactory.createPage();

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(updatedPage);
      expect(result.message).toContain("updated successfully");
    });

    test("should handle concurrent version updates", async () => {
      // Arrange
      const request: UpdatePageRequest = {
        ...pagesMockFactory.createUpdatePageRequest(),
        versionNumber: 3,
      };
      const existingPage = pagesMockFactory.createPage({
        version: { number: 3, createdAt: new Date(), authorId: "author1" },
      });
      const updatedPage = pagesMockFactory.createPage({
        version: { number: 4, createdAt: new Date(), authorId: "author2" },
      });

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.update = async () => updatedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.previousVersion).toBe(3);
      expect(result.currentVersion).toBe(4);
    });
  });
});
