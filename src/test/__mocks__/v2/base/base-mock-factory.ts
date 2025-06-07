/**
 * Base Mock Factory Implementation for Confluence V2 Testing
 *
 * This file provides the base implementation for the hierarchical mock factory pattern.
 */

import type {
  BuildableMockFactory,
  MockStateManager,
} from "./mock-factory.interfaces";

/**
 * Base implementation for buildable mock factories
 */
export abstract class BaseMockFactory<T> implements BuildableMockFactory<T> {
  protected defaults: Partial<T> = {};
  protected currentOverrides: Partial<T> = {};

  abstract create(overrides?: Partial<T>): T;

  createMany(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({ ...overrides, ...this.generateIndexedOverrides(index) }),
    );
  }

  withDefaults(defaults: Partial<T>): BuildableMockFactory<T> {
    this.defaults = { ...this.defaults, ...defaults };
    return this;
  }

  withRandomData(): BuildableMockFactory<T> {
    this.currentOverrides = this.generateRandomData();
    return this;
  }

  build(): T {
    const result = this.create(this.currentOverrides);
    this.currentOverrides = {};
    return result;
  }

  reset(): void {
    this.defaults = {};
    this.currentOverrides = {};
  }

  /**
   * Generate indexed overrides for creating multiple items
   */
  protected generateIndexedOverrides(_index: number): Partial<T> {
    return {} as Partial<T>;
  }

  /**
   * Generate random data for testing
   */
  protected abstract generateRandomData(): Partial<T>;

  /**
   * Merge defaults, overrides, and current overrides
   */
  protected mergeData(overrides?: Partial<T>): Partial<T> {
    return {
      ...this.defaults,
      ...this.currentOverrides,
      ...overrides,
    };
  }
}

/**
 * Mock state manager implementation
 */
export class MockStateManagerImpl implements MockStateManager {
  private states: Map<string, unknown> = new Map();
  private mockFactories: Set<{ reset(): void }> = new Set();

  saveState(key: string): void {
    // In a real implementation, this would serialize the current state
    this.states.set(key, new Date().toISOString());
  }

  restoreState(key: string): void {
    // In a real implementation, this would restore the serialized state
    const state = this.states.get(key);
    if (!state) {
      throw new Error(`No saved state found for key: ${key}`);
    }
  }

  clearState(): void {
    this.states.clear();
  }

  resetAll(): void {
    for (const factory of this.mockFactories) {
      factory.reset();
    }
    this.clearState();
  }

  registerMockFactory(factory: { reset(): void }): void {
    this.mockFactories.add(factory);
  }

  unregisterMockFactory(factory: { reset(): void }): void {
    this.mockFactories.delete(factory);
  }
}

/**
 * Utility functions for mock data generation
 */
export const MockDataUtils = {
  generateId(): string {
    return `test-${Math.random().toString(36).substr(2, 9)}`;
  },

  generateKey(): string {
    return `TEST${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  },

  generateName(): string {
    const adjectives = ["Test", "Mock", "Sample", "Demo", "Example"];
    const nouns = ["Space", "Page", "Content", "Document", "Project"];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective} ${noun}`;
  },

  generateDescription(): string {
    return `This is a test description generated for testing purposes - ${MockDataUtils.generateId()}`;
  },

  generateDate(daysAgo = 0): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  },

  generateUrl(path = ""): string {
    return `https://test.atlassian.net/wiki${path}`;
  },

  generateEmail(): string {
    return `test.user.${MockDataUtils.generateId()}@example.com`;
  },

  randomChoice<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  },

  randomBoolean(): boolean {
    return Math.random() > 0.5;
  },

  randomNumber(min = 1, max = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
} as const;
