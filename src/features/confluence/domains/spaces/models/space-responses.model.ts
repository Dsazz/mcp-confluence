import type { PaginationInfo, Space, SpaceSummary } from "./space.model";

/**
 * Response Types
 */
export interface GetSpacesResponse {
  spaces: Space[];
  pagination: PaginationInfo;
  summary: SpaceSummary;
}

export interface CreateSpaceResponse {
  space: Space;
  message: string;
}
