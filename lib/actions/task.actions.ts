"use server";

import { parseLocalDate } from "@/lib/utils/date";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import Task, { ITask } from "@/models/Task";
import {
  taskCreateSchema,
  taskToggleCompleteSchema,
  taskUpdateSchema,
  type TaskCreateInput,
  type TaskToggleCompleteInput,
  type TaskUpdateInput,
} from "@/lib/validators/task";

// Serializable shape — safe to pass across the server/client boundary
export type TaskDTO = {
  _id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  isCompleted: boolean;
  completedAt?: string;
  privacyMode: boolean;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
};

type TaskDocLike = Pick<
  ITask,
  | "_id"
  | "title"
  | "description"
  | "priority"
  | "isCompleted"
  | "completedAt"
  | "privacyMode"
  | "deadline"
  | "createdAt"
  | "updatedAt"
>;

function toTaskDTO(t: TaskDocLike): TaskDTO {
  return {
    _id: String(t._id),
    title: t.title,
    description: t.description ?? undefined,
    priority: t.priority,
    isCompleted: t.isCompleted,
    completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : undefined,
    privacyMode: t.privacyMode,
    deadline: t.deadline ? new Date(t.deadline).toISOString() : undefined,
    createdAt: new Date(t.createdAt).toISOString(),
    updatedAt: new Date(t.updatedAt).toISOString(),
  };
}

export async function createTask(input: TaskCreateInput): Promise<TaskDTO> {
  const { userId } = await auth(); // server-side only — ID-spoofing proof
  if (!userId) throw new Error("401 Unauthorized");

  const parsed = taskCreateSchema.parse(input);
  const description =
    typeof parsed.description === "string" && parsed.description.trim().length > 0
      ? parsed.description.trim()
      : undefined;

  try {
    await connectDB();
    const created = await Task.create({
      userId,
      title: parsed.title,
      description,
      priority: parsed.priority,
      privacyMode: parsed.privacyMode,
      deadline: parsed.deadline,
    });
    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
    return toTaskDTO(created);
  } catch (err) {
    console.error("[createTask] Failed:", err);
    throw err;
  }
}

export async function getTasks(): Promise<TaskDTO[]> {
  const { userId } = await auth(); // server-side only
  if (!userId) return [];

  try {
    await connectDB();
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 }).lean<ITask[]>();
    return tasks.map((t) => toTaskDTO(t));
  } catch (err) {
    console.error("[getTasks] Failed:", err);
    return [];
  }
}

