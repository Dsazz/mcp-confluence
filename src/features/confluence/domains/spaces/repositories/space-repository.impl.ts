import type { ConfluenceHttpClient } from "@confluence/client";
import { SpaceRepositoryError } from "../../../shared/validators";
import type {
  CreateSpaceRequest,
  GetSpacesRequest,
  PaginationInfo,
  Space,
  SpaceKey,
  SpaceRepository,
} from "../models";
import { createSpace as createSpaceFactory } from "../models";

/**
 * Implementation of SpaceRepository using Confluence HTTP client
 */
export class SpaceRepositoryImpl implements SpaceRepository {
  constructor(private httpClient: ConfluenceHttpClient) {}

  async findAll(
    params?: GetSpacesRequest,
  ): Promise<{ spaces: Space[]; pagination: PaginationInfo }> {
    try {
      const response =
        await this.httpClient.sendRequest<ConfluenceSpacesResponse>({
          method: "GET",
          url: "/spaces",
          params: this.buildQueryParams(params),
        });

      const spaces = response.results.map((spaceData) =>
        this.mapToSpace(spaceData),
      );
      const pagination = this.mapToPagination(response);

      return { spaces, pagination };
    } catch (error) {
      throw new SpaceRepositoryError(
        `Failed to retrieve spaces: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async findByKey(key: SpaceKey): Promise<Space | null> {
    try {
      const response =
        await this.httpClient.sendRequest<ConfluenceSpaceResponse>({
          method: "GET",
          url: `/spaces/${key.value}`,
        });

      return this.mapToSpace(response);
    } catch (error) {
      // If it's a 404, return null instead of throwing
      if (this.isNotFoundError(error)) {
        return null;
      }

      throw new SpaceRepositoryError(
        `Failed to retrieve space by key: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async findById(id: string): Promise<Space | null> {
    try {
      const response =
        await this.httpClient.sendRequest<ConfluenceSpaceResponse>({
          method: "GET",
          url: `/spaces/${id}`,
        });

      return this.mapToSpace(response);
    } catch (error) {
      // If it's a 404, return null instead of throwing
      if (this.isNotFoundError(error)) {
        return null;
      }

      throw new SpaceRepositoryError(
        `Failed to retrieve space by ID: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async create(request: CreateSpaceRequest): Promise<Space> {
    try {
      const response =
        await this.httpClient.sendRequest<ConfluenceSpaceResponse>({
          method: "POST",
          url: "/spaces",
          data: this.mapCreateRequest(request),
        });

      return this.mapToSpace(response);
    } catch (error) {
      throw new SpaceRepositoryError(
        `Failed to create space: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async update(
    key: SpaceKey,
    updates: Partial<CreateSpaceRequest>,
  ): Promise<Space> {
    try {
      const response =
        await this.httpClient.sendRequest<ConfluenceSpaceResponse>({
          method: "PUT",
          url: `/spaces/${key.value}`,
          data: this.mapUpdateRequest(updates),
        });

      return this.mapToSpace(response);
    } catch (error) {
      throw new SpaceRepositoryError(
        `Failed to update space: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async delete(key: SpaceKey): Promise<void> {
    try {
      await this.httpClient.sendRequest<void>({
        method: "DELETE",
        url: `/spaces/${key.value}`,
      });
    } catch (error) {
      throw new SpaceRepositoryError(
        `Failed to delete space: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  async exists(key: SpaceKey): Promise<boolean> {
    try {
      const space = await this.findByKey(key);
      return space !== null;
    } catch (error) {
      throw new SpaceRepositoryError(
        `Failed to check space existence: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
    }
  }

  /**
   * Private helper methods
   */
  private buildQueryParams(
    params?: GetSpacesRequest,
  ): Record<string, string | number> {
    const queryParams: Record<string, string | number> = {};

    if (params?.type) {
      queryParams.type = params.type;
    }

    if (params?.limit) {
      queryParams.limit = params.limit;
    }

    if (params?.start) {
      queryParams.start = params.start;
    }

    if (params?.expand) {
      queryParams.expand = params.expand;
    }

    return queryParams;
  }

  private mapToSpace(spaceData: ConfluenceSpaceData): Space {
    return createSpaceFactory({
      id: spaceData.id,
      key: spaceData.key,
      name: spaceData.name,
      description: spaceData.description?.plain?.value,
      type: spaceData.type as "global" | "personal",
      status: spaceData.status as "current" | "archived",
      createdAt: spaceData.createdAt,
      updatedAt: spaceData.version?.when || spaceData.createdAt,
      permissions: this.mapPermissions(spaceData.permissions),
      settings: this.mapSettings(spaceData),
      links: this.mapLinks(spaceData._links),
      homepage: spaceData.homepage
        ? {
            id: spaceData.homepage.id,
            title: spaceData.homepage.title,
            webui: spaceData.homepage._links?.webui || "",
          }
        : undefined,
      icon: spaceData.icon
        ? {
            path: spaceData.icon.path,
            width: spaceData.icon.width,
            height: spaceData.icon.height,
            isDefault: spaceData.icon.isDefault,
          }
        : undefined,
    });
  }

  private mapToPagination(response: ConfluenceSpacesResponse): PaginationInfo {
    return {
      start: response.start,
      limit: response.limit,
      size: response.size,
      hasMore: response.totalSize
        ? response.start + response.size < response.totalSize
        : false,
    };
  }

  private mapPermissions(_permissions?: unknown): Space["permissions"] {
    // TODO: Implement proper permissions mapping when Confluence API provides this data
    return {
      canView: true,
      canEdit: false,
      canAdmin: false,
      canCreatePages: false,
      canDeletePages: false,
    };
  }

  private mapSettings(spaceData: ConfluenceSpaceData): Space["settings"] {
    // TODO: Implement proper settings mapping when Confluence API provides this data
    return {
      isPublic: spaceData.type === "global",
      allowAnonymousAccess: false,
      enableComments: true,
      enableAttachments: true,
    };
  }

  private mapLinks(links: ConfluenceSpaceData["_links"]): Space["links"] {
    return {
      self: links.self || "",
      webui: links.webui || "",
      context: links.context || "",
    };
  }

  private mapCreateRequest(request: CreateSpaceRequest): unknown {
    return {
      key: request.key,
      name: request.name,
      description: request.description
        ? {
            plain: {
              value: request.description,
              representation: "plain",
            },
          }
        : undefined,
      type: request.type,
    };
  }

  private mapUpdateRequest(updates: Partial<CreateSpaceRequest>): unknown {
    const updateData: Record<string, unknown> = {};

    if (updates.name) {
      updateData.name = updates.name;
    }

    if (updates.description !== undefined) {
      updateData.description = updates.description
        ? {
            plain: {
              value: updates.description,
              representation: "plain",
            },
          }
        : null;
    }

    if (updates.type) {
      updateData.type = updates.type;
    }

    return updateData;
  }

  private isNotFoundError(error: unknown): boolean {
    // Check if it's a 404 error from the HTTP client
    if (error && typeof error === "object" && "status" in error) {
      return (error as { status: number }).status === 404;
    }

    // Check if it's an error message indicating not found
    if (error instanceof Error) {
      return (
        error.message.toLowerCase().includes("not found") ||
        error.message.toLowerCase().includes("404")
      );
    }

    return false;
  }
}

// Confluence API response types
interface ConfluenceSpacesResponse {
  results: ConfluenceSpaceData[];
  start: number;
  limit: number;
  size: number;
  totalSize?: number;
  _links: {
    self: string;
    next?: string;
    prev?: string;
  };
}

interface ConfluenceSpaceResponse extends ConfluenceSpaceData {}

interface ConfluenceSpaceData {
  id: string;
  key: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  description?: {
    plain?: {
      value: string;
      representation: string;
    };
  };
  version?: {
    when: string;
    number: number;
  };
  permissions?: unknown;
  homepage?: {
    id: string;
    title: string;
    _links?: {
      webui?: string;
    };
  };
  icon?: {
    path: string;
    width: number;
    height: number;
    isDefault: boolean;
  };
  _links: {
    self?: string;
    webui?: string;
    editui?: string;
    context?: string;
  };
}
