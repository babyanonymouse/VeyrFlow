import { Sparkles } from "lucide-react";

export default function AiIntelligenceSlot() {
  return (
    <div className="relative overflow-hidden p-6 rounded-2xl border border-teal-500/20 bg-linear-to-br from-indigo-500/5 to-teal-500/5">
      {/* Subtle Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/10 blur-3xl rounded-full pointer-events-none" />
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 ring-1 ring-inset ring-teal-500/20 shrink-0">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-teal-300 mb-1.5">Intelligence</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            AI is analyzing your patterns... check back tomorrow for suggestions.
          </p>
        </div>
      </div>
    </div>
  );
}