export async function updateTask(input: TaskUpdateInput): Promise<TaskDTO> {
  const { userId } = await auth();
  if (!userId) throw new Error("401 Unauthorized");

  const parsed = taskUpdateSchema.parse(input);
  const { _id, ...rest } = parsed;

  const updateDoc: any = { $set: {}, $unset: {} };
  
  if (typeof rest.title === "string") updateDoc.$set.title = rest.title;
  
  if (rest.description !== undefined) {
    const trimmed = typeof rest.description === "string" ? rest.description.trim() : "";
    if (trimmed.length > 0) {
      updateDoc.$set.description = trimmed;
    } else {
      updateDoc.$unset.description = 1;
    }
  }
  
  if (rest.priority) updateDoc.$set.priority = rest.priority;
  
  if (rest.deadline !== undefined) {
    if (rest.deadline) {
      updateDoc.$set.deadline = rest.deadline;
    } else {
      updateDoc.$unset.deadline = 1;
    }
  }
  
  if (rest.privacyMode !== undefined) updateDoc.$set.privacyMode = rest.privacyMode;

  if (Object.keys(updateDoc.$unset).length === 0) delete updateDoc.$unset;

  try {
    await connectDB();
    const updated = await Task.findOneAndUpdate({ _id, userId }, updateDoc, {
      new: true,
    });
    if (!updated) throw new Error("404 Not Found");
    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
    return toTaskDTO(updated);
  } catch (err) {
    console.error("[updateTask] Failed:", err);
    throw err;
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("401 Unauthorized");

  if (!taskId) throw new Error("Task ID is required");

  try {
    await connectDB();
    await Task.deleteOne({ _id: taskId, userId });
    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("[deleteTask] Failed:", err);
    throw err;
  }
}

export async function setTaskCompleted(
  input: TaskToggleCompleteInput
): Promise<TaskDTO> {
  const { userId } = await auth();
  if (!userId) throw new Error("401 Unauthorized");

  const parsed = taskToggleCompleteSchema.parse(input);

  try {
    await connectDB();
    // Must use explicit $set/$unset — a plain object is treated as a
    // replacement document by Mongoose's findOneAndUpdate, which would
    // wipe userId/title/etc. and never write completedAt to the DB.
    const updatePayload = parsed.isCompleted
      ? { $set: { isCompleted: true, completedAt: new Date() } }
      : { $set: { isCompleted: false }, $unset: { completedAt: 1 } };

    const updated = await Task.findOneAndUpdate(
      { _id: parsed._id, userId },
      updatePayload as any,
      { new: true }
    );
    if (!updated) throw new Error("404 Not Found");
    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
    return toTaskDTO(updated);
  } catch (err) {
    console.error("[setTaskCompleted] Failed:", err);
    throw err;
  }
}

export type VelocityData = {
  /** Short weekday label e.g. "Mon", "Tue" — stable display key for the chart */
  day: string;
  /** Internal YYYY-MM-DD string used for DB boundary queries */
  _dateStr: string;
  created: number;
  completed: number;
};

export async function getWeeklyVelocity(
  /** Client-supplied local YYYY-MM-DD string (e.g. from toLocaleDateString("en-CA"))
   *  Prevents UTC-drift for users in UTC+N timezones like Africa/Nairobi (UTC+3). */
  todayStr?: string
): Promise<VelocityData[]> {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    await connectDB();

    // Anchor to local "today" — if client supplies a date string use it,
    // otherwise fall back to server locale (en-CA = YYYY-MM-DD format).
    const localTodayStr = todayStr || new Date().toLocaleDateString("en-CA");

    // parseLocalDate builds Date at 00:00:00 local time — no UTC drift
    const todayDate = parseLocalDate(localTodayStr);

    // Build the pristine 7-day scaffold using the same manual string
    // reconstruction pattern as lib/utils/timeline.ts
    const velocity: VelocityData[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dayNum = String(d.getDate()).padStart(2, "0");
      const _dateStr = `${year}-${month}-${dayNum}`;
      // Short weekday label: "Mon", "Tue", etc.
      const day = d.toLocaleDateString("en-US", { weekday: "short" });
      velocity.push({ day, _dateStr, created: 0, completed: 0 });
    }

    // DB boundary: midnight at the start of the oldest day in the window
    const oldestDate = parseLocalDate(velocity[0]!._dateStr);

    // Fetch only tasks that fall inside the 7-day window
    const tasks = await Task.find({
      userId,
      $or: [
        { createdAt: { $gte: oldestDate } },
        { completedAt: { $gte: oldestDate } },
      ],
    }).lean<ITask[]>();

    // Tally counts — use manual string reconstruction (no .toISOString()) to
    // stay in local time and avoid UTC midnight boundary crossings
    tasks.forEach((task) => {
      // Creation day
      const cDate = new Date(task.createdAt);
      const cStr = `${cDate.getFullYear()}-${String(cDate.getMonth() + 1).padStart(2, "0")}-${String(cDate.getDate()).padStart(2, "0")}`;
      const cIdx = velocity.findIndex((v) => v._dateStr === cStr);
      if (cIdx !== -1) velocity[cIdx]!.created++;

      // Completion day (only when immutable completedAt is set)
      if (task.isCompleted && task.completedAt) {
        const dDate = new Date(task.completedAt);
        const dStr = `${dDate.getFullYear()}-${String(dDate.getMonth() + 1).padStart(2, "0")}-${String(dDate.getDate()).padStart(2, "0")}`;
        const dIdx = velocity.findIndex((v) => v._dateStr === dStr);
        if (dIdx !== -1) velocity[dIdx]!.completed++;
      }
    });

    // Strip internal _dateStr before returning — chart only needs day, created, completed
    return velocity.map(({ day, created, completed }) => ({ day, _dateStr: "", created, completed }));
  } catch (err) {
    console.error("[getWeeklyVelocity] Failed:", err);
    return [];
  }
}
