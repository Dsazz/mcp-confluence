/**
 * Operation types supported by the Confluence API
 */
export type ConfluenceOperation =
  | "search"
  | "getSpaces"
  | "getPage"
  | "createPage"
  | "updatePage"
  | "getPageComments"
  | "deletePage"
  | "getSpace"
  | "createSpace"
  | "updateSpace";

/**
 * API version mapping for different operations
 */
export interface OperationVersionMap {
  [key: string]: "v1" | "v2";
}

/**
 * Default operation to API version mapping
 * v1 API: Search operations (CQL support)
 * v2 API: CRUD operations (spaces, pages, comments)
 */
const DEFAULT_OPERATION_VERSION_MAP: OperationVersionMap = {
  // v1 API operations (legacy REST API with CQL support)
  search: "v1",

  // v2 API operations (modern REST API)
  getSpaces: "v2",
  getPage: "v2",
  createPage: "v2",
  updatePage: "v2",
  getPageComments: "v2",
  deletePage: "v2",
  getSpace: "v2",
  createSpace: "v2",
  updateSpace: "v2",
};

/**
 * Configuration for operation routing
 */
export interface OperationRouterConfig {
  /** Custom operation version mappings to override defaults */
  customMappings?: Partial<OperationVersionMap>;
  /** Fallback API version when operation is not mapped */
  fallbackVersion?: "v1" | "v2";
}

/**
 * Router for determining which API version to use for specific operations
 */
export class ConfluenceOperationRouter {
  private readonly operationMap: OperationVersionMap;
  private readonly fallbackVersion: "v1" | "v2";

  constructor(config: OperationRouterConfig = {}) {
    this.operationMap = { ...DEFAULT_OPERATION_VERSION_MAP };

    // Apply custom mappings if provided
    if (config.customMappings) {
      for (const [operation, version] of Object.entries(
        config.customMappings,
      )) {
        if (version) {
          this.operationMap[operation] = version;
        }
      }
    }

    this.fallbackVersion = config.fallbackVersion || "v2";
  }

  /**
   * Get the API version for a specific operation
   * @param operation - The operation to route
   * @returns The API version to use for this operation
   */
  getVersionForOperation(operation: ConfluenceOperation): "v1" | "v2" {
    return this.operationMap[operation] || this.fallbackVersion;
  }

  /**
   * Check if an operation should use v1 API
   * @param operation - The operation to check
   * @returns true if operation should use v1 API
   */
  isV1Operation(operation: ConfluenceOperation): boolean {
    return this.getVersionForOperation(operation) === "v1";
  }

  /**
   * Check if an operation should use v2 API
   * @param operation - The operation to check
   * @returns true if operation should use v2 API
   */
  isV2Operation(operation: ConfluenceOperation): boolean {
    return this.getVersionForOperation(operation) === "v2";
  }

  /**
   * Get all operations mapped to a specific API version
   * @param version - The API version to filter by
   * @returns Array of operations using the specified version
   */
  getOperationsForVersion(version: "v1" | "v2"): ConfluenceOperation[] {
    return Object.entries(this.operationMap)
      .filter(([, mappedVersion]) => mappedVersion === version)
      .map(([operation]) => operation as ConfluenceOperation);
  }

  /**
   * Get the current operation mapping configuration
   * @returns The complete operation to version mapping
   */
  getOperationMap(): OperationVersionMap {
    return { ...this.operationMap };
  }

  /**
   * Update the mapping for a specific operation
   * @param operation - The operation to update
   * @param version - The API version to map to
   */
  setOperationVersion(
    operation: ConfluenceOperation,
    version: "v1" | "v2",
  ): void {
    this.operationMap[operation] = version;
  }

  /**
   * Reset operation mappings to defaults
   */
  resetToDefaults(): void {
    Object.assign(this.operationMap, DEFAULT_OPERATION_VERSION_MAP);
  }

  /**
   * Get statistics about operation distribution across API versions
   * @returns Object with counts for each API version
   */
  getVersionDistribution(): { v1: number; v2: number } {
    const distribution = { v1: 0, v2: 0 };

    for (const version of Object.values(this.operationMap)) {
      distribution[version]++;
    }

    return distribution;
  }
}

/**
 * Default operation router instance with standard mappings
 */
export const defaultOperationRouter = new ConfluenceOperationRouter();
