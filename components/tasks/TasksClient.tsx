"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { Plus, CheckSquare, Trash2, Pencil, Check, Loader2 } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import type { TaskDTO } from "@/lib/actions/task.actions";
import {
  createTask,
  deleteTask,
  setTaskCompleted,
  updateTask,
} from "@/lib/actions/task.actions";
import TaskModal, { TaskModalValues } from "@/components/tasks/TaskModal";
import { taskCreateSchema } from "@/lib/validators/task";

function toLocalDateTimeString(dateStr: string): string {
  const date = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
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

export default function TasksClient({ initialTasks }: { initialTasks: TaskDTO[] }) {
  const [tasks, setTasks] = useState<TaskDTO[]>(initialTasks);
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (state: TaskDTO[], next: TaskDTO[]) => next
  );
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TaskDTO | null>(null);

  // Chronological deadline sorting with active tasks first, completed tasks last
  const sorted = useMemo(() => {
    return [...optimisticTasks].sort((a, b) => {
      // Completed tasks go to the bottom
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      // If neither or both are completed, sort by deadline
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (a.deadline) return -1; // tasks with deadlines come first
      if (b.deadline) return 1;
      // If neither has deadline, sort by createdAt descending
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [optimisticTasks]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(t: TaskDTO) {
    setEditing(t);
    setModalOpen(true);
  }

  function onSubmit(values: TaskModalValues) {
    startTransition(async () => {
      // Convert form values to server schema input (deadline string -> Date, using client timezone offset)
      const toServer = taskCreateSchema.parse({
        ...values,
        deadline: values.deadline ? new Date(values.deadline) : undefined,
      });

      if (editing) {
        const updated = await updateTask({ _id: editing._id, ...toServer });
        setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        setOptimisticTasks(
          optimisticTasks.map((t) => (t._id === updated._id ? updated : t))
        );
      } else {
        const created = await createTask(toServer);
        setTasks((prev) => [created, ...prev]);
        setOptimisticTasks([created, ...optimisticTasks]);
      }
      setModalOpen(false);
      setEditing(null);
    });
  }

  function onDelete(id: string) {
    const next = optimisticTasks.filter((t) => t._id !== id);

    // Next.js requires optimistic updates inside a transition or action.
    startTransition(() => {
      setOptimisticTasks(next);
    });

    startTransition(async () => {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    });
  }

  function onToggleComplete(task: TaskDTO) {
    const nextCompleted = !task.isCompleted;
    const next = optimisticTasks.map((t) =>
      t._id === task._id ? { ...t, isCompleted: nextCompleted } : t
    );

    // Next.js requires optimistic updates inside a transition or action.
    startTransition(() => {
      setOptimisticTasks(next);
    });

    startTransition(async () => {
      const updated = await setTaskCompleted({
        _id: task._id,
        isCompleted: nextCompleted,
      });
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setOptimisticTasks(
        next.map((t) => (t._id === updated._id ? updated : t))
      );
    });
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4" aria-busy={isPending}>
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Tasks</h1>
          <p className="text-sm text-zinc-500">
            Create, edit, and manage your tasks.
          </p>
          {isPending ? (
            <p
              role="status"
              aria-live="polite"
              className="mt-1 inline-flex items-center gap-1.5 text-xs text-indigo-300"
            >
              <Loader2 size={12} className="animate-spin" />
              Saving changes...
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {isPending ? "Working..." : "New Task"}
        </button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Create your first task to start tracking your work."
        />
      ) : (
        <ul className="grid gap-3">
          {sorted.map((t) => (
            <li
              key={t._id}
              className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleComplete(t)}
                      disabled={isPending}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                        t.isCompleted
                           ? "border-emerald-700 bg-emerald-900/30 text-emerald-200"
                          : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                      aria-label={t.isCompleted ? "Mark incomplete" : "Mark complete"}
                      title={t.isCompleted ? "Completed" : "Not completed"}
                    >
                      {t.isCompleted ? <Check size={14} /> : null}
                    </button>
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                      {t.priority}
                    </span>
                    {t.privacyMode ? (
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                        private
                      </span>
                    ) : null}
                    {t.deadline ? (
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                        {formatDeadline(t.deadline)}
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={`mt-2 truncate text-sm font-medium ${
                      t.isCompleted ? "text-zinc-500 line-through" : "text-zinc-100"
                    }`}
                  >
                    {t.title}
                  </p>
                  {t.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                      {t.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isPending}
                    aria-label="Edit task"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(t._id)}
                    className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isPending}
                    aria-label="Delete task"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalOpen ? (
        <TaskModal
          key={editing?._id ?? "create"}
          busy={isPending}
          initialValues={
            editing
              ? {
                  title: editing.title,
                  description: editing.description ?? "",
                  priority: editing.priority,
                  privacyMode: editing.privacyMode,
                  deadline: editing.deadline
                    ? toLocalDateTimeString(editing.deadline)
                    : "",
                }
              : undefined
          }
          onClose={() => {
            if (isPending) return;
            setModalOpen(false);
            setEditing(null);
          }}
          onSubmit={onSubmit}
        />
      ) : null}
    </>
  );
}
