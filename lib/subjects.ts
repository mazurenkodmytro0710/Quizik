import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import questionsData from "@/data/questions.json";
import questionsNmData from "@/data/questions_nm.json";
import questionsRal100Data from "@/data/questions_ral100.json";
import { Question, QuestionType } from "./types";

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

type ParsedOption = {
  id: string;
  text: string;
  correct: boolean;
};

type ParsedRalQuestion =
  | { kind: "ready"; question: Question }
  | {
      kind: "fallback";
      id: number;
      text: string;
      correctText: string;
      topic?: string;
    };

const MANUAL_RAL_QUESTIONS: Record<number, Omit<Question, "id">> = {
  9: {
    text: "Správne priraďte význam parametrov stratégií riadenia zásob (P1, P2).",
    type: "single",
    options: [
      { id: "a", text: "s = pravidelný časový interval, t = bod objednania, S = pevné množstvo, x = cieľová zásoba" },
      { id: "b", text: "s = bod objednania, t = pravidelný časový interval, S = cieľová úroveň zásob, x = pevné objednávacie množstvo" },
      { id: "c", text: "s = maximálna zásoba, t = minimálna zásoba, S = čas dodania, x = bezpečnostná zásoba" },
      { id: "d", text: "s = pevné množstvo, t = cieľová úroveň, S = bod objednania, x = perióda dopĺňania" },
    ],
    correctAnswers: ["b"],
    topic: "Riadenie zásob",
  },
  44: {
    text: "Ktorá z nasledujúcich metód nezaručuje optimálne riešenie, ale poskytuje suboptimálne riešenie v rozumnom čase?",
    type: "single",
    options: [
      { id: "a", text: "heuristická metóda" },
      { id: "b", text: "metóda vetvenia a medzí" },
      { id: "c", text: "simplexová metóda" },
      { id: "d", text: "bivalentné programovanie" },
    ],
    correctAnswers: ["a"],
    topic: "Celočíselné programovanie",
  },
  61: {
    text: "Čo je cieľom prognózovania v logistike?",
    type: "single",
    options: [
      { id: "a", text: "odhad predaja výrobkov v nasledujúcom období" },
      { id: "b", text: "riadenie stavu skladových zásob v reálnom čase" },
      { id: "c", text: "technické posúdenie výrobných strojov" },
      { id: "d", text: "plánovanie údržby dopravných trás" },
    ],
    correctAnswers: ["a"],
    topic: "Prognózovanie",
  },
  92: {
    text: "Aké typy vzdialeností možno použiť pri optimalizácii umiestnenia distribučného centra s presnými údajmi?",
    type: "single",
    options: [
      { id: "a", text: "euklidovskú, kvadrát euklidovskej, rektilineárnu a minimax vzdialenosť" },
      { id: "b", text: "iba pomerovo-indexovú a expertnú vzdialenosť" },
      { id: "c", text: "iba lineárnu a exponenciálnu vzdialenosť" },
      { id: "d", text: "len geografickú vzdialenosť podľa mapy" },
    ],
    correctAnswers: ["a"],
    topic: "Alokácia",
  },
  117: {
    text: "Aký je cieľ metódy CRAFT v kontexte priraďovacích problémov?",
    type: "single",
    options: [
      { id: "a", text: "nájsť najrýchlejšie riešenie" },
      { id: "b", text: "nájsť najlacnejšie riešenie bez ohľadu na kvalitu" },
      { id: "c", text: "optimalizovať permutáciu na základe kriteriálnej funkcie" },
      { id: "d", text: "minimalizovať počet permutácií potrebných na nájdenie riešenia" },
    ],
    correctAnswers: ["c"],
    topic: "Alokácia",
  },
  118: {
    text: "Čo sa hodnotí pre každú permutáciu v metóde CRAFT?",
    type: "single",
    options: [
      { id: "a", text: "počet existujúcich objektov" },
      { id: "b", text: "náklady na prepravu medzi objektmi" },
      { id: "c", text: "hodnota kriteriálnej funkcie" },
      { id: "d", text: "matica vzdialeností medzi objektmi" },
    ],
    correctAnswers: ["c"],
    topic: "Alokácia",
  },
  139: {
    text: "Čo je hlavnou funkciou výrobného rozvrhovania?",
    type: "single",
    options: [
      { id: "a", text: "definovanie cieľov výrobného procesu vo forme rozvrhov" },
      { id: "b", text: "zabezpečenie materiálu pre výrobu" },
      { id: "c", text: "riadenie personálu" },
      { id: "d", text: "monitorovanie kvality výroby" },
    ],
    correctAnswers: ["a"],
    topic: "Rozvrhovanie",
  },
  140: {
    text: "Aká je hlavná úloha dispečerského riadenia?",
    type: "single",
    options: [
      { id: "a", text: "nábor zamestnancov" },
      { id: "b", text: "prenos cieľov na výrobný proces a porovnávanie výstupov s cieľmi" },
      { id: "c", text: "monitorovanie finančných tokov" },
      { id: "d", text: "údržba strojov" },
    ],
    correctAnswers: ["b"],
    topic: "Výrobná logistika",
  },
  154: {
    text: "Medzi vlastnosti kriteriálnej funkcie F(R) patria:",
    type: "multiple",
    options: [
      { id: "a", text: "slúži na hodnotenie kvality rozvrhu" },
      { id: "b", text: "je definovaná len pre neprípustné rozvrhy" },
      { id: "c", text: "môže byť minimalizačná alebo maximalizačná" },
      { id: "d", text: "nezávisí od časových charakteristík rozvrhu" },
    ],
    correctAnswers: ["a", "c"],
    topic: "Rozvrhovanie",
  },
  159: {
    text: "Medzi vlastnosti rozvrhovania na jednom procesore s prerušením patria:",
    type: "multiple",
    options: [
      { id: "a", text: "úlohy môžu byť prerušené a neskôr pokračované" },
      { id: "b", text: "každá úloha musí byť dokončená bez prerušenia" },
      { id: "c", text: "používa sa Jacksonov algoritmus" },
      { id: "d", text: "rozvrh je optimalizovaný podľa kritéria Cmax" },
      { id: "e", text: "aktivuje sa úloha s najneskorším termínom ukončenia" },
    ],
    correctAnswers: ["a", "c"],
    topic: "Rozvrhovanie",
  },
  163: {
    text: "Medzi kroky Jacksonovho algoritmu patria:",
    type: "multiple",
    options: [
      { id: "a", text: "rozdeliť zákazky podľa poradia spracovania na procesoroch" },
      { id: "b", text: "na vzniknuté skupiny použiť Johnsonov princíp a výsledky zreťaziť" },
      { id: "c", text: "zoradiť všetky úlohy len podľa priorít" },
      { id: "d", text: "vždy minimalizovať počet oneskorených úloh bez ohľadu na poradie operácií" },
    ],
    correctAnswers: ["a", "b"],
    topic: "Rozvrhovanie",
  },
  166: {
    text: "Ktoré tvrdenie správne opisuje základné typy rozvrhovacích úloh?",
    type: "single",
    options: [
      { id: "a", text: "open shop má pevné rovnaké poradie operácií pre všetky zákazky" },
      { id: "b", text: "flow shop má pevné rovnaké poradie operácií pre všetky zákazky, kým job shop má poradie špecifické pre zákazku" },
      { id: "c", text: "job shop dovoľuje len jeden procesor" },
      { id: "d", text: "open shop a flow shop sú totožné typy úloh" },
    ],
    correctAnswers: ["b"],
    topic: "Rozvrhovanie",
  },
  209: {
    text: "Aký je nedostatok skupinového posudku?",
    type: "single",
    options: [
      { id: "a", text: "rýchlosť získania výsledku" },
      { id: "b", text: "prítomnosť všetkých potrebných odborníkov" },
      { id: "c", text: "závislosť na komunikačných schopnostiach" },
      { id: "d", text: "vysoké náklady" },
    ],
    correctAnswers: ["c"],
    topic: "Prognózovanie",
  },
  217: {
    text: "Ktoré metódy prognózovania sú vhodné, keď nie sú k dispozícii dostatočné historické údaje?",
    type: "single",
    options: [
      { id: "a", text: "kvalitatívne metódy založené na expertnoch a odhadoch" },
      { id: "b", text: "len kĺzavé priemery" },
      { id: "c", text: "len exponenciálne vyrovnávanie" },
      { id: "d", text: "iba regresná analýza" },
    ],
    correctAnswers: ["a"],
    topic: "Prognózovanie",
  },
  223: {
    text: "Ktoré označenia sa používajú pre agresívnu kapacitnú stratégiu?",
    type: "multiple",
    options: [
      { id: "a", text: "stratégia \"preempt of competition\"" },
      { id: "b", text: "stratégia \"wait and see\"" },
      { id: "c", text: "vyvážená kapacitná stratégia" },
      { id: "d", text: "agresívna kapacitná stratégia" },
    ],
    correctAnswers: ["a", "d"],
    topic: "Kapacitné plánovanie",
  },
  224: {
    text: "Ktoré označenie priamo pomenúva agresívnu kapacitnú stratégiu?",
    type: "single",
    options: [
      { id: "a", text: "agresívna kapacitná stratégia" },
      { id: "b", text: "konzervatívna kapacitná stratégia" },
      { id: "c", text: "vyvážená kapacitná stratégia" },
      { id: "d", text: "stratégia \"wait and see\"" },
    ],
    correctAnswers: ["a"],
    topic: "Kapacitné plánovanie",
  },
  225: {
    text: "Ktoré označenie priamo pomenúva konzervatívnu kapacitnú stratégiu?",
    type: "single",
    options: [
      { id: "a", text: "agresívna kapacitná stratégia" },
      { id: "b", text: "stratégia \"preempt of competition\"" },
      { id: "c", text: "konzervatívna kapacitná stratégia" },
      { id: "d", text: "vyvážená kapacitná stratégia" },
    ],
    correctAnswers: ["c"],
    topic: "Kapacitné plánovanie",
  },
  226: {
    text: "Ktoré názvy sa používajú pre konzervatívnu kapacitnú stratégiu?",
    type: "multiple",
    options: [
      { id: "a", text: "stratégia \"preempt of competition\"" },
      { id: "b", text: "stratégia \"wait and see\"" },
      { id: "c", text: "agresívna kapacitná stratégia" },
      { id: "d", text: "konzervatívna kapacitná stratégia" },
    ],
    correctAnswers: ["b", "d"],
    topic: "Kapacitné plánovanie",
  },
  236: {
    text: "Čo znamená statický výpočet úzkeho miesta?",
    type: "single",
    options: [
      { id: "a", text: "výpočet kapacity stroja na základe historických údajov" },
      { id: "b", text: "určenie maximálnej kapacity na základe súčasného využitia" },
      { id: "c", text: "výpočet kapacity stroja pri rôznych úrovniach produkcie" },
      { id: "d", text: "určenie stroja, na ktorom sa kapacita vyčerpá ako prvá" },
    ],
    correctAnswers: ["d"],
    topic: "Kapacitné plánovanie",
  },
  244: {
    text: "Čo je dôležité pri priradení objednávok do plánov periód?",
    type: "single",
    options: [
      { id: "a", text: "rešpektovať termíny dodania a kapacitné možnosti výroby" },
      { id: "b", text: "náhodne rozdeliť objednávky do periód" },
      { id: "c", text: "ignorovať výrobný cyklus a dávky" },
      { id: "d", text: "zvyšovať počet objednávok v každej perióde bez ohľadu na kapacitu" },
    ],
    correctAnswers: ["a"],
    topic: "Výrobná logistika",
  },
  258: {
    text: "Aký je význam parametra t v stratégii riadenia zásob?",
    type: "single",
    options: [
      { id: "a", text: "zásoby sa dopĺňajú v pravidelných časových intervaloch" },
      { id: "b", text: "zásoby sa dopĺňajú na úroveň S" },
      { id: "c", text: "zásoby sa dopĺňajú v okamihu, keď klesnú pod hranicu s" },
      { id: "d", text: "zásoby sa dopĺňajú o pevné množstvo x" },
    ],
    correctAnswers: ["a"],
    topic: "Riadenie zásob",
  },
};

