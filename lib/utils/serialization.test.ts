import { describe, expect, it } from "vitest";
import { serialize } from "./serialization";

describe("serialize", () => {
  it("returns primitive values as-is", () => {
    expect(serialize(42)).toBe(42);
    expect(serialize("hello")).toBe("hello");
    expect(serialize(true)).toBe(true);
    expect(serialize(null)).toBe(null);
    expect(serialize(undefined)).toBe(undefined);
  });

  it("deep clones simple objects and arrays", () => {
    const original = {
      a: 1,
      b: [2, 3],
      c: { d: "nested" },
    };
    
    const clone = serialize(original);
    
    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
    expect(clone.b).not.toBe(original.b);
    expect(clone.c).not.toBe(original.c);
  });

  it("serializes Date objects to ISO string representation", () => {
    const date = new Date("2026-05-25T00:00:00.000Z");
    const original = { date };
    
    const clone = serialize(original);
    
    expect(clone.date).toBe(date.toISOString());
  });

  it("serializes objects with toJSON method, such as MongoDB-like structures", () => {
    const original = {
      id: {
        toString: () => "mock-id-string",
        toJSON: () => "mock-id-string",
      },
      name: "Habit",
    };

    const clone = serialize(original);

    expect(clone.id).toBe("mock-id-string");
  });
});
