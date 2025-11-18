import OnboardingForm, { type FormStep } from "@/components/onboarding-form";
import questionsData from "@/lib/onboarding-questions.json";

const questions = questionsData as FormStep[];
const steps = questions.map((q) => q.step);

export default async function Page() {
  return (
    <main className="w-screen min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl px-4">
        <OnboardingForm steps={steps} questions={questions} />
      </div>
    </main>
  );
}
