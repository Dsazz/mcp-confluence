// Test Utilities and Helpers for Confluence MCP Server Testing

import type { Page, Space } from "@features/confluence/api/models.types";
import type { ToolErrorResponse } from "@features/confluence/api/responses.types";

// Test assertion helpers
export namespace TestAssertions {
  export function isValidPage(page: unknown): page is Page {
    if (typeof page !== "object" || page === null) return false;
    const p = page as Record<string, unknown>;

    return (
      typeof p.id === "string" &&
      typeof p.title === "string" &&
      typeof p.spaceId === "string" &&
      typeof p.authorId === "string" &&
      typeof p.createdAt === "string" &&
      (p.type === "page" || p.type === "blogpost") &&
      (p.status === "current" ||
        p.status === "trashed" ||
        p.status === "deleted" ||
        p.status === "draft") &&
      typeof p.version === "object" &&
      p.version !== null &&
      typeof p._links === "object" &&
      p._links !== null
    );
  }

  export function isValidSpace(space: unknown): space is Space {
    if (typeof space !== "object" || space === null) return false;
    const s = space as Record<string, unknown>;

    return (
      typeof s.id === "string" &&
      typeof s.key === "string" &&
      typeof s.name === "string" &&
      typeof s.createdAt === "string" &&
      (s.type === "global" || s.type === "personal") &&
      (s.status === "current" || s.status === "archived") &&
      typeof s._links === "object" &&
      s._links !== null
    );
  }

  export function isValidErrorResponse(
    error: unknown,
  ): error is ToolErrorResponse {
    if (typeof error !== "object" || error === null) return false;
    const e = error as Record<string, unknown>;

    return (
      e.success === false &&
      typeof e.error === "object" &&
      e.error !== null &&
      typeof e.metadata === "object" &&
      e.metadata !== null
    );
  }

  export function hasRequiredFields<T extends Record<string, unknown>>(
    obj: T,
    fields: (keyof T)[],
  ): boolean {
    return fields.every(
      (field) => obj[field] !== undefined && obj[field] !== null,
    );
  }
}

function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return (
    date instanceof Date &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString() === dateString
  );
}

// Test data validation helpers
export namespace TestValidation {
  export function validatePageStructure(page: Page): string[] {
    const errors: string[] = [];

    if (!page.id || page.id.length === 0) {
      errors.push("Page ID is required and cannot be empty");
    }

    if (!page.title || page.title.length === 0) {
      errors.push("Page title is required and cannot be empty");
    }

    if (!page.spaceId || page.spaceId.length === 0) {
      errors.push("Page spaceId is required and cannot be empty");
    }

    if (!page.authorId || page.authorId.length === 0) {
      errors.push("Page authorId is required and cannot be empty");
    }

    if (!page.createdAt || !isValidISODate(page.createdAt)) {
      errors.push("Page createdAt must be a valid ISO date string");
    }

    if (
      !page.version ||
      typeof page.version.number !== "number" ||
      page.version.number < 1
    ) {
      errors.push("Page version number must be a positive integer");
    }

    if (!page._links || !page._links.webui || !page._links.self) {
      errors.push("Page must have valid _links with webui and self properties");
    }

    return errors;
  }

  export function validateSpaceStructure(space: Space): string[] {
    const errors: string[] = [];

    if (!space.id || space.id.length === 0) {
      errors.push("Space ID is required and cannot be empty");
    }

    if (!space.key || space.key.length === 0) {
      errors.push("Space key is required and cannot be empty");
    }

    if (!space.name || space.name.length === 0) {
      errors.push("Space name is required and cannot be empty");
    }

    if (!space.createdAt || !isValidISODate(space.createdAt)) {
      errors.push("Space createdAt must be a valid ISO date string");
    }

    if (!["global", "personal"].includes(space.type)) {
      errors.push("Space type must be 'global' or 'personal'");
    }

    if (!["current", "archived"].includes(space.status)) {
      errors.push("Space status must be 'current' or 'archived'");
    }

    if (!space._links || !space._links.webui || !space._links.self) {
      errors.push(
        "Space must have valid _links with webui and self properties",
      );
    }

    return errors;
  }
}

