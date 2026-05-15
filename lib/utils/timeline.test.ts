import { describe, expect, it } from "vitest";

import { generateTimelineMap } from "./timeline";

describe("generateTimelineMap", () => {
  it("returns exactly 35 days when daysBack is 35", () => {
    const timeline = generateTimelineMap([], "2026-03-15", 35);

    expect(timeline).toHaveLength(35);
    expect(timeline[0]?.dateStr).toBe("2026-02-09");
    expect(timeline[34]?.dateStr).toBe("2026-03-15");
  });

  it("flags the exact local date string as completed (Nairobi drift defense)", () => {
    const completedDates = ["2026-01-01"];
    const timeline = generateTimelineMap(completedDates, "2026-01-03", 5);
    const jan1 = timeline.find((day) => day.dateStr === "2026-01-01");

    expect(jan1).toBeDefined();
    expect(jan1?.isCompleted).toBe(true);
  });
});
