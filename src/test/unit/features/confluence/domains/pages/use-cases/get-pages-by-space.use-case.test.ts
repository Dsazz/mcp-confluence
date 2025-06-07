import { beforeEach, describe, expect, test } from "bun:test";
import type { PageRepository } from "@features/confluence/domains/pages/models";
import { GetPagesBySpaceUseCase } from "@features/confluence/domains/pages/use-cases/get-pages-by-space.use-case";
import { PageError } from "@features/confluence/shared/validators";
import { PagesMockFactory } from "@test/__mocks__/v2/domains/pages/pages-mock-factory";

describe("GetPagesBySpaceUseCase", () => {
  let useCase: GetPagesBySpaceUseCase;
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

    useCase = new GetPagesBySpaceUseCase(mockPageRepository);
  });

  describe("Successful Retrieval", () => {
    test("should retrieve pages by space ID successfully", async () => {
      // Arrange
      const spaceId = "test-space-id";
      const pages = [
        pagesMockFactory.createPage(),
        pagesMockFactory.createPage(),
      ];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 2 });

      mockPageRepository.findBySpaceId = async () => ({
        pages,
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toEqual(pages);
      expect(result.pagination).toEqual(pagination);
    });

    test("should retrieve pages with pagination options", async () => {
      // Arrange
      const spaceId = "test-space-id";
      const options = { limit: 10, start: 20 };
      const pages = Array.from({ length: 10 }, () =>
        pagesMockFactory.createPage(),
      );
      const pagination = pagesMockFactory.createPaginationInfo({
        total: 100,
        start: 20,
        limit: 10,
        size: 10,
        hasMore: true,
      });

      mockPageRepository.findBySpaceId = async () => ({
        pages,
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(10);
      expect(result.pagination.start).toBe(20);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.hasMore).toBe(true);
    });

    test("should retrieve empty pages list", async () => {
      // Arrange
      const spaceId = "empty-space-id";
      const pagination = pagesMockFactory.createPaginationInfo({ total: 0 });

      mockPageRepository.findBySpaceId = async () => ({
        pages: [],
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    test("should retrieve single page", async () => {
      // Arrange
      const spaceId = "single-page-space";
      const pages = [pagesMockFactory.createPage()];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 1 });

      mockPageRepository.findBySpaceId = async () => ({
        pages,
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe("Repository Errors", () => {
    test("should wrap repository errors in PageError", async () => {
      // Arrange
      const spaceId = "test-space-id";
      const repositoryError = new Error("Database connection failed");

      mockPageRepository.findBySpaceId = async () => {
        throw repositoryError;
      };

      // Act & Assert
      await expect(useCase.execute(spaceId)).rejects.toThrow(PageError);
    });

    test("should preserve error context in PageError", async () => {
      // Arrange
      const spaceId = "test-space-id";
      const repositoryError = new Error("Database connection failed");

      mockPageRepository.findBySpaceId = async () => {
        throw repositoryError;
      };

      // Act & Assert
      try {
        await useCase.execute(spaceId);
      } catch (error) {
        expect(error).toBeInstanceOf(PageError);
        expect((error as PageError).message).toContain(
          "Failed to retrieve pages for space",
        );
        expect((error as PageError).message).toContain(
          "Database connection failed",
        );
      }
    });
  });

  describe("Edge Cases", () => {
    test("should handle different space ID formats", async () => {
      // Arrange
      const spaceIds = [
        "123456789",
        "abc-def-ghi",
        "SPACE_KEY_123",
        "550e8400-e29b-41d4-a716-446655440000",
      ];

      for (const spaceId of spaceIds) {
        const pages = [pagesMockFactory.createPage()];
        const pagination = pagesMockFactory.createPaginationInfo({ total: 1 });

        mockPageRepository.findBySpaceId = async () => ({
          pages,
          pagination,
        });

        // Act
        const result = await useCase.execute(spaceId);

        // Assert
        expect(result).toBeDefined();
        expect(result.pages).toHaveLength(1);
      }
    });

    test("should handle large page counts", async () => {
      // Arrange
      const spaceId = "large-space";
      const options = { limit: 250 };
      const pages = Array.from({ length: 250 }, () =>
        pagesMockFactory.createPage(),
      );
      const pagination = pagesMockFactory.createPaginationInfo({
        total: 5000,
        size: 250,
        limit: 250,
      });

      mockPageRepository.findBySpaceId = async () => ({
        pages,
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(250);
      expect(result.pagination.total).toBe(5000);
    });

    test("should handle zero limit option", async () => {
      // Arrange
      const spaceId = "test-space";
      const options = { limit: 0 };
      const pagination = pagesMockFactory.createPaginationInfo({ total: 0 });

      mockPageRepository.findBySpaceId = async () => ({
        pages: [],
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toEqual([]);
    });

    test("should handle high start offset", async () => {
      // Arrange
      const spaceId = "test-space";
      const options = { start: 9999 };
      const pagination = pagesMockFactory.createPaginationInfo({
        total: 10000,
        start: 9999,
        size: 1,
        hasMore: false,
      });

      mockPageRepository.findBySpaceId = async () => ({
        pages: [pagesMockFactory.createPage()],
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.pagination.start).toBe(9999);
      expect(result.pagination.hasMore).toBe(false);
    });
  });

  describe("Business Logic", () => {
    test("should handle space with mixed page types", async () => {
      // Arrange
      const spaceId = "mixed-content-space";
      const pages = [
        pagesMockFactory.createPage({ type: "page" }),
        pagesMockFactory.createPage({ type: "blogpost" }),
      ];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 2 });

      mockPageRepository.findBySpaceId = async () => ({
        pages,
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(2);
      expect(result.pages[0].type).toBe("page");
      expect(result.pages[1].type).toBe("blogpost");
    });

    test("should handle space with different page statuses", async () => {
      // Arrange
      const spaceId = "multi-status-space";
      const pages = [
        pagesMockFactory.createPage({ status: "current" }),
        pagesMockFactory.createPage({ status: "draft" }),
        pagesMockFactory.createPage({ status: "trashed" }),
      ];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 3 });

      mockPageRepository.findBySpaceId = async () => ({
        pages,
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(3);
      expect(result.pages.map((p) => p.status)).toEqual([
        "current",
        "draft",
        "trashed",
      ]);
    });

    test("should handle archived space pages", async () => {
      // Arrange
      const spaceId = "archived-space";
      const pages = [
        pagesMockFactory.createPage({ status: "trashed" }),
        pagesMockFactory.createPage({ status: "trashed" }),
      ];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 2 });

      mockPageRepository.findBySpaceId = async () => ({
        pages,
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(2);
      expect(result.pages.every((p) => p.status === "trashed")).toBe(true);
    });

    test("should handle space with hierarchical pages", async () => {
      // Arrange
      const spaceId = "hierarchical-space";
      const pages = [
        pagesMockFactory.createPage(), // Root page
        pagesMockFactory.createPage(), // Child page
        pagesMockFactory.createPage(), // Grandchild page
      ];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 3 });

      mockPageRepository.findBySpaceId = async () => ({
        pages,
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(3);
    });

    test("should handle space with recent activity", async () => {
      // Arrange
      const spaceId = "active-space";
      const recentDate = new Date();
      const pages = [
        pagesMockFactory.createPage({ updatedAt: recentDate }),
        pagesMockFactory.createPage({ updatedAt: recentDate }),
      ];
      const pagination = pagesMockFactory.createPaginationInfo({ total: 2 });

      mockPageRepository.findBySpaceId = async () => ({
        pages,
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(2);
      expect(
        result.pages.every(
          (p) => p.updatedAt.getTime() === recentDate.getTime(),
        ),
      ).toBe(true);
    });

    test("should handle space with no pages", async () => {
      // Arrange
      const spaceId = "empty-space";
      const pagination = pagesMockFactory.createPaginationInfo({ total: 0 });

      mockPageRepository.findBySpaceId = async () => ({
        pages: [],
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    test("should handle space with many pages", async () => {
      // Arrange
      const spaceId = "large-space";
      const pages = Array.from({ length: 100 }, () =>
        pagesMockFactory.createPage(),
      );
      const pagination = pagesMockFactory.createPaginationInfo({
        total: 1000,
        size: 100,
        hasMore: true,
      });

      mockPageRepository.findBySpaceId = async () => ({
        pages,
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(100);
      expect(result.pagination.total).toBe(1000);
      expect(result.pagination.hasMore).toBe(true);
    });

    test("should handle pagination scenarios", async () => {
      // Arrange
      const spaceId = "paginated-space";
      const options = { limit: 25, start: 50 };
      const pages = Array.from({ length: 25 }, () =>
        pagesMockFactory.createPage(),
      );
      const pagination = pagesMockFactory.createPaginationInfo({
        total: 200,
        start: 50,
        limit: 25,
        size: 25,
        hasMore: true,
      });

      mockPageRepository.findBySpaceId = async () => ({
        pages,
        pagination,
      });

      // Act
      const result = await useCase.execute(spaceId, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.pages).toHaveLength(25);
      expect(result.pagination.start).toBe(50);
      expect(result.pagination.limit).toBe(25);
      expect(result.pagination.hasMore).toBe(true);
    });
  });
});
