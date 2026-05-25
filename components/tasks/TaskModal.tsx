"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { z } from "zod";
import { taskFormSchema, type TaskFormInput } from "@/lib/validators/task";

export type TaskModalValues = TaskFormInput;

export type TaskModalValuesWithDefaults = Required<
  Pick<TaskModalValues, "title" | "description" | "priority" | "deadline" | "privacyMode">
>;

export default function TaskModal({
  busy,
  initialValues,
  onClose,
  onSubmit,
}: {
  busy?: boolean;
  initialValues?: TaskModalValuesWithDefaults;
  onClose: () => void;
  onSubmit: (values: TaskModalValues) => void;
}) {
  const defaults = useMemo<TaskModalValuesWithDefaults>(
    () =>
      initialValues ?? {
        title: "",
        description: "",
        priority: "medium",
        deadline: "",
        privacyMode: false,
      },
    [initialValues]
  );

  const [title, setTitle] = useState(defaults.title);
  const [description, setDescription] = useState(defaults.description);
  const [priority, setPriority] = useState<TaskModalValuesWithDefaults["priority"]>(
    defaults.priority
  );
  const [deadline, setDeadline] = useState(defaults.deadline);
  const [privacyMode, setPrivacyMode] = useState(defaults.privacyMode);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): TaskModalValues | null {
    const payload = {
      title,
      description,
      priority,
      privacyMode,
      deadline,
    };

    const result = taskFormSchema.safeParse(payload);
    if (result.success) {
      setErrors({});
      return {
        title: result.data.title,
        description: result.data.description ?? "",
        priority: result.data.priority,
        privacyMode: result.data.privacyMode,
        deadline: result.data.deadline,
      };
    }

    const fieldErrors: Record<string, string> = {};
    if (result.error instanceof z.ZodError) {
      for (const issue of result.error.issues) {
        const key = issue.path[0] ? String(issue.path[0]) : "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
    }
    setErrors(fieldErrors);
    return null;
  }

  function submit() {
    const parsed = validate();
    if (!parsed) return;

    onSubmit({
      title: parsed.title,
      description: parsed.description,
      priority: parsed.priority,
      privacyMode: parsed.privacyMode,
      deadline: parsed.deadline,
    });
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 cursor-pointer"
        onClick={onClose}
        aria-label="Close modal backdrop"
        disabled={busy}
      />

      <div className="absolute left-1/2 top-1/2 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-zinc-100">
              {initialValues ? "Edit task" : "Create task"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Description is optional (max 500 characters).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-md border border-zinc-800 bg-zinc-950 p-2 text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-200">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
              placeholder="e.g. Implement task CRUD"
              maxLength={100}
              autoFocus
            />
            {errors.title ? (
              <p className="mt-1 text-xs text-red-400">{errors.title}</p>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-zinc-200">
                Description
              </label>
              <span className="text-xs text-zinc-500">
                {description.length}/500
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-[96px] w-full resize-none rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
              placeholder="Optional details (max 500 chars)"
              maxLength={500}
            />
            {errors.description ? (
              <p className="mt-1 text-xs text-red-400">{errors.description}</p>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-200">
                Priority
              </label>
              <select
              title="Priority"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as TaskModalValuesWithDefaults["priority"])
                }
                className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-200">
                Deadline
              </label>
              <input
                title="Deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={privacyMode}
              onChange={(e) => setPrivacyMode(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-950"
            />
            Privacy mode (exclude from AI context)
          </label>

          {errors.form ? (
            <p className="text-xs text-red-400">{errors.form}</p>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {initialValues ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

