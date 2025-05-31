// Test Configuration for Confluence MCP Server Testing

export interface TestConfig {
  timeout: {
    unit: number;
    integration: number;
    api: number;
  };
  confluence: {
    baseUrl: string;
    apiVersion: string;
    testSpaceKey: string;
    testUserId: string;
  };
  mock: {
    enableNetworkMocks: boolean;
    enableApiMocks: boolean;
    responseDelay: number;
  };
  coverage: {
    threshold: {
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    };
  };
}

export const defaultTestConfig: TestConfig = {
  timeout: {
    unit: 5000, // 5 seconds for unit tests
    integration: 15000, // 15 seconds for integration tests
    api: 30000, // 30 seconds for API tests
  },
  confluence: {
    baseUrl: "https://test.atlassian.net/wiki",
    apiVersion: "v2",
    testSpaceKey: "TEST",
    testUserId: "test-user-123",
  },
  mock: {
    enableNetworkMocks: true,
    enableApiMocks: true,
    responseDelay: 100, // 100ms simulated delay
  },
  coverage: {
    threshold: {
      statements: 90,
      branches: 80,
      functions: 90,
      lines: 90,
    },
  },
};

// Environment-specific configurations
export const testEnvironments = {
  unit: {
    ...defaultTestConfig,
    mock: {
      ...defaultTestConfig.mock,
      enableNetworkMocks: true,
      enableApiMocks: true,
      responseDelay: 0, // No delay for unit tests
    },
  },
  integration: {
    ...defaultTestConfig,
    mock: {
      ...defaultTestConfig.mock,
      enableNetworkMocks: true,
      enableApiMocks: false, // Use real API client but mock HTTP
      responseDelay: 50,
    },
  },
  e2e: {
    ...defaultTestConfig,
    mock: {
      ...defaultTestConfig.mock,
      enableNetworkMocks: false,
      enableApiMocks: false,
      responseDelay: 0,
    },
    timeout: {
      ...defaultTestConfig.timeout,
      unit: 10000,
      integration: 30000,
      api: 60000,
    },
  },
};

// Get configuration based on environment
export function getTestConfig(
  environment: keyof typeof testEnvironments = "unit",
): TestConfig {
  return testEnvironments[environment];
}

// Test data constants
export const TEST_CONSTANTS = {
  SPACE_IDS: {
    GLOBAL: "test-global-space",
    PERSONAL: "test-personal-space",
    ARCHIVED: "test-archived-space",
  },
  PAGE_IDS: {
    VALID: "test-page-123",
    DRAFT: "test-draft-page",
    WITH_CONTENT: "test-content-page",
    WITH_PARENT: "test-child-page",
  },
  USER_IDS: {
    AUTHOR: "test-author-123",
    VIEWER: "test-viewer-456",
    ADMIN: "test-admin-789",
  },
  SPACE_KEYS: {
    GLOBAL: "TEST",
    PERSONAL: "~testuser",
    TEAM: "TEAM",
  },
  API_ENDPOINTS: {
    SPACES: "/wiki/api/v2/spaces",
    PAGES: "/wiki/api/v2/pages",
    SEARCH: "/wiki/api/v2/search",
    COMMENTS: "/wiki/api/v2/comments",
  },
  ERROR_CODES: {
    NOT_FOUND: "NOT_FOUND",
    PERMISSION_DENIED: "PERMISSION_DENIED",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED",
    RATE_LIMITED: "RATE_LIMITED",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
    CONFLICT: "CONFLICT",
  },
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
  },
} as const;
