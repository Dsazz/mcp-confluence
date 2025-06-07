import {
  SpaceError,
  SpaceNotFoundError,
} from "@features/confluence/shared/validators";
import type { Space, SpaceRepository } from "../models";
import type { SpaceKey } from "../models";

/**
 * Use case for retrieving a space by key
 */
export class GetSpaceByKeyUseCase {
  constructor(private spaceRepository: SpaceRepository) {}

  async execute(key: SpaceKey): Promise<Space> {
    try {
      const space = await this.spaceRepository.findByKey(key);

      if (!space) {
        throw new SpaceNotFoundError(key.value);
      }

      return space;
    } catch (error) {
      if (error instanceof SpaceNotFoundError) {
        throw error;
      }

      throw new SpaceError(
        `Failed to retrieve space by key: ${error instanceof Error ? error.message : "Unknown error"}`,
        key.value,
        error,
      );
    }
  }
}
