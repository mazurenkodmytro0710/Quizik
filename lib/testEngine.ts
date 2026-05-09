import { Question, TestAnswer, TestSession, TestStats } from "./types";
import { pickRandom } from "./utils";
import { checkAnswer } from "./answerChecker";

export function createTestSession(allQuestions: Question[], count: number): TestSession {
  return {
    questions: pickRandom(allQuestions, count),
    answers: [],
    currentIndex: 0,
    startedAt: Date.now(),
    finished: false,
  };
}

export function submitTestAnswer(
  session: TestSession,
  selectedAnswers: string[]
): TestSession {
  const q = session.questions[session.currentIndex];
  const isCorrect = checkAnswer(q, selectedAnswers);
  const answer: TestAnswer = {
    questionId: q.id,
    selectedAnswers,
    isCorrect,
  };
  const answers = [...session.answers, answer];
  const nextIndex = session.currentIndex + 1;
  const finished = nextIndex >= session.questions.length;
  return { ...session, answers, currentIndex: nextIndex, finished };
}

export function calcTestStats(session: TestSession): TestStats {
  const durationSeconds = Math.round((Date.now() - session.startedAt) / 1000);
  const correct = session.answers.filter((a) => a.isCorrect).length;
  const wrong = session.answers.length - correct;
  const mistakes = session.answers
    .filter((a) => !a.isCorrect)
    .map((a) => {
      const question = session.questions.find((q) => q.id === a.questionId)!;
      return {
        question,
        selected: a.selectedAnswers,
        correct: question.correctAnswers,
      };
    });
  return {
    total: session.questions.length,
    correct,
    wrong,
    percentage: Math.round((correct / session.questions.length) * 100),
    mistakes,
    durationSeconds,
  };
}
