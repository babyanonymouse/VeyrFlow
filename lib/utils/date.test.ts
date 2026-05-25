import { describe, expect, it } from "vitest";
import { calculateStreak, isYesterday, parseLocalDate } from "./date";

describe("parseLocalDate", () => {
  it("parses YYYY-MM-DD string to a Date object at local 00:00:00", () => {
    const date = parseLocalDate("2026-04-12");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(3); // 0-indexed April
    expect(date.getDate()).toBe(12);
  });

  it("returns current date on invalid formats", () => {
    const date = parseLocalDate("invalid-date");
    expect(date).toBeInstanceOf(Date);
  });
});

describe("isYesterday", () => {
  it("returns true for consecutive dates", () => {
    expect(isYesterday("2026-04-11", "2026-04-12")).toBe(true);
  });

  it("returns false for non-consecutive dates", () => {
    expect(isYesterday("2026-04-10", "2026-04-12")).toBe(false);
  });

  it("correctly handles leap year rollover (Feb 28 to Feb 29 in 2024)", () => {
    expect(isYesterday("2024-02-28", "2024-02-29")).toBe(true);
    expect(isYesterday("2024-02-28", "2024-03-01")).toBe(false);
  });

  it("correctly handles non-leap year rollover (Feb 28 to Mar 1 in 2026)", () => {
    expect(isYesterday("2026-02-28", "2026-03-01")).toBe(true);
  });
});

describe("calculateStreak", () => {
  it("calculates a 3-day streak for three consecutive dates", () => {
    const streak = calculateStreak(
      ["2026-04-12", "2026-04-10", "2026-04-11"],
      "2026-04-12"
    );
    expect(streak).toBe(3);
  });

  it("resets the streak after a missed day", () => {
    const streak = calculateStreak(
      ["2026-04-10", "2026-04-11", "2026-04-13"],
      "2026-04-13"
    );
    expect(streak).toBe(1);
  });

  it("returns 0 if completed dates list is empty", () => {
    const streak = calculateStreak([], "2026-04-12");
    expect(streak).toBe(0);
  });

  it("handles duplicate dates gracefully without inflating streak", () => {
    // Note: calculateStreak does sorted.length - 1 iteration.
    // If there are duplicate dates, say ["2026-04-11", "2026-04-12", "2026-04-12"],
    // the duplicates will be adjacent. let's see how isYesterday behaves for same days:
    // diffDays will be 0, not 1, which breaks the loop. So streak will stop.
    // Let's check:
    const streak = calculateStreak(
      ["2026-04-11", "2026-04-12", "2026-04-12"],
      "2026-04-12"
    );
    expect(streak).toBe(2); // 12 and 11
  });

  it("handles out-of-order date lists by sorting them first", () => {
    const streak = calculateStreak(
      ["2026-04-12", "2026-04-10", "2026-04-11"],
      "2026-04-12"
    );
    expect(streak).toBe(3);
  });

  it("returns 0 if the latest completed date is older than yesterday", () => {
    const streak = calculateStreak(
      ["2026-04-09", "2026-04-10"],
      "2026-04-12"
    );
    expect(streak).toBe(0);
  });

  it("keeps streak alive if latest check-off was yesterday", () => {
    const streak = calculateStreak(
      ["2026-04-10", "2026-04-11"],
      "2026-04-12"
    );
    expect(streak).toBe(2);
  });
});
