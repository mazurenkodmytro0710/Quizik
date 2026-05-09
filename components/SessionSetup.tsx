"use client";
import { useState } from "react";
import { StudyMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SessionSetupProps {
  mode: StudyMode;
  maxQuestions: number;
  subjectTitle: string;
  subjectSubtitle?: string;
  onStart: (count: number) => void;
  onBack: () => void;
}

const BASE_PRESETS = [10, 20, 30, 40, 50, 75, 100];

export function SessionSetup({
  mode,
  maxQuestions,
  subjectTitle,
  subjectSubtitle,
  onStart,
  onBack,
}: SessionSetupProps) {
  const [count, setCount] = useState(() => Math.min(20, maxQuestions));

  const isTest = mode === "test";
  const presets = [...new Set([...BASE_PRESETS.filter((value) => value < maxQuestions), maxQuestions])];

  return (
    <div className="flex flex-col gap-6">
      <button onClick={onBack} className="self-start text-white/50 hover:text-white text-sm flex items-center gap-1">
        ← Späť
      </button>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">{subjectTitle}</p>
        <h2 className="text-white text-2xl font-bold">
          {isTest ? "Test Mode" : "Learn Mode"}
        </h2>
        <p className="text-white/50 text-sm mt-1">
          {isTest
            ? "Otestuj svoje vedomosti. Okamžitá spätná väzba, záverečná štatistika."
            : "Memoruj blokovým systémom. Chybné otázky sa opakujú."}
        </p>
        {subjectSubtitle && <p className="text-white/35 text-xs mt-2">{subjectSubtitle}</p>}
      </div>

      <div>
        <p className="text-white/70 text-sm font-medium mb-3">Počet otázok</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setCount(p)}
              className={cn(
                "py-2.5 rounded-2xl text-sm font-semibold border-2 transition-all",
                count === p
                  ? "border-violet-500 bg-violet-500/20 text-violet-300"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
              )}
            >
              {p === maxQuestions ? `Všetky (${p})` : p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={maxQuestions}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="flex-1 accent-violet-500"
          />
          <span className="text-white font-bold text-lg w-10 text-right">{count}</span>
        </div>
      </div>

      {mode === "learn" && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-300">
          <p className="font-semibold mb-1">Ako funguje Learn Mode</p>
          <ul className="text-amber-300/80 space-y-0.5 text-xs">
            <li>• Otázky sú rozdelené do blokov po 7</li>
            <li>• Chybné otázky sa opakujú s oneskorením</li>
            <li>• Blok je hotový keď všetky správne odpovedáš</li>
            <li>• Na záver finálne kolo všetkých chýb</li>
          </ul>
        </div>
      )}

      <button
        onClick={() => onStart(count)}
        className="w-full py-4 rounded-2xl font-bold text-base bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 transition-all"
      >
        Začať {isTest ? "Test" : "Učenie"}
      </button>
    </div>
  );
}
