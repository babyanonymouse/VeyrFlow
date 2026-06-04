"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import Habit from "../../models/Habit";
import { habitCreateSchema, habitCheckOffSchema } from "../validators/habit";

export async function getHabits() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectDB();
  const habits = await Habit.find({ userId }).sort({ createdAt: -1 }).lean();

  // Serialize _id to string for client components
  return habits.map((h) => ({
    ...h,
    _id: h._id.toString(),
  }));
}

export async function createHabit(formData: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = habitCreateSchema.safeParse(formData);
  if (!parsed.success) {
    throw new Error(parsed.error?.issues[0]?.message || "Invalid input");
  }

  await connectDB();

  // Case-insensitive duplicate check for the current user
  const escapedTitle = parsed.data.title
    .trim()
    .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const existing = await Habit.findOne({
    userId,
    title: { $regex: new RegExp(`^${escapedTitle}$`, "i") },
  });

  if (existing) {
    return {
      success: false,
      error: "You already have a habit with this name.",
    };
  }

  const newHabit = await Habit.create({
    userId,
    ...parsed.data,
    completedDates: [],
  });

  revalidatePath("/dashboard/habits");
  revalidatePath("/dashboard");
  return { success: true, habit: JSON.parse(JSON.stringify(newHabit)) };
}

export async function updateHabit(habitId: string, formData: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = habitCreateSchema.safeParse(formData);
  if (!parsed.success) {
    throw new Error(parsed.error?.issues[0]?.message || "Invalid input");
  }

  await connectDB();

  // Case-insensitive duplicate check excluding current habitId
  const escapedTitle = parsed.data.title
    .trim()
    .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const existing = await Habit.findOne({
    userId,
    _id: { $ne: habitId },
    title: { $regex: new RegExp(`^${escapedTitle}$`, "i") },
  });

  if (existing) {
    return {
      success: false,
      error: "You already have a habit with this name.",
    };
  }

  const updated = await Habit.findOneAndUpdate(
    { _id: habitId, userId },
    { $set: parsed.data },
    { new: true },
  ).lean();

  if (!updated) {
    throw new Error("Habit not found");
  }

  revalidatePath("/dashboard/habits");
  revalidatePath("/dashboard");
  return { success: true, habit: JSON.parse(JSON.stringify(updated)) };
}

export async function checkOffHabit(data: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = habitCheckOffSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error?.issues[0]?.message || "Invalid input");
  }

  const { habitId, localDateString } = parsed.data;

  await connectDB();

  // $addToSet safely prevents duplicates at the database level
  const updated = await Habit.findOneAndUpdate(
    { _id: habitId, userId },
    { $addToSet: { completedDates: localDateString } },
    { new: true },
  ).lean();

  if (!updated) {
    throw new Error("Habit not found");
  }

  revalidatePath("/dashboard/habits");
  revalidatePath("/dashboard");
  return { success: true, completedDates: updated.completedDates };
}

export async function deleteHabit(habitId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectDB();
  await Habit.findOneAndDelete({ _id: habitId, userId });

  revalidatePath("/dashboard/habits");
  revalidatePath("/dashboard");
  return { success: true };
}
