import { beforeEach, describe, expect, test } from "bun:test";
import type { PageRepository } from "@features/confluence/domains/pages/models";
import { GetPageVersionUseCase } from "@features/confluence/domains/pages/use-cases/get-page-version.use-case";
import {
  PageError,
  PageNotFoundError,
} from "@features/confluence/shared/validators";
import { PagesMockFactory } from "@test/__mocks__/v2/domains/pages/pages-mock-factory";

describe("GetPageVersionUseCase", () => {
  let useCase: GetPageVersionUseCase;
  let mockPageRepository: PageRepository;
  let pagesMockFactory: PagesMockFactory;

  beforeEach(() => {
    pagesMockFactory = new PagesMockFactory();

    mockPageRepository = {
      findById: () => Promise.resolve(null),
      findByTitle: () => Promise.resolve(null),
      findBySpaceId: () =>
        Promise.resolve({
          pages: [],
          pagination: {
            total: 0,
            limit: 25,
            start: 0,
            size: 0,
            hasMore: false,
          },
        }),
      findChildren: () =>
        Promise.resolve({
          pages: [],
          pagination: {
            total: 0,
            limit: 25,
            start: 0,
            size: 0,
            hasMore: false,
          },
        }),
      create: () => Promise.resolve(pagesMockFactory.createPage()),
      update: () => Promise.resolve(pagesMockFactory.createPage()),
      delete: () => Promise.resolve(),
      exists: () => Promise.resolve(false),
      getVersion: () => Promise.resolve(pagesMockFactory.createPageVersion()),
      getCommentCount: () => Promise.resolve(0),
      search: () =>
        Promise.resolve({
          pages: [],
          pagination: {
            total: 0,
            limit: 25,
            start: 0,
            size: 0,
            hasMore: false,
          },
        }),
    };

    useCase = new GetPageVersionUseCase(mockPageRepository);
  });

  describe("execute", () => {
    test("should successfully get page version", async () => {
      // Arrange
      const pageId = "existing-page-id";
      const pageVersion = pagesMockFactory.createPageVersion();

      mockPageRepository.exists = () => Promise.resolve(true);
      mockPageRepository.getVersion = () => Promise.resolve(pageVersion);

      // Act
      const result = await useCase.execute(pageId);

      // Assert
      expect(result).toEqual(pageVersion);
      expect(result.number).toBe(pageVersion.number);
      expect(result.authorId).toBe(pageVersion.authorId);
      expect(result.createdAt).toBe(pageVersion.createdAt);
    });

    test("should handle page version with message", async () => {
      // Arrange
      const pageId = "page-with-version-message";
      const pageVersion = pagesMockFactory.createPageVersion({
        message: "Updated content with new information",
      });

      mockPageRepository.exists = () => Promise.resolve(true);
      mockPageRepository.getVersion = () => Promise.resolve(pageVersion);

      // Act
      const result = await useCase.execute(pageId);

      // Assert
      expect(result.message).toBe("Updated content with new information");
      expect(result.number).toBe(pageVersion.number);
    });

    test("should handle page version without message", async () => {
      // Arrange
      const pageId = "page-without-version-message";
      const pageVersion = pagesMockFactory.createPageVersion({
        message: undefined,
      });

      mockPageRepository.exists = () => Promise.resolve(true);
      mockPageRepository.getVersion = () => Promise.resolve(pageVersion);

      // Act
      const result = await useCase.execute(pageId);

      // Assert
      expect(result.message).toBeUndefined();
      expect(result.number).toBe(pageVersion.number);
    });

    test("should handle different version numbers", async () => {
      // Arrange
      const pageId = "page-with-high-version";
      const pageVersion = pagesMockFactory.createPageVersion({
        number: 42,
      });

      mockPageRepository.exists = () => Promise.resolve(true);
      mockPageRepository.getVersion = () => Promise.resolve(pageVersion);

      // Act
      const result = await useCase.execute(pageId);

      // Assert
      expect(result.number).toBe(42);
    });

    test("should handle version 1 (initial version)", async () => {
      // Arrange
      const pageId = "new-page-id";
      const pageVersion = pagesMockFactory.createPageVersion({
        number: 1,
      });

      mockPageRepository.exists = () => Promise.resolve(true);
      mockPageRepository.getVersion = () => Promise.resolve(pageVersion);

      // Act
      const result = await useCase.execute(pageId);

      // Assert
      expect(result.number).toBe(1);
    });

    test("should handle different author IDs", async () => {
      // Arrange
      const pageId = "page-by-different-author";
      const pageVersion = pagesMockFactory.createPageVersion({
        authorId: "different-author-123",
      });

      mockPageRepository.exists = () => Promise.resolve(true);
      mockPageRepository.getVersion = () => Promise.resolve(pageVersion);

      // Act
      const result = await useCase.execute(pageId);

      // Assert
      expect(result.authorId).toBe("different-author-123");
    });

    test("should handle recent version creation date", async () => {
      // Arrange
      const pageId = "recently-updated-page";
      const recentDate = new Date();
      const pageVersion = pagesMockFactory.createPageVersion({
        createdAt: recentDate,
      });

      mockPageRepository.exists = () => Promise.resolve(true);
      mockPageRepository.getVersion = () => Promise.resolve(pageVersion);

      // Act
      const result = await useCase.execute(pageId);

      // Assert
      expect(result.createdAt).toBe(recentDate);
    });

    test("should handle old version creation date", async () => {
      // Arrange
      const pageId = "old-page";
      const oldDate = new Date("2020-01-01");
      const pageVersion = pagesMockFactory.createPageVersion({
        createdAt: oldDate,
      });

      mockPageRepository.exists = () => Promise.resolve(true);
      mockPageRepository.getVersion = () => Promise.resolve(pageVersion);

      // Act
      const result = await useCase.execute(pageId);

      // Assert
      expect(result.createdAt).toBe(oldDate);
    });

    test("should throw PageNotFoundError when page does not exist", async () => {
      // Arrange
      const pageId = "non-existent-page";

      mockPageRepository.exists = () => Promise.resolve(false);

      // Act & Assert
      await expect(useCase.execute(pageId)).rejects.toThrow(PageNotFoundError);
    });

    test("should throw PageError when repository getVersion fails", async () => {
      // Arrange
      const pageId = "some-page-id";

      mockPageRepository.exists = () => Promise.resolve(true);
      mockPageRepository.getVersion = () =>
        Promise.reject(new Error("Database connection failed"));

      // Act & Assert
      await expect(useCase.execute(pageId)).rejects.toThrow(PageError);
    });

    test("should throw PageError when repository exists fails", async () => {
      // Arrange
      const pageId = "some-page-id";

      mockPageRepository.exists = () =>
        Promise.reject(new Error("Database connection failed"));

      // Act & Assert
      await expect(useCase.execute(pageId)).rejects.toThrow(PageError);
    });

    test("should preserve error context when repository fails", async () => {
      // Arrange
      const pageId = "some-page-id";
      const originalError = new Error("Connection timeout");

      mockPageRepository.exists = () => Promise.resolve(true);
      mockPageRepository.getVersion = () => Promise.reject(originalError);

      // Act & Assert
      try {
        await useCase.execute(pageId);
      } catch (error) {
        expect(error).toBeInstanceOf(PageError);
        expect((error as PageError).message).toContain(
          "Failed to retrieve page version",
        );
      }
    });

    test("should handle empty page ID", async () => {
      // Arrange
      const pageId = "";

      // Act & Assert
      await expect(useCase.execute(pageId)).rejects.toThrow(PageError);
    });

    test("should handle special characters in page ID", async () => {
      // Arrange
      const pageId = "page-with-special-chars-!@#$%";
      const pageVersion = pagesMockFactory.createPageVersion();

      mockPageRepository.exists = () => Promise.resolve(true);
      mockPageRepository.getVersion = () => Promise.resolve(pageVersion);

      // Act
      const result = await useCase.execute(pageId);

      // Assert
      expect(result).toEqual(pageVersion);
    });

    test("should handle numeric page ID", async () => {
      // Arrange
      const pageId = "123456";
      const pageVersion = pagesMockFactory.createPageVersion();

      mockPageRepository.exists = () => Promise.resolve(true);
      mockPageRepository.getVersion = () => Promise.resolve(pageVersion);

      // Act
      const result = await useCase.execute(pageId);

      // Assert
      expect(result).toEqual(pageVersion);
    });

    test("should handle UUID-style page ID", async () => {
      // Arrange
      const pageId = "550e8400-e29b-41d4-a716-446655440000";
      const pageVersion = pagesMockFactory.createPageVersion();

      mockPageRepository.exists = () => Promise.resolve(true);
      mockPageRepository.getVersion = () => Promise.resolve(pageVersion);

      // Act
      const result = await useCase.execute(pageId);

      // Assert
      expect(result).toEqual(pageVersion);
    });
  });
});