const RAL_SPLIT_NUMBERS = [44, 61, 92, 118, 140, 154, 163, 166, 217, 244, 258];

const FALLBACK_DISTRACTORS = [
  "heuristický prístup",
  "deterministický model",
  "lineárne programovanie",
  "kvalitatívna metóda",
  "agresívna kapacitná stratégia",
  "celočíselné programovanie",
  "pomerovo-indexová metóda",
  "výrobný cyklus",
];

export const getQuizSubjects = cache(async (): Promise<QuizSubject[]> => {
  const ralMarkdown = await readFile(path.join(process.cwd(), "tests", "ral.md"), "utf8");

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
      questions: parseRalQuestions(ralMarkdown),
    },
  ];
});

function parseRalQuestions(markdown: string): Question[] {
  const normalized = normalizeRalMarkdown(markdown);
  const sections = extractRalSections(normalized);
  const parsed = sections.map(([id, body]) => parseRalSection(id, body));
  const distractorPool = buildDistractorPool(parsed);

  return parsed.map((entry) => {
    if (entry.kind === "ready") {
      return entry.question;
    }

    const options = buildFallbackOptions(entry.correctText, distractorPool, entry.id);
    const correctIndex = options.findIndex((option) => option.text === entry.correctText);
    const correctAnswers = [options[Math.max(correctIndex, 0)].id];

    return {
      id: entry.id,
      text: entry.text,
      type: "single",
      options,
      correctAnswers,
      topic: entry.topic,
    };
  });
}

