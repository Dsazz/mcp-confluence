import { beforeEach, describe, expect, it, mock } from "bun:test";
import { GetSpaceByIdUseCase } from "@features/confluence/domains/spaces/use-cases/get-space-by-id.use-case";
import {
  DomainError,
  SpaceError,
} from "@features/confluence/shared/validators";
import { SpacesMockFactory } from "../../../../../../__mocks__/v2/domains/spaces/spaces-mock-factory";

describe("GetSpaceByIdUseCase", () => {
  let useCase: GetSpaceByIdUseCase;
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

    useCase = new GetSpaceByIdUseCase(mockRepository);
  });

  describe("execute", () => {
    it("should retrieve space by id successfully", async () => {
      // Arrange
      const spaceId = "12345";
      const space = spacesMockFactory.createSpace({ id: spaceId });

      mockRepository.findById.mockResolvedValue(space);

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toEqual(space);
      expect(mockRepository.findById).toHaveBeenCalledWith(spaceId);
    });

    it("should handle space not found", async () => {
      // Arrange
      const spaceId = "99999";

      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(spaceId)).rejects.toThrow(DomainError);
      await expect(useCase.execute(spaceId)).rejects.toThrow(
        `Space not found with ID: ${spaceId}`,
      );
    });

    it("should handle repository errors", async () => {
      // Arrange
      const spaceId = "12345";
      const error = new Error("Database connection failed");

      mockRepository.findById.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(spaceId)).rejects.toThrow(SpaceError);
      await expect(useCase.execute(spaceId)).rejects.toThrow(
        "Failed to retrieve space by ID",
      );
    });

    it("should handle unknown errors", async () => {
      // Arrange
      const spaceId = "12345";

      mockRepository.findById.mockRejectedValue("Unknown error");

      // Act & Assert
      await expect(useCase.execute(spaceId)).rejects.toThrow(SpaceError);
      await expect(useCase.execute(spaceId)).rejects.toThrow("Unknown error");
    });

    it("should preserve error context in SpaceError", async () => {
      // Arrange
      const spaceId = "12345";
      const originalError = new Error("Network timeout");

      mockRepository.findById.mockRejectedValue(originalError);

      // Act & Assert
      try {
        await useCase.execute(spaceId);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SpaceError);
        expect((error as SpaceError).message).toContain(
          "Failed to retrieve space by ID",
        );
        expect((error as SpaceError).message).toContain("Network timeout");
      }
    });

    it("should handle different space types", async () => {
      // Arrange
      const spaceId = "67890";
      const personalSpace = spacesMockFactory.createSpace({
        id: spaceId,
        type: "personal",
      });

      mockRepository.findById.mockResolvedValue(personalSpace);

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toEqual(personalSpace);
      expect(result.type).toBe("personal");
    });

    it("should handle archived spaces", async () => {
      // Arrange
      const spaceId = "11111";
      const archivedSpace = spacesMockFactory.createSpace({
        id: spaceId,
        status: "archived",
      });

      mockRepository.findById.mockResolvedValue(archivedSpace);

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toEqual(archivedSpace);
      expect(result.status).toBe("archived");
    });

    it("should handle numeric string IDs", async () => {
      // Arrange
      const spaceId = "123456789";
      const space = spacesMockFactory.createSpace({ id: spaceId });

      mockRepository.findById.mockResolvedValue(space);

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toEqual(space);
      expect(result.id).toBe(spaceId);
    });

    it("should propagate SpaceNotFoundError without wrapping", async () => {
      // Arrange
      const spaceId = "missing-id";

      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      try {
        await useCase.execute(spaceId);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
        expect((error as DomainError).message).toContain(spaceId);
      }
    });

    it("should include space id in error context", async () => {
      // Arrange
      const spaceId = "error-test-id";
      const originalError = new Error("Connection refused");

      mockRepository.findById.mockRejectedValue(originalError);

      // Act & Assert
      try {
        await useCase.execute(spaceId);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SpaceError);
        const spaceError = error as SpaceError;
        expect(spaceError.message).toContain("Failed to retrieve space by ID");
        expect(spaceError.message).toContain("Connection refused");
      }
    });

    it("should handle UUID-style space IDs", async () => {
      // Arrange
      const spaceId = "550e8400-e29b-41d4-a716-446655440000";
      const space = spacesMockFactory.createSpace({ id: spaceId });

      mockRepository.findById.mockResolvedValue(space);

      // Act
      const result = await useCase.execute(spaceId);

      // Assert
      expect(result).toEqual(space);
      expect(result.id).toBe(spaceId);
    });

    it("should handle empty string ID gracefully", async () => {
      // Arrange
      const spaceId = "";

      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(spaceId)).rejects.toThrow(DomainError);
    });
  });
});
