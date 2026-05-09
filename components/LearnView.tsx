"use client";
import { useEffect } from "react";
import { useLearnSession } from "@/hooks/useLearnSession";
import { Question } from "@/lib/types";
import { QuestionCard } from "./QuestionCard";
import { LearnResults } from "./LearnResults";
import { ProgressBar } from "./ProgressBar";
import { cn } from "@/lib/utils";

interface LearnViewProps {
  allQuestions: Question[];
  initialCount: number;
  subjectTitle: string;
  onHome: () => void;
}

export function LearnView({ allQuestions, initialCount, subjectTitle, onHome }: LearnViewProps) {
  const { session, feedback, stats, currentQuestion, blockProgress, start, submit, advance } =
    useLearnSession(allQuestions);

  useEffect(() => {
    start(initialCount);
  }, [initialCount, start]);

  if (!session) return null;

  if (stats) {
    return (
      <main className="min-h-screen flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md">
          <LearnResults
            stats={stats}
            subjectTitle={subjectTitle}
            onRestart={() => start(initialCount)}
            onHome={onHome}
          />
        </div>
      </main>
    );
  }

  if (!currentQuestion) return null;

  const isReview = session.phase === "review";

  const blockPct = blockProgress
    ? (blockProgress.completedInBlock / blockProgress.totalInBlock) * 100
    : 0;

  const reviewTotal = session.reviewQuestions.length;
  const reviewDone = reviewTotal - session.reviewQueue.length;
  const reviewPct = reviewTotal > 0 ? (reviewDone / reviewTotal) * 100 : 0;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-md flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={onHome} className="text-white/40 hover:text-white text-sm">✕</button>
          <div className="text-center">
            <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-white/35">{subjectTitle}</p>
            {isReview ? (
              <span className="text-amber-400 text-xs font-semibold bg-amber-500/10 px-3 py-1 rounded-full">
                FINÁLNE KOLO {reviewDone + 1}/{reviewTotal}
              </span>
            ) : blockProgress ? (
              <span className="text-violet-400 text-xs font-semibold bg-violet-500/10 px-3 py-1 rounded-full">
                BLOK {blockProgress.blockNum}/{blockProgress.totalBlocks}
              </span>
            ) : null}
          </div>
          <span className="text-white/40 text-xs font-semibold bg-white/5 px-2 py-1 rounded-full">
            LEARN
          </span>
        </div>

        {/* Block progress */}
        {!isReview && blockProgress && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-white/40">
              <span>Blok {blockProgress.blockNum} z {blockProgress.totalBlocks}</span>
              <span>{blockProgress.completedInBlock}/{blockProgress.totalInBlock} hotových</span>
            </div>
            <ProgressBar value={blockPct} color="primary" />
          </div>
        )}

        {isReview && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-white/40">
              <span>Finálne kolo opakovaní</span>
              <span>{reviewDone}/{reviewTotal}</span>
            </div>
            <ProgressBar value={reviewPct} color="yellow" />
          </div>
        )}

        {/* Block indicators */}
        {!isReview && blockProgress && blockProgress.totalBlocks > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            {session.blocks.map((b, i) => {
              const isCurrentBlock = i === session.currentBlockIndex;
              const isDone = i < session.currentBlockIndex;
              return (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full min-w-[20px]",
                    isDone && "bg-emerald-500",
                    isCurrentBlock && "bg-violet-500",
                    !isDone && !isCurrentBlock && "bg-white/10"
                  )}
                />
              );
            })}
          </div>
        )}

        <QuestionCard
          key={`${currentQuestion.id}-${session.allAnswers.length}`}
          question={currentQuestion}
          onSubmit={submit}
          feedback={feedback}
          onAdvance={advance}
        />
      </div>
    </main>
  );
}
