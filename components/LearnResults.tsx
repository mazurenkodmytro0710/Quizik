import { LearnStats } from "@/lib/types";
import { ProgressBar } from "./ProgressBar";
import { cn } from "@/lib/utils";

interface LearnResultsProps {
  stats: LearnStats;
  subjectTitle?: string;
  onRestart: () => void;
  onHome: () => void;
}

export function LearnResults({ stats, subjectTitle, onRestart, onHome }: LearnResultsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl bg-white/5 border border-white/10 p-6 text-center">
        {subjectTitle && <p className="text-violet-400 text-xs font-semibold uppercase tracking-[0.22em] mb-2">{subjectTitle}</p>}
        <p className="text-white/50 text-sm mb-1">Learn Mode dokončený!</p>
        <p className={cn("text-5xl font-black mb-1", stats.accuracy >= 70 ? "text-emerald-400" : "text-amber-400")}>
          {stats.accuracy}%
        </p>
        <p className="text-white/60 text-sm">presnosť</p>
        <div className="mt-4">
          <ProgressBar value={stats.accuracy} color={stats.accuracy >= 70 ? "green" : "yellow"} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/5 p-3 text-center">
          <p className="text-white text-2xl font-bold">{stats.total}</p>
          <p className="text-white/50 text-xs">Otázok</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3 text-center">
          <p className="text-white text-2xl font-bold">{stats.totalAttempts}</p>
          <p className="text-white/50 text-xs">Pokusov celkom</p>
        </div>
        <div className="rounded-2xl bg-red-500/10 p-3 text-center">
          <p className="text-red-400 text-2xl font-bold">{stats.originalWrong}</p>
          <p className="text-white/50 text-xs">Chybných otázok</p>
        </div>
        <div className="rounded-2xl bg-amber-500/10 p-3 text-center">
          <p className="text-amber-400 text-2xl font-bold">{stats.repeated}</p>
          <p className="text-white/50 text-xs">Opakovaní</p>
        </div>
        <div className="rounded-2xl bg-violet-500/10 p-3 text-center col-span-2">
          <p className="text-violet-400 text-2xl font-bold">{stats.completedBlocks}</p>
          <p className="text-white/50 text-xs">Blokov dokončených</p>
        </div>
      </div>

      {stats.mostMissed.length > 0 && (
        <div>
          <p className="text-white/70 text-sm font-semibold mb-3">Najčastejšie chyby</p>
          <div className="flex flex-col gap-2">
            {stats.mostMissed.map(({ question, missCount }) => (
              <div key={question.id} className="rounded-2xl bg-white/5 border border-white/10 p-3 flex justify-between items-start gap-2">
                <p className="text-white/80 text-xs flex-1 leading-snug">{question.text}</p>
                <span className="shrink-0 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                  {missCount}×
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onHome}
          className="flex-1 py-3.5 rounded-2xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white transition-all"
        >
          Domov
        </button>
        <button
          onClick={onRestart}
          className="flex-1 py-3.5 rounded-2xl font-semibold text-sm bg-violet-600 hover:bg-violet-500 text-white transition-all"
        >
          Znova
        </button>
      </div>
    </div>
  );
}
