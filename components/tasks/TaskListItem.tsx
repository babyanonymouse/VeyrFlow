"use client";

import { useTransition } from "react";
import { Check, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { TaskDTO } from "@/lib/actions/task.actions";

interface TaskListItemProps {
  task: TaskDTO;
  onToggleComplete: (task: TaskDTO) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (task: TaskDTO) => void;
}

function formatDeadline(deadlineStr: string): string {
  const d = new Date(deadlineStr);
  const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  if (hasTime) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `due ${dateStr} at ${timeStr}`;
  }
  return `due ${dateStr}`;
}

export default function TaskListItem({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
}: TaskListItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await onToggleComplete(task);
      } catch (err) {
        console.error("Failed to toggle task completion:", err);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await onDelete(task._id);
        toast.success("Task deleted");
      } catch (err) {
        console.error("Failed to delete task:", err);
      }
    });
  };

  return (
    <li className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 transition-colors hover:bg-zinc-900/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggle}
              disabled={isPending}
              className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-transform duration-75 ${
                task.isCompleted
                  ? "border-emerald-700 bg-emerald-900/30 text-emerald-200"
                  : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
              }`}
              aria-label={task.isCompleted ? "Mark incomplete" : "Mark complete"}
              title={task.isCompleted ? "Completed" : "Not completed"}
            >
              {isPending ? (
                <Loader2 size={12} className="animate-spin text-zinc-400" />
              ) : task.isCompleted ? (
                <Check size={14} />
              ) : null}
            </button>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
              {task.priority}
            </span>
            {task.privacyMode ? (
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                private
              </span>
            ) : null}
            {task.deadline ? (
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                {formatDeadline(task.deadline)}
              </span>
            ) : null}
          </div>
          <p
            className={`mt-2 truncate text-sm font-medium ${
              task.isCompleted ? "text-zinc-500 line-through" : "text-zinc-100"
            }`}
          >
            {task.title}
          </p>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
              {task.description}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-transform duration-75"
            disabled={isPending}
            aria-label="Edit task"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-transform duration-75"
            disabled={isPending}
            aria-label="Delete task"
            title="Delete"
          >
            {isPending ? <Loader2 size={16} className="animate-spin text-zinc-400" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>
    </li>
  );
}
