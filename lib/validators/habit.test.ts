import { describe, expect, it } from "vitest";
import { habitCheckOffSchema } from "./habit";

describe("habitCheckOffSchema localDateString regex", () => {
  it("passes for valid YYYY-MM-DD format", () => {
    const validData = {
      habitId: "habit-123",
      localDateString: "2026-05-25",
    };
    const result = habitCheckOffSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails for invalid formats (slashes, bad components, or time strings)", () => {
    const invalidDates = [
      "2026/05/25",          // Slashes
      "25-05-2026",          // DD-MM-YYYY format
      "2026-5-25",           // Missing leading zeros
      "2026-05-25T00:00:00", // Full ISO date-time
      "2026-05-25Z",         // Trailing timezone
      "abcd-ef-gh",          // Non-numeric
      "",                    // Empty
    ];

    invalidDates.forEach((dateStr) => {
      const result = habitCheckOffSchema.safeParse({
        habitId: "habit-123",
        localDateString: dateStr,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Invalid date format, expected YYYY-MM-DD");
      }
    });
  });
});
