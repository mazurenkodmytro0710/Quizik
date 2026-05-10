import { cache } from "react";
import questionsData from "@/data/questions.json";
import questionsNmData from "@/data/questions_nm.json";
import questionsRal100Data from "@/data/questions_ral100.json";
import questionsRalData from "@/data/questions_ral.json";
import { Question } from "./types";

export type SubjectId = "zsu" | "nm" | "ral100" | "ral";

export interface QuizSubject {
  id: SubjectId;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accent: "violet" | "emerald" | "amber" | "sky";
  questions: Question[];
}

export const getQuizSubjects = cache(async (): Promise<QuizSubject[]> => {
  return [
    {
      id: "zsu",
      title: "ZSÚ",
      subtitle: "Strojové učenie",
      description: "Pôvodný bank otázok, ktorý už v appke fungoval.",
      icon: "🛡️",
      accent: "violet",
      questions: questionsData as Question[],
    },
    {
      id: "nm",
      title: "Numerická matematika",
      subtitle: "Numerika a pravdepodobnosť",
      description: "Otázky z numerickej matematiky a teórie pravdepodobnosti.",
      icon: "∫",
      accent: "emerald",
      questions: questionsNmData as Question[],
    },
    {
      id: "ral100",
      title: "RAL 100%",
      subtitle: "Krátky RaL set",
      description: "Kompaktnejší set otázok z Riadenia a logistiky.",
      icon: "📦",
      accent: "amber",
      questions: questionsRal100Data as Question[],
    },
    {
      id: "ral",
      title: "RAL",
      subtitle: "Veľký RaL bank",
      description: "Rozšírený bank otázok z logistiky, plánovania a CSP.",
      icon: "🚚",
      accent: "sky",
      questions: questionsRalData as Question[],
    },
  ];
});
