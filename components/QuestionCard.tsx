"use client";
import { useMemo, useState } from "react";
import { MatchingPair, Question } from "@/lib/types";
import { AnswerOption } from "./AnswerOption";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  onSubmit: (selected: string[]) => void;
  feedback: { isCorrect: boolean; correctAnswers: string[] } | null;
  onAdvance: () => void;
  header?: React.ReactNode;
}

// ─── Matching sub-component ────────────────────────────────────────────────

interface MatchingCardProps {
  pairs: MatchingPair[];
  feedback: { isCorrect: boolean; correctAnswers: string[] } | null;
  onChange: (encoded: string[]) => void;
}

function MatchingCard({ pairs, feedback, onChange }: MatchingCardProps) {
  // Shuffle right options once on mount
  const rightOptions = useMemo(
    () => [...pairs.map((p) => p.right)].sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pairs.map((p) => p.id).join(",")]
  );

  const [selections, setSelections] = useState<Record<string, string>>({});

  const handleSelect = (pairId: string, value: string) => {
    if (feedback) return;
    const next = { ...selections, [pairId]: value };
    setSelections(next);
    // Encode as ["pairId:rightText", …]
    const encoded = Object.entries(next)
      .filter(([, v]) => v !== "")
      .map(([id, right]) => `${id}:${right}`);
    onChange(encoded);
  };

  return (
    <div className="flex flex-col gap-3">
      {pairs.map((pair) => {
        const selected = selections[pair.id] ?? "";
        const correctRight = pair.right;

        let rowState: "neutral" | "correct" | "wrong" = "neutral";
        if (feedback) {
          rowState = selected === correctRight ? "correct" : "wrong";
        }

        return (
          <div key={pair.id} className="flex items-center gap-2">
            {/* Left item */}
            <div className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-white">
              {pair.left}
            </div>

            {/* Arrow */}
            <span className="shrink-0 text-white/30 text-base">→</span>

            {/* Right select */}
            <div
              className={cn(
                "flex-1 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                rowState === "correct"
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                  : rowState === "wrong"
                  ? "border-red-500/50 bg-red-500/10 text-red-300"
                  : "border-white/10 bg-white/5 text-white"
              )}
            >
              {feedback ? (
                <span>{selected || "—"}</span>
              ) : (
                <select
                  value={selected}
                  onChange={(e) => handleSelect(pair.id, e.target.value)}
                  className="w-full bg-transparent outline-none text-inherit cursor-pointer"
                >
                  <option value="">Vyber…</option>
                  {rightOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-zinc-900 text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Correct badge when wrong */}
            {feedback && rowState === "wrong" && (
              <div className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-300">
                ✓ {correctRight}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main QuestionCard ─────────────────────────────────────────────────────

export function QuestionCard({ question, onSubmit, feedback, onAdvance, header }: QuestionCardProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (id: string) => {
    if (feedback) return;
    if (question.type === "single" || question.type === "truefalse") {
      setSelected([id]);
    } else {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0 || feedback) return;
    onSubmit(selected);
  };

  const handleAdvance = () => {
    setSelected([]);
    onAdvance();
  };

  const isMatching = question.type === "matching";
  const allPairsSelected =
    isMatching && question.pairs
      ? selected.length === question.pairs.length
      : false;

  const canSubmit = isMatching ? allPairsSelected : selected.length > 0;

  const typeLabel =
    question.type === "multiple"
      ? "Vyber všetky správne odpovede"
      : question.type === "truefalse"
      ? "Pravda alebo Nepravda?"
      : question.type === "matching"
      ? "Spoj správne dvojice"
      : "Vyber správnu odpoveď";

  return (
    <div className="flex flex-col gap-4">
      {header}

      <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
        <p className="text-xs text-violet-400 font-semibold mb-2 uppercase tracking-wide">{typeLabel}</p>
        <p className="text-white font-semibold text-base leading-snug">{question.text}</p>
        {question.topic && (
          <span className="mt-2 inline-block text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
            {question.topic}
          </span>
        )}
      </div>

      {/* Matching UI */}
      {isMatching && question.pairs && (
        <MatchingCard
          pairs={question.pairs}
          feedback={feedback}
          onChange={setSelected}
        />
      )}

      {/* Standard options */}
      {!isMatching && (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => {
            const isSelected = selected.includes(opt.id);
            const isCorrect = !!feedback && feedback.correctAnswers.includes(opt.id);
            const isWrong = !!feedback && isSelected && !feedback.correctAnswers.includes(opt.id);
            const optionLabel = opt.id === "true" ? "T" : opt.id === "false" ? "N" : opt.id;
            return (
              <AnswerOption
                key={opt.id}
                label={optionLabel}
                text={opt.text}
                selected={isSelected}
                disabled={!!feedback}
                isCorrect={isCorrect}
                isWrong={isWrong}
                onClick={() => toggleOption(opt.id)}
              />
            );
          })}
        </div>
      )}

      {!feedback && (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "w-full py-3.5 rounded-2xl font-semibold text-sm transition-all",
            canSubmit
              ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40"
              : "bg-white/5 text-white/25 cursor-not-allowed"
          )}
        >
          Potvrdiť odpoveď
        </button>
      )}

      {feedback && (
        <div className={cn(
          "rounded-2xl px-4 py-3 flex flex-col gap-1 border",
          feedback.isCorrect
            ? "bg-emerald-500/15 border-emerald-500/30"
            : "bg-red-500/15 border-red-500/30"
        )}>
          <p className={cn("font-bold text-sm", feedback.isCorrect ? "text-emerald-400" : "text-red-400")}>
            {feedback.isCorrect ? "Správne!" : "Nesprávne"}
          </p>
          {!feedback.isCorrect && !isMatching && (
            <p className="text-xs text-white/60">
              Správne: <span className="text-emerald-400 font-medium">{feedback.correctAnswers.join(", ")}</span>
            </p>
          )}
          {question.explanation && (
            <p className="text-xs text-white/50 mt-1">{question.explanation}</p>
          )}
        </div>
      )}

      {feedback && (
        <button
          onClick={handleAdvance}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white transition-all"
        >
          Ďalej →
        </button>
      )}
    </div>
  );
}
