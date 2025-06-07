import { describe, expect, test } from "bun:test";
import {
  PageContent,
  PageId,
  PageTitle,
} from "@features/confluence/domains/pages/models";
import {
  InvalidPageContentError,
  InvalidPageIdError,
  InvalidPageTitleError,
} from "@features/confluence/shared/validators";

describe("Page Value Objects", () => {
  describe("PageId", () => {
    describe("constructor", () => {
      test("should create valid page ID", () => {
        const pageId = new PageId("123456");
        expect(pageId.value).toBe("123456");
      });

      test("should accept various valid IDs", () => {
        const validIds = [
          "1",
          "123",
          "abc123",
          "page-id-123",
          "PAGE_ID_123",
          "uuid-like-id-12345",
          "confluence-page-id",
          "123456789",
          " ", // whitespace only (schema allows)
          "  ", // multiple whitespace (schema allows)
          "\t", // tab (schema allows)
          "\n", // newline (schema allows)
        ];

        for (const id of validIds) {
          const pageId = new PageId(id);
          expect(pageId.value).toBe(id);
        }
      });

      test("should reject invalid page IDs", () => {
        const invalidIds = [
          "", // empty string only
        ];

        for (const id of invalidIds) {
          expect(() => new PageId(id)).toThrow(InvalidPageIdError);
        }
      });

      test("should provide meaningful error messages", () => {
        expect(() => new PageId("")).toThrow(
          "Invalid page ID: . Must be a non-empty string.",
        );
      });
    });

    describe("methods", () => {
      test("should return correct value", () => {
        const pageId = new PageId("123456");
        expect(pageId.value).toBe("123456");
      });

      test("should convert to string", () => {
        const pageId = new PageId("123456");
        expect(pageId.toString()).toBe("123456");
        expect(String(pageId)).toBe("123456");
      });

      test("should compare equality correctly", () => {
        const pageId1 = new PageId("123456");
        const pageId2 = new PageId("123456");
        const pageId3 = new PageId("789012");

        expect(pageId1.equals(pageId2)).toBe(true);
        expect(pageId1.equals(pageId3)).toBe(false);
      });

      test("should create from string", () => {
        const pageId = PageId.fromString("123456");
        expect(pageId.value).toBe("123456");
        expect(pageId).toBeInstanceOf(PageId);
      });
    });

    describe("edge cases", () => {
      test("should handle numeric IDs", () => {
        const pageId = new PageId("123456789");
        expect(pageId.value).toBe("123456789");
      });

      test("should handle alphanumeric IDs", () => {
        const pageId = new PageId("abc123def");
        expect(pageId.value).toBe("abc123def");
      });

      test("should handle IDs with special characters", () => {
        const pageId = new PageId("page-id_123.test");
        expect(pageId.value).toBe("page-id_123.test");
      });

      test("should handle long IDs", () => {
        const longId = "a".repeat(100);
        const pageId = new PageId(longId);
        expect(pageId.value).toBe(longId);
      });

      test("should handle IDs with spaces in middle", () => {
        const pageId = new PageId("page id 123");
        expect(pageId.value).toBe("page id 123");
      });

      test("should handle whitespace-only IDs", () => {
        const whitespaceId = new PageId(" ");
        expect(whitespaceId.value).toBe(" ");
      });
    });
  });

  describe("PageTitle", () => {
    describe("constructor", () => {
      test("should create valid page title", () => {
        const pageTitle = new PageTitle("Test Page");
        expect(pageTitle.value).toBe("Test Page");
      });

      test("should accept various valid titles", () => {
        const validTitles = [
          "A",
          "Test",
          "Test Page",
          "My Project Documentation",
          "Page with Numbers 123",
          "Special Characters: !@#$%^&*()",
          "Unicode: 测试页面",
          "Emoji: 📄 Document",
          "Long Title with Multiple Words and Punctuation!",
          "Title with\nNewlines",
          "Title with\tTabs",
        ];

        for (const title of validTitles) {
          const pageTitle = new PageTitle(title);
          expect(pageTitle.value).toBe(title);
        }
      });

      test("should reject invalid page titles", () => {
        const invalidTitles = [
          "", // empty
          "a".repeat(501), // too long (501 characters)
        ];

        for (const title of invalidTitles) {
          expect(() => new PageTitle(title)).toThrow(InvalidPageTitleError);
        }
      });

      test("should provide meaningful error messages", () => {
        expect(() => new PageTitle("")).toThrow(
          "Invalid page title: . Must be 1-500 characters.",
        );

        const longTitle = "a".repeat(501);
        expect(() => new PageTitle(longTitle)).toThrow(
          `Invalid page title: ${longTitle}. Must be 1-500 characters.`,
        );
      });
    });

    describe("methods", () => {
      test("should return correct value", () => {
        const pageTitle = new PageTitle("Test Page");
        expect(pageTitle.value).toBe("Test Page");
      });

      test("should convert to string", () => {
        const pageTitle = new PageTitle("Test Page");
        expect(pageTitle.toString()).toBe("Test Page");
        expect(String(pageTitle)).toBe("Test Page");
      });

      test("should compare equality correctly", () => {
        const pageTitle1 = new PageTitle("Test Page");
        const pageTitle2 = new PageTitle("Test Page");
        const pageTitle3 = new PageTitle("Other Page");

        expect(pageTitle1.equals(pageTitle2)).toBe(true);
        expect(pageTitle1.equals(pageTitle3)).toBe(false);
      });

      test("should create from string", () => {
        const pageTitle = PageTitle.fromString("Test Page");
        expect(pageTitle.value).toBe("Test Page");
        expect(pageTitle).toBeInstanceOf(PageTitle);
      });
    });

    describe("edge cases", () => {
      test("should handle single character titles", () => {
        const pageTitle = new PageTitle("A");
        expect(pageTitle.value).toBe("A");
      });

      test("should handle maximum length titles", () => {
        const maxTitle = "a".repeat(500);
        const pageTitle = new PageTitle(maxTitle);
        expect(pageTitle.value).toBe(maxTitle);
        expect(pageTitle.value.length).toBe(500);
      });

      test("should handle titles with special characters", () => {
        const specialTitle = "Test Page: Development & Testing!";
        const pageTitle = new PageTitle(specialTitle);
        expect(pageTitle.value).toBe(specialTitle);
      });

      test("should handle titles with unicode characters", () => {
        const unicodeTitle = "测试页面 Test Page";
        const pageTitle = new PageTitle(unicodeTitle);
        expect(pageTitle.value).toBe(unicodeTitle);
      });

      test("should handle titles with emojis", () => {
        const emojiTitle = "📄 Project Documentation 🚀";
        const pageTitle = new PageTitle(emojiTitle);
        expect(pageTitle.value).toBe(emojiTitle);
      });

      test("should handle titles with leading/trailing whitespace", () => {
        const titleWithSpaces = " Test Page ";
        const pageTitle = new PageTitle(titleWithSpaces);
        expect(pageTitle.value).toBe(titleWithSpaces);
      });

      test("should handle titles with multiple spaces", () => {
        const titleWithMultipleSpaces = "Test    Page    Title";
        const pageTitle = new PageTitle(titleWithMultipleSpaces);
        expect(pageTitle.value).toBe(titleWithMultipleSpaces);
      });

      test("should handle titles with newlines and tabs", () => {
        const titleWithWhitespace = "Test\nPage\tTitle";
        const pageTitle = new PageTitle(titleWithWhitespace);
        expect(pageTitle.value).toBe(titleWithWhitespace);
      });
    });

    describe("boundary testing", () => {
      test("should accept exactly 500 characters", () => {
        const exactlyMaxTitle = "a".repeat(500);
        const pageTitle = new PageTitle(exactlyMaxTitle);
        expect(pageTitle.value).toBe(exactlyMaxTitle);
        expect(pageTitle.value.length).toBe(500);
      });

      test("should reject 501 characters", () => {
        const tooLongTitle = "a".repeat(501);
        expect(() => new PageTitle(tooLongTitle)).toThrow(
          InvalidPageTitleError,
        );
      });

      test("should accept exactly 1 character", () => {
        const minTitle = "a";
        const pageTitle = new PageTitle(minTitle);
        expect(pageTitle.value).toBe(minTitle);
        expect(pageTitle.value.length).toBe(1);
      });
    });
  });

  describe("PageContent", () => {
    describe("constructor", () => {
      test("should create valid page content with default format", () => {
        const pageContent = new PageContent("<p>Test content</p>");
        expect(pageContent.value).toBe("<p>Test content</p>");
        expect(pageContent.format).toBe("storage");
      });

      test("should create valid page content with specified format", () => {
        const pageContent = new PageContent('{"type":"doc"}', "editor");
        expect(pageContent.value).toBe('{"type":"doc"}');
        expect(pageContent.format).toBe("editor");
      });

      test("should accept various valid content", () => {
        const validContents = [
          "<p>HTML content</p>",
          '{"type":"doc","content":[]}',
          "h1. Wiki markup",
          "Plain text content",
          "Content with\nNewlines",
          "Content with\tTabs",
          "Unicode content: 测试内容",
          "Emoji content: 📄 Content",
          " ", // whitespace only (schema allows)
          "  ", // multiple whitespace (schema allows)
          "\t", // tab only (schema allows)
          "\n", // newline only (schema allows)
        ];

        for (const content of validContents) {
          const pageContent = new PageContent(content);
          expect(pageContent.value).toBe(content);
        }
      });

      test("should support all format types", () => {
        const content = "Test content";

        const storageContent = new PageContent(content, "storage");
        const editorContent = new PageContent(content, "editor");
        const wikiContent = new PageContent(content, "wiki");
        const atlasContent = new PageContent(content, "atlas_doc_format");

        expect(storageContent.format).toBe("storage");
        expect(editorContent.format).toBe("editor");
        expect(wikiContent.format).toBe("wiki");
        expect(atlasContent.format).toBe("atlas_doc_format");
      });

      test("should reject invalid page content", () => {
        const invalidContents = [
          "", // empty string only
        ];

        for (const content of invalidContents) {
          expect(() => new PageContent(content)).toThrow(
            InvalidPageContentError,
          );
        }
      });

      test("should provide meaningful error messages", () => {
        expect(() => new PageContent("")).toThrow(
          "Invalid page content: Content cannot be empty.",
        );
      });
    });

    describe("methods", () => {
      test("should return correct value and format", () => {
        const pageContent = new PageContent("<p>Test</p>", "storage");
        expect(pageContent.value).toBe("<p>Test</p>");
        expect(pageContent.format).toBe("storage");
      });

      test("should convert to string", () => {
        const pageContent = new PageContent("<p>Test</p>");
        expect(pageContent.toString()).toBe("<p>Test</p>");
        expect(String(pageContent)).toBe("<p>Test</p>");
      });

      test("should compare equality correctly", () => {
        const content1 = new PageContent("<p>Test</p>", "storage");
        const content2 = new PageContent("<p>Test</p>", "storage");
        const content3 = new PageContent("<p>Test</p>", "editor");
        const content4 = new PageContent("<p>Other</p>", "storage");

        expect(content1.equals(content2)).toBe(true);
        expect(content1.equals(content3)).toBe(false); // Different format
        expect(content1.equals(content4)).toBe(false); // Different content
      });

      test("should create from string with default format", () => {
        const pageContent = PageContent.fromString("<p>Test</p>");
        expect(pageContent.value).toBe("<p>Test</p>");
        expect(pageContent.format).toBe("storage");
        expect(pageContent).toBeInstanceOf(PageContent);
      });

      test("should create from string with specified format", () => {
        const pageContent = PageContent.fromString('{"type":"doc"}', "editor");
        expect(pageContent.value).toBe('{"type":"doc"}');
        expect(pageContent.format).toBe("editor");
        expect(pageContent).toBeInstanceOf(PageContent);
      });
    });

    describe("format handling", () => {
      test("should handle storage format content", () => {
        const content = new PageContent("<p>Storage content</p>", "storage");
        expect(content.format).toBe("storage");
        expect(content.value).toBe("<p>Storage content</p>");
      });

      test("should handle editor format content", () => {
        const content = new PageContent(
          '{"type":"doc","content":[]}',
          "editor",
        );
        expect(content.format).toBe("editor");
        expect(content.value).toBe('{"type":"doc","content":[]}');
      });

      test("should handle wiki format content", () => {
        const content = new PageContent("h1. Wiki Content", "wiki");
        expect(content.format).toBe("wiki");
        expect(content.value).toBe("h1. Wiki Content");
      });

      test("should handle atlas_doc_format content", () => {
        const content = new PageContent(
          '{"version":1,"type":"doc"}',
          "atlas_doc_format",
        );
        expect(content.format).toBe("atlas_doc_format");
        expect(content.value).toBe('{"version":1,"type":"doc"}');
      });
    });

    describe("edge cases", () => {
      test("should handle long content", () => {
        const longContent = "a".repeat(10000);
        const pageContent = new PageContent(longContent);
        expect(pageContent.value).toBe(longContent);
        expect(pageContent.value.length).toBe(10000);
      });

      test("should handle content with special characters", () => {
        const specialContent = "<p>Content with special chars: !@#$%^&*()</p>";
        const pageContent = new PageContent(specialContent);
        expect(pageContent.value).toBe(specialContent);
      });

      test("should handle content with unicode", () => {
        const unicodeContent = "<p>Unicode content: 测试内容 🚀</p>";
        const pageContent = new PageContent(unicodeContent);
        expect(pageContent.value).toBe(unicodeContent);
      });

      test("should handle content with newlines and tabs", () => {
        const contentWithWhitespace = "<p>Content\nwith\twhitespace</p>";
        const pageContent = new PageContent(contentWithWhitespace);
        expect(pageContent.value).toBe(contentWithWhitespace);
      });

      test("should handle JSON content", () => {
        const jsonContent =
          '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello"}]}]}';
        const pageContent = new PageContent(jsonContent, "editor");
        expect(pageContent.value).toBe(jsonContent);
        expect(pageContent.format).toBe("editor");
      });

      test("should handle whitespace-only content", () => {
        const whitespaceContent = new PageContent(" ");
        expect(whitespaceContent.value).toBe(" ");
      });
    });
  });

  describe("Value Object Patterns", () => {
    test("should be immutable", () => {
      const pageId = new PageId("123");
      const pageTitle = new PageTitle("Test Page");
      const pageContent = new PageContent("<p>Test</p>");

      // Value objects should not have setters
      expect(
        typeof (pageId as unknown as { setValue?: unknown }).setValue,
      ).toBe("undefined");
      expect(
        typeof (pageTitle as unknown as { setValue?: unknown }).setValue,
      ).toBe("undefined");
      expect(
        typeof (pageContent as unknown as { setValue?: unknown }).setValue,
      ).toBe("undefined");

      // Values should be readonly - the value should remain unchanged
      expect(pageId.value).toBe("123");
      expect(pageTitle.value).toBe("Test Page");
      expect(pageContent.value).toBe("<p>Test</p>");
    });

    test("should support value equality", () => {
      const pageId1 = new PageId("123");
      const pageId2 = new PageId("123");
      const pageTitle1 = new PageTitle("Test Page");
      const pageTitle2 = new PageTitle("Test Page");
      const pageContent1 = new PageContent("<p>Test</p>");
      const pageContent2 = new PageContent("<p>Test</p>");

      expect(pageId1.equals(pageId2)).toBe(true);
      expect(pageTitle1.equals(pageTitle2)).toBe(true);
      expect(pageContent1.equals(pageContent2)).toBe(true);
      expect(pageId1 === pageId2).toBe(false); // Different object references
      expect(pageTitle1 === pageTitle2).toBe(false); // Different object references
      expect(pageContent1 === pageContent2).toBe(false); // Different object references
    });

    test("should have consistent string representation", () => {
      const pageId = new PageId("123");
      const pageTitle = new PageTitle("Test Page");
      const pageContent = new PageContent("<p>Test</p>");

      expect(pageId.toString()).toBe(pageId.value);
      expect(pageTitle.toString()).toBe(pageTitle.value);
      expect(pageContent.toString()).toBe(pageContent.value);
      expect(String(pageId)).toBe(pageId.value);
      expect(String(pageTitle)).toBe(pageTitle.value);
      expect(String(pageContent)).toBe(pageContent.value);
    });

    test("should support factory methods", () => {
      const pageIdFromFactory = PageId.fromString("123");
      const pageTitleFromFactory = PageTitle.fromString("Test Page");
      const pageContentFromFactory = PageContent.fromString("<p>Test</p>");

      expect(pageIdFromFactory).toBeInstanceOf(PageId);
      expect(pageTitleFromFactory).toBeInstanceOf(PageTitle);
      expect(pageContentFromFactory).toBeInstanceOf(PageContent);
      expect(pageIdFromFactory.value).toBe("123");
      expect(pageTitleFromFactory.value).toBe("Test Page");
      expect(pageContentFromFactory.value).toBe("<p>Test</p>");
    });

    test("should handle format in equality for PageContent", () => {
      const content1 = new PageContent("<p>Test</p>", "storage");
      const content2 = new PageContent("<p>Test</p>", "storage");
      const content3 = new PageContent("<p>Test</p>", "editor");

      expect(content1.equals(content2)).toBe(true);
      expect(content1.equals(content3)).toBe(false);
    });
  });
});
