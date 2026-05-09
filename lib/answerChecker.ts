import { Question } from "./types";
import { arraysEqualUnordered } from "./utils";

export function checkAnswer(question: Question, selected: string[]): boolean {
  return arraysEqualUnordered(selected, question.correctAnswers);
}
