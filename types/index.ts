/**
 * Type definitions for CodePath application
 * Matches backend API types exactly
 */

// User Types - Matching backend
export interface User {
  id: string;
  email: string;
  role: string; // "Admin" | "Mentee" - matches backend role.title
}

export interface AdminSafe {
  id: string;
  username: string;
  email: string;
  createdAt: Date | string;
}

export interface MenteeSafe {
  id: string;
  username: string;
  email: string;
  createdAt: Date | string;
}

export interface MenteeDetails {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  bio: string;
  createdAt: Date | string;
}

export interface MenteeProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  bio: string;
  createdAt: Date | string;
}

export interface Role {
  id: number;
  title: string;
  createdAt: Date | string;
}

// Problem Types - Matching backend
export interface CodeforcesProblem {
  title: string;
  tags: string[];
  rating: number | null;
  index: string;
  contestId: number | null;
}

export interface ProblemsResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: CodeforcesProblem[];
  availableTags?: string[];
}

export type ProblemListSort = "rating_asc" | "rating_desc" | "title_asc";

/** Single problem detail from GET /problems/:contestId/:index (scraped from Codeforces) */
export interface CodeforcesProblemDetail {
  title: string;
  timeLimit: string;
  memoryLimit: string;
  inputFile?: string;
  outputFile?: string;
  description: string;
  inputSpecification: string;
  outputSpecification: string;
  sampleTests: Array<{ input: string; output: string }>;
  note?: string;
  tags: string[];
  difficulty: string;
  statistics?: { solvedCount: number; attemptedCount: number; accuracy: string };
  raw?: {
    descriptionHtml?: string;
    inputSpecHtml?: string;
    outputSpecHtml?: string;
    noteHtml?: string;
  };
  contestId: number;
  index: string;
  problemUrl?: string;
  fetchedAt?: string;
}

/** Response from POST /problems/run (Piston code execution) */
export interface RunCodeResponse {
  stdout: string;
  stderr: string;
  output: string;
  code: number;
  signal: string | null;
}

export type FavouritePlatform = "Codeforces" | "CodePath" | "LeetCode";

export interface FavouriteProblem {
  id: string;
  externalProblemId: string;
  platform: FavouritePlatform | string;
  createdAt: Date | string;
}

export interface FavouriteProblemWithDetails extends FavouriteProblem {
  title?: string;
  tags?: string[];
  rating?: number | null;
  contestId?: number;
  index?: string;
  slug?: string;
}

// CodePath Problem Types (first-party problem set)
export type ProblemPublishStatus = "DRAFT" | "PUBLISHED";

export interface CodePathProblemListItem {
  id: string;
  slug: string;
  title: string;
  rating: number;
  tags: string[];
  status: ProblemPublishStatus;
  timeLimitMs: number;
  memoryLimitMb: number;
  testCaseCount?: number;
  sampleCaseCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CodePathProblemsListResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: CodePathProblemListItem[];
  availableTags?: string[];
}

export interface ProblemTestCase {
  id: string;
  input: string;
  expectedOutput?: string;
  isSample: boolean;
  sortOrder: number;
}

