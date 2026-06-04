"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Flame, Check, Trash2, Loader2, Clock } from "lucide-react";
import { checkOffHabit, deleteHabit } from "@/lib/actions/habit.actions";
import { calculateStreak } from "@/lib/utils/date";
import ConsistencyHeatmap from "../charts/ConsistencyHeatmap";

interface HabitDTO {
  _id: string;
  title: string;
  description?: string;
  targetTime?: string | null;
  completedDates: string[];
}

export default function HabitItem({ habit }: { habit: HabitDTO }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // To avoid constant re-evaluation of Date() across renders triggering hydration errors,
  // we initialize today's string on component mount via state, but Next.js usually
  // prefers a stable client-side value. For the MVP, calling it here is fine because 
  // it doesn't render server-side mismatched times (unless hydrated in a different timezone).
  const [todayStr] = useState(() => new Date().toLocaleDateString("en-CA"));

  const [optimisticHabit, setOptimisticHabit] = useOptimistic(
    habit,
    (state, newCompletedDate: string) => {
      const newCompletedDates = [...state.completedDates, newCompletedDate];
      return {
        ...state,
        completedDates: newCompletedDates,
      };
    }
  );

  const currentStreak = calculateStreak(optimisticHabit.completedDates, todayStr);
  const isCompletedToday = optimisticHabit.completedDates.includes(todayStr);

  function handleCheckOff() {
    if (isCompletedToday) return;

    startTransition(async () => {
      // Instantly update the UI — must be inside startTransition (React 19 useOptimistic contract)
      setOptimisticHabit(todayStr);

      try {
        await checkOffHabit({ habitId: habit._id, localDateString: todayStr });
      } catch (error) {
        console.error("Failed to check off habit:", error);
        // Optional: show a toast notification here
        // The optimistic state will revert automatically because it's tied to the server state
      }
    });
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteHabit(habit._id);
    } catch (e) {
      console.error(e);
      setIsDeleting(false);
    }
  }

  return (
    <div className={`flex bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all duration-300 group relative overflow-hidden ${isPending ? "opacity-60" : ""}`}>
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none" />

      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {optimisticHabit.title}
            </h3>
            {optimisticHabit.description && (
              <p className="text-sm text-zinc-400 max-w-xl">
                {optimisticHabit.description}
              </p>
            )}
            {optimisticHabit.targetTime && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-2 font-medium">
                <Clock size={13} />
                <span>Target: {(() => {
                  const [hStr, mStr] = optimisticHabit.targetTime.split(":");
                  if (!hStr || !mStr) return optimisticHabit.targetTime;
                  const hour = parseInt(hStr, 10);
                  const ampm = hour >= 12 ? "PM" : "AM";
                  const hour12 = hour % 12 || 12;
                  return `${hour12}:${mStr} ${ampm}`;
                })()}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${currentStreak > 0 ? "bg-orange-500/10 border-orange-500/20 text-orange-400" : "bg-zinc-800 border-zinc-700 text-zinc-500"}`}>
              <Flame size={16} className={currentStreak > 0 ? "fill-orange-400/50" : ""} />
              <span className="font-bold text-sm tracking-wide">{currentStreak} Day{currentStreak === 1 ? "" : "s"}</span>
            </div>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-zinc-500 hover:text-red-400 transition-colors hidden sm:block opacity-0 group-hover:opacity-100 p-2"
              title="Delete Habit"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <ConsistencyHeatmap 
            completedDates={optimisticHabit.completedDates}
            todayStr={todayStr}
            habitTitle={optimisticHabit.title}
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            {optimisticHabit.completedDates.length > 0 
              ? `Last completed: ${optimisticHabit.completedDates[optimisticHabit.completedDates.length - 1] === todayStr ? 'Today' : optimisticHabit.completedDates[optimisticHabit.completedDates.length - 1]}`
              : "Not yet completed"}
          </div>

          <button
            onClick={handleCheckOff}
            disabled={isCompletedToday || isPending}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-[0.98] transition-transform duration-75 ${
              isCompletedToday || isPending
                ? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : isCompletedToday ? (
              <>
                <Check size={16} />
                Done for today
              </>
            ) : (
              "Complete Habit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
