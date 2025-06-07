import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { CreateSpaceRequest } from "@features/confluence/domains/spaces/models";
import { CreateSpaceUseCase } from "@features/confluence/domains/spaces/use-cases/create-space.use-case";
import {
  SpaceAlreadyExistsError,
  SpaceError,
} from "@features/confluence/shared/validators";
import { SpacesMockFactory } from "../../../../../../__mocks__/v2/domains/spaces/spaces-mock-factory";

describe("CreateSpaceUseCase", () => {
  let useCase: CreateSpaceUseCase;
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

    useCase = new CreateSpaceUseCase(mockRepository);
  });

  describe("execute", () => {
    it("should create space successfully", async () => {
      // Arrange
      const request: CreateSpaceRequest = {
        key: "NEWSPACE",
        name: "New Space",
        description: "A new space for testing",
        type: "global",
      };
      const createdSpace = spacesMockFactory.createSpace({
        key: spacesMockFactory.createSpaceKey(request.key),
        name: spacesMockFactory.createSpaceName(request.name),
        description: request.description,
        type: request.type,
      });

      mockRepository.findByKey.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(createdSpace);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual({
        space: createdSpace,
        message: `Space '${createdSpace.name.value}' created successfully`,
      });
      expect(mockRepository.create).toHaveBeenCalledWith(request);
    });

    it("should create space without optional fields", async () => {
      // Arrange
      const request: CreateSpaceRequest = {
        key: "MINIMAL",
        name: "Minimal Space",
      };
      const createdSpace = spacesMockFactory.createSpace({
        key: spacesMockFactory.createSpaceKey(request.key),
        name: spacesMockFactory.createSpaceName(request.name),
        type: "global",
      });

      mockRepository.findByKey.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(createdSpace);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual({
        space: createdSpace,
        message: `Space '${createdSpace.name.value}' created successfully`,
      });
      expect(mockRepository.create).toHaveBeenCalledWith(request);
    });

    it("should handle space already exists", async () => {
      // Arrange
      const request: CreateSpaceRequest = {
        key: "EXISTING",
        name: "Existing Space",
      };
      const existingSpace = spacesMockFactory.createSpace({
        key: spacesMockFactory.createSpaceKey(request.key),
      });

      mockRepository.findByKey.mockResolvedValue(existingSpace);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        SpaceAlreadyExistsError,
      );
      await expect(useCase.execute(request)).rejects.toThrow(request.key);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should handle repository creation errors", async () => {
      // Arrange
      const request: CreateSpaceRequest = {
        key: "ERRORSPACE",
        name: "Error Space",
      };
      const error = new Error("Database constraint violation");

      mockRepository.findByKey.mockResolvedValue(null);
      mockRepository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(SpaceError);
      await expect(useCase.execute(request)).rejects.toThrow(
        "Failed to create space",
      );
    });

    it("should handle repository findByKey errors", async () => {
      // Arrange
      const request: CreateSpaceRequest = {
        key: "CHECKFAIL",
        name: "Check Fail Space",
      };
      const error = new Error("Database connection failed");

      mockRepository.findByKey.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(SpaceError);
      await expect(useCase.execute(request)).rejects.toThrow(
        "Failed to create space",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should handle unknown errors", async () => {
      // Arrange
      const request: CreateSpaceRequest = {
        key: "UNKNOWN",
        name: "Unknown Error Space",
      };

      mockRepository.findByKey.mockResolvedValue(null);
      mockRepository.create.mockRejectedValue("Unknown error");

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(SpaceError);
      await expect(useCase.execute(request)).rejects.toThrow("Unknown error");
    });

    it("should preserve error context in SpaceError", async () => {
      // Arrange
      const request: CreateSpaceRequest = {
        key: "CONTEXT",
        name: "Context Space",
      };
      const originalError = new Error("Validation failed");

      mockRepository.findByKey.mockResolvedValue(null);
      mockRepository.create.mockRejectedValue(originalError);

      // Act & Assert
      try {
        await useCase.execute(request);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SpaceError);
        expect((error as SpaceError).message).toContain(
          "Failed to create space",
        );
        expect((error as SpaceError).message).toContain("Validation failed");
      }
    });

    it("should create personal space", async () => {
      // Arrange
      const request: CreateSpaceRequest = {
        key: "PERSONAL",
        name: "Personal Space",
        type: "personal",
      };
      const createdSpace = spacesMockFactory.createSpace({
        key: spacesMockFactory.createSpaceKey(request.key),
        name: spacesMockFactory.createSpaceName(request.name),
        type: "personal",
      });

      mockRepository.findByKey.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(createdSpace);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.space).toEqual(createdSpace);
      expect(result.space.type).toBe("personal");
      expect(result.message).toContain("created successfully");
    });

    it("should propagate SpaceAlreadyExistsError without wrapping", async () => {
      // Arrange
      const request: CreateSpaceRequest = {
        key: "DUPLICATE",
        name: "Duplicate Space",
      };
      const existingSpace = spacesMockFactory.createSpace({
        key: spacesMockFactory.createSpaceKey(request.key),
      });

      mockRepository.findByKey.mockResolvedValue(existingSpace);

      // Act & Assert
      try {
        await useCase.execute(request);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SpaceAlreadyExistsError);
        expect((error as SpaceAlreadyExistsError).message).toContain(
          request.key,
        );
      }
    });

    it("should include space key in error context", async () => {
      // Arrange
      const request: CreateSpaceRequest = {
        key: "ERRORKEY",
        name: "Error Key Space",
      };
      const originalError = new Error("Permission denied");

      mockRepository.findByKey.mockResolvedValue(null);
      mockRepository.create.mockRejectedValue(originalError);

      // Act & Assert
      try {
        await useCase.execute(request);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SpaceError);
        const spaceError = error as SpaceError;
        expect(spaceError.message).toContain("Failed to create space");
        expect(spaceError.message).toContain("Permission denied");
      }
    });

    it("should handle space with description", async () => {
      // Arrange
      const request: CreateSpaceRequest = {
        key: "DESCRIBED",
        name: "Described Space",
        description:
          "This space has a detailed description for testing purposes",
      };
      const createdSpace = spacesMockFactory.createSpace({
        key: spacesMockFactory.createSpaceKey(request.key),
        name: spacesMockFactory.createSpaceName(request.name),
        description: request.description,
      });

      mockRepository.findByKey.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(createdSpace);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.space).toEqual(createdSpace);
      expect(result.space.description).toBe(
        "This space has a detailed description for testing purposes",
      );
    });

    it("should validate space creation flow", async () => {
      // Arrange
      const request: CreateSpaceRequest = {
        key: "FLOWTEST",
        name: "Flow Test Space",
      };
      const createdSpace = spacesMockFactory.createSpace({
        key: spacesMockFactory.createSpaceKey(request.key),
        name: spacesMockFactory.createSpaceName(request.name),
      });

      mockRepository.findByKey.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(createdSpace);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(mockRepository.findByKey).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(result.space).toEqual(createdSpace);
      expect(result.message).toContain("created successfully");
    });
  });
});
