import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { CreateSpaceRequest } from "@features/confluence/domains/spaces/models";
import { UpdateSpaceUseCase } from "@features/confluence/domains/spaces/use-cases/update-space.use-case";
import {
  SpaceError,
  SpaceNotFoundError,
} from "@features/confluence/shared/validators";
import { SpacesMockFactory } from "../../../../../../__mocks__/v2/domains/spaces/spaces-mock-factory";

describe("UpdateSpaceUseCase", () => {
  let useCase: UpdateSpaceUseCase;
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

    useCase = new UpdateSpaceUseCase(mockRepository);
  });

  describe("execute", () => {
    it("should update space successfully", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("TESTSPACE");
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Space Name",
        description: "Updated description",
      };
      const existingSpace = spacesMockFactory.createSpace({ key: spaceKey });
      const updatedSpace = spacesMockFactory.createSpace({
        key: spaceKey,
        name: spacesMockFactory.createSpaceName(
          updates.name || "Updated Space Name",
        ),
        description: updates.description,
      });

      mockRepository.findByKey.mockResolvedValue(existingSpace);
      mockRepository.update.mockResolvedValue(updatedSpace);

      // Act
      const result = await useCase.execute(spaceKey, updates);

      // Assert
      expect(result).toEqual(updatedSpace);
      expect(mockRepository.findByKey).toHaveBeenCalledWith(spaceKey);
      expect(mockRepository.update).toHaveBeenCalledWith(spaceKey, updates);
    });

    it("should update space with partial data", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("TESTSPACE");
      const updates: Partial<CreateSpaceRequest> = {
        name: "New Name Only",
      };
      const existingSpace = spacesMockFactory.createSpace({ key: spaceKey });
      const updatedSpace = spacesMockFactory.createSpace({
        key: spaceKey,
        name: spacesMockFactory.createSpaceName(
          updates.name || "New Name Only",
        ),
      });

      mockRepository.findByKey.mockResolvedValue(existingSpace);
      mockRepository.update.mockResolvedValue(updatedSpace);

      // Act
      const result = await useCase.execute(spaceKey, updates);

      // Assert
      expect(result).toEqual(updatedSpace);
      expect(result.name.value).toBe("New Name Only");
    });

    it("should handle space not found", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("NONEXISTENT");
      const updates: Partial<CreateSpaceRequest> = {
        name: "New Name",
      };

      mockRepository.findByKey.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(spaceKey, updates)).rejects.toThrow(
        SpaceNotFoundError,
      );
      await expect(useCase.execute(spaceKey, updates)).rejects.toThrow(
        spaceKey.value,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should handle repository update errors", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("TESTSPACE");
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Name",
      };
      const existingSpace = spacesMockFactory.createSpace({ key: spaceKey });
      const error = new Error("Database constraint violation");

      mockRepository.findByKey.mockResolvedValue(existingSpace);
      mockRepository.update.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(spaceKey, updates)).rejects.toThrow(
        SpaceError,
      );
      await expect(useCase.execute(spaceKey, updates)).rejects.toThrow(
        "Failed to update space",
      );
    });

    it("should handle repository findByKey errors", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("TESTSPACE");
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Name",
      };
      const error = new Error("Database connection failed");

      mockRepository.findByKey.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(spaceKey, updates)).rejects.toThrow(
        SpaceError,
      );
      await expect(useCase.execute(spaceKey, updates)).rejects.toThrow(
        "Failed to update space",
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should handle unknown errors", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("TESTSPACE");
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Name",
      };
      const existingSpace = spacesMockFactory.createSpace({ key: spaceKey });

      mockRepository.findByKey.mockResolvedValue(existingSpace);
      mockRepository.update.mockRejectedValue("Unknown error");

      // Act & Assert
      await expect(useCase.execute(spaceKey, updates)).rejects.toThrow(
        SpaceError,
      );
      await expect(useCase.execute(spaceKey, updates)).rejects.toThrow(
        "Unknown error",
      );
    });

    it("should preserve error context in SpaceError", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("TESTSPACE");
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Name",
      };
      const existingSpace = spacesMockFactory.createSpace({ key: spaceKey });
      const originalError = new Error("Validation failed");

      mockRepository.findByKey.mockResolvedValue(existingSpace);
      mockRepository.update.mockRejectedValue(originalError);

      // Act & Assert
      try {
        await useCase.execute(spaceKey, updates);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SpaceError);
        expect((error as SpaceError).message).toContain(
          "Failed to update space",
        );
        expect((error as SpaceError).message).toContain("Validation failed");
      }
    });

    it("should propagate SpaceNotFoundError without wrapping", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("MISSING");
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Name",
      };

      mockRepository.findByKey.mockResolvedValue(null);

      // Act & Assert
      try {
        await useCase.execute(spaceKey, updates);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SpaceNotFoundError);
        expect((error as SpaceNotFoundError).message).toContain(spaceKey.value);
      }
    });

    it("should include space key in error context", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("ERRORTEST");
      const updates: Partial<CreateSpaceRequest> = {
        name: "Updated Name",
      };
      const existingSpace = spacesMockFactory.createSpace({ key: spaceKey });
      const originalError = new Error("Permission denied");

      mockRepository.findByKey.mockResolvedValue(existingSpace);
      mockRepository.update.mockRejectedValue(originalError);

      // Act & Assert
      try {
        await useCase.execute(spaceKey, updates);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SpaceError);
        const spaceError = error as SpaceError;
        expect(spaceError.message).toContain("Failed to update space");
        expect(spaceError.message).toContain("Permission denied");
      }
    });

    it("should update space description only", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("TESTSPACE");
      const updates: Partial<CreateSpaceRequest> = {
        description: "New description only",
      };
      const existingSpace = spacesMockFactory.createSpace({ key: spaceKey });
      const updatedSpace = spacesMockFactory.createSpace({
        key: spaceKey,
        description: updates.description,
      });

      mockRepository.findByKey.mockResolvedValue(existingSpace);
      mockRepository.update.mockResolvedValue(updatedSpace);

      // Act
      const result = await useCase.execute(spaceKey, updates);

      // Assert
      expect(result).toEqual(updatedSpace);
      expect(result.description).toBe("New description only");
    });

    it("should validate update flow", async () => {
      // Arrange
      const spaceKey = spacesMockFactory.createSpaceKey("FLOWTEST");
      const updates: Partial<CreateSpaceRequest> = {
        name: "Flow Test Space",
        description: "Flow test description",
      };
      const existingSpace = spacesMockFactory.createSpace({ key: spaceKey });
      const updatedSpace = spacesMockFactory.createSpace({
        key: spaceKey,
        name: spacesMockFactory.createSpaceName(
          updates.name || "Flow Test Space",
        ),
        description: updates.description,
      });

      mockRepository.findByKey.mockResolvedValue(existingSpace);
      mockRepository.update.mockResolvedValue(updatedSpace);

      // Act
      const result = await useCase.execute(spaceKey, updates);

      // Assert
      expect(mockRepository.findByKey).toHaveBeenCalledTimes(1);
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedSpace);
      expect(result.name.value).toBe("Flow Test Space");
    });
  });
});