function normalizeRalMarkdown(markdown: string): string {
  let normalized = markdown.replace(/\r/g, "");

  for (const questionNumber of RAL_SPLIT_NUMBERS) {
    const pattern = new RegExp(String.raw`(?<!#)\s+${questionNumber}\.\s+`, "g");
    normalized = normalized.replace(pattern, `\n\n## ${questionNumber}. `);
  }

  return normalized;
}

function extractRalSections(markdown: string): Array<[number, string]> {
  const parts = markdown.split(/^##\s+/m);
  const sections: Array<[number, string]> = [];

  for (const part of parts) {
    const match = part.match(/^(\d+)\.\s*([\s\S]*)$/);
    if (!match) continue;
    sections.push([Number(match[1]), match[2].trim()]);
  }

  return sections;
}

function parseRalSection(id: number, body: string): ParsedRalQuestion {
  const manual = MANUAL_RAL_QUESTIONS[id];
  if (manual) {
    return {
      kind: "ready",
      question: {
        id,
        ...manual,
      },
    };
  }

  const compact = collapseWhitespace(body);
  const topic = inferRalTopic(compact);

  if (isTrueFalseQuestion(compact)) {
    const correctAnswers = /✅\s*Pravda/i.test(compact) ? ["true"] : ["false"];

    return {
      kind: "ready",
      question: {
        id,
        text: cleanQuestionText(compact),
        type: "truefalse",
        options: [
          { id: "true", text: "Pravda" },
          { id: "false", text: "Nepravda" },
        ],
        correctAnswers,
        topic,
      },
    };
  }

  const parsedOptions = extractMarkedOptions(compact);
  const answerText = extractAnswerText(compact);

  if (parsedOptions.length > 0) {
    const questionText = cleanQuestionText(compact.slice(0, parsedOptions[0].matchIndex));
    let correctAnswers = parsedOptions.filter((option) => option.correct).map((option) => option.id);

    if (correctAnswers.length === 0 && answerText) {
      correctAnswers = matchCorrectOptionIds(parsedOptions, answerText);
    }

    if (correctAnswers.length === 0) {
      correctAnswers = [parsedOptions[0].id];
    }

    const type: QuestionType = correctAnswers.length > 1 ? "multiple" : "single";

    return {
      kind: "ready",
      question: {
        id,
        text: questionText,
        type,
        options: parsedOptions.map((option) => ({
          id: option.id,
          text: option.text,
        })),
        correctAnswers,
        topic,
      },
    };
  }

  const text = deriveFallbackQuestionText(compact);
  const correctText = cleanOptionText(answerText || "Správna odpoveď");

  return {
    kind: "fallback",
    id,
    text,
    correctText,
    topic,
  };
}

function isTrueFalseQuestion(text: string): boolean {
  return /\bPravda\b/i.test(text) && /\bNepravda\b/i.test(text);
}

function extractMarkedOptions(text: string): Array<ParsedOption & { matchIndex: number }> {
  const regex =
    /(✅\s*)?([A-Za-z])\)\s*(.*?)(?=(?:\s+(?:✅\s*)?[A-Za-z]\)\s)|(?:\s+\*\*Správna odpoveď:\*\*)|$)/g;
  const matches: Array<ParsedOption & { matchIndex: number }> = [];

  for (const match of text.matchAll(regex)) {
    const optionText = cleanOptionText(match[3]);
    if (!optionText) continue;

    matches.push({
      id: match[2].toLowerCase(),
      text: optionText,
      correct: Boolean(match[1]),
      matchIndex: match.index ?? 0,
    });
  }

  return matches;
}

