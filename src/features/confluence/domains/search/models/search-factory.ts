import type { SearchResult, SearchStatistics } from "./search.model";

/**
 * Factory Functions
 */
export function createSearchResult(data: {
  content: {
    id: string;
    type: "page" | "blogpost" | "comment" | "attachment";
    status: string;
    title: string;
    spaceId?: string;
    spaceKey?: string;
    spaceName?: string;
    authorId: string;
    authorDisplayName?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    version: {
      number: number;
      createdAt: string | Date;
    };
    links: {
      webui: string;
      self: string;
      editui?: string;
    };
  };
  excerpt?: string;
  score: number;
  highlights?: {
    title?: string[];
    content?: string[];
  };
}): SearchResult {
  return {
    content: {
      id: data.content.id,
      type: data.content.type,
      status: data.content.status,
      title: data.content.title,
      spaceId: data.content.spaceId,
      spaceKey: data.content.spaceKey,
      spaceName: data.content.spaceName,
      authorId: data.content.authorId,
      authorDisplayName: data.content.authorDisplayName,
      createdAt:
        typeof data.content.createdAt === "string"
          ? new Date(data.content.createdAt)
          : data.content.createdAt,
      updatedAt:
        typeof data.content.updatedAt === "string"
          ? new Date(data.content.updatedAt)
          : data.content.updatedAt,
      version: {
        number: data.content.version.number,
        createdAt:
          typeof data.content.version.createdAt === "string"
            ? new Date(data.content.version.createdAt)
            : data.content.version.createdAt,
      },
      links: data.content.links,
    },
    excerpt: data.excerpt,
    score: data.score,
    highlights: data.highlights,
  };
}

export function createSearchStatistics(
  results: SearchResult[],
): SearchStatistics {
  const resultsByType = {
    pages: results.filter((r) => r.content.type === "page").length,
    blogposts: results.filter((r) => r.content.type === "blogpost").length,
    comments: results.filter((r) => r.content.type === "comment").length,
    attachments: results.filter((r) => r.content.type === "attachment").length,
  };

  const spaceMap = new Map<string, { spaceName: string; count: number }>();
  for (const result of results) {
    if (result.content.spaceKey) {
      const existing = spaceMap.get(result.content.spaceKey);
      if (existing) {
        existing.count++;
      } else {
        spaceMap.set(result.content.spaceKey, {
          spaceName: result.content.spaceName || result.content.spaceKey,
          count: 1,
        });
      }
    }
  }

  const resultsBySpace = Array.from(spaceMap.entries()).map(
    ([spaceKey, data]) => ({
      spaceKey,
      spaceName: data.spaceName,
      count: data.count,
    }),
  );

  return {
    totalResults: results.length,
    searchTime: 0, // Would be populated by actual search timing
    resultsByType,
    resultsBySpace,
  };
}
