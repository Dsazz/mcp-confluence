import {
  SpaceAlreadyExistsError,
  SpaceError,
} from "@features/confluence/shared/validators";
import type {
  CreateSpaceRequest,
  CreateSpaceResponse,
  SpaceRepository,
} from "../models";
import { SpaceKey } from "../models";

/**
 * Use case for creating a new space
 */
export class CreateSpaceUseCase {
  constructor(private spaceRepository: SpaceRepository) {}

  async execute(request: CreateSpaceRequest): Promise<CreateSpaceResponse> {
    try {
      // Check if space already exists
      const spaceKey = SpaceKey.fromString(request.key);
      const existingSpace = await this.spaceRepository.findByKey(spaceKey);

      if (existingSpace) {
        throw new SpaceAlreadyExistsError(request.key);
      }

      const space = await this.spaceRepository.create(request);

      return {
        space,
        message: `Space '${space.name.value}' created successfully`,
      };
    } catch (error) {
      if (error instanceof SpaceAlreadyExistsError) {
        throw error;
      }

      throw new SpaceError(
        `Failed to create space: ${error instanceof Error ? error.message : "Unknown error"}`,
        request.key,
        error,
      );
    }
  }
}
