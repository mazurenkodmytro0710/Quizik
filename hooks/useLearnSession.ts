"use client";
import { useState, useCallback, useRef } from "react";
import { LearnSession, LearnStats, LearnAnswer, Question } from "@/lib/types";
import {
  createLearnSession,
  getCurrentLearnQuestion,
  calcLearnStats,
} from "@/lib/learnEngine";
import { checkAnswer } from "@/lib/answerChecker";
import { shuffle } from "@/lib/utils";

const DELAY_WRONG = 3;

export function useLearnSession(allQuestions: Question[]) {
  const [session, setSession] = useState<LearnSession | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswers: string[] } | null>(null);
  const [stats, setStats] = useState<LearnStats | null>(null);
  const pendingRef = useRef<LearnSession | null>(null);

  const start = useCallback((count: number) => {
    setSession(createLearnSession(allQuestions, count));
    setFeedback(null);
    setStats(null);
    pendingRef.current = null;
  }, [allQuestions]);

  const submit = useCallback((selectedAnswers: string[]) => {
    setSession((prev) => {
      if (!prev) return prev;
      const q = getCurrentLearnQuestion(prev)!;
      const isCorrect = checkAnswer(q, selectedAnswers);
      const attemptNumber = prev.allAnswers.filter((a) => a.questionId === q.id).length + 1;
      const answer: LearnAnswer = { questionId: q.id, selectedAnswers, isCorrect, attemptNumber };

      const withAnswer = { ...prev, allAnswers: [...prev.allAnswers, answer] };
      const next = applyLearnAnswer(prev, q, isCorrect, [...prev.allAnswers, answer]);

      setFeedback({ isCorrect, correctAnswers: q.correctAnswers });
      pendingRef.current = next;

      return withAnswer;
    });
  }, []);

  const advance = useCallback(() => {
    setFeedback(null);
    const next = pendingRef.current;
    pendingRef.current = null;
    if (next) {
      if (next.phase === "done") {
        setStats(calcLearnStats(next));
      }
      setSession(next);
    }
  }, []);

  const reset = useCallback(() => {
    setSession(null);
    setFeedback(null);
    setStats(null);
    pendingRef.current = null;
  }, []);

  const currentQuestion = session ? getCurrentLearnQuestion(session) : null;

  const blockProgress = session && session.phase === "block"
    ? {
        blockNum: session.currentBlockIndex + 1,
        totalBlocks: session.blocks.length,
        completedInBlock: session.blocks[session.currentBlockIndex].completedIds.size,
        totalInBlock: session.blocks[session.currentBlockIndex].originalQuestions.length,
      }
    : null;

  return { session, feedback, stats, currentQuestion, blockProgress, start, submit, advance, reset };
}

function applyLearnAnswer(
  session: LearnSession,
  question: Question,
  isCorrect: boolean,
  allAnswers: LearnAnswer[]
): LearnSession {
  if (session.phase === "block") {
    return applyBlockAnswer(session, question, isCorrect, allAnswers);
  }
  if (session.phase === "review") {
    return applyReviewAnswer(session, question, isCorrect, allAnswers);
  }
  return session;
}

function applyBlockAnswer(
  session: LearnSession,
  question: Question,
  isCorrect: boolean,
  allAnswers: LearnAnswer[]
): LearnSession {
  const block = { ...session.blocks[session.currentBlockIndex] };
  block.completedIds = new Set(block.completedIds);
  let newQueue = [...session.currentQueue];

  if (isCorrect) {
    newQueue = newQueue.filter((q) => q.id !== question.id);
    block.completedIds.add(question.id);
  } else {
    newQueue = newQueue.filter((q) => q.id !== question.id);
    const insertAt = Math.min(DELAY_WRONG, newQueue.length);
    newQueue.splice(insertAt, 0, question);
  }

  const updatedBlocks = session.blocks.map((b, i) =>
    i === session.currentBlockIndex ? block : b
  );

  const blockDone = block.originalQuestions.every((q) => block.completedIds.has(q.id));

  if (!blockDone) {
    return { ...session, blocks: updatedBlocks, currentQueue: newQueue, allAnswers };
  }

  const nextBlockIndex = session.currentBlockIndex + 1;
  if (nextBlockIndex < session.blocks.length) {
    const nextBlock = session.blocks[nextBlockIndex];
    return {
      ...session,
      blocks: updatedBlocks,
      currentBlockIndex: nextBlockIndex,
      currentQueue: [...nextBlock.originalQuestions],
      currentQueueIndex: 0,
      allAnswers,
    };
  }

  // All blocks done — compute review
  const wrongIds = new Set(allAnswers.filter((a) => !a.isCorrect).map((a) => a.questionId));
  const reviewQuestions = session.allQuestions.filter((q) => wrongIds.has(q.id));
  const reviewQueue = shuffle([...reviewQuestions]);

  return {
    ...session,
    blocks: updatedBlocks,
    allAnswers,
    phase: reviewQuestions.length > 0 ? "review" : "done",
    reviewQuestions,
    reviewQueue,
  };
}

function applyReviewAnswer(
  session: LearnSession,
  question: Question,
  isCorrect: boolean,
  allAnswers: LearnAnswer[]
): LearnSession {
  const newReviewQueue = [...session.reviewQueue];
  const lastAnswer = allAnswers[allAnswers.length - 1];
  const reviewAnswers = [...session.reviewAnswers, lastAnswer];

  if (isCorrect) {
    newReviewQueue.shift();
  } else {
    newReviewQueue.shift();
    const insertAt = Math.min(DELAY_WRONG, newReviewQueue.length);
    newReviewQueue.splice(insertAt, 0, question);
  }

  const done = newReviewQueue.length === 0;
  return {
    ...session,
    allAnswers,
    reviewQueue: newReviewQueue,
    reviewAnswers,
    phase: done ? "done" : "review",
  };
}
