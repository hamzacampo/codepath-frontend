"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { apiService } from "@/lib/api-service";

export type QuizMode = "auto" | "db" | "ai";

type QuizQuestionShape = {
  id: number;
  question?: string;
  questionTitle?: string;
  topic?: string;
  difficulty?: string;
  options?: string[];
  dbOptions?: Array<{ id: number; optionText: string; orderIndex: number }>;
};

function mapAiQuestion(q: any, idx: number): QuizQuestionShape {
  return {
    id: q.id ?? q.question_id ?? idx + 1,
    questionTitle: q.questionTitle ?? q.question ?? q.title ?? "",
    question: q.question ?? q.questionTitle ?? q.title ?? "",
    topic: q.topic,
    difficulty: q.difficulty,
    options: Array.isArray(q.options) ? q.options : Array.isArray(q.choices) ? q.choices : [],
  };
}

function normalizeQuizResponse(data: any): { quizId?: number; questions: QuizQuestionShape[] } {
  if (Array.isArray(data)) {
    return { questions: data.map(mapAiQuestion) };
  }

  const rawQuestions =
    data?.questions ??
    data?.items ??
    data?.question_list ??
    (Array.isArray(data?.data) ? data.data : []);

  const questions: QuizQuestionShape[] = Array.isArray(rawQuestions)
    ? rawQuestions.map(mapAiQuestion)
    : [];

  return { quizId: data?.quizId ?? data?.quiz_id, questions };
}

export type PlacementQuizResult = {
  level: string;
  accuracy?: number;
  aiInsight?: string;
  source: "db" | "ai";
};

export type PlacementQuizProps = {
  onComplete: (result: PlacementQuizResult) => void;
  onBack?: () => void;
  backLabel?: string;
  title?: string;
  description?: string;
  error?: string;
  onError?: (message: string) => void;
  quizMode?: QuizMode;
  numberOfQuestions?: number;
};

