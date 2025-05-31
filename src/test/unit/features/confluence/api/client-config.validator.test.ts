import { describe, expect, test } from "bun:test";
import {
  isValidConfluenceConfig,
  validateConfluenceConfig,
} from "../../../../../features/confluence/api/client-config.validator";
import { ConfluenceConfig } from "../../../../../features/confluence/api/config.types";

describe("validateConfluenceConfig", () => {
  describe("Valid Configuration", () => {
    test("should validate correct configuration", () => {
      const config = new ConfluenceConfig(
        "https://test.atlassian.net",
        "test-api-token",
        "test@example.com",
      );

      expect(() => validateConfluenceConfig(config)).not.toThrow();
    });

    test("should validate configuration with different valid URLs", () => {
      const validUrls = [
        "https://company.atlassian.net",
        "https://subdomain.company.atlassian.net",
        "https://custom-domain.com",
        "http://localhost:8080",
      ];

      for (const url of validUrls) {
        const config = new ConfluenceConfig(url, "token", "user@test.com");
        expect(() => validateConfluenceConfig(config)).not.toThrow();
      }
    });

    test("should validate configuration with different valid emails", () => {
      const validEmails = [
        "user@example.com",
        "test.user@company.co.uk",
        "admin+test@domain.org",
        "user123@test-domain.com",
      ];

      for (const email of validEmails) {
        const config = new ConfluenceConfig("https://test.com", "token", email);
        expect(() => validateConfluenceConfig(config)).not.toThrow();
      }
    });
  });

  describe("Invalid Configuration", () => {
    test("should throw error for empty host URL", () => {
      const config = new ConfluenceConfig("", "token", "user@test.com");
      expect(() => validateConfluenceConfig(config)).toThrow(
        "Configuration validation failed: Confluence host URL is required",
      );
    });

    test("should throw error for empty API token", () => {
      const config = new ConfluenceConfig(
        "https://test.com",
        "",
        "user@test.com",
      );
      expect(() => validateConfluenceConfig(config)).toThrow(
        "Configuration validation failed: Confluence API token is required",
      );
    });

    test("should throw error for empty user email", () => {
      const config = new ConfluenceConfig("https://test.com", "token", "");
      expect(() => validateConfluenceConfig(config)).toThrow(
        "Configuration validation failed: User email is required for API token authentication",
      );
    });

    test("should throw error for multiple missing fields", () => {
      const config = new ConfluenceConfig("", "", "");
      expect(() => validateConfluenceConfig(config)).toThrow(
        "Configuration validation failed: Confluence host URL is required, Confluence API token is required, User email is required for API token authentication",
      );
    });

    test("should throw error for missing host URL and token", () => {
      const config = new ConfluenceConfig("", "", "user@test.com");
      expect(() => validateConfluenceConfig(config)).toThrow(
        "Configuration validation failed: Confluence host URL is required, Confluence API token is required",
      );
    });
  });

  describe("Edge Cases", () => {
    test("should accept URLs with trailing slashes", () => {
      const config = new ConfluenceConfig(
        "https://test.com/",
        "token",
        "user@test.com",
      );
      expect(() => validateConfluenceConfig(config)).not.toThrow();
    });

    test("should accept URLs with paths", () => {
      const config = new ConfluenceConfig(
        "https://test.com/confluence",
        "token",
        "user@test.com",
      );
      expect(() => validateConfluenceConfig(config)).not.toThrow();
    });

    test("should accept URLs with ports", () => {
      const config = new ConfluenceConfig(
        "https://test.com:8443",
        "token",
        "user@test.com",
      );
      expect(() => validateConfluenceConfig(config)).not.toThrow();
    });

    test("should accept very long but valid tokens", () => {
      const longToken = "a".repeat(1000);
      const config = new ConfluenceConfig(
        "https://test.com",
        longToken,
        "user@test.com",
      );
      expect(() => validateConfluenceConfig(config)).not.toThrow();
    });

    test("should accept emails with plus addressing", () => {
      const config = new ConfluenceConfig(
        "https://test.com",
        "token",
        "user+tag@test.com",
      );
      expect(() => validateConfluenceConfig(config)).not.toThrow();
    });

    test("should accept emails with dots in local part", () => {
      const config = new ConfluenceConfig(
        "https://test.com",
        "token",
        "first.last@test.com",
      );
      expect(() => validateConfluenceConfig(config)).not.toThrow();
    });

    test("should accept whitespace in values (no trimming)", () => {
      const config = new ConfluenceConfig(
        "  https://test.com  ",
        "  token  ",
        "  user@test.com  ",
      );
      expect(() => validateConfluenceConfig(config)).not.toThrow();
    });
  });
});

describe("isValidConfluenceConfig", () => {
  describe("Valid Configuration", () => {
    test("should return true for valid configuration", () => {
      const config = new ConfluenceConfig(
        "https://test.atlassian.net",
        "test-api-token",
        "test@example.com",
      );

      expect(isValidConfluenceConfig(config)).toBe(true);
    });

    test("should return true for configuration with all required fields", () => {
      const config = new ConfluenceConfig(
        "https://test.com",
        "token",
        "user@test.com",
      );
      expect(isValidConfluenceConfig(config)).toBe(true);
    });
  });

  describe("Invalid Configuration", () => {
    test("should return false for empty host URL", () => {
      const config = new ConfluenceConfig("", "token", "user@test.com");
      expect(isValidConfluenceConfig(config)).toBe(false);
    });

    test("should return false for empty API token", () => {
      const config = new ConfluenceConfig(
        "https://test.com",
        "",
        "user@test.com",
      );
      expect(isValidConfluenceConfig(config)).toBe(false);
    });

    test("should return false for empty user email", () => {
      const config = new ConfluenceConfig("https://test.com", "token", "");
      expect(isValidConfluenceConfig(config)).toBe(false);
    });

    test("should return false for multiple missing fields", () => {
      const config = new ConfluenceConfig("", "", "");
      expect(isValidConfluenceConfig(config)).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    test("should return true for whitespace values (no trimming)", () => {
      const config = new ConfluenceConfig(
        "  https://test.com  ",
        "  token  ",
        "  user@test.com  ",
      );
      expect(isValidConfluenceConfig(config)).toBe(true);
    });

    test("should return true for unusual but non-empty values", () => {
      const config = new ConfluenceConfig("not-a-url", "123", "not-an-email");
      expect(isValidConfluenceConfig(config)).toBe(true);
    });
  });
});
