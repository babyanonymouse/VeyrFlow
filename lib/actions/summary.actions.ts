"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Habit from "@/models/Habit";
import Task from "@/models/Task";
import { serialize } from "@/lib/utils/serialization";
import { calculateStreak } from "@/lib/utils/date";

/**
 * Computes the Monday-anchored start of the current week at 00:00:00 local time.
 * Uses the same philosophy as lib/utils/timeline.ts: manual Date arithmetic
 * to avoid UTC-drift for users in offset timezones (e.g. Nairobi UTC+3).
 */
function getStartOfWeek(): Date {
  const now = new Date();
  // getDay() → 0=Sun, 1=Mon, …, 6=Sat
  const day = now.getDay();
  // Distance to the previous (or current) Monday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function getDashboardSummary(clientDateString?: string) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) throw new Error("Unauthorized");

  await connectDB();

  // Use YYYY-MM-DD for timezone-resilient string matching.
  // Prefer client-supplied date for strict TZ accuracy (UTC+3 Nairobi).
  const today = clientDateString || new Date().toLocaleDateString("en-CA");

  const startOfWeek = getStartOfWeek();

  // Single round-trip: all three queries run concurrently
  const [habits, allTasks, tasksCompletedThisWeek] = await Promise.all([
    Habit.find({ userId }).lean(),
    Task.find({ userId, isCompleted: false }).lean(),
    Task.countDocuments({
      userId,
      // completedAt is immutable — editing a task title never shifts this value
      completedAt: { $gte: startOfWeek },
    }),
  ]);

  // ── Pending Habits ────────────────────────────────────────────────────────
  // Only show active habits NOT yet checked off today
  const pendingHabits = habits.filter(
    (h: any) => h.isActive && !h.completedDates.includes(today)
  );

  // ── Priority Tasks ────────────────────────────────────────────────────────
  const priorityTasks = allTasks
    .filter((t: any) => {
      if (t.priority === "high") return true;
      if (t.deadline) {
        const taskDate = new Date(t.deadline).toLocaleDateString("en-CA");
        return taskDate === today;
      }
      return false;
    })
    .sort((a: any, b: any) => {
      const pMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const pDiff = (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 3);

  // ── Weekly Snapshot ───────────────────────────────────────────────────────
  // Only count active habits for rate + streak (archived habits skew metrics)
  const activeHabits = (habits as any[]).filter((h) => h.isActive);

  // Habit completion rate for today: how many active habits were checked off?
  const checkedTodayCount = activeHabits.filter((h) =>
    h.completedDates.includes(today)
  ).length;
  const habitCompletionRate =
    activeHabits.length > 0
      ? Math.round((checkedTodayCount / activeHabits.length) * 100)
      : 0;

  // Best streak: highest current active streak across all active habits
  const bestStreak =
    activeHabits.length > 0
      ? Math.max(
          ...activeHabits.map((h) =>
            calculateStreak(h.completedDates as string[], today)
          )
        )
      : 0;

  return {
    pendingHabits: serialize(pendingHabits),
    priorityTasks: serialize(priorityTasks),
    greeting: `Good morning, ${user.firstName}`,
    todayStr: today,
    weeklySnapshot: {
      tasksCompletedThisWeek,
      habitCompletionRate,
      bestStreak,
    },
  };
}
