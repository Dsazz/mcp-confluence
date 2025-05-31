import { describe, test, expect, beforeEach } from "bun:test";
import { ConfluenceHttpClientFactory, createV1Client, createV2Client, createConfluenceHttpClient } from "../../../../../features/confluence/api/http-client.factory";
import { ConfluenceConfig } from "../../../../../features/confluence/api/config.types";
import { ConfluenceHttpClientV1 } from "../../../../../features/confluence/api/http-client-v1.impl";
import { ConfluenceHttpClientV2 } from "../../../../../features/confluence/api/http-client-v2.impl";

describe("ConfluenceHttpClientFactory", () => {
  let factory: ConfluenceHttpClientFactory;
  let mockConfig: ConfluenceConfig;

  beforeEach(() => {
    mockConfig = new ConfluenceConfig(
      "https://test.atlassian.net",
      "test-api-token",
      "test@example.com"
    );
    factory = new ConfluenceHttpClientFactory(mockConfig);
  });

  describe("Constructor", () => {
    test("should create factory with valid configuration", () => {
      expect(factory).toBeInstanceOf(ConfluenceHttpClientFactory);
    });

    test("should store configuration for later use", () => {
      const config = factory.getConfig();
      expect(config).toBe(mockConfig);
      expect(config.hostUrl).toBe("https://test.atlassian.net");
      expect(config.apiToken).toBe("test-api-token");
      expect(config.userEmail).toBe("test@example.com");
    });
  });

  describe("createClient", () => {
    test("should create v1 client when requested", () => {
      const client = factory.createClient({ apiVersion: "v1" });
      expect(client).toBeInstanceOf(ConfluenceHttpClientV1);
    });

    test("should create v2 client when requested", () => {
      const client = factory.createClient({ apiVersion: "v2" });
      expect(client).toBeInstanceOf(ConfluenceHttpClientV2);
    });

    test("should throw error for unsupported API version", () => {
      expect(() => {
        factory.createClient({ apiVersion: "v3" as "v1" | "v2" });
      }).toThrow("Unsupported API version: v3");
    });

    test("should create different instances for multiple calls", () => {
      const client1 = factory.createClient({ apiVersion: "v1" });
      const client2 = factory.createClient({ apiVersion: "v1" });
      expect(client1).not.toBe(client2);
      expect(client1).toBeInstanceOf(ConfluenceHttpClientV1);
      expect(client2).toBeInstanceOf(ConfluenceHttpClientV1);
    });
  });

  describe("createV1Client", () => {
    test("should create v1 client instance", () => {
      const client = factory.createV1Client();
      expect(client).toBeInstanceOf(ConfluenceHttpClientV1);
    });

    test("should create different instances for multiple calls", () => {
      const client1 = factory.createV1Client();
      const client2 = factory.createV1Client();
      expect(client1).not.toBe(client2);
    });
  });

  describe("createV2Client", () => {
    test("should create v2 client instance", () => {
      const client = factory.createV2Client();
      expect(client).toBeInstanceOf(ConfluenceHttpClientV2);
    });

    test("should create different instances for multiple calls", () => {
      const client1 = factory.createV2Client();
      const client2 = factory.createV2Client();
      expect(client1).not.toBe(client2);
    });
  });

  describe("getConfig", () => {
    test("should return the factory configuration", () => {
      const config = factory.getConfig();
      expect(config).toBe(mockConfig);
    });

    test("should return same configuration instance", () => {
      const config1 = factory.getConfig();
      const config2 = factory.getConfig();
      expect(config1).toBe(config2);
    });
  });
});

describe("Convenience Functions", () => {
  let mockConfig: ConfluenceConfig;

  beforeEach(() => {
    mockConfig = new ConfluenceConfig(
      "https://test.atlassian.net",
      "test-api-token",
      "test@example.com"
    );
  });

  describe("createV1Client", () => {
    test("should create v1 client with configuration", () => {
      const client = createV1Client(mockConfig);
      expect(client).toBeInstanceOf(ConfluenceHttpClientV1);
    });

    test("should create different instances for multiple calls", () => {
      const client1 = createV1Client(mockConfig);
      const client2 = createV1Client(mockConfig);
      expect(client1).not.toBe(client2);
    });
  });

  describe("createV2Client", () => {
    test("should create v2 client with configuration", () => {
      const client = createV2Client(mockConfig);
      expect(client).toBeInstanceOf(ConfluenceHttpClientV2);
    });

    test("should create different instances for multiple calls", () => {
      const client1 = createV2Client(mockConfig);
      const client2 = createV2Client(mockConfig);
      expect(client1).not.toBe(client2);
    });
  });

  describe("createConfluenceHttpClient", () => {
    test("should create v1 client when requested", () => {
      const client = createConfluenceHttpClient(mockConfig, { apiVersion: "v1" });
      expect(client).toBeInstanceOf(ConfluenceHttpClientV1);
    });

    test("should create v2 client when requested", () => {
      const client = createConfluenceHttpClient(mockConfig, { apiVersion: "v2" });
      expect(client).toBeInstanceOf(ConfluenceHttpClientV2);
    });

    test("should throw error for unsupported API version", () => {
      expect(() => {
        createConfluenceHttpClient(mockConfig, { apiVersion: "v3" as "v1" | "v2" });
      }).toThrow("Unsupported API version: v3");
    });

    test("should use factory internally", () => {
      const client1 = createConfluenceHttpClient(mockConfig, { apiVersion: "v1" });
      const client2 = createConfluenceHttpClient(mockConfig, { apiVersion: "v1" });
      expect(client1).not.toBe(client2);
      expect(client1).toBeInstanceOf(ConfluenceHttpClientV1);
      expect(client2).toBeInstanceOf(ConfluenceHttpClientV1);
    });
  });
});

describe("Factory Pattern Validation", () => {
  test("should maintain proper dependency injection pattern", () => {
    const config1 = new ConfluenceConfig("https://test1.com", "token1", "user1@test.com");
    const config2 = new ConfluenceConfig("https://test2.com", "token2", "user2@test.com");

    const factory1 = new ConfluenceHttpClientFactory(config1);
    const factory2 = new ConfluenceHttpClientFactory(config2);

    expect(factory1.getConfig()).toBe(config1);
    expect(factory2.getConfig()).toBe(config2);
    expect(factory1.getConfig()).not.toBe(factory2.getConfig());
  });

  test("should not maintain global state", () => {
    const config = new ConfluenceConfig("https://test.com", "token", "user@test.com");
    
    const factory1 = new ConfluenceHttpClientFactory(config);
    const factory2 = new ConfluenceHttpClientFactory(config);

    // Different factory instances
    expect(factory1).not.toBe(factory2);
    
    // But same config reference
    expect(factory1.getConfig()).toBe(factory2.getConfig());
  });
});
