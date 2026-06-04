import { getHabits } from "@/lib/actions/habit.actions";
import HabitList from "@/components/habits/HabitList";
import HabitModal from "@/components/habits/HabitModal";
import EmptyState from "@/components/ui/EmptyState";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await getHabits();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Habits</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Build consistency. Engineered for zero-drag productivity.
          </p>
        </div>
        <HabitModal />
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No habits yet"
          description="Start engineering your daily routines by creating a new habit."
        />
      ) : (
        <HabitList initialHabits={habits} />
      )}
    </div>
  );
}
