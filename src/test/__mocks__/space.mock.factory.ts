import type { Space } from "../../features/confluence/api/confluence.models.types.js";
import type { BuildableMockFactory, MockBuilder } from "./mock-factory.interfaces.js";

// Space Mock Builder Implementation
export class SpaceMockBuilder implements MockBuilder<Space> {
  private overrides: Partial<Space> = {};

  constructor(private factory: SpaceMockFactory) {}

  with<K extends keyof Space>(key: K, value: Space[K]): SpaceMockBuilder {
    this.overrides[key] = value;
    return this;
  }

  withPartial(partial: Partial<Space>): SpaceMockBuilder {
    this.overrides = { ...this.overrides, ...partial };
    return this;
  }

  withRelated<R>(_relation: string, _factory: { create(): R }): SpaceMockBuilder {
    // Spaces don't typically have related entities in our current model
    return this;
  }

  build(): Space {
    return this.factory.create(this.overrides);
  }
}

// Space Mock Factory Implementation
export class SpaceMockFactory implements BuildableMockFactory<Space> {
  private readonly defaults: Partial<Space> = {
    key: "TEST",
    name: "Test Space",
    type: "global",
    status: "current",
    description: {
      plain: {
        value: "A test space for development and testing purposes",
        representation: "plain",
      },
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    authorId: "user123",
  };

  create(overrides: Partial<Space> = {}): Space {
    const id = overrides.id || this.generateId();
    const key = overrides.key || this.generateKey();
    const name = overrides.name || this.generateName();
    
    return {
      ...this.defaults,
      ...overrides,
      id,
      key,
      name,
      _links: {
        webui: `/spaces/${key}`,
        self: `/wiki/api/v2/spaces/${id}`,
        ...overrides._links,
      },
      homepage: overrides.homepage || {
        id: `${id}-homepage`,
        title: `${name} Home`,
        _links: {
          webui: `/spaces/${key}/overview`,
        },
      },
    } as Space;
  }

  createMany(count: number, overrides: Partial<Space> = {}): Space[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        ...overrides,
        id: `space-${index + 1}`,
        key: `${overrides.key || "TEST"}${index + 1}`,
        name: `${overrides.name || "Test Space"} ${index + 1}`,
      })
    );
  }

  createWithDefaults(): Space {
    return this.create();
  }

  createValid(): Space {
    return this.create({
      id: this.generateId(),
      key: this.generateRealisticKey(),
      name: this.generateRealisticName(),
      description: {
        plain: {
          value: this.generateRealisticDescription(),
          representation: "plain",
        },
      },
    });
  }

  createMinimal(): Space {
    return this.create({
      description: undefined,
      homepage: undefined,
      authorId: undefined,
    });
  }

  builder(): SpaceMockBuilder {
    return new SpaceMockBuilder(this);
  }

  // Convenience methods for common space types
  createPersonalSpace(userId: string): Space {
    return this.create({
      type: "personal",
      key: `~${userId}`,
      name: `${userId}'s Personal Space`,
      authorId: userId,
    });
  }

  createGlobalSpace(key: string, name: string): Space {
    return this.create({
      type: "global",
      key,
      name,
    });
  }

  createArchivedSpace(): Space {
    return this.create({
      status: "archived",
      name: "Archived Test Space",
    });
  }

  // Helper methods for realistic data generation
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateKey(): string {
    const keys = ["DEV", "TEST", "PROJ", "TEAM", "DOC"];
    return keys[Math.floor(Math.random() * keys.length)];
  }

  private generateName(): string {
    const names = [
      "Development Team",
      "Project Documentation",
      "Team Collaboration",
      "Technical Specifications",
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  private generateRealisticKey(): string {
    return "ENGTEAM";
  }

  private generateRealisticName(): string {
    return "Engineering Team Space";
  }

  private generateRealisticDescription(): string {
    return "Collaborative workspace for the engineering team to share documentation, project updates, and technical specifications.";
  }
} 