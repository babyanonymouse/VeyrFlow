import { CheckSquare, Flame, Zap } from "lucide-react";

export type WeeklySnapshotData = {
  tasksCompletedThisWeek: number;
  habitCompletionRate: number;
  bestStreak: number;
};

export default function WeeklySnapshot({
  snapshot,
}: {
  snapshot: WeeklySnapshotData;
}) {
  const habitRateStatus =
    snapshot.habitCompletionRate >= 80
      ? "Excellent consistency! Top tier rhythm."
      : snapshot.habitCompletionRate >= 50
        ? "Good momentum. Keep pushing!"
        : snapshot.habitCompletionRate > 0
          ? "Keep building your daily rhythm."
          : "Start with one easy habit today.";

  const streakStatus =
    snapshot.bestStreak > 0
      ? `Streak is active! Keep maintaining it.`
      : "No active streak. Start one today!";

  const habitCompletionProgress = Math.max(0, Math.min(100, snapshot.habitCompletionRate));

  // Circular progress dimensions
  const radius = 18;
  const circumference = 2 * Math.PI * radius; // ~113.097
  const strokeDashoffset = circumference - (habitCompletionProgress / 100) * circumference;

  return (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p aria-hidden="true" className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">
            Progress Metrics
          </p>
          <h2 className="text-2xl font-black text-zinc-100 tracking-tight mt-0.5">Weekly Snapshot</h2>
        </div>
        <p className="text-sm text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 rounded-full px-4 py-1.5 backdrop-blur-md">
          Habit health: <span className="text-orange-400 font-semibold">{habitRateStatus}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Tasks Done */}
        <article
          aria-label={`${snapshot.tasksCompletedThisWeek} tasks completed this week`}
          className="group relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-950/40 backdrop-blur-md p-6 hover:scale-[1.02] active:scale-[0.99] transition-transform duration-300 cursor-pointer shadow-xl shadow-black/10"
        >
          {/* Custom Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                Tasks Done
              </p>
              <p className="text-4xl font-extrabold tracking-tight text-emerald-400">
                {snapshot.tasksCompletedThisWeek}
              </p>
              <p className="text-xs text-zinc-400 mt-1 font-medium">this week</p>
            </div>
            
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 shadow-inner relative overflow-hidden">
              <CheckSquare size={20} />
            </div>
          </div>

          <div className="relative z-10 mt-5 border-t border-zinc-800/60 pt-3">
            <p className="text-[11px] leading-relaxed text-zinc-500 font-medium">
              {snapshot.tasksCompletedThisWeek > 0 
                ? "Excellent progress! Keep building momentum." 
                : "No tasks completed yet. Complete a task to start!"}
            </p>
          </div>
        </article>

        {/* Card 2: Habit Rate */}
        <article
          aria-label={`${snapshot.habitCompletionRate}% habit completion rate today`}
          className="group relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-950/40 backdrop-blur-md p-6 hover:scale-[1.02] active:scale-[0.99] transition-transform duration-300 cursor-pointer shadow-xl shadow-black/10"
        >
          {/* Custom Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                Habit Rate
              </p>
              <p className="text-4xl font-extrabold tracking-tight text-orange-400">
                {snapshot.habitCompletionRate}%
              </p>
              <p className="text-xs text-zinc-400 mt-1 font-medium">completed today</p>
            </div>

            {/* Circular Progress Ring with Flame inside */}
            <div className="relative w-12 h-12 shrink-0 bg-orange-500/5 rounded-full border border-orange-500/10 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 absolute inset-0" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  className="stroke-zinc-800/50"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  className="stroke-orange-500 transition-[stroke-dashoffset] duration-500 ease-out"
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="relative z-10 text-orange-400 flex items-center justify-center">
                <Flame size={18} className="fill-orange-500/20" />
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-5 border-t border-zinc-800/60 pt-3">
            <p className="text-[11px] leading-relaxed text-zinc-500 font-medium">
              {snapshot.habitCompletionRate >= 80 
                ? "Outstanding! Keep maintaining consistency." 
                : "Complete your habits today to level this up."}
            </p>
          </div>
        </article>

        {/* Card 3: Best Streak */}
        <article
          aria-label={`${snapshot.bestStreak} ${snapshot.bestStreak === 1 ? "day" : "days"} best active streak`}
          className="group relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-950/40 backdrop-blur-md p-6 hover:scale-[1.02] active:scale-[0.99] transition-transform duration-300 cursor-pointer shadow-xl shadow-black/10"
        >
          {/* Custom Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                Best Streak
              </p>
              <p className="text-4xl font-extrabold tracking-tight text-indigo-400">
                {snapshot.bestStreak}
              </p>
              <p className="text-xs text-zinc-400 mt-1 font-medium">active days</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0 shadow-inner relative overflow-hidden">
              <Zap size={20} className="group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>

          <div className="relative z-10 mt-5 border-t border-zinc-800/60 pt-3">
            <p className="text-[11px] leading-relaxed text-zinc-500 font-medium">
              {streakStatus}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
