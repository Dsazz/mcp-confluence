import type {
  CreateSpaceRequest,
  CreateSpaceResponse,
  GetSpacesRequest,
  GetSpacesResponse,
  PaginationInfo,
  Space,
  SpaceLinks,
  SpacePermissions,
  SpaceSettings,
  SpaceSummary,
} from "@features/confluence/domains/spaces/models";
import {
  SpaceKey,
  SpaceName,
} from "@features/confluence/domains/spaces/models";
import { BaseMockFactory, MockDataUtils } from "../../base/base-mock-factory";

export class SpacesMockFactory extends BaseMockFactory<Space> {
  /**
   * Required implementation for BaseMockFactory
   */
  create(overrides: Partial<Space> = {}): Space {
    return this.createSpace(overrides);
  }

  /**
   * Required implementation for BaseMockFactory
   */
  protected generateRandomData(): Partial<Space> {
    return {
      type: MockDataUtils.randomChoice(["global", "personal"] as const),
      status: MockDataUtils.randomChoice(["current", "archived"] as const),
    };
  }

  /**
   * Create a mock SpaceKey value object
   */
  createSpaceKey(value?: string): SpaceKey {
    return new SpaceKey(value || MockDataUtils.generateKey());
  }

  /**
   * Create a mock SpaceName value object
   */
  createSpaceName(value?: string): SpaceName {
    return new SpaceName(value || MockDataUtils.generateName());
  }

  /**
   * Create a mock SpaceLinks
   */
  createSpaceLinks(
    spaceKey?: string,
    overrides: Partial<SpaceLinks> = {},
  ): SpaceLinks {
    const key = spaceKey || MockDataUtils.generateKey();
    return {
      self: `/api/v2/spaces/${key}`,
      webui: `/spaces/${key}`,
      context: `/spaces/${key}/overview`,
      ...overrides,
    };
  }

  /**
   * Create a mock SpacePermissions
   */
  createSpacePermissions(
    overrides: Partial<SpacePermissions> = {},
  ): SpacePermissions {
    return {
      canView: true,
      canEdit: true,
      canAdmin: false,
      canCreatePages: true,
      canDeletePages: false,
      ...overrides,
    };
  }

  /**
   * Create a mock SpaceSettings
   */
  createSpaceSettings(overrides: Partial<SpaceSettings> = {}): SpaceSettings {
    return {
      isPublic: true,
      allowAnonymousAccess: false,
      enableComments: true,
      enableAttachments: true,
      ...overrides,
    };
  }

  /**
   * Create a mock Space
   */
  createSpace(overrides: Partial<Space> = {}): Space {
    const spaceKey = this.createSpaceKey();
    const now = new Date();

    return {
      id: MockDataUtils.generateId(),
      key: spaceKey,
      name: this.createSpaceName(),
      description: MockDataUtils.generateDescription(),
      type: "global",
      status: "current",
      createdAt: now,
      updatedAt: now,
      permissions: this.createSpacePermissions(),
      settings: this.createSpaceSettings(),
      links: this.createSpaceLinks(spaceKey.value),
      homepage: {
        id: MockDataUtils.generateId(),
        title: "Home",
        webui: `/spaces/${spaceKey.value}/overview`,
      },
      ...overrides,
    };
  }

  /**
   * Create a mock SpaceSummary
   */
  createSpaceSummary(overrides: Partial<SpaceSummary> = {}): SpaceSummary {
    return {
      total: 10,
      globalSpaces: 7,
      personalSpaces: 3,
      archivedSpaces: 0,
      ...overrides,
    };
  }

  /**
   * Create multiple mock spaces
   */
  createSpaces(count: number, overrides: Partial<Space> = {}): Space[] {
    return Array.from({ length: count }, (_, index) =>
      this.createSpace({
        ...overrides,
        ...this.generateIndexedOverrides(index),
      }),
    );
  }

  /**
   * Create a mock PaginationInfo
   */
  createPaginationInfo(
    overrides: Partial<PaginationInfo> = {},
  ): PaginationInfo {
    return {
      start: 0,
      limit: 25,
      size: 10,
      hasMore: false,
      ...overrides,
    };
  }

  /**
   * Create a mock GetSpacesRequest
   */
  createGetSpacesRequest(
    overrides: Partial<GetSpacesRequest> = {},
  ): GetSpacesRequest {
    return {
      type: "global",
      limit: 25,
      start: 0,
      expand: "description,permissions",
      ...overrides,
    };
  }

  /**
   * Create a mock GetSpacesResponse
   */
  createGetSpacesResponse(
    overrides: Partial<GetSpacesResponse> = {},
  ): GetSpacesResponse {
    const spaces = this.createSpaces(3);
    return {
      spaces,
      pagination: this.createPaginationInfo({
        size: spaces.length,
      }),
      summary: this.createSpaceSummary({
        total: spaces.length,
        globalSpaces: spaces.filter((s) => s.type === "global").length,
        personalSpaces: spaces.filter((s) => s.type === "personal").length,
      }),
      ...overrides,
    };
  }

  /**
   * Create a mock CreateSpaceRequest
   */
  createCreateSpaceRequest(
    overrides: Partial<CreateSpaceRequest> = {},
  ): CreateSpaceRequest {
    return {
      key: MockDataUtils.generateKey(),
      name: MockDataUtils.generateName(),
      description: MockDataUtils.generateDescription(),
      type: "global",
      ...overrides,
    };
  }

  /**
   * Create a mock CreateSpaceResponse
   */
  createCreateSpaceResponse(
    overrides: Partial<CreateSpaceResponse> = {},
  ): CreateSpaceResponse {
    return {
      space: this.createSpace(),
      message: "Space created successfully",
      ...overrides,
    };
  }

  /**
   * Generate indexed overrides for creating multiple items
   */
  protected generateIndexedOverrides(index: number): Partial<Space> {
    return {
      key: this.createSpaceKey(`TEST${index.toString().padStart(3, "0")}`),
      name: this.createSpaceName(`Test Space ${index + 1}`),
    };
  }
}
