"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { ArrowRight } from "lucide-react";

type Step = "personal-info" | "assessment-method" | "skill-level" | "codeforces" | "quiz" | "congratulations";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  bio: string;
  assessmentMethod: "codeforces" | "quiz" | "manual" | "";
  skillLevel: string;
  codeforcesHandle: string;
  quizAnswers: string[];
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<Step>("personal-info");
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    bio: "",
    assessmentMethod: "",
    skillLevel: "",
    codeforcesHandle: "",
    quizAnswers: ["", "", ""],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === "personal-info") {
      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.password) {
        setError("Please fill in all required fields");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      setError("");
      setCurrentStep("assessment-method");
    } else if (currentStep === "assessment-method") {
      if (!formData.assessmentMethod) {
        setError("Please select an assessment method");
        return;
      }
      setError("");
      if (formData.assessmentMethod === "codeforces") {
        setCurrentStep("codeforces");
      } else if (formData.assessmentMethod === "quiz") {
        setCurrentStep("quiz");
      } else if (formData.assessmentMethod === "manual") {
        setCurrentStep("skill-level");
      }
    } else if (currentStep === "codeforces") {
      if (!formData.codeforcesHandle) {
        setError("Please enter your Codeforces handle");
        return;
      }
      setError("");
      handleRegistration();
    } else if (currentStep === "quiz") {
      if (formData.quizAnswers.some((answer) => !answer.trim())) {
        setError("Please answer all questions");
        return;
      }
      setError("");
      handleRegistration();
    } else if (currentStep === "skill-level") {
      if (!formData.skillLevel) {
        setError("Please select your skill level");
        return;
      }
      setError("");
      handleRegistration();
    }
  };

  const handleRegistration = async () => {
    setLoading(true);
    setError("");

    // Generate username from full name or email
    const username = formData.fullName.split(" ")[0].toLowerCase() || formData.email.split("@")[0];

    // Fetch roles to get Mentee roleId
    let menteeRoleId: number | undefined;
    try {
      const { apiService } = await import("@/lib/api-service");
      const roles = await apiService.getRoles();
      const menteeRole = roles.find((r) => r.title === "Mentee");
      if (!menteeRole) {
        setError("Mentee role not found. Please contact administrator.");
        setLoading(false);
        return;
      }
      menteeRoleId = menteeRole.id;
    } catch (error: any) {
      setError("Failed to fetch roles. Please try again.");
      setLoading(false);
      return;
    }

    const result = await register(
      username,
      formData.email,
      formData.password,
      formData.codeforcesHandle || undefined,
      undefined, // leetcodeHandle
      formData.fullName,
      formData.phone || undefined,
      formData.country,
      formData.bio || undefined,
      menteeRoleId
    );

    setLoading(false);

    if (result.success) {
      setCurrentStep("congratulations");
    } else {
      setError(result.error || "Registration failed");
    }
  };

  const getStepNumber = () => {
    if (currentStep === "personal-info") return 1;
    if (
      currentStep === "assessment-method" ||
      currentStep === "codeforces" ||
      currentStep === "quiz" ||
      currentStep === "skill-level"
    )
      return 2;
    return 3;
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
        <StepIndicator number={3} title="Review results" active={getStepNumber() === 3} completed={false} />
      </div>

      {/* Main content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        {currentStep === "personal-info" && (
          <PersonalInfoStep formData={formData} updateFormData={updateFormData} onNext={handleNext} error={error} />
        )}

        {currentStep === "assessment-method" && (
          <AssessmentMethodStep formData={formData} updateFormData={updateFormData} onNext={handleNext} error={error} />
        )}

        {currentStep === "skill-level" && (
          <SkillLevelStep formData={formData} updateFormData={updateFormData} onNext={handleNext} error={error} />
        )}

        {currentStep === "codeforces" && (
          <CodeforcesStep formData={formData} updateFormData={updateFormData} onNext={handleNext} error={error} />
        )}

        {currentStep === "quiz" && (
          <QuizStep formData={formData} updateFormData={updateFormData} onNext={handleNext} error={error} />
        )}

        {currentStep === "congratulations" && <CongratulationsStep router={router} />}
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
  return (
    <div className="flex gap-3 shrink-0">
      <div className="flex flex-col items-center gap-2">
        <div
          className={`
          flex items-center justify-center w-10 h-10 rounded-full border-4 text-xl font-bold shrink-0 bg-transparent
          ${active ? "border-accent text-accent" : completed ? "border-primary text-primary" : "border-white text-white"}
        `}
        >
          {number}
        </div>
        {number < 3 && (
          <div className="hidden lg:flex flex-col gap-4">
            <div className={`w-2 h-2 rounded-full border-2 bg-transparent ${active ? "border-accent" : completed ? "border-primary" : "border-white"}`} />
            <div className={`w-2 h-2 rounded-full border-2 bg-transparent ${active ? "border-accent" : completed ? "border-primary" : "border-white"}`} />
            <div className={`w-2 h-2 rounded-full border-2 bg-transparent ${active ? "border-accent" : completed ? "border-primary" : "border-white"}`} />
          </div>
        )}
      </div>
      <span className={`text-xs lg:text-2xl pt-1.5 whitespace-nowrap ${active ? "text-accent" : completed ? "text-primary" : "text-white"}`}>
        {title}
      </span>
    </div>
  );
}

function PersonalInfoStep({
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
    <div className="bg-gradient-to-b from-[#FFFFFF]/25 from-0% via-[#FFFFFF]/20 via-50% to-[#FFFFFF]/6 to-100% rounded-2xl p-6 md:p-8 w-[456px] border border-black">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">Register with CodePath</h2>
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
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(e) => updateFormData("fullName", e.target.value)}
        />

        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => updateFormData("email", e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => updateFormData("password", e.target.value)}
        />

        <Input
          type="tel"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => updateFormData("phone", e.target.value)}
        />

        <Select
          value={formData.country}
          onChange={(e) => updateFormData("country", e.target.value)}
        >
          <option value="">Choose a country</option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="ca">Canada</option>
          <option value="au">Australia</option>
          <option value="in">India</option>
        </Select>

        <Textarea
          placeholder="Tell us about yourself"
          value={formData.bio}
          onChange={(e) => updateFormData("bio", e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={onNext} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-foreground hover:text-accent hover:underline">
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
    <div className="bg-gradient-to-b from-[#FFFFFF]/25 from-0% via-[#FFFFFF]/20 via-50% to-[#FFFFFF]/6 to-100% rounded-2xl p-6 md:p-8 w-[456px] border border-black">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">Choose Assessment Method</h2>
      <p className="text-muted-foreground text-center text-sm mb-8">
        Choose how you'd like us to assess your current skill level
      </p>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 mb-4">
          {error}
        </div>
      )}

      <RadioGroup
        value={formData.assessmentMethod}
        onValueChange={(value) => updateFormData("assessmentMethod", value as any)}
        className="space-y-4"
      >
        <label
          className={`
            flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors
            ${formData.assessmentMethod === "codeforces" ? "bg-primary" : "bg-primary/80 hover:bg-primary"}
          `}
        >
          <RadioGroupItem value="codeforces" id="codeforces" className="border-foreground text-foreground" />
          <span className="text-primary-foreground font-medium">Connect your Codeforces account</span>
        </label>

        <label
          className={`
            flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors
            ${formData.assessmentMethod === "quiz" ? "bg-primary" : "bg-primary/80 hover:bg-primary"}
          `}
        >
          <RadioGroupItem value="quiz" id="quiz" className="border-foreground text-foreground" />
          <span className="text-primary-foreground font-medium">Take a placement quiz</span>
        </label>

        <label
          className={`
            flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors
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
  error,
}: {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  onNext: () => void;
  error: string;
}) {
  return (
    <div className="bg-gradient-to-b from-[#FFFFFF]/25 from-0% via-[#FFFFFF]/20 via-50% to-[#FFFFFF]/6 to-100% rounded-2xl p-6 md:p-8 w-[456px] border border-black">
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
      >
        <option value="">Choose your level</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
        <option value="expert">Expert</option>
      </Select>

      <div className="flex justify-end mt-8">
        <Button
          onClick={onNext}
          disabled={!formData.skillLevel}
          className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function CodeforcesStep({
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
    <div className="bg-gradient-to-b from-[#FFFFFF]/25 from-0% via-[#FFFFFF]/20 via-50% to-[#FFFFFF]/6 to-100% rounded-2xl p-6 md:p-8 w-[456px] border border-black">
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

      <div className="flex justify-end mt-8">
        <Button
          onClick={onNext}
          disabled={!formData.codeforcesHandle}
          className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
        >
          Connect <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function QuizStep({
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
  const updateQuizAnswer = (index: number, value: string) => {
    const newAnswers = [...formData.quizAnswers];
    newAnswers[index] = value;
    updateFormData("quizAnswers", newAnswers);
  };

  return (
    <div className="bg-gradient-to-b from-[#FFFFFF]/25 from-0% via-[#FFFFFF]/20 via-50% to-[#FFFFFF]/6 to-100% rounded-2xl p-6 md:p-8 w-[456px] border border-black">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">Take a placement quiz</h2>
      <p className="text-muted-foreground text-center text-sm mb-8">
        Answer the following questions below to help us analyze your skills.
      </p>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {[0, 1, 2].map((index) => (
          <div key={index}>
            <Label className="text-foreground mb-2 block">Question {index + 1}</Label>
            <Textarea
              placeholder="Answer here"
              value={formData.quizAnswers[index]}
              onChange={(e) => updateQuizAnswer(index, e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={onNext} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function CongratulationsStep({ router }: { router: any }) {
  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-12 max-w-xl text-center border border-border">
      <h2 className="text-3xl font-bold text-primary-foreground mb-4">Congratulations 🎉</h2>

      <p className="text-primary-foreground/90 mb-2">Your CodePrint is ready!</p>
      <p className="text-primary-foreground/90 mb-6">Let's start your training journey</p>

      <p className="text-primary-foreground text-lg mb-8">
        Your level is <span className="font-bold">Advanced</span>
      </p>

      <Button
        onClick={() => router.push("/")}
        className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
      >
        Go to Home <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
