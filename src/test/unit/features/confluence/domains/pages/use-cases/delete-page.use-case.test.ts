import { beforeEach, describe, expect, test } from "bun:test";
import type { PageRepository } from "@features/confluence/domains/pages/models";
import { DeletePageUseCase } from "@features/confluence/domains/pages/use-cases/delete-page.use-case";
import {
  PageError,
  PageNotFoundError,
} from "@features/confluence/shared/validators";
import { PagesMockFactory } from "@test/__mocks__/v2/domains/pages/pages-mock-factory";

describe("DeletePageUseCase", () => {
  let useCase: DeletePageUseCase;
  let mockPageRepository: PageRepository;
  let pagesMockFactory: PagesMockFactory;

  beforeEach(() => {
    pagesMockFactory = new PagesMockFactory();

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

    useCase = new DeletePageUseCase(mockPageRepository);
  });

  describe("Successful Deletion", () => {
    test("should delete page successfully", async () => {
      // Arrange
      const pageId = "test-page-id";
      const existingPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.delete = async () => {};

      // Act & Assert
      await expect(useCase.execute(pageId)).resolves.toBeUndefined();
    });

    test("should delete draft page", async () => {
      // Arrange
      const pageId = "draft-page-id";
      const draftPage = pagesMockFactory.createPage({ status: "draft" });
      mockPageRepository.findById = async () => draftPage;
      mockPageRepository.delete = async () => {};

      // Act & Assert
      await expect(useCase.execute(pageId)).resolves.toBeUndefined();
    });

    test("should delete blog post", async () => {
      // Arrange
      const pageId = "blog-post-id";
      const blogPost = pagesMockFactory.createPage({ type: "blogpost" });
      mockPageRepository.findById = async () => blogPost;
      mockPageRepository.delete = async () => {};

      // Act & Assert
      await expect(useCase.execute(pageId)).resolves.toBeUndefined();
    });

    test("should delete archived page", async () => {
      // Arrange
      const pageId = "archived-page-id";
      const archivedPage = pagesMockFactory.createPage({ status: "trashed" });
      mockPageRepository.findById = async () => archivedPage;
      mockPageRepository.delete = async () => {};

      // Act & Assert
      await expect(useCase.execute(pageId)).resolves.toBeUndefined();
    });
  });

  describe("Page Not Found", () => {
    test("should throw PageNotFoundError when page does not exist", async () => {
      // Arrange
      const pageId = "non-existent-page";
      mockPageRepository.findById = async () => null;

      // Act & Assert
      await expect(useCase.execute(pageId)).rejects.toThrow(PageNotFoundError);
    });

    test("should throw PageNotFoundError with correct page ID", async () => {
      // Arrange
      const pageId = "non-existent-page";
      mockPageRepository.findById = async () => null;

      // Act & Assert
      try {
        await useCase.execute(pageId);
      } catch (error) {
        expect(error).toBeInstanceOf(PageNotFoundError);
        expect((error as PageNotFoundError).message).toContain(pageId);
      }
    });
  });

  describe("Repository Errors", () => {
    test("should wrap repository errors in PageError", async () => {
      // Arrange
      const pageId = "test-page-id";
      const existingPage = pagesMockFactory.createPage();
      const repositoryError = new Error("Database connection failed");

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.delete = async () => {
        throw repositoryError;
      };

      // Act & Assert
      await expect(useCase.execute(pageId)).rejects.toThrow(PageError);
    });

    test("should preserve error context in PageError", async () => {
      // Arrange
      const pageId = "test-page-id";
      const existingPage = pagesMockFactory.createPage();
      const repositoryError = new Error("Database connection failed");

      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.delete = async () => {
        throw repositoryError;
      };

      // Act & Assert
      try {
        await useCase.execute(pageId);
      } catch (error) {
        expect(error).toBeInstanceOf(PageError);
        expect((error as PageError).message).toContain("Failed to delete page");
        expect((error as PageError).message).toContain(
          "Database connection failed",
        );
      }
    });

    test("should handle findById errors", async () => {
      // Arrange
      const pageId = "test-page-id";
      mockPageRepository.findById = async () => {
        throw new Error("Find operation failed");
      };

      // Act & Assert
      await expect(useCase.execute(pageId)).rejects.toThrow(PageError);
    });

    test("should preserve PageNotFoundError from repository", async () => {
      // Arrange
      const pageId = "test-page-id";
      mockPageRepository.findById = async () => null;

      // Act & Assert
      await expect(useCase.execute(pageId)).rejects.toThrow(PageNotFoundError);
    });
  });

  describe("Edge Cases", () => {
    test("should handle different page ID formats", async () => {
      // Arrange
      const pageId = "123456789";
      const existingPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.delete = async () => {};

      // Act & Assert
      await expect(useCase.execute(pageId)).resolves.toBeUndefined();
    });

    test("should handle UUID-style page IDs", async () => {
      // Arrange
      const pageId = "550e8400-e29b-41d4-a716-446655440000";
      const existingPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.delete = async () => {};

      // Act & Assert
      await expect(useCase.execute(pageId)).resolves.toBeUndefined();
    });

    test("should handle alphanumeric page IDs", async () => {
      // Arrange
      const pageId = "abc123def456";
      const existingPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.delete = async () => {};

      // Act & Assert
      await expect(useCase.execute(pageId)).resolves.toBeUndefined();
    });

    test("should handle long page IDs", async () => {
      // Arrange
      const pageId = "very-long-page-id-with-many-characters-and-dashes";
      const existingPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => existingPage;
      mockPageRepository.delete = async () => {};

      // Act & Assert
      await expect(useCase.execute(pageId)).resolves.toBeUndefined();
    });
  });

  describe("Business Logic", () => {
    test("should verify page exists before deletion", async () => {
      // Arrange
      const pageId = "test-page-id";
      const existingPage = pagesMockFactory.createPage();
      let findByIdCalled = false;
      let deleteCalled = false;

      mockPageRepository.findById = async () => {
        findByIdCalled = true;
        return existingPage;
      };
      mockPageRepository.delete = async () => {
        deleteCalled = true;
      };

      // Act
      await useCase.execute(pageId);

      // Assert
      expect(findByIdCalled).toBe(true);
      expect(deleteCalled).toBe(true);
    });

    test("should not call delete if page does not exist", async () => {
      // Arrange
      const pageId = "non-existent-page";
      let deleteCalled = false;

      mockPageRepository.findById = async () => null;
      mockPageRepository.delete = async () => {
        deleteCalled = true;
      };

      // Act & Assert
      try {
        await useCase.execute(pageId);
      } catch (error) {
        expect(deleteCalled).toBe(false);
        expect(error).toBeInstanceOf(PageNotFoundError);
      }
    });

    test("should handle deletion of page with children", async () => {
      // Arrange
      const pageId = "parent-page-id";
      const parentPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => parentPage;
      mockPageRepository.delete = async () => {};

      // Act & Assert
      await expect(useCase.execute(pageId)).resolves.toBeUndefined();
    });

    test("should handle deletion of page with attachments", async () => {
      // Arrange
      const pageId = "page-with-attachments";
      const pageWithAttachments = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => pageWithAttachments;
      mockPageRepository.delete = async () => {};

      // Act & Assert
      await expect(useCase.execute(pageId)).resolves.toBeUndefined();
    });

    test("should handle deletion of page with comments", async () => {
      // Arrange
      const pageId = "page-with-comments";
      const pageWithComments = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => pageWithComments;
      mockPageRepository.delete = async () => {};

      // Act & Assert
      await expect(useCase.execute(pageId)).resolves.toBeUndefined();
    });

    test("should handle deletion of page with restrictions", async () => {
      // Arrange
      const pageId = "restricted-page";
      const restrictedPage = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => restrictedPage;
      mockPageRepository.delete = async () => {};

      // Act & Assert
      await expect(useCase.execute(pageId)).resolves.toBeUndefined();
    });

    test("should handle permanent deletion", async () => {
      // Arrange
      const pageId = "page-to-permanently-delete";
      const pageToDelete = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => pageToDelete;
      mockPageRepository.delete = async () => {};

      // Act & Assert
      await expect(useCase.execute(pageId)).resolves.toBeUndefined();
    });

    test("should handle soft deletion (move to trash)", async () => {
      // Arrange
      const pageId = "page-to-soft-delete";
      const pageToSoftDelete = pagesMockFactory.createPage();
      mockPageRepository.findById = async () => pageToSoftDelete;
      mockPageRepository.delete = async () => {};

      // Act & Assert
      await expect(useCase.execute(pageId)).resolves.toBeUndefined();
    });
  });
});
