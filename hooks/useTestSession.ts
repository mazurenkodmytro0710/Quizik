"use client";
import { useState, useCallback } from "react";
import { TestSession, TestStats, TestAnswer, Question } from "@/lib/types";
import { createTestSession, calcTestStats } from "@/lib/testEngine";
import { checkAnswer } from "@/lib/answerChecker";

export function useTestSession(allQuestions: Question[]) {
  const [session, setSession] = useState<TestSession | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswers: string[] } | null>(null);
  const [stats, setStats] = useState<TestStats | null>(null);

  const start = useCallback((count: number) => {
    setSession(createTestSession(allQuestions, count));
    setFeedback(null);
    setStats(null);
  }, [allQuestions]);

  const submit = useCallback((selectedAnswers: string[]) => {
    setSession((prev) => {
      if (!prev) return prev;
      const q = prev.questions[prev.currentIndex];
      const isCorrect = checkAnswer(q, selectedAnswers);
      const answer: TestAnswer = { questionId: q.id, selectedAnswers, isCorrect };
      // Record the answer but DON'T advance currentIndex yet — wait for advance()
      const next = { ...prev, answers: [...prev.answers, answer] };
      setFeedback({ isCorrect, correctAnswers: q.correctAnswers });
      return next;
    });
  }, []);

  const advance = useCallback(() => {
    setFeedback(null);
    setSession((prev) => {
      if (!prev) return prev;
      const nextIndex = prev.currentIndex + 1;
      const finished = nextIndex >= prev.questions.length;
      const next = { ...prev, currentIndex: nextIndex, finished };
      if (finished) {
        setStats(calcTestStats(next));
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSession(null);
    setFeedback(null);
    setStats(null);
  }, []);

  return { session, feedback, stats, start, submit, advance, reset };
}
