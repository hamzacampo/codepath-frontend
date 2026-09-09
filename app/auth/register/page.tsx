"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { ArrowRight, Loader2 } from "lucide-react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { apiService } from "@/lib/api-service";
import { PlacementQuiz } from "@/components/quiz/PlacementQuiz";

type Step =
  | "personal-info"
  | "assessment-method"
  | "codeforces"
  | "quiz"
  | "skill-level"
  | "congratulations";

interface FormData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  bio: string;
  assessmentMethod: "" | "codeforces" | "quiz" | "manual";
  codeforcesHandle: string;
  skillLevel: string;
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<Step>("personal-info");
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    bio: "",
    assessmentMethod: "",
    codeforcesHandle: "",
    skillLevel: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [assessedLevel, setAssessedLevel] = useState<string | null>(null);
  const justRegisteredRef = useRef(false);
  const registerMentee = useAuthStore((state) => state.registerMentee);
  const finalizeRegistration = useAuthStore((state) => state.finalizeRegistration);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.loading);
  const router = useRouter();

  // Clear "just registered" flag only after we've actually moved to assessment (so redirect effect doesn't run first)
  useEffect(() => {
    if (currentStep === "assessment-method") {
      justRegisteredRef.current = false;
    }
  }, [currentStep]);

  // Redirect to dashboard only when already logged in and on step 1 (opened /register while signed in)
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && currentStep === "personal-info" && !justRegisteredRef.current) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, currentStep, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Already logged in on step 1 and did not just register → redirecting
  if (isAuthenticated && currentStep === "personal-info" && !justRegisteredRef.current) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    );
  }

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegistration = async () => {
    // Validate required fields according to backend requirements
    if (!formData.fullName || formData.fullName.length < 6) {
      setError("Full name must be at least 6 characters");
      return;
    }
    if (!formData.username || formData.username.length < 6) {
      setError("Username must be at least 6 characters");
      return;
    }
    if (!formData.email) {
      setError("Email is required");
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!formData.country) {
      setError("Country is required");
      return;
    }

    setLoading(true);
    setError("");
    // Set before calling registerMentee so when auth store updates and re-renders, we don't redirect
    justRegisteredRef.current = true;

    try {
      // Call registerMentee - backend automatically sets roleId to Mentee (user is only registered here)
      const result = await registerMentee({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        country: formData.country,
        bio: formData.bio || undefined,
      });

      setLoading(false);

      if (result.success) {
        setCurrentStep("assessment-method");
      } else {
        justRegisteredRef.current = false;
        setError(result.error || "Registration failed");
      }
    } catch (error: any) {
      setLoading(false);
      justRegisteredRef.current = false;
      setError(error.message || "Registration failed. Please try again.");
    }
  };

  // When we just registered, auth store updates before our state — show step 2 until effect runs
  const displayStep: Step =
    justRegisteredRef.current && currentStep === "personal-info"
      ? "assessment-method"
      : currentStep;

  const getStepNumber = () => {
    if (displayStep === "personal-info") return 1;
    if (displayStep === "congratulations") return 3;
    return 2; // assessment-method, codeforces, quiz, skill-level
  };

  const handleAssessmentNext = () => {
    if (formData.assessmentMethod === "codeforces") setCurrentStep("codeforces");
    else if (formData.assessmentMethod === "quiz") setCurrentStep("quiz");
    else if (formData.assessmentMethod === "manual") setCurrentStep("skill-level");
  };

  const handleCodeforcesConnect = async () => {
    if (!formData.codeforcesHandle.trim()) {
      setError("Enter your Codeforces handle");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await apiService.integrateCodeforces(formData.codeforcesHandle.trim());
      setAssessedLevel(result.codePathLevel ?? null);
      finalizeRegistration();
      setCurrentStep("congratulations");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to connect Codeforces");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillLevelNext = async () => {
    const id = formData.skillLevel ? parseInt(formData.skillLevel, 10) : 0;
    if (!id) {
      setError("Choose your level");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await apiService.setMenteeSkillLevel(id);
      setAssessedLevel(result.skillLevel?.title ?? null);
      finalizeRegistration();
      setCurrentStep("congratulations");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to set skill level");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 min-h-[calc(100vh-200px)] px-4 py-8 max-w-7xl mx-auto">
      {/* Step indicator */}
      <div className="flex flex-row lg:flex-col gap-4 lg:gap-2 w-full lg:w-1/2 justify-start lg:items-start overflow-x-auto pb-4 lg:pb-0">
        <StepIndicator
          number={1}
          title="Enter your personal information"
          active={getStepNumber() === 1}
          completed={getStepNumber() > 1}
        />
        <StepIndicator
          number={2}
          title="Choose assessment method"
          active={getStepNumber() === 2}
          completed={getStepNumber() > 2}
        />
        <StepIndicator
          number={3}
          title="Review results"
          active={getStepNumber() === 3}
          completed={false}
        />
      </div>

      {/* Main content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        {displayStep === "personal-info" && (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onRegister={handleRegistration}
            error={error}
            loading={loading}
          />
        )}

        {displayStep === "assessment-method" && (
          <AssessmentMethodStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleAssessmentNext}
            error={error}
          />
        )}

        {displayStep === "skill-level" && (
          <SkillLevelStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleSkillLevelNext}
            onBack={() => setCurrentStep("assessment-method")}
            error={error}
            loading={loading}
          />
        )}

        {displayStep === "codeforces" && (
          <CodeforcesStep
            formData={formData}
            updateFormData={updateFormData}
            onConnect={handleCodeforcesConnect}
            onBack={() => setCurrentStep("assessment-method")}
            error={error}
            loading={loading}
          />
        )}

        {displayStep === "quiz" && (
          <PlacementQuiz
            onBack={() => setCurrentStep("assessment-method")}
            backLabel="Choose another method"
            onComplete={(result) => {
              setAssessedLevel(result.level);
              finalizeRegistration();
              setCurrentStep("congratulations");
            }}
            error={error}
            onError={setError}
          />
        )}

        {displayStep === "congratulations" && (
          <CongratulationsStep router={router} level={assessedLevel} />
        )}
      </div>
    </div>
  );
}

function StepIndicator({
  number,
  title,
  active,
  completed,
}: {
  number: number;
  title: string;
  active: boolean;
  completed: boolean;
}) {
  const highlighted = active || completed;
  return (
    <div className="flex gap-3 shrink-0">
      <div className="flex flex-col items-center gap-2">
        <div
          className={`
          flex items-center justify-center w-10 h-10 rounded-full border-4 text-xl font-bold shrink-0 bg-transparent
          ${highlighted ? "border-accent text-accent" : "border-foreground text-foreground"}
        `}
        >
          {number}
        </div>
        {number < 3 && (
          <div className="hidden lg:flex flex-col gap-4">
            <div
              className={`w-2 h-2 rounded-full border-2 bg-transparent ${highlighted ? "border-accent" : "border-foreground"}`}
            />
            <div
              className={`w-2 h-2 rounded-full border-2 bg-transparent ${highlighted ? "border-accent" : "border-foreground"}`}
            />
            <div
              className={`w-2 h-2 rounded-full border-2 bg-transparent ${highlighted ? "border-accent" : "border-foreground"}`}
            />
          </div>
        )}
      </div>
      <span
        className={`text-xs lg:text-2xl pt-1.5 whitespace-nowrap ${highlighted ? "text-accent" : "text-foreground"}`}
      >
        {title}
      </span>
    </div>
  );
}

function PersonalInfoStep({
  formData,
  updateFormData,
  onRegister,
  error,
  loading,
}: {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  onRegister: () => void;
  error: string;
  loading: boolean;
}) {
  return (
    <div className="bg-linear-to-b from-[#FFFFFF]/25 from-0% via-[#FFFFFF]/20 via-50% to-[#FFFFFF]/6 to-100% rounded-2xl p-6 md:p-8 w-full max-w-[560px] border border-black">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">
        Register with CodePath
      </h2>
      <p className="text-muted-foreground text-center text-sm mb-6">
        Sign up to track your progress and unlock your full potential
      </p>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <Input
          placeholder="Full Name (min 6 characters)"
          value={formData.fullName}
          onChange={(e) => updateFormData("fullName", e.target.value)}
          required
        />

        <Input
          placeholder="Username (min 6 characters)"
          value={formData.username}
          onChange={(e) => updateFormData("username", e.target.value)}
          required
        />

        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => updateFormData("email", e.target.value)}
          required
        />

        <Input
          type="password"
          placeholder="Password (min 8 characters)"
          value={formData.password}
          onChange={(e) => updateFormData("password", e.target.value)}
          required
        />

        <Input
          type="tel"
          placeholder="Phone (optional)"
          value={formData.phone}
          onChange={(e) => updateFormData("phone", e.target.value)}
        />

        <Select
          value={formData.country}
          onChange={(e) => updateFormData("country", e.target.value)}
        >
          <option value="">Choose a country *</option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="ca">Canada</option>
          <option value="au">Australia</option>
          <option value="in">India</option>
        </Select>

        <Textarea
          placeholder="Tell us about yourself (optional)"
          value={formData.bio}
          onChange={(e) => updateFormData("bio", e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end mt-6">
        <Button
          onClick={onRegister}
          disabled={loading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            <>
              Register <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-foreground hover:text-accent hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
}

function AssessmentMethodStep({
  formData,
  updateFormData,
  onNext,
  error,
}: {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  onNext: () => void;
  error: string;
}) {
  return (
    <div className="bg-linear-to-b from-[#FFFFFF]/25 from-0% via-[#FFFFFF]/20 via-50% to-[#FFFFFF]/6 to-100% rounded-2xl p-6 md:p-8 w-full max-w-[560px] border border-black">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">Choose Assessment Method</h2>
      <p className="text-muted-foreground text-center text-sm mb-8">
        Choose how you&apos;d like us to assess your current skill level
      </p>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 mb-4">
          {error}
        </div>
      )}

      <RadioGroup
        value={formData.assessmentMethod}
        onValueChange={(value) => updateFormData("assessmentMethod", value as FormData["assessmentMethod"])}
        className="space-y-4"
      >
        <label
          className={`
            flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-colors
            ${formData.assessmentMethod === "codeforces" ? "bg-primary" : "bg-primary/80 hover:bg-primary"}
          `}
        >
          <RadioGroupItem value="codeforces" id="codeforces" className="border-foreground text-foreground" />
          <span className="text-primary-foreground font-medium">Connect your Codeforces account</span>
        </label>

        <label
          className={`
            flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-colors
            ${formData.assessmentMethod === "quiz" ? "bg-primary" : "bg-primary/80 hover:bg-primary"}
          `}
        >
          <RadioGroupItem value="quiz" id="quiz" className="border-foreground text-foreground" />
          <span className="text-primary-foreground font-medium">Take a placement quiz</span>
        </label>

        <label
          className={`
            flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-colors
            ${formData.assessmentMethod === "manual" ? "bg-primary" : "bg-primary/80 hover:bg-primary"}
          `}
        >
          <RadioGroupItem value="manual" id="manual" className="border-foreground text-foreground" />
          <span className="text-primary-foreground font-medium">Choose your level manually</span>
        </label>
      </RadioGroup>

      <div className="flex justify-end mt-8">
        <Button
          onClick={onNext}
          disabled={!formData.assessmentMethod}
          className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SkillLevelStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  error,
  loading,
}: {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  error: string;
  loading: boolean;
}) {
  const [levels, setLevels] = useState<{ id: number; title: string }[]>([]);
  useEffect(() => {
    apiService.getSkillLevels().then((list) => setLevels(list.map((l) => ({ id: l.id, title: l.title }))));
  }, []);

  return (
    <div className="bg-linear-to-b from-[#FFFFFF]/25 from-0% via-[#FFFFFF]/20 via-50% to-[#FFFFFF]/6 to-100% rounded-2xl p-6 md:p-8 w-full max-w-[560px] border border-black">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">Choose your skills level</h2>
      <p className="text-muted-foreground text-center text-sm mb-8">Choose your skills level from the menu below</p>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 mb-4">
          {error}
        </div>
      )}

      <Select
        value={formData.skillLevel}
        onChange={(e) => updateFormData("skillLevel", e.target.value)}
        className="h-12"
        placeholder="Choose your level"
      >
        {levels.map((l) => (
          <option key={l.id} value={String(l.id)}>
            {l.title}
          </option>
        ))}
      </Select>

      <div className="flex flex-nowrap items-center justify-between gap-2 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="shrink-0 text-xs sm:text-sm border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 whitespace-nowrap"
        >
          Choose another method
        </Button>
        <Button
          onClick={onNext}
          disabled={!formData.skillLevel || loading}
          className="shrink-0 text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function CodeforcesStep({
  formData,
  updateFormData,
  onConnect,
  onBack,
  error,
  loading,
}: {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  onConnect: () => void;
  onBack: () => void;
  error: string;
  loading: boolean;
}) {
  return (
    <div className="bg-linear-to-b from-[#FFFFFF]/25 from-0% via-[#FFFFFF]/20 via-50% to-[#FFFFFF]/6 to-100% rounded-2xl p-6 md:p-8 w-full max-w-[560px] border border-black">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">Connect to your Codeforces Account</h2>
      <p className="text-muted-foreground text-center text-sm mb-8">
        Enter your Codeforces handle and we will analyze your skills based on your account details and submissions.
      </p>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 mb-4">
          {error}
        </div>
      )}

      <Input
        placeholder="Enter your Codeforces handle"
        value={formData.codeforcesHandle}
        onChange={(e) => updateFormData("codeforcesHandle", e.target.value)}
      />

      <div className="flex flex-nowrap items-center justify-between gap-2 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="shrink-0 text-xs sm:text-sm border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 whitespace-nowrap"
        >
          Choose another method
        </Button>
        <Button
          onClick={onConnect}
          disabled={!formData.codeforcesHandle.trim() || loading}
          className="shrink-0 text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              Connect <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function CongratulationsStep({ router, level }: { router: any; level?: string | null }) {
  const displayLevel = level && level.trim() !== "" ? level : "Not assessed yet";
  return (
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
          <h2 className="text-3xl font-bold text-white w-fit">Congratulations</h2>
          <Icon
            icon="mingcute:celebrate-fill"
            className="w-10 h-10 text-primary-foreground absolute top-1/2 -translate-y-1/2 left-full ml-2"
          />
        </span>
      </div>

      <p className="text-gray-300 mb-1">Your CodePrint is ready!</p>
      <p className="text-gray-300 mb-8">Let&apos;s start your training journey</p>

      <p className="text-white text-xl mb-8">
        Your level is <span className="font-bold">{displayLevel}</span>
      </p>

      <Button
        onClick={() => router.push("/dashboard")}
        className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-3 rounded-full text-base font-medium"
      >
        Proceed to dashboard
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
