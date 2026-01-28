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
}

export interface FavouriteProblem {
  id: string;
  externalProblemId: string;
  platform: string;
  createdAt: Date | string;
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

// Contest Types
export interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  problems: string[]; // problem IDs
  participants: string[]; // user IDs
  status: "upcoming" | "ongoing" | "ended";
  type: "practice" | "official";
  createdAt: string;
}

export interface ContestSubmission {
  submissionId: string;
  userId: string;
  problemId: string;
  submittedAt: string;
  status: Submission["status"];
  penalty: number;
}

export interface ContestScoreboard {
  userId: string;
  username: string;
  problemsSolved: number;
  totalPenalty: number;
  submissions: ContestSubmission[];
  rank: number;
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

// Register Response
export interface RegisterResponse {
  message: string;
  newUserId: string;
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
export interface QuizQuestionSafe {
  id: number;
  questionTitle: string;
  answer: string;
  score: number;
  createdAt: Date | string;
}

export interface QuizQuestionList {
  questionTitle: string;
  createdAt: Date | string;
}

export interface QuizQuestionForMentee {
  id: number;
  questionTitle: string;
  score: number;
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

// Mentee Profile Response
export interface MenteeProfileResponse {
  mentee: MenteeProfile;
  externalAccountIntegration: ExternalAccount[];
}

