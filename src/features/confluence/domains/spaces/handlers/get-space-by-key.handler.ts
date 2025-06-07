import { ValidationError } from "@features/confluence/shared/validators";
import type { Space } from "../models";
import { SpaceKey as SpaceKeyClass } from "../models";
import type { GetSpaceByKeyUseCase } from "../use-cases";
import { GetSpaceByKeyValidator } from "../validators";

/**
 * Handler for getting a space by key
 */
export class GetSpaceByKeyHandler {
  private validator = new GetSpaceByKeyValidator();

  constructor(private getSpaceByKeyUseCase: GetSpaceByKeyUseCase) {}

  async handle(key: string): Promise<Space> {
    try {
      this.validator.validate(key);
      const spaceKey = SpaceKeyClass.fromString(key);
      return await this.getSpaceByKeyUseCase.execute(spaceKey);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to get space by key: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
