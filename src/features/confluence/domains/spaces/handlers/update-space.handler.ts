import { ValidationError } from "@features/confluence/shared/validators";
import type { CreateSpaceRequest, Space } from "../models";
import { SpaceKey as SpaceKeyClass } from "../models";
import type { UpdateSpaceUseCase } from "../use-cases";
import { UpdateSpaceValidator } from "../validators";

/**
 * Handler for updating a space
 */
export class UpdateSpaceHandler {
  private validator = new UpdateSpaceValidator();

  constructor(private updateSpaceUseCase: UpdateSpaceUseCase) {}

  async handle(
    key: string,
    updates: Partial<CreateSpaceRequest>,
  ): Promise<Space> {
    try {
      this.validator.validate(key, updates);
      const spaceKey = SpaceKeyClass.fromString(key);
      return await this.updateSpaceUseCase.execute(spaceKey, updates);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to update space: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
