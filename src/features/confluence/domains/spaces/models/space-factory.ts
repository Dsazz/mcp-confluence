import { SpaceKey, SpaceName } from "./space-value-objects.model";
import type {
  Space,
  SpaceLinks,
  SpacePermissions,
  SpaceSettings,
  SpaceSummary,
} from "./space.model";

/**
 * Factory Functions
 */
export function createSpace(data: {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: "global" | "personal";
  status: "current" | "archived";
  createdAt: string | Date;
  updatedAt: string | Date;
  permissions: SpacePermissions;
  settings: SpaceSettings;
  links: SpaceLinks;
  homepage?: Space["homepage"];
  icon?: Space["icon"];
}): Space {
  return {
    id: data.id,
    key: SpaceKey.fromString(data.key),
    name: SpaceName.fromString(data.name),
    description: data.description,
    type: data.type,
    status: data.status,
    createdAt:
      typeof data.createdAt === "string"
        ? new Date(data.createdAt)
        : data.createdAt,
    updatedAt:
      typeof data.updatedAt === "string"
        ? new Date(data.updatedAt)
        : data.updatedAt,
    permissions: data.permissions,
    settings: data.settings,
    links: data.links,
    homepage: data.homepage,
    icon: data.icon,
  };
}

export function createSpaceSummary(spaces: Space[]): SpaceSummary {
  return {
    total: spaces.length,
    globalSpaces: spaces.filter((space) => space.type === "global").length,
    personalSpaces: spaces.filter((space) => space.type === "personal").length,
    archivedSpaces: spaces.filter((space) => space.status === "archived")
      .length,
  };
}
