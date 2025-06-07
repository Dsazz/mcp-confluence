import { beforeEach, describe, expect, test } from "bun:test";
import type {
  CreatePageRequest,
  PageRepository,
} from "@features/confluence/domains/pages/models";
import { CreatePageUseCase } from "@features/confluence/domains/pages/use-cases/create-page.use-case";
import type { SpaceRepository } from "@features/confluence/domains/spaces/models";
import {
  PageError,
  PageNotFoundError,
  ValidationError,
} from "@features/confluence/shared/validators";
import { PagesMockFactory } from "@test/__mocks__/v2/domains/pages/pages-mock-factory";
import { SpacesMockFactory } from "@test/__mocks__/v2/domains/spaces/spaces-mock-factory";

describe("CreatePageUseCase", () => {
  let useCase: CreatePageUseCase;
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

    useCase = new CreatePageUseCase(mockPageRepository, mockSpaceRepository);
  });

  describe("Successful Creation", () => {
    test("should create page successfully", async () => {
      // Arrange
      const request: CreatePageRequest =
        pagesMockFactory.createCreatePageRequest();
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findByTitle = async () => null; // No existing page
      mockPageRepository.create = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
      expect(result.context).toBeDefined();
      expect(result.message).toContain("created successfully");
    });

    test("should create page with parent page", async () => {
      // Arrange
      const request: CreatePageRequest = {
        ...pagesMockFactory.createCreatePageRequest(),
        parentPageId: "parent-123",
      };
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.exists = async () => true; // Parent exists
      mockPageRepository.create = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
      expect(result.context).toBeDefined();
      expect(result.message).toContain("created successfully");
    });

    test("should create draft page", async () => {
      // Arrange
      const request: CreatePageRequest = {
        ...pagesMockFactory.createCreatePageRequest(),
        status: "draft",
      };
      const expectedPage = pagesMockFactory.createPage({ status: "draft" });
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.create = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page.status).toBe("draft");
      expect(result.message).toContain("created successfully");
    });

    test("should create blog post", async () => {
      // Arrange
      const request: CreatePageRequest = {
        ...pagesMockFactory.createCreatePageRequest(),
        title: "Test Blog Post",
      };
      const expectedPage = pagesMockFactory.createPage({ type: "blogpost" });
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.create = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page.type).toBe("blogpost");
      expect(result.message).toContain("created successfully");
    });
  });

  describe("Validation Errors", () => {
    test("should throw ValidationError when page with same title exists", async () => {
      // Arrange
      const request: CreatePageRequest =
        pagesMockFactory.createCreatePageRequest();
      const existingPage = pagesMockFactory.createPage();
      mockPageRepository.findByTitle = async () => existingPage;

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(ValidationError);
    });

    test("should throw ValidationError with correct message for duplicate title", async () => {
      // Arrange
      const request: CreatePageRequest =
        pagesMockFactory.createCreatePageRequest();
      const existingPage = pagesMockFactory.createPage();
      mockPageRepository.findByTitle = async () => existingPage;

      // Act & Assert
      try {
        await useCase.execute(request);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          `A page with title "${request.title}" already exists`,
        );
      }
    });

    test("should throw PageNotFoundError when parent page does not exist", async () => {
      // Arrange
      const request: CreatePageRequest = {
        ...pagesMockFactory.createCreatePageRequest(),
        parentPageId: "non-existent-parent",
      };
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.exists = async () => false; // Parent doesn't exist

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(PageNotFoundError);
    });

    test("should throw PageNotFoundError with correct parent page ID", async () => {
      // Arrange
      const parentPageId = "non-existent-parent";
      const request: CreatePageRequest = {
        ...pagesMockFactory.createCreatePageRequest(),
        parentPageId,
      };
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.exists = async () => false;

      // Act & Assert
      try {
        await useCase.execute(request);
      } catch (error) {
        expect(error).toBeInstanceOf(PageNotFoundError);
        expect((error as PageNotFoundError).message).toContain(parentPageId);
      }
    });
  });

  describe("Repository Errors", () => {
    test("should wrap repository errors in PageError", async () => {
      // Arrange
      const request: CreatePageRequest =
        pagesMockFactory.createCreatePageRequest();
      const repositoryError = new Error("Database connection failed");
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.create = async () => {
        throw repositoryError;
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(PageError);
    });

    test("should preserve error context in PageError", async () => {
      // Arrange
      const request: CreatePageRequest =
        pagesMockFactory.createCreatePageRequest();
      const repositoryError = new Error("Database connection failed");
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.create = async () => {
        throw repositoryError;
      };

      // Act & Assert
      try {
        await useCase.execute(request);
      } catch (error) {
        expect(error).toBeInstanceOf(PageError);
        expect((error as PageError).message).toContain("Failed to create page");
        expect((error as PageError).message).toContain(
          "Database connection failed",
        );
      }
    });

    test("should handle title check errors", async () => {
      // Arrange
      const request: CreatePageRequest =
        pagesMockFactory.createCreatePageRequest();
      mockPageRepository.findByTitle = async () => {
        throw new Error("Title check failed");
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(PageError);
    });

    test("should handle parent existence check errors", async () => {
      // Arrange
      const request: CreatePageRequest = {
        ...pagesMockFactory.createCreatePageRequest(),
        parentPageId: "parent-123",
      };
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.exists = async () => {
        throw new Error("Parent check failed");
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(PageError);
    });
  });

  describe("Context Building", () => {
    test("should build simplified context when repositories not provided", async () => {
      // Arrange
      const useCaseWithoutRepos = new CreatePageUseCase(mockPageRepository);
      const request: CreatePageRequest =
        pagesMockFactory.createCreatePageRequest();
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.create = async () => expectedPage;

      // Act
      const result = await useCaseWithoutRepos.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
      expect(result.context).toBeDefined();
    });

    test("should build full context when all repositories provided", async () => {
      // Arrange
      const request: CreatePageRequest =
        pagesMockFactory.createCreatePageRequest();
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.create = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
      expect(result.context).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    test("should handle different content formats", async () => {
      // Arrange
      const request: CreatePageRequest = {
        ...pagesMockFactory.createCreatePageRequest(),
        contentFormat: "wiki",
      };
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.create = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
    });

    test("should handle long page titles", async () => {
      // Arrange
      const longTitle = "A".repeat(400);
      const request: CreatePageRequest = {
        ...pagesMockFactory.createCreatePageRequest(),
        title: longTitle,
      };
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.create = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
    });

    test("should handle large content", async () => {
      // Arrange
      const largeContent = `<p>${"Content ".repeat(1000)}</p>`;
      const request: CreatePageRequest = {
        ...pagesMockFactory.createCreatePageRequest(),
        content: largeContent,
      };
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.create = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
    });

    test("should handle special characters in title", async () => {
      // Arrange
      const specialTitle = "Test Page with Special Characters: @#$%^&*()";
      const request: CreatePageRequest = {
        ...pagesMockFactory.createCreatePageRequest(),
        title: specialTitle,
      };
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.create = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
    });
  });

  describe("Business Logic", () => {
    test("should handle creation in different spaces", async () => {
      // Arrange
      const request: CreatePageRequest = {
        ...pagesMockFactory.createCreatePageRequest(),
        spaceId: "DIFFERENT-SPACE",
      };
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.create = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
    });

    test("should handle creation with different statuses", async () => {
      // Arrange
      const request: CreatePageRequest = {
        ...pagesMockFactory.createCreatePageRequest(),
        status: "current",
      };
      const expectedPage = pagesMockFactory.createPage({ status: "current" });
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.create = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page.status).toBe("current");
    });

    test("should handle creation with nested parent hierarchy", async () => {
      // Arrange
      const request: CreatePageRequest = {
        ...pagesMockFactory.createCreatePageRequest(),
        parentPageId: "deeply-nested-parent",
      };
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.exists = async () => true;
      mockPageRepository.create = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
    });

    test("should handle creation with minimal required fields", async () => {
      // Arrange
      const request: CreatePageRequest = {
        spaceId: "TEST-SPACE",
        title: "Minimal Page",
        content: "<p>Minimal content</p>",
      };
      const expectedPage = pagesMockFactory.createPage();
      mockPageRepository.findByTitle = async () => null;
      mockPageRepository.create = async () => expectedPage;

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toEqual(expectedPage);
      expect(result.message).toContain("created successfully");
    });
  });
});
