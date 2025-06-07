/**
 * Base Mock Factory Interfaces for Confluence V2 Testing
 *
 * This file defines the core interfaces for the hierarchical mock factory pattern
 * that mirrors the V2 domain-driven architecture.
 */

/**
 * Base mock factory interface for creating test data
 */
export interface MockFactory<T> {
  create(overrides?: Partial<T>): T;
  createMany(count: number, overrides?: Partial<T>): T[];
  reset(): void;
}

/**
 * Buildable mock factory for complex object construction
 */
export interface BuildableMockFactory<T> extends MockFactory<T> {
  withDefaults(defaults: Partial<T>): BuildableMockFactory<T>;
  withRandomData(): BuildableMockFactory<T>;
  build(): T;
}

/**
 * Repository mock interface for V2 domain repositories
 */
export interface RepositoryMock<TEntity, TKey = string> {
  findAll(
    params?: unknown,
  ): Promise<{ entities: TEntity[]; pagination: unknown }>;
  findByKey(key: TKey): Promise<TEntity | null>;
  findById(id: string): Promise<TEntity | null>;
  create(request: unknown): Promise<TEntity>;
  update(key: TKey, updates: unknown): Promise<TEntity>;
  delete(key: TKey): Promise<void>;
  exists(key: TKey): Promise<boolean>;
  reset(): void;
  setMockData(data: TEntity[]): void;
  addMockData(data: TEntity): void;
}

/**
 * Use case mock interface for V2 domain use cases
 */
export interface UseCaseMock<TRequest = unknown, TResponse = unknown> {
  execute(request: TRequest): Promise<TResponse>;
  reset(): void;
  setMockResponse(response: TResponse): void;
  setMockError(error: Error): void;
}

/**
 * Domain mock factory interface for complete domain mocking
 */
export interface DomainMockFactory<TEntity, TKey = string> {
  repository: RepositoryMock<TEntity, TKey>;
  useCases: Record<string, UseCaseMock>;
  testData: BuildableMockFactory<TEntity>;
  reset(): void;
}

/**
 * Error mock factory for testing error scenarios
 */
export interface ErrorMockFactory<TError> {
  notFound(resource: string): TError;
  validation(field: string, message: string): TError;
  unauthorized(action?: string): TError;
  forbidden(resource: string): TError;
  serverError(message?: string): TError;
  networkError(): TError;
  timeout(): TError;
}

/**
 * Test scenario builder for complex test setups
 */
export interface TestScenarioBuilder<T> {
  withValidData(): TestScenarioBuilder<T>;
  withInvalidData(): TestScenarioBuilder<T>;
  withEmptyData(): TestScenarioBuilder<T>;
  withLargeDataset(size: number): TestScenarioBuilder<T>;
  withErrorScenario(errorType: string): TestScenarioBuilder<T>;
  build(): T;
}

/**
 * Mock state manager for test isolation
 */
export interface MockStateManager {
  saveState(key: string): void;
  restoreState(key: string): void;
  clearState(): void;
  resetAll(): void;
}
