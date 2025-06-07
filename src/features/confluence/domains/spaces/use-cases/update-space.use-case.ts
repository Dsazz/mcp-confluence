import {
  SpaceError,
  SpaceNotFoundError,
} from "@features/confluence/shared/validators";
import type {
  CreateSpaceRequest,
  Space,
  SpaceKey,
  SpaceRepository,
} from "../models";

/**
 * Use case for updating an existing space
 */
export class UpdateSpaceUseCase {
  constructor(private spaceRepository: SpaceRepository) {}

  async execute(
    key: SpaceKey,
    updates: Partial<CreateSpaceRequest>,
  ): Promise<Space> {
    try {
      // Check if space exists
      const existingSpace = await this.spaceRepository.findByKey(key);

      if (!existingSpace) {
        throw new SpaceNotFoundError(key.value);
      }

      const updatedSpace = await this.spaceRepository.update(key, updates);

      return updatedSpace;
    } catch (error) {
      if (error instanceof SpaceNotFoundError) {
        throw error;
      }

      throw new SpaceError(
        `Failed to update space: ${error instanceof Error ? error.message : "Unknown error"}`,
        key.value,
        error,
      );
    }
  }
}
