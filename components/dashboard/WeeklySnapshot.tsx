import { CheckSquare, Flame, Zap } from "lucide-react";

export type WeeklySnapshotData = {
  tasksCompletedThisWeek: number;
  habitCompletionRate: number;
  bestStreak: number;
};

const tiles = [
  {
    key: "tasksCompletedThisWeek" as const,
    label: "Tasks Done",
    sublabel: "this week",
    icon: CheckSquare,
    color: "text-emerald-400",
    ring: "ring-emerald-500/20",
    bg: "bg-emerald-500/10",
    glow: "bg-emerald-500/5",
    format: (v: number) => String(v),
  },
  {
    key: "habitCompletionRate" as const,
    label: "Habit Rate",
    sublabel: "today",
    icon: Flame,
    color: "text-orange-400",
    ring: "ring-orange-500/20",
    bg: "bg-orange-500/10",
    glow: "bg-orange-500/5",
    format: (v: number) => `${v}%`,
  },
  {
    key: "bestStreak" as const,
    label: "Best Streak",
    sublabel: "active days",
    icon: Zap,
    color: "text-indigo-400",
    ring: "ring-indigo-500/20",
    bg: "bg-indigo-500/10",
    glow: "bg-indigo-500/5",
    format: (v: number) => String(v),
  },
];

export default function WeeklySnapshot({
  snapshot,
}: {
  snapshot: WeeklySnapshotData;
}) {
  const habitRateStatus =
    snapshot.habitCompletionRate >= 80
      ? "Excellent consistency"
      : snapshot.habitCompletionRate >= 50
        ? "Good momentum"
        : snapshot.habitCompletionRate > 0
          ? "Keep building your rhythm"
          : "Start with one easy win today";

  const streakStatus =
    snapshot.bestStreak > 0
      ? `${snapshot.bestStreak}-day active streak window`
      : "No active streak yet";

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Performance Pulse</p>
          <h2 className="text-xl font-semibold text-zinc-100">Weekly Snapshot</h2>
        </div>
        <p className="text-sm text-zinc-400">
          Habit health: <span className="text-orange-300 font-medium">{habitRateStatus}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tiles.map(({ key, label, sublabel, icon: Icon, color, ring, bg, glow, format }) => (
          <article
            key={key}
            aria-label={`${label}: ${format(snapshot[key])} ${sublabel}`}
            className="relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 p-5 transition-colors hover:border-zinc-700"
          >
            <div
              className={`absolute -top-6 -right-6 w-24 h-24 ${glow} blur-2xl rounded-full pointer-events-none`}
            />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">
                  {label}
                </p>
                <p className={`text-3xl font-bold tracking-tight ${color}`}>
                  {format(snapshot[key])}
                </p>
                <p className="text-xs text-zinc-600 mt-0.5">{sublabel}</p>
                {key === "bestStreak" && (
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">{streakStatus}</p>
                )}
              </div>
              <div className={`p-2 rounded-xl ${bg} ring-1 ${ring} shrink-0`}>
                <Icon size={18} className={color} />
              </div>
            </div>

            {key === "habitCompletionRate" && (
              <div className="relative z-10 mt-3">
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-400 transition-all"
                    style={{ width: `${Math.max(0, Math.min(100, snapshot.habitCompletionRate))}%` }}
                  />
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
