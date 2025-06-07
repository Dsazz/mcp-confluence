import type {
  CreateSpaceRequest,
  GetSpacesRequest,
} from "./space-schemas.model";
import type { SpaceKey } from "./space-value-objects.model";
import type { PaginationInfo, Space } from "./space.model";

/**
 * Repository Interface
 */
export interface SpaceRepository {
  findAll(
    params?: GetSpacesRequest,
  ): Promise<{ spaces: Space[]; pagination: PaginationInfo }>;
  findByKey(key: SpaceKey): Promise<Space | null>;
  findById(id: string): Promise<Space | null>;
  create(space: CreateSpaceRequest): Promise<Space>;
  update(key: SpaceKey, updates: Partial<CreateSpaceRequest>): Promise<Space>;
  delete(key: SpaceKey): Promise<void>;
  exists(key: SpaceKey): Promise<boolean>;
}
