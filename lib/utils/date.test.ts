import { describe, expect, it } from "vitest";

import { calculateStreak } from "./date";

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
});
