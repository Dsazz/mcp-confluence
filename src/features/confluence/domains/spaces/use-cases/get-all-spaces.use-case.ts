import { SpaceError } from "@features/confluence/shared/validators";
import type {
  GetSpacesRequest,
  GetSpacesResponse,
  SpaceRepository,
} from "../models";
import { createSpaceSummary } from "../models";

/**
 * Use case for retrieving all spaces
 */
export class GetAllSpacesUseCase {
  constructor(private spaceRepository: SpaceRepository) {}

  async execute(request?: GetSpacesRequest): Promise<GetSpacesResponse> {
    try {
      const { spaces, pagination } =
        await this.spaceRepository.findAll(request);
      const summary = createSpaceSummary(spaces);

      return {
        spaces,
        pagination,
        summary,
      };
    } catch (error) {
      throw new SpaceError(
        `Failed to retrieve spaces: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        error,
      );
    }
  }
}
