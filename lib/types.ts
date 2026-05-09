export type QuestionType = "single" | "multiple" | "truefalse";

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options: Option[];
  correctAnswers: string[];
  topic?: string;
  explanation?: string;
}

// Test Mode
export interface TestAnswer {
  questionId: number;
  selectedAnswers: string[];
  isCorrect: boolean;
  timeSpent?: number;
}

export interface TestSession {
  questions: Question[];
  answers: TestAnswer[];
  currentIndex: number;
  startedAt: number;
  finished: boolean;
}

export interface TestStats {
  total: number;
  correct: number;
  wrong: number;
  percentage: number;
  mistakes: Array<{
    question: Question;
    selected: string[];
    correct: string[];
  }>;
  durationSeconds: number;
}

// Learn Mode
export interface LearnAnswer {
  questionId: number;
  selectedAnswers: string[];
  isCorrect: boolean;
  attemptNumber: number;
}

export interface LearnBlock {
  blockNumber: number;
  originalQuestions: Question[];
  queue: Question[];
  completedIds: Set<number>;
  answers: LearnAnswer[];
}

export interface LearnSession {
  allQuestions: Question[];
  blocks: LearnBlock[];
  currentBlockIndex: number;
  currentQueue: Question[];
  currentQueueIndex: number;
  allAnswers: LearnAnswer[];
  phase: "block" | "review" | "done";
  reviewQuestions: Question[];
  reviewQueue: Question[];
  reviewAnswers: LearnAnswer[];
  startedAt: number;
}

export interface LearnStats {
  total: number;
  totalAttempts: number;
  originalWrong: number;
  repeated: number;
  accuracy: number;
  mostMissed: Array<{ question: Question; missCount: number }>;
  completedBlocks: number;
  finalReviewPassed: boolean;
}

export type AppMode = "home" | "test" | "learn";
export type StudyMode = "test" | "learn";