// Test scenario builders
export namespace TestScenarios {
  export function createPageScenarios() {
    return {
      validPage: {
        name: "Valid Page",
        description: "A complete, valid page with all required fields",
        data: {
          id: "test-page-123",
          type: "page" as const,
          status: "current" as const,
          title: "Test Page Title",
          spaceId: "TEST-SPACE",
          authorId: "test-user-123",
          createdAt: "2024-01-01T00:00:00.000Z",
          version: {
            number: 1,
            message: "Initial version",
            createdAt: "2024-01-01T00:00:00.000Z",
            authorId: "test-user-123",
          },
          _links: {
            webui: "/spaces/TEST-SPACE/pages/test-page-123",
            editui: "/spaces/TEST-SPACE/pages/test-page-123/edit",
            self: "/wiki/api/v2/pages/test-page-123",
          },
        },
      },
      pageWithContent: {
        name: "Page with Content",
        description: "A page with body content in storage format",
        data: {
          body: {
            storage: {
              value: "<p>This is test content</p>",
              representation: "storage" as const,
            },
          },
        },
      },
      draftPage: {
        name: "Draft Page",
        description: "A page in draft status",
        data: {
          status: "draft" as const,
          title: "Draft Page Title",
        },
      },
    };
  }

  export function createSpaceScenarios() {
    return {
      globalSpace: {
        name: "Global Space",
        description: "A standard global space",
        data: {
          id: "test-space-123",
          key: "TEST",
          name: "Test Space",
          type: "global" as const,
          status: "current" as const,
          createdAt: "2024-01-01T00:00:00.000Z",
          authorId: "test-user-123",
          _links: {
            webui: "/spaces/TEST",
            self: "/wiki/api/v2/spaces/test-space-123",
          },
        },
      },
      personalSpace: {
        name: "Personal Space",
        description: "A user's personal space",
        data: {
          type: "personal" as const,
          key: "~testuser",
          name: "Test User's Personal Space",
        },
      },
      archivedSpace: {
        name: "Archived Space",
        description: "An archived space",
        data: {
          status: "archived" as const,
          name: "Archived Test Space",
        },
      },
    };
  }

  export function createErrorScenarios() {
    return {
      notFound: {
        name: "Not Found Error",
        description: "Resource not found error",
        data: {
          success: false as const,
          error: {
            code: "NOT_FOUND",
            message: "Resource not found",
            details: "The requested resource could not be found",
            suggestions: ["Verify the resource ID", "Check permissions"],
          },
        },
      },
      permissionDenied: {
        name: "Permission Denied Error",
        description: "Access denied error",
        data: {
          success: false as const,
          error: {
            code: "PERMISSION_DENIED",
            message: "Permission denied",
            details: "You do not have permission to access this resource",
            suggestions: [
              "Contact your administrator",
              "Check your permissions",
            ],
          },
        },
      },
      validationError: {
        name: "Validation Error",
        description: "Request validation failed",
        data: {
          success: false as const,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: "One or more fields failed validation",
            suggestions: ["Check required fields", "Verify data formats"],
          },
        },
      },
    };
  }
}

// Test timing and performance helpers
export namespace TestTiming {
  export async function measureExecutionTime<T>(
    fn: () => Promise<T>,
  ): Promise<{ result: T; executionTime: number }> {
    const start = performance.now();
    const result = await fn();
    const executionTime = performance.now() - start;
    return { result, executionTime };
  }

  export function createTimeout(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  export async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs,
      ),
    );

    return Promise.race([promise, timeoutPromise]);
  }
}

// Test cleanup helpers
export namespace TestCleanup {
  const cleanupTasks: (() => void | Promise<void>)[] = [];

  export function addCleanupTask(task: () => void | Promise<void>): void {
    cleanupTasks.push(task);
  }

  export async function runCleanup(): Promise<void> {
    for (const task of cleanupTasks) {
      try {
        await task();
      } catch (error) {
        console.warn("Cleanup task failed:", error);
      }
    }
    cleanupTasks.length = 0;
  }

  export function clearCleanupTasks(): void {
    cleanupTasks.length = 0;
  }
}