function extractAnswerText(text: string): string {
  const match = text.match(/\*\*Správna odpoveď:\*\*\s*(.+)$/);
  if (!match) return "";

  return cleanOptionText(match[1]);
}

function cleanQuestionText(text: string): string {
  return collapseWhitespace(
    text
      .replace(/\*\*Správna odpoveď:\*\*.*$/g, "")
      .replace(/---/g, "")
      .trim()
  );
}

function deriveFallbackQuestionText(text: string): string {
  const withoutAnswer = cleanQuestionText(text);
  const questionMarkIndex = withoutAnswer.indexOf("?");
  if (questionMarkIndex >= 0) {
    return withoutAnswer.slice(0, questionMarkIndex + 1).trim();
  }

  return withoutAnswer;
}

function cleanOptionText(text: string): string {
  return collapseWhitespace(
    text
      .replace(/\*\*/g, "")
      .replace(/^Správna odpoveď:\s*/i, "")
      .replace(/^[0-9]+[.)]\s*/, "")
      .replace(/^[A-Za-z][.)]\s*/, "")
      .replace(/^-+\s*/, "")
      .trim()
  );
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function matchCorrectOptionIds(options: ParsedOption[], answerText: string): string[] {
  const normalizedAnswer = normalizeForMatch(answerText);
  if (!normalizedAnswer) return [];

  return options
    .filter((option) => {
      const normalizedOption = normalizeForMatch(option.text);
      return (
        normalizedOption === normalizedAnswer ||
        normalizedOption.includes(normalizedAnswer) ||
        normalizedAnswer.includes(normalizedOption)
      );
    })
    .map((option) => option.id);
}

