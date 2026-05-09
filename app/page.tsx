import { QuizApp } from "@/components/QuizApp";
import { getQuizSubjects } from "@/lib/subjects";

export default async function Home() {
  const subjects = await getQuizSubjects();

  return <QuizApp subjects={subjects} />;
}
