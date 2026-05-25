import { z } from "zod";

export const habitCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  targetTime: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format, expected HH:mm")
      .optional()
  ),
});

export const habitCheckOffSchema = z.object({
  habitId: z.string().min(1, "Habit ID is required"),
  localDateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD"),
});
