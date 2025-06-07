import {
  DomainError,
  SpaceError,
} from "@features/confluence/shared/validators";
import type { Space, SpaceRepository } from "../models";

/**
 * Use case for retrieving a space by ID
 */
export class GetSpaceByIdUseCase {
  constructor(private spaceRepository: SpaceRepository) {}

  async execute(id: string): Promise<Space> {
    try {
      const space = await this.spaceRepository.findById(id);

      if (!space) {
        throw new DomainError(`Space not found with ID: ${id}`);
      }

      return space;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw new SpaceError(
        `Failed to retrieve space by ID: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        error,
      );
    }
  }
}
