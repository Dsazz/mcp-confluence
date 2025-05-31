import type { Page } from "../../features/confluence/api/models.types";
import type { BuildableMockFactory, MockBuilder } from "./mock-factory.interfaces";

// Page Mock Builder Implementation
export class PageMockBuilder implements MockBuilder<Page> {
  private overrides: Partial<Page> = {};

  constructor(private factory: PageMockFactory) {}

  with<K extends keyof Page>(key: K, value: Page[K]): PageMockBuilder {
    this.overrides[key] = value;
    return this;
  }

  withPartial(partial: Partial<Page>): PageMockBuilder {
    this.overrides = { ...this.overrides, ...partial };
    return this;
  }

  withRelated<R>(relation: string, factory: { create(): R }): PageMockBuilder {
    // Handle related entity creation (e.g., space, parent page)
    if (relation === "space") {
      const space = factory.create() as unknown as { id: string };
      this.overrides.spaceId = space.id;
    }
    return this;
  }

  build(): Page {
    return this.factory.create(this.overrides);
  }
}

// Page Mock Factory Implementation
export class PageMockFactory implements BuildableMockFactory<Page> {
  private readonly defaults: Partial<Page> = {
    type: "page",
    status: "current",
    title: "Test Page",
    spaceId: "SPACE1",
    authorId: "user123",
    createdAt: "2024-01-01T00:00:00.000Z",
    version: {
      number: 1,
      message: "Initial version",
      createdAt: "2024-01-01T00:00:00.000Z",
      authorId: "user123",
    },
    _links: {
      webui: "/spaces/SPACE1/pages/12345",
      editui: "/spaces/SPACE1/pages/12345/edit",
      self: "/wiki/api/v2/pages/12345",
    },
  };

  create(overrides: Partial<Page> = {}): Page {
    const id = overrides.id || this.generateId();
    const title = overrides.title || this.generateTitle();
    
    return {
      ...this.defaults,
      ...overrides,
      id,
      title,
      _links: {
        ...this.defaults._links,
        webui: `/spaces/${overrides.spaceId || this.defaults.spaceId}/pages/${id}`,
        editui: `/spaces/${overrides.spaceId || this.defaults.spaceId}/pages/${id}/edit`,
        self: `/wiki/api/v2/pages/${id}`,
        ...overrides._links,
      },
    } as Page;
  }

  createMany(count: number, overrides: Partial<Page> = {}): Page[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        ...overrides,
        id: `page-${index + 1}`,
        title: `${overrides.title || "Test Page"} ${index + 1}`,
      })
    );
  }

  createWithDefaults(): Page {
    return this.create();
  }

  createValid(): Page {
    return this.create({
      id: this.generateId(),
      title: this.generateRealisticTitle(),
      body: {
        storage: {
          value: this.generateRealisticContent(),
          representation: "storage",
        },
      },
    });
  }

  createMinimal(): Page {
    return this.create({
      body: undefined,
      parentId: undefined,
    });
  }

  builder(): PageMockBuilder {
    return new PageMockBuilder(this);
  }

  // Helper methods for realistic data generation
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateTitle(): string {
    const topics = [
      "Documentation",
      "Project",
      "Meeting Notes",
      "Specification",
    ];
    const adjectives = ["New", "Updated", "Draft", "Final"];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${
      topics[Math.floor(Math.random() * topics.length)]
    }`;
  }

  private generateRealisticTitle(): string {
    return `Engineering Team Meeting Notes - ${new Date().toLocaleDateString()}`;
  }

  private generateRealisticContent(): string {
    return `<p>This is a comprehensive document containing important information about our project.</p>
            <h2>Overview</h2>
            <p>The project aims to improve our development processes and team collaboration.</p>
            <h2>Key Points</h2>
            <ul>
              <li>Implement new testing strategies</li>
              <li>Enhance documentation practices</li>
              <li>Improve code review process</li>
            </ul>`;
  }
} 