import type { SpaceKey, SpaceName } from "./space-value-objects.model";

/**
 * Domain Models
 */
export interface SpacePermissions {
  canView: boolean;
  canEdit: boolean;
  canAdmin: boolean;
  canCreatePages: boolean;
  canDeletePages: boolean;
}

export interface SpaceSettings {
  isPublic: boolean;
  allowAnonymousAccess: boolean;
  enableComments: boolean;
  enableAttachments: boolean;
}

export interface SpaceLinks {
  self: string;
  webui: string;
  editui?: string;
  context?: string;
}

export interface Space {
  id: string;
  key: SpaceKey;
  name: SpaceName;
  description?: string;
  type: "global" | "personal";
  status: "current" | "archived";
  createdAt: Date;
  updatedAt: Date;
  permissions: SpacePermissions;
  settings: SpaceSettings;
  links: SpaceLinks;
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

/**
 * Supporting Types
 */
export interface PaginationInfo {
  start: number;
  limit: number;
  size: number;
  hasMore: boolean;
  total?: number;
}

export interface SpaceSummary {
  total: number;
  globalSpaces: number;
  personalSpaces: number;
  archivedSpaces: number;
}
