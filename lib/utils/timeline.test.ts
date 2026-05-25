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

  it("handles zero or negative daysBack values by returning an empty array", () => {
    const timelineZero = generateTimelineMap([], "2026-03-15", 0);
    expect(timelineZero).toHaveLength(0);

    const timelineNegative = generateTimelineMap([], "2026-03-15", -5);
    expect(timelineNegative).toHaveLength(0);
  });

  it("safely ignores completedDates that fall outside of the timeline window", () => {
    const completedDates = ["2026-01-01", "2026-03-15"];
    const timeline = generateTimelineMap(completedDates, "2026-01-03", 2);
    // timeline covers Jan 2 and Jan 3
    expect(timeline).toHaveLength(2);
    
    const jan1 = timeline.find((day) => day.dateStr === "2026-01-01");
    const mar15 = timeline.find((day) => day.dateStr === "2026-03-15");
    
    expect(jan1).toBeUndefined();
    expect(mar15).toBeUndefined();
  });

  it("verifies manual padding checks for single-digit months and days", () => {
    const timeline = generateTimelineMap([], "2026-01-09", 1);
    expect(timeline[0]?.dateStr).toBe("2026-01-09");
  });

  it("defaults to 30 days when daysBack parameter is omitted", () => {
    const timeline = generateTimelineMap([], "2026-03-15");
    expect(timeline).toHaveLength(30);
  });
});
