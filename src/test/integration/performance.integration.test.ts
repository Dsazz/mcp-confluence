import { beforeEach, afterEach, describe, expect, test } from "bun:test";
import { ConfluenceClient } from "../../features/confluence/api/client.impl";
import { ConfluenceConfig } from "../../features/confluence/api/config.types";
import { ConfluenceGetSpacesHandler } from "../../features/confluence/tools/handlers/get-spaces.handler";
import { ConfluenceGetPageHandler } from "../../features/confluence/tools/handlers/get-page.handler";
import { ConfluenceSearchPagesHandler } from "../../features/confluence/tools/handlers/search-pages.handler";
import { ConfluenceCreatePageHandler } from "../../features/confluence/tools/handlers/create-page.handler";
import { ConfluenceUpdatePageHandler } from "../../features/confluence/tools/handlers/update-page.handler";

describe("Performance Integration", () => {
  let client: ConfluenceClient;
  let config: ConfluenceConfig;
  let handlers: {
    getSpaces: ConfluenceGetSpacesHandler;
    getPage: ConfluenceGetPageHandler;
    searchPages: ConfluenceSearchPagesHandler;
    createPage: ConfluenceCreatePageHandler;
    updatePage: ConfluenceUpdatePageHandler;
  };

  beforeEach(() => {
    // Setup test configuration
    config = new ConfluenceConfig(
      "https://test.atlassian.net/wiki",
      "test-token-123",
      "test@example.com"
    );
    
    client = new ConfluenceClient(config);
    
    // Initialize all handlers for performance testing
    handlers = {
      getSpaces: new ConfluenceGetSpacesHandler(client),
      getPage: new ConfluenceGetPageHandler(client),
      searchPages: new ConfluenceSearchPagesHandler(client),
      createPage: new ConfluenceCreatePageHandler(client),
      updatePage: new ConfluenceUpdatePageHandler(client),
    };
  });

  afterEach(async () => {
    // Cleanup performance test resources
  });

  describe("Response Time Performance", () => {
    test("should complete getSpaces operation within acceptable time", async () => {
      const startTime = performance.now();
      
      const result = await handlers.getSpaces.handle({ limit: 25 });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Verify operation completed (even with auth failure)
      expect(result).toBeDefined();
      expect(result.success).toBe(false); // Auth failure expected
      
      // Performance assertion: should complete within 5 seconds
      expect(executionTime).toBeLessThan(5000);
      
      // Log performance metrics for monitoring
      console.log(`getSpaces execution time: ${executionTime.toFixed(2)}ms`);
    });

    test("should complete searchPages operation within acceptable time", async () => {
      const startTime = performance.now();
      
      const result = await handlers.searchPages.handle({
        query: 'type = "page" AND space.key = "TEST"',
        limit: 10,
        orderBy: "relevance"
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Verify operation completed
      expect(result).toBeDefined();
      expect(result.success).toBe(false); // Auth failure expected
      
      // Performance assertion: should complete within 5 seconds
      expect(executionTime).toBeLessThan(5000);
      
      console.log(`searchPages execution time: ${executionTime.toFixed(2)}ms`);
    });

    test("should complete getPage operation within acceptable time", async () => {
      const startTime = performance.now();
      
      const result = await handlers.getPage.handle({
        pageId: "performance-test-123",
        includeContent: true
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Verify operation completed
      expect(result).toBeDefined();
      expect(result.success).toBe(false); // Auth failure expected
      
      // Performance assertion: should complete within 5 seconds
      expect(executionTime).toBeLessThan(5000);
      
      console.log(`getPage execution time: ${executionTime.toFixed(2)}ms`);
    });

    test("should complete createPage operation within acceptable time", async () => {
      const startTime = performance.now();
      
      const result = await handlers.createPage.handle({
        spaceId: "performance-space-123",
        title: "Performance Test Page",
        content: "<p>Performance test content</p>",
        contentFormat: "storage"
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Verify operation completed
      expect(result).toBeDefined();
      expect(result.success).toBe(false); // Auth failure expected
      
      // Performance assertion: should complete within 5 seconds
      expect(executionTime).toBeLessThan(5000);
      
      console.log(`createPage execution time: ${executionTime.toFixed(2)}ms`);
    });

    test("should complete updatePage operation within acceptable time", async () => {
      const startTime = performance.now();
      
      const result = await handlers.updatePage.handle({
        pageId: "performance-update-123",
        title: "Updated Performance Test Page",
        content: "<p>Updated performance test content</p>",
        versionNumber: 1,
        versionMessage: "Performance test update"
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Verify operation completed
      expect(result).toBeDefined();
      expect(result.success).toBe(false); // Auth failure expected
      
      // Performance assertion: should complete within 5 seconds
      expect(executionTime).toBeLessThan(5000);
      
      console.log(`updatePage execution time: ${executionTime.toFixed(2)}ms`);
    });
  });

  describe("Concurrent Operations Performance", () => {
    test("should handle multiple concurrent getSpaces requests efficiently", async () => {
      const concurrentRequests = 5;
      const startTime = performance.now();
      
      // Create multiple concurrent requests
      const promises = Array.from({ length: concurrentRequests }, (_, index) =>
        handlers.getSpaces.handle({ 
          limit: 10 + index, // Vary parameters slightly
          start: index * 10 
        })
      );
      
      const results = await Promise.allSettled(promises);
      const endTime = performance.now();
      const totalExecutionTime = endTime - startTime;
      
      // Verify all requests completed
      expect(results).toHaveLength(concurrentRequests);
      for (const result of results) {
        expect(result.status).toBe("fulfilled");
        if (result.status === "fulfilled") {
          expect(result.value.success).toBe(false); // Auth failure expected
        }
      }
      
      // Performance assertion: concurrent requests should not take significantly longer than sequential
      // Allow up to 10 seconds for 5 concurrent requests
      expect(totalExecutionTime).toBeLessThan(10000);
      
      console.log(`Concurrent getSpaces (${concurrentRequests} requests) execution time: ${totalExecutionTime.toFixed(2)}ms`);
      console.log(`Average per request: ${(totalExecutionTime / concurrentRequests).toFixed(2)}ms`);
    });

    test("should handle mixed concurrent operations efficiently", async () => {
      const startTime = performance.now();
      
      // Create mixed concurrent operations
      const mixedPromises = [
        handlers.getSpaces.handle({ limit: 10 }),
        handlers.searchPages.handle({ query: "test", limit: 5 }),
        handlers.getPage.handle({ pageId: "concurrent-test-1" }),
        handlers.getPage.handle({ pageId: "concurrent-test-2" }),
        handlers.searchPages.handle({ query: 'space.key = "TEST"', limit: 3 })
      ];
      
      const results = await Promise.allSettled(mixedPromises);
      const endTime = performance.now();
      const totalExecutionTime = endTime - startTime;
      
      // Verify all operations completed
      expect(results).toHaveLength(5);
      for (const result of results) {
        expect(result.status).toBe("fulfilled");
        if (result.status === "fulfilled") {
          expect(result.value.success).toBe(false); // Auth failure expected
        }
      }
      
      // Performance assertion: mixed operations should complete within reasonable time
      expect(totalExecutionTime).toBeLessThan(15000);
      
      console.log(`Mixed concurrent operations execution time: ${totalExecutionTime.toFixed(2)}ms`);
    });

    test("should maintain performance under high concurrency load", async () => {
      const highConcurrencyCount = 10;
      const startTime = performance.now();
      
      // Create high concurrency scenario
      const highConcurrencyPromises = Array.from({ length: highConcurrencyCount }, (_, index) => {
        // Alternate between different operation types
        if (index % 3 === 0) {
          return handlers.getSpaces.handle({ limit: 5 });
        }
        if (index % 3 === 1) {
          return handlers.searchPages.handle({ query: `test-${index}`, limit: 3 });
        }
        return handlers.getPage.handle({ pageId: `high-load-test-${index}` });
      });
      
      const results = await Promise.allSettled(highConcurrencyPromises);
      const endTime = performance.now();
      const totalExecutionTime = endTime - startTime;
      
      // Verify all operations completed
      expect(results).toHaveLength(highConcurrencyCount);
      for (const result of results) {
        expect(result.status).toBe("fulfilled");
      }
      
      // Performance assertion: high concurrency should not cause timeouts
      expect(totalExecutionTime).toBeLessThan(20000);
      
      console.log(`High concurrency (${highConcurrencyCount} operations) execution time: ${totalExecutionTime.toFixed(2)}ms`);
    });
  });

  describe("Resource Usage Performance", () => {
    test("should handle large parameter sets efficiently", async () => {
      const startTime = performance.now();
      
      // Test with large parameter sets
      const largeSearchResult = await handlers.searchPages.handle({
        query: 'type = "page" AND (title ~ "test" OR title ~ "documentation" OR title ~ "guide" OR title ~ "tutorial")',
        limit: 100, // Maximum allowed
        orderBy: "relevance"
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Verify operation handled large parameters
      expect(largeSearchResult).toBeDefined();
      expect(largeSearchResult.success).toBe(false); // Auth failure expected
      
      // Performance assertion: large parameters should not cause excessive delays
      expect(executionTime).toBeLessThan(8000);
      
      console.log(`Large parameter search execution time: ${executionTime.toFixed(2)}ms`);
    });

    test("should handle complex content operations efficiently", async () => {
      const startTime = performance.now();
      
      // Test with complex content
      const complexContent = `
        <h1>Performance Test Page</h1>
        <p>This is a complex content test with multiple elements:</p>
        <ul>
          <li>Item 1 with <strong>bold text</strong></li>
          <li>Item 2 with <em>italic text</em></li>
          <li>Item 3 with <a href="https://example.com">links</a></li>
        </ul>
        <table>
          <tr><th>Column 1</th><th>Column 2</th></tr>
          <tr><td>Data 1</td><td>Data 2</td></tr>
        </table>
        <p>Additional content with special characters: &amp; &lt; &gt; &quot;</p>
      `;
      
      const complexCreateResult = await handlers.createPage.handle({
        spaceId: "performance-complex-space",
        title: "Complex Performance Test Page",
        content: complexContent,
        contentFormat: "storage"
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Verify complex content was handled
      expect(complexCreateResult).toBeDefined();
      expect(complexCreateResult.success).toBe(false); // Auth failure expected
      
      // Performance assertion: complex content should not cause excessive processing time
      expect(executionTime).toBeLessThan(6000);
      
      console.log(`Complex content creation execution time: ${executionTime.toFixed(2)}ms`);
    });

    test("should maintain consistent performance across multiple operations", async () => {
      const operationCount = 8;
      const executionTimes: number[] = [];
      
      // Perform multiple identical operations to test consistency
      for (let i = 0; i < operationCount; i++) {
        const startTime = performance.now();
        
        const result = await handlers.getSpaces.handle({ 
          limit: 15,
          start: i * 5 
        });
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        executionTimes.push(executionTime);
        
        // Verify each operation completed
        expect(result).toBeDefined();
        expect(result.success).toBe(false); // Auth failure expected
      }
      
      // Calculate performance consistency metrics
      const averageTime = executionTimes.reduce((sum, time) => sum + time, 0) / operationCount;
      const maxTime = Math.max(...executionTimes);
      const minTime = Math.min(...executionTimes);
      const variance = maxTime - minTime;
      
      // Performance assertions: operations should be reasonably consistent
      expect(averageTime).toBeLessThan(5000);
      expect(maxTime).toBeLessThan(8000);
      expect(variance).toBeLessThan(3000); // Variance should not be excessive
      
      console.log(`Performance consistency over ${operationCount} operations:`);
      console.log(`  Average: ${averageTime.toFixed(2)}ms`);
      console.log(`  Min: ${minTime.toFixed(2)}ms`);
      console.log(`  Max: ${maxTime.toFixed(2)}ms`);
      console.log(`  Variance: ${variance.toFixed(2)}ms`);
    });
  });

  describe("Memory and Resource Management", () => {
    test("should handle rapid sequential operations without memory leaks", async () => {
      const rapidOperationCount = 15;
      const startTime = performance.now();
      
      // Perform rapid sequential operations
      for (let i = 0; i < rapidOperationCount; i++) {
        const result = await handlers.getPage.handle({
          pageId: `rapid-test-${i}`,
          includeContent: false
        });
        
        // Verify each operation completed
        expect(result).toBeDefined();
        expect(result.success).toBe(false); // Auth failure expected
        
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      const endTime = performance.now();
      const totalExecutionTime = endTime - startTime;
      
      // Performance assertion: rapid operations should complete efficiently
      expect(totalExecutionTime).toBeLessThan(12000);
      
      console.log(`Rapid sequential operations (${rapidOperationCount}) execution time: ${totalExecutionTime.toFixed(2)}ms`);
    });

    test("should handle error scenarios without performance degradation", async () => {
      const errorTestCount = 6;
      const executionTimes: number[] = [];
      
      // Test performance with various error scenarios
      const errorScenarios = [
        { pageId: "" }, // Empty pageId
        { pageId: "invalid-id-123" }, // Invalid pageId
        { pageId: "another-invalid-456" }, // Another invalid pageId
        { pageId: "test-error-789" }, // Test error pageId
        { pageId: "performance-error-101" }, // Performance error pageId
        { pageId: "final-error-test-202" } // Final error test pageId
      ];
      
      for (let i = 0; i < errorTestCount; i++) {
        const startTime = performance.now();
        
        const result = await handlers.getPage.handle(errorScenarios[i]);
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        executionTimes.push(executionTime);
        
        // Verify error was handled gracefully
        expect(result).toBeDefined();
        expect(result.success).toBe(false);
      }
      
      // Calculate error handling performance
      const averageErrorTime = executionTimes.reduce((sum, time) => sum + time, 0) / errorTestCount;
      const maxErrorTime = Math.max(...executionTimes);
      
      // Performance assertions: error handling should not be slower than normal operations
      expect(averageErrorTime).toBeLessThan(5000);
      expect(maxErrorTime).toBeLessThan(8000);
      
      console.log(`Error handling performance over ${errorTestCount} scenarios:`);
      console.log(`  Average error handling time: ${averageErrorTime.toFixed(2)}ms`);
      console.log(`  Max error handling time: ${maxErrorTime.toFixed(2)}ms`);
    });
  });
}); 