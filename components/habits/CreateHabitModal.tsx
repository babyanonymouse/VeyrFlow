"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { createHabit } from "@/lib/actions/habit.actions";

export default function CreateHabitModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function actionCreate(formData: FormData) {
    setIsLoading(true);
    setError("");

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      targetTime: formData.get("targetTime") as string,
    };

    try {
      await createHabit(data);
      setIsOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create habit";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors active:scale-[0.98] transition-transform duration-75"
      >
        <Plus size={16} />
        New Habit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold text-white mb-4">Create New Habit</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form action={actionCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              required
              maxLength={100}
              autoFocus
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. Drink 2L water"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              maxLength={500}
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              placeholder="Why this habit matters..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Target Time (Optional)
            </label>
            <input
              type="time"
              name="targetTime"
              className="w-full bg-transparent border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors active:scale-[0.98] transition-transform duration-75"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 active:scale-[0.98] transition-transform duration-75"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Create Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
