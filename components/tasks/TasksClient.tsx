"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { Plus, CheckSquare, Loader2 } from "lucide-react";
import TaskListItem from "./TaskListItem";
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

export default function TasksClient({ initialTasks }: { initialTasks: TaskDTO[] }) {
  const [tasks, setTasks] = useState<TaskDTO[]>(initialTasks);
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (state: TaskDTO[], next: TaskDTO[]) => next
  );
  const [isModalPending, startModalTransition] = useTransition();
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
    startModalTransition(async () => {
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

  async function onDelete(id: string) {
    const next = optimisticTasks.filter((t) => t._id !== id);
    setOptimisticTasks(next);
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  }

  async function onToggleComplete(task: TaskDTO) {
    const nextCompleted = !task.isCompleted;
    const next = optimisticTasks.map((t) =>
      t._id === task._id ? { ...t, isCompleted: nextCompleted } : t
    );
    setOptimisticTasks(next);
    try {
      const updated = await setTaskCompleted({
        _id: task._id,
        isCompleted: nextCompleted,
      });
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      console.error("Failed to toggle task completion:", err);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4" aria-busy={isModalPending}>
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Tasks</h1>
          <p className="text-sm text-zinc-500">
            Create, edit, and manage your tasks.
          </p>
          {isModalPending ? (
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
          disabled={isModalPending}
        >
          {isModalPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {isModalPending ? "Working..." : "New Task"}
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
            <TaskListItem
              key={t._id}
              task={t}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={openEdit}
            />
          ))}
        </ul>
      )}

      {modalOpen ? (
        <TaskModal
          key={editing?._id ?? "create"}
          busy={isModalPending}
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
            if (isModalPending) return;
            setModalOpen(false);
            setEditing(null);
          }}
          onSubmit={onSubmit}
        />
      ) : null}
    </>
  );
}
