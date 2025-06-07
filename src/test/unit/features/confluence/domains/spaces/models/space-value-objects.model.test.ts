import { describe, expect, test } from "bun:test";
import {
  SpaceKey,
  SpaceName,
} from "@features/confluence/domains/spaces/models";
import {
  InvalidSpaceKeyError,
  InvalidSpaceNameError,
} from "@features/confluence/shared/validators";

describe("Space Value Objects", () => {
  describe("SpaceKey", () => {
    describe("constructor", () => {
      test("should create valid space key", () => {
        const spaceKey = new SpaceKey("TEST");
        expect(spaceKey.value).toBe("TEST");
      });

      test("should accept uppercase alphanumeric keys", () => {
        const validKeys = [
          "A",
          "AB",
          "ABC",
          "TEST",
          "SPACE1",
          "PROJECT2023",
          "DEV",
        ];

        for (const key of validKeys) {
          const spaceKey = new SpaceKey(key);
          expect(spaceKey.value).toBe(key);
        }
      });

      test("should reject invalid space keys", () => {
        const invalidKeys = [
          "", // empty
          "test", // lowercase
          "Test", // mixed case
          "1TEST", // starts with number
          "TEST-1", // contains hyphen
          "TEST_1", // contains underscore
          "TEST 1", // contains space
          "TEST!", // contains special character
          "test@", // contains @ symbol
        ];

        for (const key of invalidKeys) {
          expect(() => new SpaceKey(key)).toThrow(InvalidSpaceKeyError);
        }
      });

      test("should provide meaningful error messages", () => {
        expect(() => new SpaceKey("test")).toThrow(
          "Invalid space key: test. Must be uppercase alphanumeric starting with a letter.",
        );
        expect(() => new SpaceKey("1TEST")).toThrow(
          "Invalid space key: 1TEST. Must be uppercase alphanumeric starting with a letter.",
        );
        expect(() => new SpaceKey("TEST-1")).toThrow(
          "Invalid space key: TEST-1. Must be uppercase alphanumeric starting with a letter.",
        );
      });
    });

    describe("methods", () => {
      test("should return correct value", () => {
        const spaceKey = new SpaceKey("TEST");
        expect(spaceKey.value).toBe("TEST");
      });

      test("should convert to string", () => {
        const spaceKey = new SpaceKey("TEST");
        expect(spaceKey.toString()).toBe("TEST");
        expect(String(spaceKey)).toBe("TEST");
      });

      test("should compare equality correctly", () => {
        const spaceKey1 = new SpaceKey("TEST");
        const spaceKey2 = new SpaceKey("TEST");
        const spaceKey3 = new SpaceKey("OTHER");

        expect(spaceKey1.equals(spaceKey2)).toBe(true);
        expect(spaceKey1.equals(spaceKey3)).toBe(false);
      });

      test("should create from string", () => {
        const spaceKey = SpaceKey.fromString("TEST");
        expect(spaceKey.value).toBe("TEST");
        expect(spaceKey).toBeInstanceOf(SpaceKey);
      });
    });

    describe("edge cases", () => {
      test("should handle single character keys", () => {
        const spaceKey = new SpaceKey("A");
        expect(spaceKey.value).toBe("A");
      });

      test("should handle long keys", () => {
        const longKey = "VERYLONGSPACEKEYNAME";
        const spaceKey = new SpaceKey(longKey);
        expect(spaceKey.value).toBe(longKey);
      });

      test("should handle keys with numbers", () => {
        const spaceKey = new SpaceKey("PROJECT2023");
        expect(spaceKey.value).toBe("PROJECT2023");
      });

      test("should reject keys starting with numbers", () => {
        expect(() => new SpaceKey("2023PROJECT")).toThrow(InvalidSpaceKeyError);
      });

      test("should reject empty string", () => {
        expect(() => new SpaceKey("")).toThrow(InvalidSpaceKeyError);
      });

      test("should reject whitespace", () => {
        expect(() => new SpaceKey(" ")).toThrow(InvalidSpaceKeyError);
        expect(() => new SpaceKey("  ")).toThrow(InvalidSpaceKeyError);
        expect(() => new SpaceKey("\t")).toThrow(InvalidSpaceKeyError);
        expect(() => new SpaceKey("\n")).toThrow(InvalidSpaceKeyError);
      });
    });
  });

  describe("SpaceName", () => {
    describe("constructor", () => {
      test("should create valid space name", () => {
        const spaceName = new SpaceName("Test Space");
        expect(spaceName.value).toBe("Test Space");
      });

      test("should accept various valid names", () => {
        const validNames = [
          "A",
          "Test",
          "Test Space",
          "My Project Space",
          "Development Environment",
          "Project 2023",
          "Space with Numbers 123",
          "Special Characters: !@#$%^&*()",
          "Unicode: 测试空间",
          "Emoji: 🚀 Space",
        ];

        for (const name of validNames) {
          const spaceName = new SpaceName(name);
          expect(spaceName.value).toBe(name);
        }
      });

      test("should reject invalid space names", () => {
        const invalidNames = [
          "", // empty
          "a".repeat(201), // too long (201 characters)
        ];

        for (const name of invalidNames) {
          expect(() => new SpaceName(name)).toThrow(InvalidSpaceNameError);
        }
      });

      test("should provide meaningful error messages", () => {
        expect(() => new SpaceName("")).toThrow(
          "Invalid space name: . Must be 1-200 characters.",
        );

        const longName = "a".repeat(201);
        expect(() => new SpaceName(longName)).toThrow(
          `Invalid space name: ${longName}. Must be 1-200 characters.`,
        );
      });
    });

    describe("methods", () => {
      test("should return correct value", () => {
        const spaceName = new SpaceName("Test Space");
        expect(spaceName.value).toBe("Test Space");
      });

      test("should convert to string", () => {
        const spaceName = new SpaceName("Test Space");
        expect(spaceName.toString()).toBe("Test Space");
        expect(String(spaceName)).toBe("Test Space");
      });

      test("should compare equality correctly", () => {
        const spaceName1 = new SpaceName("Test Space");
        const spaceName2 = new SpaceName("Test Space");
        const spaceName3 = new SpaceName("Other Space");

        expect(spaceName1.equals(spaceName2)).toBe(true);
        expect(spaceName1.equals(spaceName3)).toBe(false);
      });

      test("should create from string", () => {
        const spaceName = SpaceName.fromString("Test Space");
        expect(spaceName.value).toBe("Test Space");
        expect(spaceName).toBeInstanceOf(SpaceName);
      });
    });

    describe("edge cases", () => {
      test("should handle single character names", () => {
        const spaceName = new SpaceName("A");
        expect(spaceName.value).toBe("A");
      });

      test("should handle maximum length names", () => {
        const maxName = "a".repeat(200);
        const spaceName = new SpaceName(maxName);
        expect(spaceName.value).toBe(maxName);
        expect(spaceName.value.length).toBe(200);
      });

      test("should handle names with special characters", () => {
        const specialName = "Test Space: Development & Testing!";
        const spaceName = new SpaceName(specialName);
        expect(spaceName.value).toBe(specialName);
      });

      test("should handle names with unicode characters", () => {
        const unicodeName = "测试空间 Test Space";
        const spaceName = new SpaceName(unicodeName);
        expect(spaceName.value).toBe(unicodeName);
      });

      test("should handle names with emojis", () => {
        const emojiName = "🚀 Project Space 🌟";
        const spaceName = new SpaceName(emojiName);
        expect(spaceName.value).toBe(emojiName);
      });

      test("should handle names with leading/trailing whitespace", () => {
        const nameWithSpaces = " Test Space ";
        const spaceName = new SpaceName(nameWithSpaces);
        expect(spaceName.value).toBe(nameWithSpaces);
      });

      test("should handle names with multiple spaces", () => {
        const nameWithMultipleSpaces = "Test    Space    Name";
        const spaceName = new SpaceName(nameWithMultipleSpaces);
        expect(spaceName.value).toBe(nameWithMultipleSpaces);
      });

      test("should handle names with newlines and tabs", () => {
        const nameWithWhitespace = "Test\nSpace\tName";
        const spaceName = new SpaceName(nameWithWhitespace);
        expect(spaceName.value).toBe(nameWithWhitespace);
      });
    });

    describe("boundary testing", () => {
      test("should accept exactly 200 characters", () => {
        const exactlyMaxName = "a".repeat(200);
        const spaceName = new SpaceName(exactlyMaxName);
        expect(spaceName.value).toBe(exactlyMaxName);
        expect(spaceName.value.length).toBe(200);
      });

      test("should reject 201 characters", () => {
        const tooLongName = "a".repeat(201);
        expect(() => new SpaceName(tooLongName)).toThrow(InvalidSpaceNameError);
      });

      test("should accept exactly 1 character", () => {
        const minName = "a";
        const spaceName = new SpaceName(minName);
        expect(spaceName.value).toBe(minName);
        expect(spaceName.value.length).toBe(1);
      });
    });
  });

  describe("Value Object Patterns", () => {
    test("should be immutable", () => {
      const spaceKey = new SpaceKey("TEST");
      const spaceName = new SpaceName("Test Space");

      // Value objects should not have setters
      expect(
        typeof (spaceKey as unknown as { setValue?: unknown }).setValue,
      ).toBe("undefined");
      expect(
        typeof (spaceName as unknown as { setValue?: unknown }).setValue,
      ).toBe("undefined");

      // Values should be readonly - the value should remain unchanged
      expect(spaceKey.value).toBe("TEST");
      expect(spaceName.value).toBe("Test Space");
    });

    test("should support value equality", () => {
      const spaceKey1 = new SpaceKey("TEST");
      const spaceKey2 = new SpaceKey("TEST");
      const spaceName1 = new SpaceName("Test Space");
      const spaceName2 = new SpaceName("Test Space");

      expect(spaceKey1.equals(spaceKey2)).toBe(true);
      expect(spaceName1.equals(spaceName2)).toBe(true);
      expect(spaceKey1 === spaceKey2).toBe(false); // Different object references
      expect(spaceName1 === spaceName2).toBe(false); // Different object references
    });

    test("should have consistent string representation", () => {
      const spaceKey = new SpaceKey("TEST");
      const spaceName = new SpaceName("Test Space");

      expect(spaceKey.toString()).toBe(spaceKey.value);
      expect(spaceName.toString()).toBe(spaceName.value);
      expect(String(spaceKey)).toBe(spaceKey.value);
      expect(String(spaceName)).toBe(spaceName.value);
    });

    test("should support factory methods", () => {
      const spaceKeyFromFactory = SpaceKey.fromString("TEST");
      const spaceNameFromFactory = SpaceName.fromString("Test Space");

      expect(spaceKeyFromFactory).toBeInstanceOf(SpaceKey);
      expect(spaceNameFromFactory).toBeInstanceOf(SpaceName);
      expect(spaceKeyFromFactory.value).toBe("TEST");
      expect(spaceNameFromFactory.value).toBe("Test Space");
    });
  });
});
