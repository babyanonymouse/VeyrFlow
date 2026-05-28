"use client";

import { useOptimistic, useTransition, useState, useEffect } from "react";
import { checkOffHabit } from "@/lib/actions/habit.actions";
import { setTaskCompleted, updateTask } from "@/lib/actions/task.actions";
import { getDashboardSummary } from "@/lib/actions/summary.actions";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import HabitCarousel from "./HabitCarousel";
import PriorityTaskList from "./PriorityTaskList";
import AiIntelligenceSlot from "./AiIntelligenceSlot";
import WeeklySnapshot from "./WeeklySnapshot";
import PwaInstallPrompt from "./PwaInstallPrompt";
import { Activity } from "lucide-react";
import TaskModal from "@/components/tasks/TaskModal";
import HabitAnalyticsDrawer from "@/components/habits/HabitAnalyticsDrawer";
import { toLocalDateTimeInputValue, toUtcDeadlineISOString } from "@/lib/utils/task-deadline";
import type { TaskDTO } from "@/lib/actions/task.actions";
import { taskCreateSchema } from "@/lib/validators/task";

export interface HabitDTO {
  _id: string;
  title: string;
  description?: string;
  targetTime?: string | null;
  completedDates: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface DashboardSummary {
  todayStr: string;
  greeting: string;
  pendingHabits: HabitDTO[];
  priorityTasks: TaskDTO[];
  weeklySnapshot: {
    tasksCompletedThisWeek: number;
    habitCompletionRate: number;
    bestStreak: number;
  };
}

export default function NerveCenterClient({ initialData }: { initialData: DashboardSummary }) {
  const [parentRef] = useAutoAnimate();
  const [overrideSummary, setOverrideSummary] = useState<DashboardSummary | null>(null);
  const activeData = overrideSummary || initialData;
  const [isPending, startTransition] = useTransition();

  const [editingTask, setEditingTask] = useState<TaskDTO | null>(null);
  const [viewingHabit, setViewingHabit] = useState<HabitDTO | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitDrawerOpen, setIsHabitDrawerOpen] = useState(false);

  const [optHabits, removeOptHabit] = useOptimistic(
    activeData.pendingHabits,
    (state: HabitDTO[], habitId: string) => state.filter((h) => h._id !== habitId)
  );

  const [optTasks, removeOptTask] = useOptimistic(
    activeData.priorityTasks,
    (state: TaskDTO[], taskId: string) => state.filter((t) => t._id !== taskId)
  );

  useEffect(() => {
    const clientToday = new Date().toLocaleDateString("en-CA");
    if (clientToday !== initialData.todayStr) {
      getDashboardSummary(clientToday).then((summary) => {
        setOverrideSummary(summary as unknown as DashboardSummary);
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
        setOverrideSummary(summary as unknown as DashboardSummary);
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
        setOverrideSummary(summary as unknown as DashboardSummary);
      }
    } catch (e) {
      console.error("Failed to complete task optimistically", e);
    }
  };

  const handleTaskSubmit = (values: {
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    privacyMode: boolean;
    deadline?: string;
  }) => {
    if (!editingTask) return;
    const taskId = editingTask._id;

    // Instantly close modal to protect responsive UX
    setIsTaskModalOpen(false);
    setEditingTask(null);

    startTransition(async () => {
      try {
        const toServer = taskCreateSchema.parse({
          ...values,
          deadline: toUtcDeadlineISOString(values.deadline),
        });
        await updateTask({ _id: taskId, ...toServer });
        
        const clientToday = new Date().toLocaleDateString("en-CA");
        const summary = await getDashboardSummary(clientToday);
        setOverrideSummary(summary as unknown as DashboardSummary);
      } catch (err) {
        console.error("Failed to update task", err);
      }
    });
  };

  const isDoubleEmpty = optHabits.length === 0 && optTasks.length === 0;

  return (
    <div ref={parentRef} className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto overflow-x-hidden md:overflow-x-visible">
      {/* PWA Install Promotion Banner */}
      <PwaInstallPrompt />

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
              <HabitCarousel
                habits={optHabits}
                onCheckOff={handleCheckOffHabit}
                todayStr={activeData.todayStr}
                onHabitClick={(habit) => {
                  setViewingHabit(habit);
                  setIsHabitDrawerOpen(true);
                }}
              />
            )}

            {optTasks.length > 0 && (
              <PriorityTaskList
                tasks={optTasks}
                onComplete={handleCompleteTask}
                onTaskClick={(task) => {
                  setEditingTask(task);
                  setIsTaskModalOpen(true);
                }}
              />
            )}
          </div>

          {/* Sidebar (AI Slot) */}
          <div className="lg:col-span-4">
            <AiIntelligenceSlot />
          </div>
        </div>
      )}

      {isTaskModalOpen && editingTask && (
        <TaskModal
          key={editingTask._id}
          busy={isPending}
          initialValues={{
            title: editingTask.title,
            description: editingTask.description ?? "",
            priority: editingTask.priority,
            privacyMode: editingTask.privacyMode,
            deadline: editingTask.deadline
              ? toLocalDateTimeInputValue(new Date(editingTask.deadline))
              : "",
          }}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={handleTaskSubmit}
        />
      )}

      <HabitAnalyticsDrawer
        isOpen={isHabitDrawerOpen}
        onOpenChange={setIsHabitDrawerOpen}
        habit={viewingHabit}
        todayStr={activeData.todayStr}
      />
    </div>
  );
}

