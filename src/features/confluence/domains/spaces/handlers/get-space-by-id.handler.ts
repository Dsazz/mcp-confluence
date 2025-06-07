import { ValidationError } from "@features/confluence/shared/validators";
import type { Space } from "../models";
import type { GetSpaceByIdUseCase } from "../use-cases";
import { GetSpaceByIdValidator } from "../validators";

/**
 * Handler for getting a space by ID
 */
export class GetSpaceByIdHandler {
  private validator = new GetSpaceByIdValidator();

  constructor(private getSpaceByIdUseCase: GetSpaceByIdUseCase) {}

  async handle(id: string): Promise<Space> {
    try {
      this.validator.validate(id);
      return await this.getSpaceByIdUseCase.execute(id);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to get space by ID: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
