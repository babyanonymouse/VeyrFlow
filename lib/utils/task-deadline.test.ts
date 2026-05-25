import { describe, expect, it } from "vitest";
import {
  toLocalDateTimeInputValue,
  toUtcDeadlineISOString,
} from "@/lib/utils/task-deadline";

describe("task-deadline utils", () => {
  it("formats Date to datetime-local input value", () => {
    const date = new Date(2026, 4, 25, 17, 5, 12);
    expect(toLocalDateTimeInputValue(date)).toBe("2026-05-25T17:05");
  });

  it("converts local datetime string to UTC ISO string", () => {
    const local = "2026-05-25T17:00";
    expect(toUtcDeadlineISOString(local)).toBe(new Date(local).toISOString());
  });

  it("returns undefined when no local deadline is provided", () => {
    expect(toUtcDeadlineISOString(undefined)).toBeUndefined();
    expect(toUtcDeadlineISOString("")).toBeUndefined();
  });
});
