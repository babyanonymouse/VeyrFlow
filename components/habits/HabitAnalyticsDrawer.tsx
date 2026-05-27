"use client";

import { useMemo } from "react";
import { Drawer } from "vaul";
import { DayPicker } from "react-day-picker";
import { Flame, Clock, CalendarDays, X, Settings } from "lucide-react";
import { calculateStreak } from "@/lib/utils/date";
import Link from "next/link";

interface HabitDTO {
  _id: string;
  title: string;
  description?: string;
  targetTime?: string | null;
  completedDates: string[];
}

interface HabitAnalyticsDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  habit: HabitDTO | null;
  todayStr: string;
}

export default function HabitAnalyticsDrawer({
  isOpen,
  onOpenChange,
  habit,
  todayStr,
}: HabitAnalyticsDrawerProps) {
  const currentStreak = useMemo(() => {
    if (!habit) return 0;
    return calculateStreak(habit.completedDates || [], todayStr);
  }, [habit, todayStr]);

  const completedDays = useMemo(() => {
    if (!habit?.completedDates) return [];
    return habit.completedDates.map((dateStr: string) => new Date(`${dateStr}T00:00:00`));
  }, [habit]);

  if (!habit) return null;

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[70] bg-black/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[80] rounded-t-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl max-w-md mx-auto outline-none">
          {/* Drawer handle */}
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-855 bg-zinc-800" />
          
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-zinc-100 truncate">{habit.title}</h2>
              {habit.description && (
                <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{habit.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-zinc-800 bg-zinc-950 p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-zinc-850 bg-zinc-900/30 p-3.5">
                <Flame className={`h-5 w-5 ${currentStreak > 0 ? "text-orange-500 fill-orange-500/20" : "text-zinc-500"}`} />
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Streak</p>
                  <p className="text-sm font-bold text-zinc-200">
                    {currentStreak} Day{currentStreak === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-zinc-850 bg-zinc-900/30 p-3.5">
                <CalendarDays className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Total Check-ins</p>
                  <p className="text-sm font-bold text-zinc-200">
                    {completedDays.length} Time{completedDays.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </div>

            {/* Target Time & Settings */}
            <div className="flex items-center justify-between border-y border-zinc-800/80 py-3.5">
              {habit.targetTime ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <Clock size={14} className="animate-pulse" />
                  <span>Target Time: {habit.targetTime}</span>
                </div>
              ) : (
                <div className="text-xs font-semibold text-zinc-500">
                  No target time set
                </div>
              )}

              <Link
                href="/dashboard/habits"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-905 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors"
                onClick={() => onOpenChange(false)}
              >
                <Settings size={12} />
                Manage Habit
              </Link>
            </div>

            {/* Heatmap / Calendar Display-Only */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">History & Consistency</p>
              <div className="flex justify-center bg-zinc-950 p-2 rounded-xl border border-zinc-850/60">
                <DayPicker
                  className="p-1"
                  modifiers={{ completed: completedDays }}
                  modifiersClassNames={{
                    completed: "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 hover:bg-emerald-500/20 rounded-md",
                  }}
                  classNames={{
                    month_caption: "mb-3 text-sm font-medium text-zinc-100 text-center",
                    weekdays: "mb-1 flex justify-between",
                    weekday: "text-xs text-zinc-500 w-8 text-center",
                    day: "text-zinc-400 w-8 h-8 flex items-center justify-center text-sm",
                    day_button: "w-8 h-8 rounded-md transition-colors hover:bg-zinc-900 pointer-events-none select-none text-zinc-300",
                    today: "text-indigo-400 border border-indigo-500/30 font-semibold",
                  }}
                />
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