export function PlacementQuiz({
  onComplete,
  onBack,
  backLabel = "Go back",
  title = "Take a placement quiz",
  description = "Answer the following questions below to help us analyze your skills.",
  error,
  onError,
  quizMode = "auto",
  numberOfQuestions = 3,
}: PlacementQuizProps) {
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [dbQuizMode, setDbQuizMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestionShape[]>([]);
  const [quizId, setQuizId] = useState<number | undefined>();
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});

  const loadQuiz = () => {
    setFetching(true);
    setFetchError(null);
    setDbQuizMode(false);
    setSelectedOptions({});

    const applyDbQuestions = (response: unknown) => {
      const list = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.questions)
          ? (response as any).questions
          : Array.isArray((response as any)?.data)
            ? (response as any).data
            : [];
      if (list.length === 0) return false;

      const parsed: QuizQuestionShape[] = list.map((q: any) => {
        const titleText =
          q.questionTitle ??
          q.question_title ??
          q.question ??
          (typeof q.title === "string" ? q.title : "") ??
          "";
        const rawOptions = Array.isArray(q.options) ? q.options : [];
        const dbOptions = rawOptions
          .filter((option: any) => option && typeof option === "object" && "optionText" in option)
          .map((option: any) => ({
            id: Number(option.id),
            optionText: String(option.optionText),
            orderIndex: Number(option.orderIndex ?? 0),
          }))
          .sort((a: { orderIndex: number }, b: { orderIndex: number }) => a.orderIndex - b.orderIndex);

        return {
          id: Number(q.id),
          questionTitle: titleText,
          question: titleText,
          dbOptions,
        };
      });

      setQuizId(undefined);
      setQuestions(parsed);
      setDbQuizMode(true);
      setFetching(false);
      return true;
    };

    const applyAiResponse = (aiData: any) => {
      const { quizId: id, questions: aiQuestions } = normalizeQuizResponse(aiData);
      if (aiQuestions.length > 0) {
        setQuizId(id);
        setQuestions(aiQuestions);
        setDbQuizMode(false);
        setFetching(false);
        return true;
      }
      setFetchError(
        quizMode === "ai"
          ? "AI quiz is unavailable right now. Please try again later or use the standard quiz."
          : "No quiz questions available. Please try again later.",
      );
      setFetching(false);
      return false;
    };

    const loadDbQuiz = () =>
      apiService
        .getQuizAll()
        .then((dbQuestions) => applyDbQuestions(dbQuestions))
        .catch(() => false);

    const loadAiQuiz = () =>
      apiService
        .getQuizStart(numberOfQuestions)
        .then(applyAiResponse)
        .catch((err) => {
          setFetchError(
            err?.response?.data?.message ||
              err?.message ||
              "AI quiz service is unavailable. Please try the standard quiz or try again later.",
          );
          setFetching(false);
          return false;
        });

    if (quizMode === "db") {
      loadDbQuiz().then((loaded) => {
        if (!loaded) {
          setFetchError("No placement questions are available yet. Please try the AI quiz instead.");
          setFetching(false);
        }
      });
      return;
    }

    if (quizMode === "ai") {
      void loadAiQuiz();
      return;
    }

    loadDbQuiz()
      .then((loaded) => {
        if (loaded) return;
        return loadAiQuiz();
      })
      .catch(() => loadAiQuiz());
  };

  useEffect(() => {
    loadQuiz();
  }, [quizMode, numberOfQuestions]);

  const setSelectedOption = (questionId: number, selectedValue: number) => {
    setSelectedOptions((prev) => ({ ...prev, [questionId]: selectedValue }));
  };

  const validateAnswers = () => {
    const allAnswered = questions.every((q) => selectedOptions[q.id] !== undefined);
    if (!allAnswered) {
      onError?.("Please answer all questions");
      return false;
    }
    return true;
  };

  const handleSubmitDb = async () => {
    if (!validateAnswers()) return;

    const payload = questions.map((question) => ({
      questionId: question.id,
      selectedOptionId: selectedOptions[question.id] as number,
    }));

    setSubmitting(true);
    try {
      const result = await apiService.submitQuizDB(payload);
      onComplete({
        level: result.level,
        source: "db",
      });
    } catch (err: any) {
      setSubmitting(false);
      onError?.(err?.response?.data?.message || err?.message || "Failed to submit quiz");
    }
  };

  const handleSubmitAi = async () => {
    if (!validateAnswers()) return;

    const answers = questions.map((q) => ({
      question_id: q.id,
      selected_option: selectedOptions[q.id] as number,
    }));

    setSubmitting(true);
    try {
      const result = await apiService.submitQuiz(answers, quizId);
      onComplete({
        level: result.MenteeLevel,
        accuracy: result.ResultAccuracy,
        aiInsight: result.AiInsight,
        source: "ai",
      });
    } catch (err: any) {
      setSubmitting(false);
      onError?.(err?.response?.data?.message || err?.message || "Failed to submit quiz");
    }
  };

  return (
    <div className="bg-linear-to-b from-[#FFFFFF]/25 from-0% via-[#FFFFFF]/20 via-50% to-[#FFFFFF]/6 to-100% rounded-2xl p-6 md:p-8 w-full max-w-[560px] border border-black">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">{title}</h2>
      <p className="text-muted-foreground text-center text-sm mb-4">{description}</p>
      {!fetching && questions.length > 0 && (
        <p className="text-center text-xs text-muted-foreground mb-6">
          {dbQuizMode ? "Standard placement questions" : "AI-powered adaptive quiz"}
        </p>
      )}

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 mb-4">
          {error}
        </div>
      )}

      {fetchError && (
        <div className="p-3 text-sm text-amber-600 bg-amber-500/10 rounded-md border border-amber-500/20 mb-4">
          {fetchError}
          <Button variant="outline" size="sm" className="mt-2 w-full" onClick={loadQuiz}>
            Retry
          </Button>
        </div>
      )}

      {fetching ? (
        <p className="text-muted-foreground text-center py-6">Loading questions...</p>
      ) : (
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const titleText =
              q.questionTitle ?? q.question ?? `Question ${idx + 1}`;
            const options = q.options ?? [];
            const dbOptions = q.dbOptions ?? [];
            const selected = selectedOptions[q.id];

            return (
              <div key={q.id}>
                <Label className="text-foreground font-semibold mb-2 block">
                  {titleText ? `Question #${idx + 1}: ${titleText}` : `Question #${idx + 1}`}
                </Label>
                {!dbQuizMode && (q.topic || q.difficulty) && (
                  <p className="text-xs text-muted-foreground mb-2 capitalize">
                    {[q.topic, q.difficulty].filter(Boolean).join(" · ")}
                  </p>
                )}
                {dbOptions.length > 0 ? (
                  <RadioGroup
                    value={selected !== undefined ? String(selected) : ""}
                    onValueChange={(value) => setSelectedOption(q.id, parseInt(value, 10))}
                    className="space-y-2"
                  >
                    {dbOptions.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-2 p-2 rounded-lg border border-input cursor-pointer hover:bg-muted/50"
                      >
                        <RadioGroupItem value={String(option.id)} id={`q-${q.id}-${option.id}`} />
                        <span>{option.optionText}</span>
                      </label>
                    ))}
                  </RadioGroup>
                ) : options.length ? (
                  <RadioGroup
                    value={selected !== undefined ? String(selected) : ""}
                    onValueChange={(value) => setSelectedOption(q.id, parseInt(value, 10))}
                    className="space-y-2"
                  >
                    {options.map((opt, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-lg border border-input cursor-pointer hover:bg-muted/50"
                      >
                        <RadioGroupItem value={String(i)} id={`q-${q.id}-${i}`} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </RadioGroup>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This question has no answer options configured.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-nowrap items-center justify-between gap-2 mt-8">
        {!fetching && questions.length > 0 && onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={submitting}
            className="shrink-0 text-xs sm:text-sm border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 whitespace-nowrap"
          >
            {backLabel}
          </Button>
        )}
        {!fetching && questions.length > 0 && (
          <Button
            type="button"
            disabled={submitting}
            onClick={dbQuizMode ? handleSubmitDb : handleSubmitAi}
            className="shrink-0 text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap disabled:opacity-50 ml-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit answers <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