export interface CodePathProblemDetail {
  id: string;
  slug: string;
  title: string;
  statement: string;
  inputDescription: string;
  outputDescription: string;
  constraints: string | null;
  rating: number;
  tags: string[];
  timeLimitMs: number;
  memoryLimitMb: number;
  status: ProblemPublishStatus;
  testCases: ProblemTestCase[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCodePathProblemInput {
  slug?: string;
  title: string;
  statement: string;
  inputDescription: string;
  outputDescription: string;
  constraints?: string | null;
  rating: number;
  tags: string[];
  timeLimitMs?: number;
  memoryLimitMb?: number;
}

export interface UpdateCodePathProblemInput {
  slug?: string;
  title?: string;
  statement?: string;
  inputDescription?: string;
  outputDescription?: string;
  constraints?: string | null;
  rating?: number;
  tags?: string[];
  timeLimitMs?: number;
  memoryLimitMb?: number;
}

export interface CreateProblemTestCaseInput {
  input: string;
  expectedOutput: string;
  isSample?: boolean;
  sortOrder?: number;
}

export interface UpdateProblemTestCaseInput {
  input?: string;
  expectedOutput?: string;
  isSample?: boolean;
  sortOrder?: number;
}

export type SubmissionVerdict = "AC" | "WA" | "TLE" | "RE" | "CE" | "JE";

export interface CodePathSubmissionSummary {
  id: string;
  problemId: string;
  language: string;
  verdict: SubmissionVerdict;
  passedCount: number;
  totalCount: number;
  runtimeMs: number | null;
  message: string | null;
  createdAt: string;
}

export interface CodePathSampleCaseResult {
  index: number;
  verdict: SubmissionVerdict;
  stdout: string;
  stderr: string;
  timeMs: number | null;
}

export interface CodePathSubmitResponse {
  submission: CodePathSubmissionSummary;
  sampleCaseResults: CodePathSampleCaseResult[];
}

export interface CodePathSubmissionsListResponse {
  submissions: CodePathSubmissionSummary[];
}

export interface CodePathSubmissionDetail extends CodePathSubmissionSummary {
  code: string;
  stderr: string | null;
  problem: {
    id: string;
    slug: string;
    title: string;
    status: ProblemPublishStatus;
  };
  user: {
    id: string;
    username?: string;
    email?: string;
  };
}

// Submission Types
export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  language: "cpp" | "java" | "python" | "javascript";
  sourceCode: string;
  status: "pending" | "accepted" | "wrong_answer" | "time_limit_exceeded" | "runtime_error" | "compilation_error";
  verdict: string;
  timeUsed: number; // in milliseconds
  memoryUsed: number; // in KB
  submittedAt: string;
}

// Contest Types — matching backend /contests API
export type ContestStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

export type ContestDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface ContestSummary {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: ContestStatus;
  difficulty: ContestDifficulty;
  durationMinutes: number;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  freezeEnabled: boolean;
  freezeMinutes: number | null;
  virtualStartTime: string | null;
  rulesOfEngagement: string[];
  createdAt: string;
  problemCount: number;
  participantCount: number;
  activeParticipantCount: number;
  myProgress?: {
    solvedCount: number;
    totalProblems: number;
    rank: number | null;
    isParticipant: boolean;
  };
}

export interface ContestProblemItem {
  id: string;
  label: string;
  order: number;
  codePathProblem: {
    id: string;
    slug: string;
    title: string;
    rating: number;
    tags: string[];
  };
}

export interface ContestParticipant {
  id: string;
  userId: string;
  username: string;
  fullName: string | null;
  virtualStartTime: string | null;
  finished: boolean;
  isVirtualReplay?: boolean;
  solvedCount?: number;
  rank?: number | null;
}

export interface ContestDetail {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: ContestStatus;
  difficulty: ContestDifficulty;
  durationMinutes: number;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  freezeEnabled: boolean;
  freezeMinutes: number | null;
  virtualStartTime: string | null;
  rulesOfEngagement: string[];
  createdByUserId: string;
  createdAt: string;
  problems: ContestProblemItem[];
  problemCount?: number;
  contentLocked?: boolean;
  participants: ContestParticipant[];
}

export interface ScoreboardProblemCell {
  label: string;
  accepted: boolean;
  timeMinutes: number | null;
  wrongAttempts: number;
}

export interface ScoreboardRow {
  rank: number;
  participantId: string;
  userId: string;
  username: string;
  fullName: string | null;
  solvedCount: number;
  penalty: number;
  problems: ScoreboardProblemCell[];
}

export interface ContestScoreboardResponse {
  contestId: string;
  frozen: boolean;
  freezeMinutes: number | null;
  scoreboard: ScoreboardRow[];
}

export interface ContestSubmissionRecord {
  id: string;
  contestProblemId: string;
  problemLabel?: string;
  codePathProblemId?: string;
  verdict: string;
  submissionTimeMinutes: number;
  programmingLanguage: string;
  codePathSubmissionId?: string | null;
  createdAt: string;
}

export interface ContestSubmitResponse {
  submission: ContestSubmissionRecord;
  judge: {
    verdict: SubmissionVerdict;
    passedCount: number;
    totalCount: number;
    runtimeMs?: number | null;
    message?: string | null;
    sampleCaseResults?: Array<{
      index: number;
      verdict: SubmissionVerdict;
      stdout?: string | null;
      stderr?: string | null;
      timeMs?: number | null;
    }>;
  };
}

export interface CreateContestInput {
  title: string;
  description?: string;
  difficulty?: ContestDifficulty;
  durationMinutes: number;
  scheduledStartTime?: string | null;
  freezeEnabled?: boolean;
  freezeMinutes?: number | null;
  rulesOfEngagement?: string[];
  problems?: Array<{ codePathProblemId: string }>;
  selection?: {
    targetSkillTier?: string;
    topics?: Array<{ id?: number; title: string }>;
    totalProblems?: number;
  };
}

// Coach & Booking Types
export interface CoachProfile {
  id: string;
  specialty: string;
  bio: string | null;
  hourlyRate: string | null;
  isAvailable: boolean;
  bookingLink: string | null;
  user: {
    id: string;
    username: string;
    email: string;
    profile: {
      fullName: string | null;
      country: string | null;
      avatarUrl: string | null;
    } | null;
  };
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface BookingSummary {
  id: string;
  coachId: string;
  coachName: string;
  menteeId: string;
  menteeName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  meetingUrl: string | null;
  notes: string | null;
  calEventUid: string | null;
  createdAt: string;
}

export interface CreateCoachInput {
  name: string;
  username: string;
  email: string;
  password: string;
  country: string;
  phone?: string;
  specialty: string;
  bio?: string;
  hourlyRate?: number | null;
  isAvailable?: boolean;
  bookingLink?: string;
}

// Reference Library Types
export interface SolutionSnippet {
  id: string;
  userId: string;
  topicId: number | null;
  title: string;
  language: string;
  code: string;
  notes: string | null;
  tags: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  topic: { id: number; title: string } | null;
}

export interface ReferenceCurateSection {
  title: string;
  description?: string;
  snippetIds?: string[];
}

export interface ReferenceCurateResponse {
  sections: ReferenceCurateSection[];
  snippetCount: number;
}

// Nearby Peers
export interface NearbyMentee {
  userId: string;
  username: string;
  fullName: string | null;
  country: string | null;
  city: string | null;
  organization: string | null;
  rating: number | null;
  accuracy: number | null;
  problemsSolved: number | null;
  level: string | null;
  similarityScore: number;
}

// Roadmap Generation
export interface GenerateRoadmapResponse {
  roadmap: {
    id: number;
    title: string;
    description: string;
    progressId: number;
    currentModuleId: number | null;
  };
  modules: Array<{
    order: number;
    topicId: number | null;
    topicTitle: string;
    suggestedDifficultyRange: string;
    learningObjective: string;
    estimatedHours: number;
    practiceProblems: unknown[];
  }>;
}

// Topic
export interface Topic {
  id: number;
  title: string;
  tags?: string;
  rating?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// CodePrint Dashboard Types
export interface SkillAnalysis {
  topic: string;
  strength: number; // 0-100
  problemsSolved: number;
  averageTime: number;
  accuracy: number; // 0-100
}

export interface CodePrintData {
  skills: SkillAnalysis[];
  ratingHistory: RatingPoint[];
  totalSolved: number;
  totalContests: number;
  currentRating: number;
  lastUpdated: string;
}

export interface RatingPoint {
  date: string;
  rating: number;
  contestId?: string;
}

// Learning Path Types
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  topics: LearningTopic[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedDuration: number; // in hours
}

export interface LearningTopic {
  id: string;
  title: string;
  description: string;
  problems: string[]; // problem IDs
  resources: Resource[];
  order: number;
}

export interface Resource {
  id: string;
  title: string;
  type: "article" | "video" | "tutorial";
  url: string;
  description: string;
}

// AI Chat Types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  hintLevel?: number; // 1-3 for hints
}

/** Backend forwards FastAPI { reply }; older shapes kept for compatibility. */
export interface ChatbotResponse {
  reply?: string;
  answer?: string;
  response?: string;
  message?: string;
}

// API Response Types - Backend returns direct data or { message, ...data }
export interface BackendErrorResponse {
  message: string;
  error?: any;
  status?: string;
  details?: any;
}

export interface BackendSuccessResponse<T = any> {
  message?: string;
  [key: string]: any; // Backend responses vary, so we use index signature
}

// Login Response
export interface LoginResponse {
  message: string;
  accessToken: string;
  user: User;
}

// Register Response - Now returns token and user (same as login) for auto-login
export interface RegisterResponse {
  message: string;
  accessToken: string;
  user: User;
}

// Legacy ApiResponse for compatibility (if needed)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// External Platform Types
export interface CodeforcesSubmission {
  id: number;
  contestId?: number;
  problem: {
    contestId?: number;
    index: string;
    name: string;
  };
  verdict: string;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
  creationTimeSeconds: number;
}

export interface LeetCodeSubmission {
  id: string;
  title: string;
  status: string;
  lang: string;
  timestamp: string;
}

// Quiz Types - Matching backend
export interface QuizOptionSafe {
  id: number;
  optionText: string;
  orderIndex: number;
  isCorrect: boolean;
}

export interface QuizOptionForMentee {
  id: number;
  optionText: string;
  orderIndex: number;
}

export interface QuizOptionInput {
  optionText: string;
  orderIndex: number;
  isCorrect: boolean;
}

export interface QuizQuestionSafe {
  id: number;
  questionTitle: string;
  score: number;
  createdAt: Date | string;
  options: QuizOptionSafe[];
}

export interface QuizQuestionList {
  id: number;
  questionTitle: string;
  createdAt: Date | string;
}

export interface QuizQuestionForMentee {
  id: number;
  questionTitle: string;
  score: number;
  options: QuizOptionForMentee[];
}

// Contact Types - Matching backend
export interface ContactInfo {
  id: number;
  email: string;
  phone: string;
  facebook: string;
  instagram: string;
  youtube: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ContactInquirySafe {
  id: number;
  fullName: string;
  title: string;
  createdAt: Date | string;
}

export interface ContactInquiryDetails {
  id: number;
  fullName: string;
  email: string;
  title: string;
  message: string;
  createdAt: Date | string;
}

// External Account Types - Matching backend
export interface ExternalAccount {
  id: number;
  platform: string;
  handle: string;
  lastSynced: Date | string | null;
  isVerified: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CodeforcesIntegrationStatus {
  linked: boolean;
  handle: string | null;
  platform?: string;
  isVerified: boolean;
  lastSynced: string | null;
  codePathLevel: string | null;
}

// Skill assessment profile (computed + cached on backend)
export type SkillConfidence = "high" | "medium" | "low";
export type SkillPrimarySource =
  | "codeforces"
  | "codepath"
  | "contest"
  | "placement"
  | "blended"
  | "none";

export type SkillSyncStatus =
  | "idle"
  | "pending_choice"
  | "syncing"
  | "complete"
  | "failed";

export type AssessmentMethod = "ai" | "rules";

export type SkillLevelPreference =
  | "auto"
  | "blended"
  | "codeforces"
  | "codepath"
  | "contest"
  | "placement";

export interface SourceContribution {
  source: Exclude<SkillPrimarySource, "none" | "blended">;
  tier: string;
  rating: number | null;
  weight: number;
  label: string;
}

export interface SkillLevelOption {
  preference: SkillLevelPreference;
  label: string;
  tier: string;
  rating: number | null;
  description: string;
}

export interface AssessmentMethodOption {
  method: AssessmentMethod;
  label: string;
  description: string;
  previewTier?: string;
  previewRating?: number | null;
}

export interface MenteeSkillProfileSources {
  codeforces: {
    connected: boolean;
    handle: string | null;
    rating: number | null;
    problemsSolved: number;
    accuracy: number | null;
  };
  codepath: {
    solvedCount: number;
    attemptedCount: number;
    avgSolvedRating: number;
    accuracy: number;
    topicPerformance: Array<{
      topic: string;
      attempts: number;
      solved: number;
      accuracy: number;
    }>;
  };
  contest: {
    participatedCount: number;
    finishedCount: number;
    avgSolveRate: number;
    avgProblemRating: number;
    totalContestSolves: number;
  };
  placement: {
    skillLevelId: number;
    skillLevelTitle: string;
    assessmentType: string;
    score: number;
    assessedAt: string;
  } | null;
}

export interface MenteeSkillProfile {
  tier: string;
  rating: number | null;
  confidence: SkillConfidence;
  primarySource: SkillPrimarySource;
  levelPreference?: SkillLevelPreference;
  assessmentMethod?: AssessmentMethod;
  skillLevelId: number | null;
  sources: MenteeSkillProfileSources;
  contributions?: SourceContribution[];
  reasoning?: string;
  syncStatus?: SkillSyncStatus;
  syncError?: string | null;
  computedAt: string;
}

// Mentee Profile API response - matches GET /users/mentees/profile/view
export interface MenteeProfileStatistics {
  problemsSolved: number;
  quizResult: string;
  level: string;
  rating: number;
  confidence?: SkillConfidence;
  primarySource?: SkillPrimarySource;
}

export interface MenteeProfileResponse {
  mentee: MenteeProfile;
  externalAccountIntegration: ExternalAccount | ExternalAccount[] | null;
  statistics: MenteeProfileStatistics;
  skillProfile?: MenteeSkillProfile;
}

// Roadmap Types - Matching backend
export interface RoadmapSummary {
  learningPathId: number;
  learningPathTitle: string;
  progressPercentage: number;
  modulesCompleted: number;
  topicsMastered: number;
  totalModules: number;
  accuracy: number;
  activeStreak: number;
  isPersonalRoadmap?: boolean;
}

export interface ModuleProblemProgress {
  externalProblemId: string;
  platform: string;
  solved: boolean;
}

export interface ModulePerformanceStats {
  roadmapProblems: number;
  generalProblems: number;
  wrongSubmissions: number;
  acceptedSolutions: number;
}

export interface ModuleWithProgress {
  id: number;
  title: string;
  topicTitle?: string;
  moduleOrder: number | null;
  totalProblems: number;
  solvedProblems: number;
  completionPercentage: number;
  isCompleted: boolean;
  accuracy?: number;
  proficiency?: string;
  performance?: ModulePerformanceStats;
  problems?: ModuleProblemProgress[];
}

export interface MyRoadmapModulesWithProgress {
  learningPathId: number;
  learningPathTitle: string;
  modules: ModuleWithProgress[];
  currentModule: ModuleWithProgress | null;
}

export interface UserAchievement {
  id: number;
  achievementId: number;
  name: string;
  description: string;
  achievementType: string;
  iconUrl: string;
  progressData: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface PathModuleResource {
  id: number;
  pathModuleId: number;
  resourceType: string;
  title: string;
  description?: string;
  url?: string;
}

export interface PathModuleProblem {
  id: number;
  pathModuleId: number;
  externalProblemId: string;
  platform: string;
}

export interface PathModuleWithDetails {
  id: number;
  learningPathId: number;
  title: string;
  description: string;
  moduleOrder?: number;
  estimatedHours?: number | null;
  topicId?: number | null;
  learningObjectives?: unknown;
  successCriteria?: unknown;
  moduleResources: PathModuleResource[];
  moduleProblems: PathModuleProblem[];
  topic?: { id: number; title: string };
}

export interface RoadmapWithModules {
  id: number;
  title: string;
  description?: string;
  skillLevel: string;
  targetSkillLevelId?: number;
  pathModules: PathModuleWithDetails[];
}

export interface AdminRoadmapListItem {
  id: number;
  title: string;
  skillLevel: string;
  modulesCount: number;
  duration: number;
  createdAt: string;
}

export interface CreateRoadmapInput {
  title: string;
  description: string;
  targetSkillLevelId: number;
}

export interface UpdateRoadmapInput {
  title?: string;
  description?: string;
  targetSkillLevelId?: number;
}

export interface CreateRoadmapModuleInput {
  learningPathId: number;
  title: string;
  description: string;
  topicId?: number;
  moduleOrder?: number;
  estimatedHours?: number;
  learningObjectives?: Record<string, string>;
  successCriteria?: Record<string, string>;
}

export interface UpdateRoadmapModuleInput {
  title?: string;
  description?: string;
  topicId?: number;
  moduleOrder?: number;
  estimatedHours?: number;
  learningObjectives?: Record<string, string>;
  successCriteria?: Record<string, string>;
}

export interface CreateRoadmapResourceInput {
  pathModuleId: number;
  resourceType: string;
  title: string;
  description?: string;
  url?: string;
}

export interface UpdateRoadmapResourceInput {
  resourceType?: string;
  title?: string;
  description?: string;
  url?: string;
}

export interface CreateRoadmapProblemInput {
  pathModuleId: number;
  externalProblemId: string;
  platform: "Codeforces" | "CodePath";
}

export interface UpdateRoadmapProblemInput {
  externalProblemId?: string;
  platform?: "Codeforces" | "CodePath";
}

// Mentee statistics (GET /statistics/mentee) - CodePrint dashboard
export interface MenteeStatisticsResponse {
  codePathRating: number;
  codePathLevel: string;
  problemsSolved: number;
  accuracy: number;
  yourCodePrint: Array<{ topic: string; attempts: number }>;
  insightsPanel: string;
  skillProfile?: MenteeSkillProfile;
}

// CodePrint dashboard - consistency & growth (GET /statistics/mentee/activity, /statistics/mentee/growth)
export interface ActivityByDateResponse {
  codeprint: Record<string, number>;
  codeforces: Record<string, number>;
}

export interface GrowthSourceMonthStat {
  submissions: number;
  problemsSolved: number;
}

export interface GrowthMonthStat {
  year: number;
  month: number;
  monthLabel: string;
  codeprint: GrowthSourceMonthStat;
  codeforces: GrowthSourceMonthStat;
}

export interface GrowthTimelineResponse {
  months: GrowthMonthStat[];
}

export interface InsightItem {
  id: number;
  content: string;
}

export interface AdminInsight extends InsightItem {
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Skill levels (GET /skill-levels) - for manual assessment
export interface SkillLevel {
  id: number;
  title: string;
  description: string;
  targetRatingRange: string;
  expectedKnowledge: string;
  createdAt: string;
  updatedAt: string;
}

