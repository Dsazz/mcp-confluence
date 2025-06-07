import { ValidationError } from "@features/confluence/shared/validators";
import type { GetSpacesRequest, GetSpacesResponse } from "../models";
import type { GetAllSpacesUseCase } from "../use-cases";
import { GetSpacesValidator } from "../validators";

/**
 * Handler for getting all spaces
 */
export class GetSpacesHandler {
  private validator = new GetSpacesValidator();

  constructor(private getAllSpacesUseCase: GetAllSpacesUseCase) {}

  async handle(request?: GetSpacesRequest): Promise<GetSpacesResponse> {
    try {
      this.validator.validate(request);
      return await this.getAllSpacesUseCase.execute(request);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to get spaces: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
