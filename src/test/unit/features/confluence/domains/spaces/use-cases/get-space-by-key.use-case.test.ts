import { beforeEach, describe, expect, it, mock } from "bun:test";
import { GetSpaceByKeyUseCase } from "@features/confluence/domains/spaces/use-cases/get-space-by-key.use-case";
import {
  SpaceError,
  SpaceNotFoundError,
} from "@features/confluence/shared/validators";

import { SpacesMockFactory } from "../../../../../../__mocks__/v2/domains/spaces/spaces-mock-factory";

describe("GetSpaceByKeyUseCase", () => {
  let useCase: GetSpaceByKeyUseCase;
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

    useCase = new GetSpaceByKeyUseCase(mockRepository);
  });

  describe("execute", () => {
    it("should retrieve space by key successfully", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("TEST");
      const space = spacesMockFactory.createSpace({ key: spaceKey });

      mockRepository.findByKey.mockResolvedValue(space);

      // Act
      const result = await useCase.execute(spaceKey);

      // Assert
      expect(result).toEqual(space);
      expect(mockRepository.findByKey).toHaveBeenCalledWith(spaceKey);
    });

    it("should handle space not found", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("NONEXISTENT");

      mockRepository.findByKey.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(spaceKey)).rejects.toThrow(
        SpaceNotFoundError,
      );
      await expect(useCase.execute(spaceKey)).rejects.toThrow(spaceKey.value);
    });

    it("should handle repository errors", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("TEST");
      const error = new Error("Database connection failed");

      mockRepository.findByKey.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(spaceKey)).rejects.toThrow(SpaceError);
      await expect(useCase.execute(spaceKey)).rejects.toThrow(
        "Failed to retrieve space by key",
      );
    });

    it("should handle unknown errors", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("TEST");

      mockRepository.findByKey.mockRejectedValue("Unknown error");

      // Act & Assert
      await expect(useCase.execute(spaceKey)).rejects.toThrow(SpaceError);
      await expect(useCase.execute(spaceKey)).rejects.toThrow("Unknown error");
    });

    it("should preserve error context in SpaceError", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("TEST");
      const originalError = new Error("Network timeout");

      mockRepository.findByKey.mockRejectedValue(originalError);

      // Act & Assert
      try {
        await useCase.execute(spaceKey);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SpaceError);
        expect((error as SpaceError).message).toContain(
          "Failed to retrieve space by key",
        );
        expect((error as SpaceError).message).toContain("Network timeout");
      }
    });

    it("should handle different space types", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("PERSONAL");
      const personalSpace = spacesMockFactory.createSpace({
        key: spaceKey,
        type: "personal",
      });

      mockRepository.findByKey.mockResolvedValue(personalSpace);

      // Act
      const result = await useCase.execute(spaceKey);

      // Assert
      expect(result).toEqual(personalSpace);
      expect(result.type).toBe("personal");
    });

    it("should handle archived spaces", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("ARCHIVED");
      const archivedSpace = spacesMockFactory.createSpace({
        key: spaceKey,
        status: "archived",
      });

      mockRepository.findByKey.mockResolvedValue(archivedSpace);

      // Act
      const result = await useCase.execute(spaceKey);

      // Assert
      expect(result).toEqual(archivedSpace);
      expect(result.status).toBe("archived");
    });

    it("should handle spaces with valid space key format", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("TESTSPACE123");
      const space = spacesMockFactory.createSpace({ key: spaceKey });

      mockRepository.findByKey.mockResolvedValue(space);

      // Act
      const result = await useCase.execute(spaceKey);

      // Assert
      expect(result).toEqual(space);
      expect(result.key).toEqual(spaceKey);
    });

    it("should propagate SpaceNotFoundError without wrapping", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("MISSING");

      mockRepository.findByKey.mockResolvedValue(null);

      // Act & Assert
      try {
        await useCase.execute(spaceKey);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SpaceNotFoundError);
        expect((error as SpaceNotFoundError).message).toContain(spaceKey.value);
      }
    });

    it("should include space key in error context", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("ERRORTEST");
      const originalError = new Error("Connection refused");

      mockRepository.findByKey.mockRejectedValue(originalError);

      // Act & Assert
      try {
        await useCase.execute(spaceKey);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SpaceError);
        const spaceError = error as SpaceError;
        expect(spaceError.message).toContain("Failed to retrieve space by key");
        expect(spaceError.message).toContain("Connection refused");
      }
    });
  });
});
