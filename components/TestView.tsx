"use client";
import { useEffect } from "react";
import { useTestSession } from "@/hooks/useTestSession";
import { Question } from "@/lib/types";
import { QuestionCard } from "./QuestionCard";
import { TestResults } from "./TestResults";
import { ProgressBar } from "./ProgressBar";

interface TestViewProps {
  allQuestions: Question[];
  initialCount: number;
  subjectTitle: string;
  onHome: () => void;
}

export function TestView({ allQuestions, initialCount, subjectTitle, onHome }: TestViewProps) {
  const { session, feedback, stats, start, submit, advance } = useTestSession(allQuestions);

  useEffect(() => {
    start(initialCount);
  }, [initialCount, start]);

  if (stats) {
    return (
      <main className="min-h-screen flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md">
          <TestResults
            stats={stats}
            subjectTitle={subjectTitle}
            onRestart={() => start(initialCount)}
            onHome={onHome}
          />
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-white/40">Načítavam...</p>
      </main>
    );
  }

  const q = session.questions[session.currentIndex];
  if (!q) return null;

  const total = session.questions.length;
  const progress = (session.currentIndex / total) * 100;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-md flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <button onClick={onHome} className="text-white/40 hover:text-white text-sm">✕</button>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">{subjectTitle}</p>
            <span className="text-white/60 text-sm font-medium">
              {session.currentIndex + 1} / {total}
            </span>
          </div>
          <span className="text-violet-400 text-xs font-semibold bg-violet-500/10 px-2 py-1 rounded-full">
            TEST
          </span>
        </div>

        <ProgressBar value={progress} />

        <QuestionCard
          key={q.id}
          question={q}
          onSubmit={submit}
          feedback={feedback}
          onAdvance={advance}
        />
      </div>
    </main>
  );
}
