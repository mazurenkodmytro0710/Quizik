import { TestStats } from "@/lib/types";
import { getOptionLabel } from "@/lib/utils";
import { ProgressBar } from "./ProgressBar";
import { cn } from "@/lib/utils";

interface TestResultsProps {
  stats: TestStats;
  subjectTitle?: string;
  onRestart: () => void;
  onHome: () => void;
}

export function TestResults({ stats, subjectTitle, onRestart, onHome }: TestResultsProps) {
  const pct = stats.percentage;
  const grade = pct >= 90 ? "Vynikajúco!" : pct >= 70 ? "Dobrá práca" : pct >= 50 ? "Ujde to" : "Treba precvičiť";

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl bg-white/5 border border-white/10 p-6 text-center">
        {subjectTitle && <p className="text-violet-400 text-xs font-semibold uppercase tracking-[0.22em] mb-2">{subjectTitle}</p>}
        <p className="text-white/50 text-sm mb-1">Výsledok testu</p>
        <p className={cn("text-5xl font-black mb-1", pct >= 70 ? "text-emerald-400" : "text-red-400")}>{pct}%</p>
        <p className="text-white/70 text-sm font-medium">{grade}</p>
        <div className="mt-4">
          <ProgressBar value={pct} color={pct >= 70 ? "green" : "yellow"} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/5 p-3 text-center">
          <p className="text-white text-2xl font-bold">{stats.total}</p>
          <p className="text-white/50 text-xs">Otázok</p>
        </div>
        <div className="rounded-2xl bg-emerald-500/10 p-3 text-center">
          <p className="text-emerald-400 text-2xl font-bold">{stats.correct}</p>
          <p className="text-white/50 text-xs">Správne</p>
        </div>
        <div className="rounded-2xl bg-red-500/10 p-3 text-center">
          <p className="text-red-400 text-2xl font-bold">{stats.wrong}</p>
          <p className="text-white/50 text-xs">Chyby</p>
        </div>
      </div>

      {stats.mistakes.length > 0 && (
        <div>
          <p className="text-white/70 text-sm font-semibold mb-3">Chybné odpovede ({stats.mistakes.length})</p>
          <div className="flex flex-col gap-3">
            {stats.mistakes.map(({ question, selected, correct }) => (
              <div key={question.id} className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
                <p className="text-white/90 text-sm font-medium mb-2">{question.text}</p>
                {question.type !== "matching" && (
                  <>
                    <p className="text-xs text-red-400">
                      Tvoja odpoveď: <span className="font-semibold">{selected.join(", ") || "—"}</span>
                    </p>
                    <p className="text-xs text-emerald-400">
                      Správna odpoveď: <span className="font-semibold">{correct.join(", ")}</span>
                    </p>
                  </>
                )}
                {question.type === "matching" && question.pairs ? (
                  <div className="mt-2 flex flex-col gap-1">
                    {question.pairs.map((pair) => (
                      <p key={pair.id} className="text-xs text-white/40">
                        {pair.left} → <span className="text-emerald-400">{pair.right}</span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 flex flex-col gap-1">
                    {correct.map((cId) => (
                      <p key={cId} className="text-xs text-white/40">
                        {cId}: {getOptionLabel(question, cId)}
                      </p>
                    ))}
                  </div>
                )}
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
