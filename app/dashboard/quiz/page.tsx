"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Brain, ListChecks } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import {
  PlacementQuiz,
  type PlacementQuizResult,
  type QuizMode,
} from "@/components/quiz/PlacementQuiz";

type QuizStep = "choose" | "quiz" | "complete";

export default function RetakeQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState<QuizStep>("choose");
  const [error, setError] = useState("");
  const [quizMode, setQuizMode] = useState<QuizMode>("db");
  const [quizAttempt, setQuizAttempt] = useState(0);
  const [result, setResult] = useState<PlacementQuizResult | null>(null);

  if (step === "complete" && result) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex items-center justify-center min-h-[calc(100vh-var(--app-header-height)-4rem)]">
        <div className="relative bg-[#473961] rounded-3xl p-8 pt-50 max-w-md w-full text-center border border-[#4a3a6a] shadow-[0_0_60px_rgba(139,92,246,0.15)]">
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-60 h-60">
            <Image
              src="/colorful-balloons-celebration.png"
              alt="Celebration balloons"
              fill
              className="object-contain"
            />
          </div>

          <div className="text-center mb-6">
            <span className="inline-block relative">
              <h2 className="text-3xl font-bold text-white w-fit">Quiz complete</h2>
              <Icon
                icon="mingcute:celebrate-fill"
                className="w-10 h-10 text-primary-foreground absolute top-1/2 -translate-y-1/2 left-full ml-2"
              />
            </span>
          </div>

          <p className="text-gray-300 mb-1">Your placement has been updated.</p>
          <p className="text-white text-xl mb-4">
            Your level is <span className="font-bold">{result.level}</span>
          </p>
          {result.source === "ai" && result.accuracy != null && (
            <p className="text-gray-300 text-sm mb-4">
              Accuracy: {Math.round(result.accuracy * 100)}%
            </p>
          )}
          {result.aiInsight && (
            <p className="text-gray-200 text-sm mb-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              {result.aiInsight}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setError("");
                setStep("choose");
                setQuizAttempt((n) => n + 1);
              }}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Retake again
            </Button>
            <Button
              onClick={() => router.push("/dashboard/profile")}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
            >
              Back to profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "choose") {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex items-center justify-center min-h-[calc(100vh-var(--app-header-height)-4rem)]">
        <div className="bg-linear-to-b from-[#FFFFFF]/25 from-0% via-[#FFFFFF]/20 via-50% to-[#FFFFFF]/6 to-100% rounded-2xl p-6 md:p-8 w-full max-w-[560px] border border-black">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            Retake placement quiz
          </h2>
          <p className="text-muted-foreground text-center text-sm mb-8">
            Choose how you want to be assessed. Your roadmap and level may update based on your result.
          </p>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setQuizMode("db");
                setStep("quiz");
              }}
              className="w-full flex items-start gap-4 p-4 rounded-xl border border-input bg-primary/80 hover:bg-primary text-left transition-colors"
            >
              <ListChecks className="w-6 h-6 shrink-0 text-primary-foreground mt-0.5" />
              <div>
                <p className="font-semibold text-primary-foreground">Standard placement quiz</p>
                <p className="text-sm text-primary-foreground/80 mt-1">
                  Answer questions from the CodePath question bank.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setQuizMode("ai");
                setStep("quiz");
              }}
              className="w-full flex items-start gap-4 p-4 rounded-xl border border-input bg-primary/80 hover:bg-primary text-left transition-colors"
            >
              <Brain className="w-6 h-6 shrink-0 text-primary-foreground mt-0.5" />
              <div>
                <p className="font-semibold text-primary-foreground">AI-powered quiz</p>
                <p className="text-sm text-primary-foreground/80 mt-1">
                  Take an adaptive quiz analyzed by the AI service with topic-based feedback.
                </p>
              </div>
            </button>
          </div>

          <div className="flex justify-start mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/profile")}
              className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Back to profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex items-center justify-center min-h-[calc(100vh-var(--app-header-height)-4rem)]">
      <PlacementQuiz
        key={`${quizMode}-${quizAttempt}`}
        quizMode={quizMode}
        title={quizMode === "ai" ? "AI placement quiz" : "Retake placement quiz"}
        description={
          quizMode === "ai"
            ? "Answer AI-generated questions to reassess your skill level. You'll receive topic-based feedback after submission."
            : "Answer the questions below to reassess your skill level. Your roadmap and level may update based on your new result."
        }
        backLabel="Choose quiz type"
        onBack={() => {
          setError("");
          setStep("choose");
        }}
        onComplete={(quizResult) => {
          setResult(quizResult);
          setStep("complete");
        }}
        error={error}
        onError={setError}
      />
    </div>
  );
}
