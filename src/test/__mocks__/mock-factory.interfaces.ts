// Base Mock Factory Interface
export interface MockFactory<T> {
  create(overrides?: Partial<T>): T;
  createMany(count: number, overrides?: Partial<T>): T[];
  createWithDefaults(): T;
  createValid(): T;
  createMinimal(): T;
}

// Extended Factory with Builder Support
export interface BuildableMockFactory<T> extends MockFactory<T> {
  builder(): MockBuilder<T>;
}

// Mock Builder Interface
export interface MockBuilder<T> {
  with<K extends keyof T>(key: K, value: T[K]): MockBuilder<T>;
  withPartial(partial: Partial<T>): MockBuilder<T>;
  withRelated<R>(relation: string, factory: MockFactory<R>): MockBuilder<T>;
  build(): T;
}

// Mock Scenario Interface for predefined test scenarios
export interface MockScenario<T> {
  name: string;
  description: string;
  setup(): T;
  validate(result: T): boolean;
}

// Performance optimization interfaces
export interface PerformantMockFactory<T> extends MockFactory<T> {
  createBatch(count: number, template: Partial<T>): T[];
  clearCache(): void;
  getPoolSize(): number;
}

// Error mock factory interface
export interface ErrorMockFactory<T> extends MockFactory<T> {
  createNotFoundError(resource: string): T;
  createPermissionError(action: string, resource: string): T;
  createValidationError(field: string, value: string): T;
  createServerError(message?: string): T;
} 