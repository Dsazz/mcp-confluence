/**
 * Space Formatter
 *
 * Transforms Space domain objects to API response format for the confluence system.
 * Handles space permissions, settings, and metadata formatting.
 */

import type { Formatter } from "../../../shared/formatters";
import { formatDate } from "../../../shared/formatters";
import type {
  Space,
  SpaceLinks,
  SpacePermissions,
  SpaceSettings,
} from "../models";

/**
 * API Response interfaces for Space formatting
 */
export interface ApiSpaceResponse {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: "global" | "personal";
  status: "current" | "archived";
  createdAt: string;
  updatedAt: string;
  permissions: ApiSpacePermissionsResponse;
  settings: ApiSpaceSettingsResponse;
  links: ApiSpaceLinksResponse;
  homepage?: {
    id: string;
    title: string;
    webui: string;
  };
  icon?: {
    path: string;
    width: number;
    height: number;
    isDefault: boolean;
  };
}

export interface ApiSpacePermissionsResponse {
  canView: boolean;
  canEdit: boolean;
  canAdmin: boolean;
  canCreatePages: boolean;
  canDeletePages: boolean;
}

export interface ApiSpaceSettingsResponse {
  isPublic: boolean;
  allowAnonymousAccess: boolean;
  enableComments: boolean;
  enableAttachments: boolean;
}

export interface ApiSpaceLinksResponse {
  self: string;
  webui: string;
  editui?: string;
  context?: string;
}

/**
 * SpaceFormatter class that transforms Space domain objects to API response format
 *
 * Provides comprehensive formatting for all Space-related data including:
 * - Basic space information (id, key, name, description, etc.)
 * - Space permissions and settings
 * - Links and navigation
 * - Homepage and icon information
 */
export class SpaceFormatter implements Formatter<Space, ApiSpaceResponse> {
  /**
   * Formats a Space domain object into an API response format
   *
   * @param space - The Space domain object to format
   * @returns Formatted API response object
   */
  format(space: Space): ApiSpaceResponse {
    return {
      id: space.id,
      key: space.key.value,
      name: space.name.value,
      description: space.description,
      type: space.type,
      status: space.status,
      createdAt: formatDate(space.createdAt),
      updatedAt: formatDate(space.updatedAt),
      permissions: this.formatPermissions(space.permissions),
      settings: this.formatSettings(space.settings),
      links: this.formatLinks(space.links),
      homepage: space.homepage
        ? {
            id: space.homepage.id,
            title: space.homepage.title,
            webui: space.homepage.webui,
          }
        : undefined,
      icon: space.icon
        ? {
            path: space.icon.path,
            width: space.icon.width,
            height: space.icon.height,
            isDefault: space.icon.isDefault,
          }
        : undefined,
    };
  }

  /**
   * Formats a SpacePermissions object to API response format
   *
   * @param permissions - SpacePermissions object to format
   * @returns Formatted permissions response
   */
  private formatPermissions(
    permissions: SpacePermissions,
  ): ApiSpacePermissionsResponse {
    return {
      canView: permissions.canView,
      canEdit: permissions.canEdit,
      canAdmin: permissions.canAdmin,
      canCreatePages: permissions.canCreatePages,
      canDeletePages: permissions.canDeletePages,
    };
  }

  /**
   * Formats a SpaceSettings object to API response format
   *
   * @param settings - SpaceSettings object to format
   * @returns Formatted settings response
   */
  private formatSettings(settings: SpaceSettings): ApiSpaceSettingsResponse {
    return {
      isPublic: settings.isPublic,
      allowAnonymousAccess: settings.allowAnonymousAccess,
      enableComments: settings.enableComments,
      enableAttachments: settings.enableAttachments,
    };
  }

  /**
   * Formats a SpaceLinks object to API response format
   *
   * @param links - SpaceLinks object to format
   * @returns Formatted links response
   */
  private formatLinks(links: SpaceLinks): ApiSpaceLinksResponse {
    return {
      self: links.self,
      webui: links.webui,
      editui: links.editui,
      context: links.context,
    };
  }
}
