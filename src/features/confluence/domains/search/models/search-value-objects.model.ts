import { z } from "zod";
import { InvalidSearchQueryError } from "../../../shared/validators";

const SearchQuerySchema = z.string().min(1, "Search query cannot be empty");

/**
 * Value Objects
 */
export class SearchQuery {
  private readonly _value: string;

  constructor(value: string) {
    const result = SearchQuerySchema.safeParse(value);
    if (!result.success) {
      throw new InvalidSearchQueryError(
        `Invalid search query: ${value}. Query cannot be empty.`,
        result.error,
      );
    }
    this._value = result.data;
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: SearchQuery): boolean {
    return this._value === other._value;
  }

  static fromString(value: string): SearchQuery {
    return new SearchQuery(value);
  }
}

export class CQLQuery {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new InvalidSearchQueryError("CQL query cannot be empty");
    }
    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: CQLQuery): boolean {
    return this._value === other._value;
  }

  static fromString(value: string): CQLQuery {
    return new CQLQuery(value);
  }

  /**
   * Helper methods for building CQL queries
   */
  static text(query: string): CQLQuery {
    return new CQLQuery(`text ~ "${query}"`);
  }

  static title(query: string): CQLQuery {
    return new CQLQuery(`title ~ "${query}"`);
  }

  static space(spaceKey: string): CQLQuery {
    return new CQLQuery(`space.key = "${spaceKey}"`);
  }

  static type(
    contentType: "page" | "blogpost" | "comment" | "attachment",
  ): CQLQuery {
    return new CQLQuery(`type = "${contentType}"`);
  }

  static creator(username: string): CQLQuery {
    return new CQLQuery(`creator = "${username}"`);
  }

  static created(
    date: string,
    operator: "=" | ">" | "<" | ">=" | "<=" = "=",
  ): CQLQuery {
    return new CQLQuery(`created ${operator} "${date}"`);
  }

  static lastModified(
    date: string,
    operator: "=" | ">" | "<" | ">=" | "<=" = "=",
  ): CQLQuery {
    return new CQLQuery(`lastModified ${operator} "${date}"`);
  }

  and(other: CQLQuery): CQLQuery {
    return new CQLQuery(`(${this._value}) AND (${other._value})`);
  }

  or(other: CQLQuery): CQLQuery {
    return new CQLQuery(`(${this._value}) OR (${other._value})`);
  }

  orderBy(
    field: "created" | "lastModified" | "title",
    direction: "ASC" | "DESC" = "DESC",
  ): CQLQuery {
    return new CQLQuery(`${this._value} ORDER BY ${field} ${direction}`);
  }
}
