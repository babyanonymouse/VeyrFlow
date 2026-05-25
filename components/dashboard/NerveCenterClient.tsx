"use client";

import { useOptimistic, startTransition, useState, useEffect } from "react";
import { checkOffHabit } from "@/lib/actions/habit.actions";
import { setTaskCompleted } from "@/lib/actions/task.actions";
import { getDashboardSummary } from "@/lib/actions/summary.actions";
import HabitCarousel from "./HabitCarousel";
import PriorityTaskList from "./PriorityTaskList";
import AiIntelligenceSlot from "./AiIntelligenceSlot";
import WeeklySnapshot from "./WeeklySnapshot";
import { Activity } from "lucide-react";

export default function NerveCenterClient({ initialData }: { initialData: any }) {
  const [overrideSummary, setOverrideSummary] = useState<any>(null);
  const activeData = overrideSummary || initialData;

  const [optHabits, removeOptHabit] = useOptimistic(
    activeData.pendingHabits,
    (state: any[], habitId: string) => state.filter((h) => h._id !== habitId)
  );

  const [optTasks, removeOptTask] = useOptimistic(
    activeData.priorityTasks,
    (state: any[], taskId: string) => state.filter((t) => t._id !== taskId)
  );

  useEffect(() => {
    const clientToday = new Date().toLocaleDateString("en-CA");
    if (clientToday !== initialData.todayStr) {
      getDashboardSummary(clientToday).then((summary) => {
        setOverrideSummary(summary);
      });
    }
  }, [initialData.todayStr]);

  const handleCheckOffHabit = async (habitId: string) => {
    const clientToday = new Date().toLocaleDateString("en-CA");
    startTransition(() => {
      removeOptHabit(habitId);
    });
    try {
      await checkOffHabit({ habitId, localDateString: clientToday });
      if (clientToday !== initialData.todayStr) {
        const summary = await getDashboardSummary(clientToday);
        setOverrideSummary(summary);
      }
    } catch (e) {
      console.error("Failed to check off habit optimistically", e);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    startTransition(() => {
      removeOptTask(taskId);
    });
    try {
      await setTaskCompleted({ _id: taskId, isCompleted: true });
      const clientToday = new Date().toLocaleDateString("en-CA");
      if (clientToday !== initialData.todayStr) {
        const summary = await getDashboardSummary(clientToday);
        setOverrideSummary(summary);
      }
    } catch (e) {
      console.error("Failed to complete task optimistically", e);
    }
  };

  const isDoubleEmpty = optHabits.length === 0 && optTasks.length === 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto overflow-x-hidden md:overflow-x-visible">
      {/* Greeting Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">{activeData.greeting}</h1>
        <p className="text-zinc-400 text-lg">
          You have <span className="text-emerald-400 font-semibold">{optHabits.length}</span> habits to maintain and <span className="text-orange-400 font-semibold">{optTasks.length}</span> priority tasks.
        </p>
      </div>

      {/* Weekly Snapshot — always visible, even when today's list is empty */}
      <WeeklySnapshot snapshot={activeData.weeklySnapshot} />

      {isDoubleEmpty ? (
        <div className="py-16 px-6 flex flex-col items-center justify-center text-center space-y-6 border border-zinc-800 rounded-3xl bg-zinc-900/50 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="bg-zinc-800 p-5 rounded-full ring-1 ring-zinc-700 relative z-10 shadow-xl shadow-black/50">
            <Activity className="w-10 h-10 text-indigo-400" />
          </div>
          <div className="relative z-10 max-w-sm mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">All caught up!</h2>
            <p className="text-zinc-400 leading-relaxed">
              Your Nerve Center is completely clear for the day. Take a break or add new routines to build your momentum.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area (Habit Carousel + Tasks) */}
          <div className="lg:col-span-8 space-y-10 min-w-0">
            {optHabits.length > 0 && (
              <HabitCarousel habits={optHabits} onCheckOff={handleCheckOffHabit} todayStr={activeData.todayStr} />
            )}

            {optTasks.length > 0 && (
              <PriorityTaskList tasks={optTasks} onComplete={handleCompleteTask} />
            )}
          </div>

          {/* Sidebar (AI Slot) */}
          <div className="lg:col-span-4">
            <AiIntelligenceSlot />
          </div>
        </div>
      )}
    </div>
  );
}

