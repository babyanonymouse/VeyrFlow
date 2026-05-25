import { describe, expect, it } from "vitest";
import { taskFormSchema } from "./task";

describe("taskFormSchema deadline transform", () => {
  it("transforms an empty string deadline to undefined", () => {
    const data = {
      title: "Clean room",
      deadline: "",
    };
    const result = taskFormSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.deadline).toBeUndefined();
    }
  });

  it("retains a valid non-empty string deadline", () => {
    const data = {
      title: "Clean room",
      deadline: "2026-05-25",
    };
    const result = taskFormSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.deadline).toBe("2026-05-25");
    }
  });

  it("handles omitted deadline field by defaulting/falling back to undefined", () => {
    const data = {
      title: "Clean room",
    };
    const result = taskFormSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.deadline).toBeUndefined();
    }
  });
});
