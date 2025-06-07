import {
  InvalidSpaceKeyError,
  InvalidSpaceNameError,
} from "@features/confluence/shared/validators";
import { z } from "zod";

/**
 * Validation Schemas for Value Objects
 */
const SpaceKeySchema = z
  .string()
  .regex(/^[A-Z][A-Z0-9]*$/, "Space key must be uppercase alphanumeric");
const SpaceNameSchema = z.string().min(1).max(200);

/**
 * Value Objects
 */
export class SpaceKey {
  private readonly _value: string;

  constructor(value: string) {
    const result = SpaceKeySchema.safeParse(value);
    if (!result.success) {
      throw new InvalidSpaceKeyError(
        `Invalid space key: ${value}. Must be uppercase alphanumeric starting with a letter.`,
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

  equals(other: SpaceKey): boolean {
    return this._value === other._value;
  }

  static fromString(value: string): SpaceKey {
    return new SpaceKey(value);
  }
}

export class SpaceName {
  private readonly _value: string;

  constructor(value: string) {
    const result = SpaceNameSchema.safeParse(value);
    if (!result.success) {
      throw new InvalidSpaceNameError(
        `Invalid space name: ${value}. Must be 1-200 characters.`,
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

  equals(other: SpaceName): boolean {
    return this._value === other._value;
  }

  static fromString(value: string): SpaceName {
    return new SpaceName(value);
  }
}