function normalizeForMatch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function buildDistractorPool(parsedQuestions: ParsedRalQuestion[]): string[] {
  const pool = new Set<string>();

  for (const entry of parsedQuestions) {
    if (entry.kind === "ready") {
      for (const option of entry.question.options) {
        const cleaned = cleanOptionText(option.text);
        if (cleaned.length >= 8) {
          pool.add(cleaned);
        }
      }
      continue;
    }

    if (entry.correctText.length >= 8) {
      pool.add(entry.correctText);
    }
  }

  for (const distractor of FALLBACK_DISTRACTORS) {
    pool.add(distractor);
  }

  return [...pool];
}

function buildFallbackOptions(correctText: string, pool: string[], seed: number): Question["options"] {
  const used = new Set([normalizeForMatch(correctText)]);
  const distractors: string[] = [];
  const startIndex = seed % pool.length;

  for (let offset = 0; offset < pool.length && distractors.length < 3; offset += 1) {
    const candidate = pool[(startIndex + offset) % pool.length];
    const normalizedCandidate = normalizeForMatch(candidate);

    if (
      !normalizedCandidate ||
      used.has(normalizedCandidate) ||
      normalizedCandidate.includes(normalizeForMatch(correctText)) ||
      normalizeForMatch(correctText).includes(normalizedCandidate)
    ) {
      continue;
    }

    used.add(normalizedCandidate);
    distractors.push(candidate);
  }

  while (distractors.length < 3) {
    const fallback = FALLBACK_DISTRACTORS[distractors.length];
    const normalizedFallback = normalizeForMatch(fallback);
    if (!used.has(normalizedFallback)) {
      used.add(normalizedFallback);
      distractors.push(fallback);
    }
  }

  const correctSlot = seed % 4;
  const texts = [...distractors];
  texts.splice(correctSlot, 0, correctText);

  return texts.slice(0, 4).map((text, index) => ({
    id: String.fromCharCode(97 + index),
    text,
  }));
}

function inferRalTopic(text: string): string | undefined {
  const normalized = text.toLowerCase();

  if (normalized.includes("csp") || normalized.includes("ohranič") || normalized.includes("eclipse")) {
    return "Úlohy s ohraničeniami";
  }
  if (normalized.includes("prognóz")) {
    return "Prognózovanie";
  }
  if (normalized.includes("zásob")) {
    return "Riadenie zásob";
  }
  if (normalized.includes("kapacit")) {
    return "Kapacitné plánovanie";
  }
  if (
    normalized.includes("rozvrh") ||
    normalized.includes("procesor") ||
    normalized.includes("shop") ||
    normalized.includes("johnson") ||
    normalized.includes("jackson")
  ) {
    return "Rozvrhovanie";
  }
  if (
    normalized.includes("alok") ||
    normalized.includes("priraď") ||
    normalized.includes("centrum") ||
    normalized.includes("vzdialen")
  ) {
    return "Alokácia";
  }
  if (normalized.includes("lineárn") || normalized.includes("simplex") || normalized.includes("bivalent")) {
    return "Programovanie";
  }
  if (normalized.includes("logistik") || normalized.includes("výrobn")) {
    return "Výrobná logistika";
  }

  return "RAL";
}
