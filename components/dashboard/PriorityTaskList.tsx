"use client";

import { useEffect, useState } from "react";
import { Check, Calendar } from "lucide-react";
import type { TaskDTO } from "@/lib/actions/task.actions";

function formatTaskDeadline(deadlineStr: string) {
  const d = new Date(deadlineStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  const taskDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date().toLocaleDateString("en-CA");

  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  const timePart = hasTime ? ` at ${pad(d.getHours())}:${pad(d.getMinutes())}` : "";

  if (taskDate === today) {
    return `Today${timePart}`;
  }

  // Tomorrow check
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = `${tomorrowDate.getFullYear()}-${pad(tomorrowDate.getMonth() + 1)}-${pad(tomorrowDate.getDate())}`;
  if (taskDate === tomorrow) {
    return `Tomorrow${timePart}`;
  }

  // Yesterday check
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = `${yesterdayDate.getFullYear()}-${pad(yesterdayDate.getMonth() + 1)}-${pad(yesterdayDate.getDate())}`;
  if (taskDate === yesterday) {
    return `Yesterday (Overdue)${timePart}`;
  }

  // Check if older than yesterday (Overdue)
  if (d.getTime() < new Date().setHours(0, 0, 0, 0)) {
    return `Overdue: ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}${timePart}`;
  }

  return `due ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}${timePart}`;
}

export default function PriorityTaskList({
  tasks,
  onComplete,
  onTaskClick,
}: {
  tasks: TaskDTO[];
  onComplete: (id: string) => void;
  onTaskClick?: (task: TaskDTO) => void;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
        Priority Tasks
      </h2>
      <div className="grid gap-3">
        {tasks.map((task: TaskDTO) => {
          const isOverdue = isMounted && task.deadline && new Date(task.deadline).getTime() < new Date().setHours(0, 0, 0, 0);

          return (
            <div
              key={task._id}
              onClick={() => onTaskClick?.(task)}
              className="flex items-start gap-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 transition-colors hover:bg-zinc-900 group cursor-pointer"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete(task._id);
                }}
                className="mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded border border-zinc-600 bg-zinc-950 text-transparent hover:bg-emerald-500/20 hover:border-emerald-500 hover:text-emerald-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title="Complete Task"
              >
                <Check
                  size={14}
                  strokeWidth={3}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold text-zinc-100">{task.title}</h3>
                  {task.priority === "high" && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-orange-500/10 text-orange-400">
                      High Priority
                    </span>
                  )}
                  {task.deadline && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border ${
                        isOverdue
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      }`}
                    >
                      <Calendar size={10} />
                      {isMounted ? formatTaskDeadline(task.deadline) : "Loading date..."}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-xs text-zinc-400 line-clamp-1">{task.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
