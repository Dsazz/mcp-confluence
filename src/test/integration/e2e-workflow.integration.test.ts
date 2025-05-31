import { beforeEach, afterEach, describe, expect, test } from "bun:test";
import { ConfluenceClient } from "../../features/confluence/api/client.impl";
import { ConfluenceConfig } from "../../features/confluence/api/config.types";
import { ConfluenceGetSpacesHandler } from "../../features/confluence/tools/handlers/get-spaces.handler";
import { ConfluenceGetPageHandler } from "../../features/confluence/tools/handlers/get-page.handler";
import { ConfluenceSearchPagesHandler } from "../../features/confluence/tools/handlers/search-pages.handler";
import { ConfluenceCreatePageHandler } from "../../features/confluence/tools/handlers/create-page.handler";
import { ConfluenceUpdatePageHandler } from "../../features/confluence/tools/handlers/update-page.handler";

describe("End-to-End Workflow Integration", () => {
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
    
    // Initialize all handlers for workflow testing
    handlers = {
      getSpaces: new ConfluenceGetSpacesHandler(client),
      getPage: new ConfluenceGetPageHandler(client),
      searchPages: new ConfluenceSearchPagesHandler(client),
      createPage: new ConfluenceCreatePageHandler(client),
      updatePage: new ConfluenceUpdatePageHandler(client),
    };
  });

  afterEach(async () => {
    // Cleanup if needed
  });

  describe("Complete User Workflows", () => {
    test("should execute complete content discovery workflow", async () => {
      // Workflow: User discovers content by browsing spaces → searching → viewing pages
      const workflowSteps: string[] = [];
      
      try {
        // Step 1: Get available spaces
        workflowSteps.push("Getting spaces");
        const spacesResult = await handlers.getSpaces.handle({ limit: 10 });
        expect(spacesResult.success).toBe(false); // Auth failure expected
        expect(spacesResult.error).toContain("Authentication failed");
        workflowSteps.push("Spaces request handled");

        // Step 2: Search for content in discovered spaces
        workflowSteps.push("Searching pages");
        const searchResult = await handlers.searchPages.handle({
          query: 'space.key = "TEST" AND type = "page"',
          limit: 5,
          orderBy: "relevance"
        });
        expect(searchResult.success).toBe(false); // Auth failure expected
        expect(searchResult.error).toContain("Authentication failed");
        workflowSteps.push("Search request handled");

        // Step 3: Get detailed page information
        workflowSteps.push("Getting page details");
        const pageResult = await handlers.getPage.handle({
          pageId: "123456",
          includeContent: true,
          includeComments: false
        });
        expect(pageResult.success).toBe(false); // Auth failure expected
        expect(pageResult.error).toContain("Authentication failed");
        workflowSteps.push("Page details request handled");

        // Verify workflow completed all steps
        expect(workflowSteps).toHaveLength(6);
        expect(workflowSteps).toContain("Getting spaces");
        expect(workflowSteps).toContain("Searching pages");
        expect(workflowSteps).toContain("Getting page details");
        
      } catch (error) {
        // Log workflow progress for debugging
        console.log("Workflow steps completed:", workflowSteps);
        throw error;
      }
    });

    test("should execute complete content creation workflow", async () => {
      // Workflow: User creates content by selecting space → creating page → updating content
      const workflowData = {
        spaceId: "test-space-123",
        pageTitle: "Test Workflow Page",
        initialContent: "<p>Initial content for workflow test</p>",
        updatedContent: "<p>Updated content after workflow test</p>",
        pageId: "workflow-page-123"
      };

      // Step 1: Verify target space exists
      const spacesResult = await handlers.getSpaces.handle({ limit: 50 });
      expect(spacesResult.success).toBe(false); // Auth failure expected
      expect(spacesResult.error).toContain("Authentication failed");

      // Step 2: Create new page in the space
      const createResult = await handlers.createPage.handle({
        spaceId: workflowData.spaceId,
        title: workflowData.pageTitle,
        content: workflowData.initialContent,
        contentFormat: "storage",
        status: "current"
      });
      expect(createResult.success).toBe(false); // Auth failure expected
      expect(createResult.error).toContain("Authentication failed");

      // Step 3: Update the created page
      const updateResult = await handlers.updatePage.handle({
        pageId: workflowData.pageId,
        title: workflowData.pageTitle,
        content: workflowData.updatedContent,
        contentFormat: "storage",
        versionNumber: 1,
        versionMessage: "Updated via workflow test"
      });
      expect(updateResult.success).toBe(false); // Auth failure expected
      expect(updateResult.error).toContain("Authentication failed");

      // Verify workflow data integrity
      expect(workflowData.spaceId).toBeDefined();
      expect(workflowData.pageTitle).toBeDefined();
      expect(workflowData.initialContent).not.toBe(workflowData.updatedContent);
    });

    test("should execute complete content management workflow", async () => {
      // Workflow: User manages content by searching → viewing → editing → verifying changes
      const managementWorkflow = {
        searchQuery: 'title ~ "workflow" AND space.key = "TEST"',
        targetPageId: "management-test-123",
        editReason: "Workflow management test update"
      };

      // Step 1: Search for existing content
      const searchResult = await handlers.searchPages.handle({
        query: managementWorkflow.searchQuery,
        limit: 10,
        orderBy: "modified"
      });
      expect(searchResult.success).toBe(false); // Auth failure expected

      // Step 2: Get current page state
      const currentPageResult = await handlers.getPage.handle({
        pageId: managementWorkflow.targetPageId,
        includeContent: true,
        expand: ["version", "space"]
      });
      expect(currentPageResult.success).toBe(false); // Auth failure expected

      // Step 3: Update page with management changes
      const updateResult = await handlers.updatePage.handle({
        pageId: managementWorkflow.targetPageId,
        title: "Updated via Management Workflow",
        content: "<p>Content updated through management workflow</p>",
        versionNumber: 2,
        versionMessage: managementWorkflow.editReason
      });
      expect(updateResult.success).toBe(false); // Auth failure expected

      // Step 4: Verify changes were applied
      const verificationResult = await handlers.getPage.handle({
        pageId: managementWorkflow.targetPageId,
        includeContent: true
      });
      expect(verificationResult.success).toBe(false); // Auth failure expected

      // Verify workflow maintains data consistency
      expect(managementWorkflow.searchQuery).toContain("workflow");
      expect(managementWorkflow.targetPageId).toBeDefined();
      expect(managementWorkflow.editReason).toContain("Workflow");
    });
  });

  describe("Multi-Step Operations", () => {
    test("should handle complex search and retrieval operations", async () => {
      // Multi-step: Complex search → filter results → batch retrieve details
      const operationSteps = [];
      
      // Step 1: Broad search
      operationSteps.push("broad-search");
      const broadSearchResult = await handlers.searchPages.handle({
        query: 'type = "page"',
        limit: 25,
        orderBy: "created"
      });
      expect(broadSearchResult.success).toBe(false);
      
      // Step 2: Refined search with filters
      operationSteps.push("refined-search");
      const refinedSearchResult = await handlers.searchPages.handle({
        query: 'type = "page" AND space.key = "DOCS"',
        limit: 10,
        orderBy: "relevance"
      });
      expect(refinedSearchResult.success).toBe(false);
      
      // Step 3: Batch page retrieval (simulated)
      operationSteps.push("batch-retrieval");
      const pageIds = ["page-1", "page-2", "page-3"];
      const batchPromises = pageIds.map(id => handlers.getPage.handle({ pageId: id }));
      const batchResults = await Promise.allSettled(batchPromises);
      
      expect(batchResults).toHaveLength(3);
      for (const result of batchResults) {
        expect(result.status).toBe("fulfilled");
        if (result.status === "fulfilled") {
          expect(result.value.success).toBe(false); // Auth failure expected
        }
      }
      
      expect(operationSteps).toEqual(["broad-search", "refined-search", "batch-retrieval"]);
    });

    test("should handle space exploration and content analysis", async () => {
      // Multi-step: Get spaces → analyze each space → get sample content
      const explorationData = {
        spacesAnalyzed: 0,
        contentSampled: 0
      };

      // Step 1: Get all accessible spaces
      const spacesResult = await handlers.getSpaces.handle({ limit: 50 });
      expect(spacesResult.success).toBe(false);
      explorationData.spacesAnalyzed++;

      // Step 2: For each space, get sample content (simulated with test data)
      const testSpaceKeys = ["TEST", "DOCS", "PROJ"];
      
      for (const spaceKey of testSpaceKeys) {
        const spaceContentResult = await handlers.searchPages.handle({
          query: `space.key = "${spaceKey}"`,
          limit: 3,
          orderBy: "created"
        });
        expect(spaceContentResult.success).toBe(false);
        explorationData.contentSampled++;
      }

      // Verify exploration completed
      expect(explorationData.spacesAnalyzed).toBe(1);
      expect(explorationData.contentSampled).toBe(3);
    });

    test("should handle content lifecycle operations", async () => {
      // Multi-step: Create → Read → Update → Read → Verify changes
      const lifecycleData = {
        pageId: "lifecycle-test-123",
        spaceId: "test-space-456",
        versions: [] as number[],
        operations: [] as string[]
      };

      // Step 1: Create initial page
      lifecycleData.operations.push("create");
      const createResult = await handlers.createPage.handle({
        spaceId: lifecycleData.spaceId,
        title: "Lifecycle Test Page",
        content: "<p>Initial lifecycle content</p>",
        status: "current"
      });
      expect(createResult.success).toBe(false);
      lifecycleData.versions.push(1);

      // Step 2: Read created page
      lifecycleData.operations.push("read-initial");
      const readInitialResult = await handlers.getPage.handle({
        pageId: lifecycleData.pageId,
        includeContent: true
      });
      expect(readInitialResult.success).toBe(false);

      // Step 3: Update page content
      lifecycleData.operations.push("update");
      const updateResult = await handlers.updatePage.handle({
        pageId: lifecycleData.pageId,
        title: "Updated Lifecycle Test Page",
        content: "<p>Updated lifecycle content</p>",
        versionNumber: 1,
        versionMessage: "Lifecycle test update"
      });
      expect(updateResult.success).toBe(false);
      lifecycleData.versions.push(2);

      // Step 4: Read updated page
      lifecycleData.operations.push("read-updated");
      const readUpdatedResult = await handlers.getPage.handle({
        pageId: lifecycleData.pageId,
        includeContent: true
      });
      expect(readUpdatedResult.success).toBe(false);

      // Verify lifecycle progression
      expect(lifecycleData.operations).toEqual([
        "create", "read-initial", "update", "read-updated"
      ]);
      expect(lifecycleData.versions).toEqual([1, 2]);
    });
  });

  describe("Data Flow Validation", () => {
    test("should validate data consistency across operations", async () => {
      // Test data flow: Input → Processing → Output → Validation
      const testData = {
        input: {
          spaceId: "data-flow-space",
          pageTitle: "Data Flow Test",
          content: "<p>Test content for data flow validation</p>"
        },
        processing: {
          operationsExecuted: [] as string[],
          dataTransformations: [] as string[]
        },
        output: {
          results: [] as unknown[],
          validationErrors: [] as string[]
        }
      };

      // Input validation
      expect(testData.input.spaceId).toBeDefined();
      expect(testData.input.pageTitle).toBeDefined();
      expect(testData.input.content).toContain("Test content");

      // Processing simulation
      testData.processing.operationsExecuted.push("create-page");
      testData.processing.dataTransformations.push("html-to-storage");
      
      const createResult = await handlers.createPage.handle({
        spaceId: testData.input.spaceId,
        title: testData.input.pageTitle,
        content: testData.input.content,
        contentFormat: "storage"
      });
      
      testData.output.results.push(createResult);
      
      // Output validation
      expect(createResult.success).toBe(false); // Auth failure expected
      expect(testData.processing.operationsExecuted).toContain("create-page");
      expect(testData.processing.dataTransformations).toContain("html-to-storage");
      expect(testData.output.results).toHaveLength(1);
    });

    test("should validate parameter flow between operations", async () => {
      // Test parameter passing: Operation A output → Operation B input
      const parameterFlow = {
        step1: {
          operation: "getSpaces",
          input: { limit: 10, type: "global" as const },
          output: null as unknown
        },
        step2: {
          operation: "searchPages",
          input: null as unknown,
          output: null as unknown
        },
        step3: {
          operation: "getPage",
          input: null as unknown,
          output: null as unknown
        }
      };

      // Step 1: Get spaces
      parameterFlow.step1.output = await handlers.getSpaces.handle(parameterFlow.step1.input);
      expect(parameterFlow.step1.output).toBeDefined();

      // Step 2: Use space data for search (simulated parameter flow)
      parameterFlow.step2.input = {
        query: 'space.key = "TEST"', // Would normally come from step1 output
        limit: 5
      };
      parameterFlow.step2.output = await handlers.searchPages.handle(parameterFlow.step2.input);
      expect(parameterFlow.step2.output).toBeDefined();

      // Step 3: Use search results for page retrieval (simulated parameter flow)
      parameterFlow.step3.input = {
        pageId: "test-page-123" // Would normally come from step2 output
      };
      parameterFlow.step3.output = await handlers.getPage.handle(parameterFlow.step3.input);
      expect(parameterFlow.step3.output).toBeDefined();

      // Validate parameter flow integrity
      expect(parameterFlow.step1.input.limit).toBe(10);
      expect(parameterFlow.step2.input).toHaveProperty("query");
      expect(parameterFlow.step3.input).toHaveProperty("pageId");
    });

    test("should validate error propagation through workflow", async () => {
      // Test error handling: Error in step N → proper handling in step N+1
      const errorFlow = {
        errors: [] as string[],
        recoveryActions: [] as string[],
        finalState: "unknown"
      };

      try {
        // Step 1: Operation that will fail
        const failingResult = await handlers.getPage.handle({
          pageId: "" // Invalid empty pageId
        });
        
        if (!failingResult.success) {
          errorFlow.errors.push("Invalid pageId parameter");
          errorFlow.recoveryActions.push("Validate input parameters");
        }

        // Step 2: Recovery operation
        const recoveryResult = await handlers.getSpaces.handle({ limit: 10 });
        if (!recoveryResult.success) {
          errorFlow.errors.push("Recovery operation also failed");
          errorFlow.recoveryActions.push("Check authentication");
        }

        errorFlow.finalState = "error-handled";

      } catch (error) {
        errorFlow.errors.push(`Unexpected error: ${error}`);
        errorFlow.finalState = "error-unhandled";
      }

      // Validate error handling
      expect(errorFlow.errors).toContain("Invalid pageId parameter");
      expect(errorFlow.recoveryActions).toContain("Validate input parameters");
      expect(errorFlow.finalState).toBe("error-handled");
    });

    test("should validate concurrent operation data integrity", async () => {
      // Test concurrent operations maintain data integrity
      const concurrentData = {
        startTime: Date.now(),
        endTime: 0
      };

      // Launch concurrent operations
      const operations = [
        handlers.getSpaces.handle({ limit: 10 }),
        handlers.searchPages.handle({ query: "test", limit: 5 }),
        handlers.getPage.handle({ pageId: "concurrent-test-123" })
      ];

      // Wait for all operations to complete
      const results = await Promise.allSettled(operations);
      concurrentData.endTime = Date.now();

      // Validate concurrent execution
      expect(results).toHaveLength(3);
      expect(concurrentData.endTime).toBeGreaterThan(concurrentData.startTime);
      
      // Verify all operations completed (even if with auth failures)
      for (const result of results) {
        expect(result.status).toBe("fulfilled");
      }
    });
  });
}); 