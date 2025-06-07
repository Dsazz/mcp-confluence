import { beforeEach, describe, expect, it, mock } from "bun:test";
import type {
  GetSpacesRequest,
  Space,
} from "@features/confluence/domains/spaces/models";
import { GetAllSpacesUseCase } from "@features/confluence/domains/spaces/use-cases/get-all-spaces.use-case";
import { SpaceError } from "@features/confluence/shared/validators";
import { SpacesMockFactory } from "../../../../../../__mocks__/v2/domains/spaces/spaces-mock-factory";

describe("GetAllSpacesUseCase", () => {
  let useCase: GetAllSpacesUseCase;
  let mockRepository: {
    findAll: ReturnType<typeof mock>;
    findByKey: ReturnType<typeof mock>;
    findById: ReturnType<typeof mock>;
    create: ReturnType<typeof mock>;
    update: ReturnType<typeof mock>;
    delete: ReturnType<typeof mock>;
    exists: ReturnType<typeof mock>;
  };
  let spacesMockFactory: SpacesMockFactory;

  beforeEach(() => {
    spacesMockFactory = new SpacesMockFactory();

    mockRepository = {
      findAll: mock(),
      findByKey: mock(),
      findById: mock(),
      create: mock(),
      update: mock(),
      delete: mock(),
      exists: mock(),
    };

    useCase = new GetAllSpacesUseCase(mockRepository);
  });

  describe("execute", () => {
    it("should retrieve all spaces successfully without parameters", async () => {
      // Arrange
      const spaces = spacesMockFactory.createSpaces(3);
      const pagination = spacesMockFactory.createPaginationInfo();

      mockRepository.findAll.mockResolvedValue({
        spaces,
        pagination,
      });

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual({
        spaces,
        pagination,
        summary: expect.any(Object),
      });
      expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it("should retrieve spaces with request parameters", async () => {
      // Arrange
      const request: GetSpacesRequest = {
        limit: 10,
        start: 0,
        type: "global",
        expand: "description,permissions",
      };
      const spaces = spacesMockFactory.createSpaces(2);
      const pagination = spacesMockFactory.createPaginationInfo({
        limit: 10,
        start: 0,
        size: 2,
      });

      mockRepository.findAll.mockResolvedValue({
        spaces,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.spaces).toEqual(spaces);
      expect(result.pagination).toEqual(pagination);
      expect(result.summary).toEqual(expect.any(Object));
      expect(mockRepository.findAll).toHaveBeenCalledWith(request);
    });

    it("should create summary from retrieved spaces", async () => {
      // Arrange
      const globalSpaces = spacesMockFactory.createSpaces(2, {
        type: "global",
      });
      const personalSpaces = spacesMockFactory.createSpaces(1, {
        type: "personal",
      });
      const allSpaces = [...globalSpaces, ...personalSpaces];
      const pagination = spacesMockFactory.createPaginationInfo();

      mockRepository.findAll.mockResolvedValue({
        spaces: allSpaces,
        pagination,
      });

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.summary).toEqual(
        expect.objectContaining({
          total: expect.any(Number),
          globalSpaces: expect.any(Number),
          personalSpaces: expect.any(Number),
        }),
      );
    });

    it("should handle empty spaces result", async () => {
      // Arrange
      const spaces: Space[] = [];
      const pagination = spacesMockFactory.createPaginationInfo({
        size: 0,
        hasMore: false,
      });

      mockRepository.findAll.mockResolvedValue({
        spaces,
        pagination,
      });

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.spaces).toEqual([]);
      expect(result.pagination.size).toBe(0);
      expect(result.summary).toEqual(expect.any(Object));
    });

    it("should handle repository errors", async () => {
      // Arrange
      const error = new Error("Database connection failed");
      mockRepository.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(SpaceError);
      await expect(useCase.execute()).rejects.toThrow(
        "Failed to retrieve spaces",
      );
    });

    it("should handle unknown errors", async () => {
      // Arrange
      mockRepository.findAll.mockRejectedValue("Unknown error");

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(SpaceError);
      await expect(useCase.execute()).rejects.toThrow("Unknown error");
    });

    it("should preserve error context in SpaceError", async () => {
      // Arrange
      const originalError = new Error("Network timeout");
      mockRepository.findAll.mockRejectedValue(originalError);

      // Act & Assert
      try {
        await useCase.execute();
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SpaceError);
        expect((error as SpaceError).message).toContain(
          "Failed to retrieve spaces",
        );
        expect((error as SpaceError).message).toContain("Network timeout");
      }
    });

    it("should handle different space types correctly", async () => {
      // Arrange
      const request: GetSpacesRequest = { type: "personal" };
      const personalSpaces = spacesMockFactory.createSpaces(3, {
        type: "personal",
      });
      const pagination = spacesMockFactory.createPaginationInfo();

      mockRepository.findAll.mockResolvedValue({
        spaces: personalSpaces,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.spaces).toEqual(personalSpaces);
      expect(mockRepository.findAll).toHaveBeenCalledWith(request);
    });

    it("should handle pagination parameters correctly", async () => {
      // Arrange
      const request: GetSpacesRequest = {
        limit: 5,
        start: 10,
      };
      const spaces = spacesMockFactory.createSpaces(5);
      const pagination = spacesMockFactory.createPaginationInfo({
        limit: 5,
        start: 10,
        size: 5,
        hasMore: true,
      });

      mockRepository.findAll.mockResolvedValue({
        spaces,
        pagination,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.start).toBe(10);
      expect(result.pagination.hasMore).toBe(true);
      expect(mockRepository.findAll).toHaveBeenCalledWith(request);
    });
  });
});
