"use client";

import { useState } from "react";
import { LearnView } from "@/components/LearnView";
import { SessionSetup } from "@/components/SessionSetup";
import { TestView } from "@/components/TestView";
import { QuizSubject } from "@/lib/subjects";
import { StudyMode } from "@/lib/types";
import { cn } from "@/lib/utils";

type Screen = "home" | "setup-test" | "setup-learn" | "test" | "learn";

interface QuizAppProps {
  subjects: QuizSubject[];
}

export function QuizApp({ subjects }: QuizAppProps) {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id ?? "zsu");
  const [questionCount, setQuestionCount] = useState(20);

  const selectedSubject =
    subjects.find((subject) => subject.id === selectedSubjectId) ?? subjects[0];

  if (!selectedSubject) {
    return null;
  }

  const handleStart = (mode: StudyMode, count: number) => {
    setQuestionCount(count);
    setScreen(mode);
  };

  if (screen === "test") {
    return (
      <TestView
        allQuestions={selectedSubject.questions}
        initialCount={questionCount}
        subjectTitle={selectedSubject.title}
        onHome={() => setScreen("home")}
      />
    );
  }

  if (screen === "learn") {
    return (
      <LearnView
        allQuestions={selectedSubject.questions}
        initialCount={questionCount}
        subjectTitle={selectedSubject.title}
        onHome={() => setScreen("home")}
      />
    );
  }

  if (screen === "setup-test" || screen === "setup-learn") {
    const mode: StudyMode = screen === "setup-test" ? "test" : "learn";

    return (
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto w-full max-w-md">
          <SessionSetup
            mode={mode}
            maxQuestions={selectedSubject.questions.length}
            subjectTitle={selectedSubject.title}
            subjectSubtitle={selectedSubject.subtitle}
            onStart={(count) => handleStart(mode, count)}
            onBack={() => setScreen("home")}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.28),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.2),transparent_38%),rgba(255,255,255,0.04)] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 text-2xl shadow-lg shadow-violet-950/30">
                ⚡
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Quizik</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                Vyber predmet, nastav počet otázok a prepínaj sa medzi testovaním a učením bez
                menenia logiky aplikácie.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Predmety" value={String(subjects.length)} />
              <StatCard label="Aktívny set" value={selectedSubject.title} />
              <StatCard label="Otázok v sete" value={String(selectedSubject.questions.length)} />
              <StatCard
                label="Spolu otázok"
                value={String(subjects.reduce((sum, subject) => sum + subject.questions.length, 0))}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {subjects.map((subject) => {
              const isSelected = subject.id === selectedSubject.id;

              return (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={cn(
                    "rounded-[28px] border p-5 text-left transition-all duration-200",
                    "hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]",
                    isSelected
                      ? getSubjectAccentClass(subject.accent)
                      : "border-white/10 bg-white/[0.03]"
                  )}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 text-2xl">
                        {subject.icon}
                      </span>
                      <div>
                        <p className="text-lg font-bold text-white">{subject.title}</p>
                        <p className="text-sm text-white/55">{subject.subtitle}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80">
                        vybraný
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-6 text-white/65">{subject.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/35">bank otázok</span>
                    <span className="text-2xl font-black text-white">{subject.questions.length}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">Zvolený predmet</p>
              <h2 className="mt-2 text-2xl font-black text-white">{selectedSubject.title}</h2>
              <p className="mt-1 text-sm text-white/55">{selectedSubject.subtitle}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Pripravené na štart</p>
                  <p className="mt-1 text-sm leading-6 text-white/55">{selectedSubject.description}</p>
                </div>
                <span className="shrink-0 text-3xl font-black text-white">{selectedSubject.questions.length}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <ModeCard
                icon="🎯"
                title="Test Mode"
                description="Náhodne vyber otázky, odpovedaj a hneď uvidíš výsledok."
                accentColor="violet"
                tags={["Okamžitý výsledok", "Náhodný výber", "Štatistiky"]}
                onClick={() => setScreen("setup-test")}
              />
              <ModeCard
                icon="🧠"
                title="Learn Mode"
                description="Prechádzaj bloky, vracaj sa k chybám a dotiahni ich do správna."
                accentColor="amber"
                tags={["Bloky po 7", "Opakovanie chýb", "Finálne kolo"]}
                onClick={() => setScreen("setup-learn")}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  description,
  accentColor,
  tags,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  accentColor: "violet" | "amber";
  tags: string[];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-3xl border-2 p-5 text-left transition-all duration-200",
        "hover:scale-[1.01] active:scale-[0.99]",
        accentColor === "violet"
          ? "border-violet-500/30 bg-violet-500/10 hover:border-violet-500/60 hover:bg-violet-500/15"
          : "border-amber-500/30 bg-amber-500/10 hover:border-amber-500/60 hover:bg-amber-500/15"
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl",
            accentColor === "violet" ? "bg-violet-500/20" : "bg-amber-500/20"
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-white">{title}</p>
          <p className="mt-0.5 text-sm leading-snug text-white/55">{description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  accentColor === "violet"
                    ? "bg-violet-500/20 text-violet-300"
                    : "bg-amber-500/20 text-amber-300"
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <span className="mt-1 text-lg text-white/30">→</span>
      </div>
    </button>
  );
}

function getSubjectAccentClass(accent: QuizSubject["accent"]) {
  switch (accent) {
    case "emerald":
      return "border-emerald-400/40 bg-emerald-500/10 shadow-lg shadow-emerald-950/20";
    case "amber":
      return "border-amber-400/40 bg-amber-500/10 shadow-lg shadow-amber-950/20";
    case "sky":
      return "border-sky-400/40 bg-sky-500/10 shadow-lg shadow-sky-950/20";
    case "rose":
      return "border-rose-400/40 bg-rose-500/10 shadow-lg shadow-rose-950/20";
    case "violet":
    default:
      return "border-violet-400/40 bg-violet-500/10 shadow-lg shadow-violet-950/20";
  }
}
