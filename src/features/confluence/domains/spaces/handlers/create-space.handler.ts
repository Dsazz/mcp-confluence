import { ValidationError } from "@features/confluence/shared/validators";
import type { CreateSpaceRequest, CreateSpaceResponse } from "../models";
import type { CreateSpaceUseCase } from "../use-cases";
import { CreateSpaceValidator } from "../validators";

/**
 * Handler for creating a space
 */
export class CreateSpaceHandler {
  private validator = new CreateSpaceValidator();

  constructor(private createSpaceUseCase: CreateSpaceUseCase) {}

  async handle(request: CreateSpaceRequest): Promise<CreateSpaceResponse> {
    try {
      this.validator.validate(request);
      return await this.createSpaceUseCase.execute(request);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to create space: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
