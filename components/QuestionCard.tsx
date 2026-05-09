"use client";
import { useState } from "react";
import { Question } from "@/lib/types";
import { AnswerOption } from "./AnswerOption";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  onSubmit: (selected: string[]) => void;
  feedback: { isCorrect: boolean; correctAnswers: string[] } | null;
  onAdvance: () => void;
  header?: React.ReactNode;
}

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

  const typeLabel =
    question.type === "multiple"
      ? "Vyber všetky správne odpovede"
      : question.type === "truefalse"
      ? "Pravda alebo Nepravda?"
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

      {!feedback && (
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className={cn(
            "w-full py-3.5 rounded-2xl font-semibold text-sm transition-all",
            selected.length > 0
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
          {!feedback.isCorrect && (
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
