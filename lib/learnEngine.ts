import { Question, LearnAnswer, LearnBlock, LearnSession, LearnStats } from "./types";
import { pickRandom, shuffle } from "./utils";
import { checkAnswer } from "./answerChecker";

const BLOCK_SIZE = 7;
const DELAY_WRONG = 3; // wrong question delayed by this many positions

export function createLearnSession(allQuestions: Question[], count: number): LearnSession {
  const selected = pickRandom(allQuestions, count);
  const blocks = chunkIntoBlocks(selected);
  const firstBlock = blocks[0];
  return {
    allQuestions: selected,
    blocks,
    currentBlockIndex: 0,
    currentQueue: [...firstBlock.originalQuestions],
    currentQueueIndex: 0,
    allAnswers: [],
    phase: "block",
    reviewQuestions: [],
    reviewQueue: [],
    reviewAnswers: [],
    startedAt: Date.now(),
  };
}

function chunkIntoBlocks(questions: Question[]): LearnBlock[] {
  const blocks: LearnBlock[] = [];
  for (let i = 0; i < questions.length; i += BLOCK_SIZE) {
    const chunk = questions.slice(i, i + BLOCK_SIZE);
    blocks.push({
      blockNumber: blocks.length + 1,
      originalQuestions: chunk,
      queue: [...chunk],
      completedIds: new Set(),
      answers: [],
    });
  }
  return blocks;
}

export function getCurrentLearnQuestion(session: LearnSession): Question | null {
  if (session.phase === "block") {
    return session.currentQueue[session.currentQueueIndex] ?? null;
  }
  if (session.phase === "review") {
    return session.reviewQueue[0] ?? null;
  }
  return null;
}

export function submitLearnAnswer(
  session: LearnSession,
  selectedAnswers: string[]
): LearnSession {
  if (session.phase === "block") {
    return handleBlockAnswer(session, selectedAnswers);
  }
  if (session.phase === "review") {
    return handleReviewAnswer(session, selectedAnswers);
  }
  return session;
}

function handleBlockAnswer(session: LearnSession, selectedAnswers: string[]): LearnSession {
  const block = session.blocks[session.currentBlockIndex];
  const question = session.currentQueue[session.currentQueueIndex];
  const isCorrect = checkAnswer(question, selectedAnswers);
  const attemptNumber = session.allAnswers.filter((a) => a.questionId === question.id).length + 1;

  const answer: LearnAnswer = { questionId: question.id, selectedAnswers, isCorrect, attemptNumber };
  const allAnswers = [...session.allAnswers, answer];

  const newQueue = [...session.currentQueue];

  if (isCorrect) {
    // remove from queue, mark completed
    newQueue.splice(session.currentQueueIndex, 1);
    block.completedIds.add(question.id);
  } else {
    // remove from current position, insert DELAY_WRONG positions later
    newQueue.splice(session.currentQueueIndex, 1);
    const insertAt = Math.min(session.currentQueueIndex + DELAY_WRONG, newQueue.length);
    newQueue.splice(insertAt, 0, question);
  }

  const blockDone = block.originalQuestions.every((q) => block.completedIds.has(q.id));

  if (!blockDone) {
    const nextIndex = isCorrect ? session.currentQueueIndex % (newQueue.length || 1) : session.currentQueueIndex;
    return { ...session, currentQueue: newQueue, currentQueueIndex: Math.min(nextIndex, newQueue.length - 1), allAnswers };
  }

  // Block done — move to next block or review
  const nextBlockIndex = session.currentBlockIndex + 1;
  if (nextBlockIndex < session.blocks.length) {
    const nextBlock = session.blocks[nextBlockIndex];
    return {
      ...session,
      currentBlockIndex: nextBlockIndex,
      currentQueue: [...nextBlock.originalQuestions],
      currentQueueIndex: 0,
      allAnswers,
    };
  }

  // All blocks done — compute review questions
  const wrongIds = new Set(
    allAnswers.filter((a) => !a.isCorrect).map((a) => a.questionId)
  );
  const reviewQuestions = session.allQuestions.filter((q) => wrongIds.has(q.id));
  const reviewQueue = shuffle(reviewQuestions);

  return {
    ...session,
    allAnswers,
    phase: reviewQuestions.length > 0 ? "review" : "done",
    reviewQuestions,
    reviewQueue,
  };
}

function handleReviewAnswer(session: LearnSession, selectedAnswers: string[]): LearnSession {
  const question = session.reviewQueue[0];
  const isCorrect = checkAnswer(question, selectedAnswers);
  const attemptNumber = session.allAnswers.filter((a) => a.questionId === question.id).length + 1;

  const answer: LearnAnswer = { questionId: question.id, selectedAnswers, isCorrect, attemptNumber };
  const reviewAnswers = [...session.reviewAnswers, answer];
  const allAnswers = [...session.allAnswers, answer];

  const newReviewQueue = [...session.reviewQueue];

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

export function calcLearnStats(session: LearnSession): LearnStats {
  const total = session.allQuestions.length;

  const originalWrong = session.reviewQuestions.length;

  // total attempts
  const totalAttempts = session.allAnswers.length;

  // repeated = answers beyond 1st attempt
  const attemptCountById: Record<number, number> = {};
  for (const a of session.allAnswers) {
    attemptCountById[a.questionId] = (attemptCountById[a.questionId] ?? 0) + 1;
  }
  const repeated = Object.values(attemptCountById).reduce((sum, c) => sum + Math.max(0, c - 1), 0);

  // accuracy = correct answers / total attempts
  const correctCount = session.allAnswers.filter((a) => a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 100;

  // most missed
  const missCountById: Record<number, number> = {};
  for (const a of session.allAnswers) {
    if (!a.isCorrect) {
      missCountById[a.questionId] = (missCountById[a.questionId] ?? 0) + 1;
    }
  }
  const mostMissed = Object.entries(missCountById)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, missCount]) => ({
      question: session.allQuestions.find((q) => q.id === Number(id))!,
      missCount,
    }));

  return {
    total,
    totalAttempts,
    originalWrong,
    repeated,
    accuracy,
    mostMissed,
    completedBlocks: session.blocks.length,
    finalReviewPassed: session.phase === "done",
  };
}
