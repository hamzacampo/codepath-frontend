/**
 * API Service - Matches backend API endpoints exactly
 */

import apiClient from "./api-client";
import type {
  LoginResponse,
  RegisterResponse,
  AdminSafe,
  MenteeSafe,
  MenteeDetails,
  MenteeProfileResponse,
  MenteeSkillProfile,
  SkillLevelOption,
  SkillLevelPreference,
  AssessmentMethod,
  AssessmentMethodOption,
  SkillSyncStatus,
  Role,
  ProblemsResponse,
  CodeforcesProblem,
  CodeforcesProblemDetail,
  RunCodeResponse,
  FavouriteProblem,
  FavouriteProblemWithDetails,
  QuizQuestionSafe,
  QuizQuestionList,
  QuizQuestionForMentee,
  QuizOptionInput,
  ContactInfo,
  ContactInquirySafe,
  ContactInquiryDetails,
  BackendSuccessResponse,
  RoadmapSummary,
  ModuleWithProgress,
  MyRoadmapModulesWithProgress,
  UserAchievement,
  RoadmapWithModules,
  AdminRoadmapListItem,
  CreateRoadmapInput,
  UpdateRoadmapInput,
  CreateRoadmapModuleInput,
  UpdateRoadmapModuleInput,
  CreateRoadmapResourceInput,
  UpdateRoadmapResourceInput,
  CreateRoadmapProblemInput,
  UpdateRoadmapProblemInput,
  PathModuleWithDetails,
  PathModuleResource,
  PathModuleProblem,
  MenteeStatisticsResponse,
  ActivityByDateResponse,
  GrowthTimelineResponse,
  InsightItem,
  AdminInsight,
  SkillLevel,
  ChatbotResponse,
  CodePathProblemsListResponse,
  CodePathProblemDetail,
  CodePathProblemListItem,
  CreateCodePathProblemInput,
  UpdateCodePathProblemInput,
  CreateProblemTestCaseInput,
  UpdateProblemTestCaseInput,
  ProblemTestCase,
  ProblemPublishStatus,
  CodePathSubmitResponse,
  CodePathSubmissionsListResponse,
  CodePathSubmissionDetail,
  SubmissionVerdict,
  ContestSummary,
  ContestDetail,
  ContestScoreboardResponse,
  ContestSubmissionRecord,
  ContestSubmitResponse,
  CreateContestInput,
  CodeforcesIntegrationStatus,
  CoachProfile,
  BookingSummary,
  BookingStatus,
  CreateCoachInput,
  SolutionSnippet,
  ReferenceCurateResponse,
  NearbyMentee,
  GenerateRoadmapResponse,
  Topic,
} from "../types";

class APIService {
  // ============ Auth Endpoints ============
  /**
   * Login - POST /auth/login
   * Body: { email, password }
   * Returns: { message, accessToken, user: { id, email, role } }
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  }

  /**
   * Register Mentee - POST /auth/mentee/register
   * Body: { fullName, username, email, password, phone?, country, bio? }
   * Returns: { message, newUserId }
   * Note: roleId is automatically set to Mentee role by backend
   */
  async registerMentee(data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    country: string;
    bio?: string;
  }): Promise<RegisterResponse> {
    const response = await apiClient.post("/auth/mentee/register", data);
    return response.data;
  }

  // ============ User Endpoints ============
  /**
   * Get Admins - GET /users/admins
   * Returns: AdminSafe[]
   */
  async getAdmins(): Promise<AdminSafe[]> {
    const response = await apiClient.get("/users/admins");
    return response.data;
  }

  /**
   * Get Admin by ID - GET /users/admins/:id
   * Returns: AdminSafe
   */
  async getAdmin(id: string): Promise<AdminSafe> {
    const response = await apiClient.get(`/users/admins/${id}`);
    return response.data;
  }

  /**
   * Create Admin - POST /users/admins/create
   * Body: { username, email, password, roleId }
   * Returns: { message }
   */
  async createAdmin(data: {
    username: string;
    email: string;
    password: string;
    roleId: number;
  }): Promise<BackendSuccessResponse> {
    const response = await apiClient.post("/users/admins/create", data);
    return response.data;
  }

  /**
   * Update Admin - POST /users/admins/update/:id
   * Body: { username?, email?, password? }
   * Returns: { message, admin }
   */
  async updateAdmin(
    id: string,
    data: { username?: string; email?: string; password?: string }
  ): Promise<BackendSuccessResponse & { admin: AdminSafe }> {
    const response = await apiClient.post(`/users/admins/update/${id}`, data);
    return response.data;
  }

  /**
   * Delete Admin - DELETE /users/admins/delete/:id
   * Returns: { message }
   */
  async deleteAdmin(id: string): Promise<BackendSuccessResponse> {
    const response = await apiClient.delete(`/users/admins/delete/${id}`);
    return response.data;
  }

  /**
   * Get Mentees - GET /users/mentees?name=&email=&level=
   * Query params: name?, email?, level?
   * Returns: MenteeSafe[]
   */
  async getMentees(params?: {
    name?: string;
    email?: string;
    level?: string;
  }): Promise<MenteeSafe[]> {
    const response = await apiClient.get("/users/mentees", { params });
    return response.data;
  }

  /**
   * Get Mentee by ID - GET /users/mentees/:id
   * Returns: MenteeDetails
   */
  async getMentee(id: string): Promise<MenteeDetails> {
    const response = await apiClient.get(`/users/mentees/${id}`);
    return response.data;
  }

  /**
   * Get Mentee Profile - GET /users/mentees/profile/view
   * Returns: { mentee, externalAccountIntegration, statistics }
   */
  async getMenteeProfile(): Promise<MenteeProfileResponse> {
    const response = await apiClient.get("/users/mentees/profile/view");
    return response.data;
  }

  /**
   * Get computed skill profile - GET /users/mentees/skill-profile
   */
  async getMenteeSkillProfile(refresh = false): Promise<MenteeSkillProfile> {
    const response = await apiClient.get("/users/mentees/skill-profile", {
      params: refresh ? { refresh: "true" } : undefined,
    });
    return response.data;
  }

  /**
   * Update Mentee Profile - POST /users/mentees/profile/update
   * Body: { fullName?, phone?, country?, bio? }
   * Returns: { message }
   */
  async updateMenteeProfile(data: {
    fullName?: string;
    phone?: string;
    country?: string;
    bio?: string;
  }): Promise<BackendSuccessResponse> {
    const response = await apiClient.post("/users/mentees/profile/update", data);
    return response.data;
  }

  /**
   * Update Mentee Password - POST /users/mentees/password/update
   * Body: { currentPassword, newPassword, confirmNewPassword }
   * Returns: { message }
   */
  async updateMenteePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<BackendSuccessResponse> {
    const response = await apiClient.post("/users/mentees/password/update", data);
    return response.data;
  }

  /**
   * Set Mentee Skill Level (Manual assessment) - POST /users/mentees/skill-level
   * Body: { skillLevelId }
   * Returns: { message, skillLevel: { id, title } }
   */
  async setMenteeSkillLevel(skillLevelId: number): Promise<{
    message: string;
    skillLevel: { id: number; title: string };
  }> {
    const response = await apiClient.post("/users/mentees/skill-level", {
      skillLevelId,
    });
    return response.data;
  }

  /**
   * Get Roles - GET /users/roles
   * Returns: Role[]
   */
  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get("/users/roles");
    return response.data;
  }

  /**
   * Get Role by ID - GET /users/roles/:id
   * Returns: Role
   */
  async getRole(id: number): Promise<Role> {
    const response = await apiClient.get(`/users/roles/${id}`);
    return response.data;
  }

  // ============ Problem Endpoints ============
  /**
   * Get Problems - GET /problems?page=1&limit=20
   * Query params: page?, limit?
   * Returns: { page, limit, total, totalPages, items }
   */
  async getProblems(params?: {
    page?: number;
    limit?: number;
    minRating?: number | null;
    maxRating?: number | null;
    tag?: string | null;
    search?: string | null;
    sort?: "rating_asc" | "rating_desc" | "title_asc";
  }): Promise<ProblemsResponse> {
    const query: Record<string, unknown> = {};
    if (params?.page != null) query.page = params.page;
    if (params?.limit != null) query.limit = params.limit;
    if (params?.minRating != null && params.minRating > 0) query.minRating = params.minRating;
    if (params?.maxRating != null && params.maxRating > 0) query.maxRating = params.maxRating;
    if (params?.tag != null && params.tag !== "all") query.tag = params.tag;
    if (params?.search?.trim()) query.search = params.search.trim();
    if (params?.sort) query.sort = params.sort;
    const response = await apiClient.get("/problems", { params: query });
    return response.data;
  }

  /**
   * Get Problem - GET /problems/:contestId/:index
   * Returns: Full problem detail scraped from Codeforces
   */
  async getProblem(
    contestId: number,
    index: string
  ): Promise<CodeforcesProblemDetail> {
    const response = await apiClient.get(`/problems/${contestId}/${index}`);
    return response.data;
  }

  /**
   * Run Code - POST /problems/run
   * Body: { code, language, stdin? }
   * Returns: RunCodeResponse
   */
  async runCode(data: {
    code: string;
    language: "cpp" | "java" | "python" | "javascript";
    stdin?: string;
  }): Promise<RunCodeResponse> {
    const response = await apiClient.post("/problems/run", data, {
      timeout: 20000,
    });
    return response.data;
  }

  /**
   * Get Favourite Problems - GET /problems/favourites
   * Returns: FavouriteProblemWithDetails[] (enriched with title, rating, tags for Codeforces)
   */
  async getFavouriteProblems(): Promise<FavouriteProblemWithDetails[]> {
    const response = await apiClient.get("/problems/favourites");
    return response.data;
  }

  /**
   * Add Problem to Favourites - POST /problems/favourites/add
   * Body: { externalProblemId, platform }
   * Returns: { message }
   */
  async addProblemToFavourite(data: {
    externalProblemId: string;
    platform: "Codeforces" | "LeetCode" | "CodePath";
  }): Promise<BackendSuccessResponse> {
    const response = await apiClient.post("/problems/favourites/add", data);
    return response.data;
  }

  /**
   * Remove Problem from Favourites - DELETE /problems/favourites/remove/:id
   * Returns: { message }
   */
  async removeProblemFromFavourite(id: string): Promise<BackendSuccessResponse> {
    const response = await apiClient.delete(`/problems/favourites/remove/${id}`);
    return response.data;
  }

  /**
   * Sync submission from Codeforces - POST /problems/sync-submission
   * Body: { contestId, index }
   * Returns: { message, solved, attemptCount }
   */
  async syncSubmission(data: {
    contestId: number;
    index: string;
  }): Promise<{ message: string; solved: boolean; attemptCount: number }> {
    const response = await apiClient.post("/problems/sync-submission", data);
    return response.data;
  }

  // ============ Roadmap Endpoints (Mentee) ============
  /**
   * Get my roadmap summary - GET /roadmaps/my-roadmap/summary
   * Returns: RoadmapSummary
   */
  async getMyRoadmapSummary(): Promise<RoadmapSummary> {
    const response = await apiClient.get("/roadmaps/my-roadmap/summary");
    return response.data;
  }

  /**
   * Get my roadmap modules with progress - GET /roadmaps/my-roadmap/modules-with-progress
   * Returns: MyRoadmapModulesWithProgress
   */
  async getMyRoadmapModulesWithProgress(): Promise<MyRoadmapModulesWithProgress> {
    const response = await apiClient.get(
      "/roadmaps/my-roadmap/modules-with-progress"
    );
    return response.data;
  }

  /**
   * Get my current focus module - GET /roadmaps/my-roadmap/current-focus
   * Returns: ModuleWithProgress | null
   */
  async getMyRoadmapCurrentFocus(): Promise<ModuleWithProgress | null> {
    const response = await apiClient.get(
      "/roadmaps/my-roadmap/current-focus"
    );
    return response.data;
  }

  /**
   * Get my achievements - GET /roadmaps/my-roadmap/achievements
   * Returns: UserAchievement[]
   */
  async getMyRoadmapAchievements(): Promise<UserAchievement[]> {
    const response = await apiClient.get("/roadmaps/my-roadmap/achievements");
    return response.data;
  }

  /**
   * Get roadmap by ID (full with modules) - GET /roadmaps/:id
   * Returns: RoadmapWithModules
   */
  async getRoadmapById(id: number): Promise<RoadmapWithModules> {
    const response = await apiClient.get(`/roadmaps/${id}`);
    return response.data;
  }

  // ============ Roadmap Admin CRUD ============
  async listAdminRoadmaps(): Promise<AdminRoadmapListItem[]> {
    const response = await apiClient.get("/roadmaps");
    return response.data;
  }

  async createAdminRoadmap(
    data: CreateRoadmapInput,
  ): Promise<{ roadmap: AdminRoadmapListItem }> {
    const response = await apiClient.post("/roadmaps/create", data);
    return response.data;
  }

  async updateAdminRoadmap(
    id: number,
    data: UpdateRoadmapInput,
  ): Promise<{ roadmap: AdminRoadmapListItem }> {
    const response = await apiClient.put(`/roadmaps/update/${id}`, data);
    return response.data;
  }

  async deleteAdminRoadmap(id: number): Promise<void> {
    await apiClient.delete(`/roadmaps/delete/${id}`);
  }

  async createRoadmapModule(
    data: CreateRoadmapModuleInput,
  ): Promise<{ module: PathModuleWithDetails }> {
    const response = await apiClient.post("/roadmaps/create/modules", data);
    return response.data;
  }

  async updateRoadmapModule(
    id: number,
    data: UpdateRoadmapModuleInput,
  ): Promise<{ module: PathModuleWithDetails }> {
    const response = await apiClient.put(`/roadmaps/update/modules/${id}`, data);
    return response.data;
  }

  async deleteRoadmapModule(id: number): Promise<void> {
    await apiClient.delete(`/roadmaps/delete/modules/${id}`);
  }

  async createRoadmapResource(
    data: CreateRoadmapResourceInput,
  ): Promise<{ resource: PathModuleResource }> {
    const response = await apiClient.post("/roadmaps/create/resources", data);
    return response.data;
  }

  async updateRoadmapResource(
    id: number,
    data: UpdateRoadmapResourceInput,
  ): Promise<{ resource: PathModuleResource }> {
    const response = await apiClient.put(`/roadmaps/update/resources/${id}`, data);
    return response.data;
  }

  async deleteRoadmapResource(id: number): Promise<void> {
    await apiClient.delete(`/roadmaps/delete/resources/${id}`);
  }

  async createRoadmapProblem(
    data: CreateRoadmapProblemInput,
  ): Promise<{ problem: PathModuleProblem }> {
    const response = await apiClient.post("/roadmaps/create/problems", data);
    return response.data;
  }

  async updateRoadmapProblem(
    id: number,
    data: UpdateRoadmapProblemInput,
  ): Promise<{ problem: PathModuleProblem }> {
    const response = await apiClient.put(`/roadmaps/update/problems/${id}`, data);
    return response.data;
  }

  async deleteRoadmapProblem(id: number): Promise<void> {
    await apiClient.delete(`/roadmaps/delete/problems/${id}`);
  }

  // ============ Statistics (Mentee) - CodePrint ============
  /**
   * Get mentee statistics (rating, level, problems solved, accuracy, CodePrint, insights) - GET /statistics/mentee
   * Returns: MenteeStatisticsResponse
   */
  async getMenteeStatistics(): Promise<MenteeStatisticsResponse> {
    const response = await apiClient.get("/statistics/mentee");
    return response.data;
  }

  /**
   * Get activity by date for consistency tracker - GET /statistics/mentee/activity?year=2025
   * Returns: ActivityByDateResponse
   */
  async getMenteeActivity(year?: number): Promise<ActivityByDateResponse> {
    const response = await apiClient.get("/statistics/mentee/activity", {
      params: year != null ? { year } : undefined,
    });
    return response.data;
  }

  /**
   * Get monthly growth for timeline chart - GET /statistics/mentee/growth
   * Returns: GrowthTimelineResponse
   */
  async getMenteeGrowth(): Promise<GrowthTimelineResponse> {
    const response = await apiClient.get("/statistics/mentee/growth");
    return response.data;
  }

  // ============ Skill Levels (Mentee/Admin) ============
  /**
   * Get all skill levels - GET /skill-levels
   * Returns: SkillLevel[]
   */
  async getSkillLevels(): Promise<SkillLevel[]> {
    const response = await apiClient.get("/skill-levels");
    return response.data;
  }

  // ============ External Accounts (Mentee) ============
  /**
   * Integrate Codeforces account - POST /external-accounts/codeforces/integrate
   * Body: { handle }
   * Returns: { message } and activates roadmap
   */
  async integrateCodeforces(handle: string): Promise<{
    message: string;
    handle?: string;
    codePathLevel?: string;
    skillSyncPending?: boolean;
    requiresLevelChoice?: boolean;
    levelOptions?: SkillLevelOption[];
    assessmentMethods?: AssessmentMethodOption[];
  }> {
    const response = await apiClient.post(
      "/external-accounts/codeforces/integrate",
      { handle }
    );
    return response.data;
  }

  async getCodeforcesIntegration(): Promise<CodeforcesIntegrationStatus> {
    const response = await apiClient.get("/external-accounts/codeforces/integration");
    return response.data;
  }

  async disconnectCodeforces(): Promise<{
    message: string;
    codePathLevel?: string;
    levelOptions?: SkillLevelOption[];
    assessmentMethods?: AssessmentMethodOption[];
    requiresLevelChoice?: boolean;
  }> {
    const response = await apiClient.delete("/external-accounts/codeforces/disconnect");
    return response.data;
  }

  async getSkillLevelOptions(): Promise<{
    options: SkillLevelOption[];
    assessmentMethods: AssessmentMethodOption[];
    currentPreference: SkillLevelPreference;
    currentAssessmentMethod: AssessmentMethod;
    profile?: MenteeSkillProfile;
    autoResolved?: boolean;
  }> {
    const response = await apiClient.get("/users/mentees/skill-level-options");
    return response.data;
  }

  async getSkillSyncStatus(): Promise<{
    status: SkillSyncStatus;
    error: string | null;
    updatedAt: string | null;
  }> {
    const response = await apiClient.get("/users/mentees/skill-sync-status");
    return response.data;
  }

  async setSkillLevelPreference(
    preference: SkillLevelPreference,
    assessmentMethod: AssessmentMethod = "rules",
  ): Promise<{ message: string; profile: MenteeSkillProfile; skillSyncPending?: boolean }> {
    const response = await apiClient.post("/users/mentees/skill-level-preference", {
      preference,
      assessmentMethod,
    });
    return response.data;
  }

  // ============ Quiz Endpoints ============
  /**
   * Get Quiz Questions (Admin) - GET /quiz/questions
   * Returns: QuizQuestionList[]
   */
  async getQuizQuestions(): Promise<QuizQuestionList[]> {
    const response = await apiClient.get("/quiz/questions");
    return response.data;
  }

  /**
   * Get Quiz Question by ID (Admin) - GET /quiz/questions/:id
   * Returns: QuizQuestionSafe
   */
  async getQuizQuestion(id: number): Promise<QuizQuestionSafe> {
    const response = await apiClient.get(`/quiz/questions/${id}`);
    return response.data;
  }

  /**
   * Create Quiz Question (Admin) - POST /quiz/questions/create
   * Body: { questionTitle, score, options }
   * Returns: { message }
   */
  async createQuizQuestion(data: {
    questionTitle: string;
    score: number;
    options: QuizOptionInput[];
  }): Promise<BackendSuccessResponse> {
    const response = await apiClient.post("/quiz/questions/create", data);
    return response.data;
  }

  /**
   * Update Quiz Question (Admin) - POST /quiz/questions/update/:id
   * Body: { questionTitle?, score?, options? }
   * Returns: { message }
   */
  async updateQuizQuestion(
    id: number,
    data: {
      questionTitle?: string;
      score?: number;
      options?: QuizOptionInput[];
    }
  ): Promise<BackendSuccessResponse> {
    const response = await apiClient.post(`/quiz/questions/update/${id}`, data);
    return response.data;
  }

  /**
   * Delete Quiz Question (Admin) - DELETE /quiz/questions/delete/:id
   * Returns: { message }
   */
  async deleteQuizQuestion(id: number): Promise<BackendSuccessResponse> {
    const response = await apiClient.delete(`/quiz/questions/delete/${id}`);
    return response.data;
  }

  /**
   * Get Quiz (Mentee) - GET /quiz?numberofQuestions=10
   * Query params: numberofQuestions (required)
   * Returns: QuizQuestionForMentee[]
   */
  async getQuiz(numberofQuestions: number): Promise<QuizQuestionForMentee[]> {
    const response = await apiClient.get("/quiz", {
      params: { numberofQuestions },
    });
    return response.data;
  }

  /**
   * Get all quiz questions (Mentee) - GET /quiz/all
   * Returns: QuizQuestionForMentee[] (whole QuizQuestion table, shuffled)
   */
  async getQuizAll(): Promise<QuizQuestionForMentee[]> {
    const response = await apiClient.get("/quiz/all");
    return response.data;
  }

  /**
   * Submit DB quiz (Mentee) - POST /quiz/submit-db
   * Body: { answers: [{ questionId, selectedOptionId }] }
   * Returns: { level, totalScore, maxScore }
   */
  async submitQuizDB(
    answers: Array<{ questionId: number; selectedOptionId: number }>
  ): Promise<{ level: string; totalScore: number; maxScore: number }> {
    const response = await apiClient.post("/quiz/submit-db", { answers });
    return response.data;
  }

  /**
   * Get Quiz AI version (Mentee) - GET /quiz/start?numberofQuestions=N
   * Returns: FastAPI response with quizId and questions (for placement quiz)
   */
  async getQuizStart(numberofQuestions: number): Promise<{
    quizId?: number;
    questions?: Array<{
      id: number;
      question?: string;
      questionTitle?: string;
      options?: string[];
    }>;
  }> {
    const response = await apiClient.get("/quiz/start", {
      params: { numberofQuestions },
    });
    return response.data;
  }

  /**
   * Submit Quiz (Mentee) - POST /quiz/submit
   * Body: { quizId?, answers: [{ question_id, selected_option }] }
   * Returns: { MenteeLevel, ResultAccuracy }
   */
  async submitQuiz(
    answers: Array<{ question_id: number; selected_option: number }>,
    quizId?: number
  ): Promise<{ MenteeLevel: string; ResultAccuracy: number; AiInsight?: string | null }> {
    const body: {
      answers: Array<{ question_id: number; selected_option: number }>;
      quizId?: number;
    } = { answers };
    if (quizId != null) body.quizId = quizId;
    const response = await apiClient.post("/quiz/submit", body);
    return response.data;
  }

  // ============ Insights Endpoints ============
  async getActiveInsights(): Promise<InsightItem[]> {
    const response = await apiClient.get("/insights");
    return response.data;
  }

  async getAdminInsights(): Promise<AdminInsight[]> {
    const response = await apiClient.get("/insights/manage");
    return response.data;
  }

  async getAdminInsight(id: number): Promise<AdminInsight> {
    const response = await apiClient.get(`/insights/manage/${id}`);
    return response.data;
  }

  async createInsight(data: {
    content: string;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<AdminInsight> {
    const response = await apiClient.post("/insights/manage", data);
    return response.data;
  }

  async updateInsight(
    id: number,
    data: {
      content?: string;
      isActive?: boolean;
      sortOrder?: number;
    },
  ): Promise<AdminInsight> {
    const response = await apiClient.put(`/insights/manage/${id}`, data);
    return response.data;
  }

  async deleteInsight(id: number): Promise<BackendSuccessResponse> {
    const response = await apiClient.delete(`/insights/manage/${id}`);
    return response.data;
  }

  // ============ Contact Endpoints ============
  /**
   * Get Contact Info - GET /contact/info
   * Returns: ContactInfo
   */
  async getContactInfo(): Promise<ContactInfo> {
    const response = await apiClient.get("/contact/info");
    return response.data;
  }

  /**
   * Update Contact Info (Admin) - POST /contact/info/update
   * Body: { email?, phone?, facebook?, instagram?, youtube? }
   * Returns: { message }
   */
  async updateContactInfo(data: {
    email?: string;
    phone?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  }): Promise<BackendSuccessResponse> {
    const response = await apiClient.post("/contact/info/update", data);
    return response.data;
  }

  /**
   * Get Contact Inquiries (Admin) - GET /contact/inquiries
   * Returns: ContactInquirySafe[]
   */
  async getContactInquiries(): Promise<ContactInquirySafe[]> {
    const response = await apiClient.get("/contact/inquiries");
    return response.data;
  }

  /**
   * Get Contact Inquiry by ID (Admin) - GET /contact/inquiries/:id
   * Returns: ContactInquiryDetails
   */
  async getContactInquiry(id: number): Promise<ContactInquiryDetails> {
    const response = await apiClient.get(`/contact/inquiries/${id}`);
    return response.data;
  }

  /**
   * Send Contact Inquiry - POST /contact/inquiries/send
   * Body: { fullName, email, title, message }
   * Returns: { message }
   */
  async sendContactInquiry(data: {
    fullName: string;
    email: string;
    title: string;
    message: string;
  }): Promise<BackendSuccessResponse> {
    const response = await apiClient.post("/contact/inquiries/send", data);
    return response.data;
  }

  /**
   * Send Mass Email to Mentees (Admin) - POST /contact/send/mentees
   * Body: { emailTitle, emailContent }
   * Returns: { message }
   */
  async sendMassEmailToMentees(data: {
    emailTitle: string;
    emailContent: string;
  }): Promise<BackendSuccessResponse> {
    const response = await apiClient.post("/contact/send/mentees", data);
    return response.data;
  }

  /**
   * Chatbot - POST /chatbot/ask (Mentee only)
   * Body: { question }
   * Returns: { reply } from FastAPI via Node
   */
  async askChatbot(question: string): Promise<ChatbotResponse> {
    const response = await apiClient.post("/chatbot/ask", { question });
    return response.data;
  }

  // ============ CodePath Problem Endpoints (Admin + Mentee) ============

  /**
   * List published CodePath problems - GET /codepath-problems
   */
  async listCodePathProblems(params?: {
    page?: number;
    limit?: number;
    minRating?: number;
    maxRating?: number;
    tag?: string;
    search?: string;
    sort?: "rating_asc" | "rating_desc" | "title_asc";
  }): Promise<CodePathProblemsListResponse> {
    const response = await apiClient.get("/codepath-problems", { params });
    return response.data;
  }

  /**
   * List all CodePath problems (Admin) - GET /codepath-problems/admin/all
   */
  async listAllCodePathProblemsAdmin(params?: {
    page?: number;
    limit?: number;
    status?: ProblemPublishStatus;
    search?: string;
  }): Promise<CodePathProblemsListResponse> {
    const response = await apiClient.get("/codepath-problems/admin/all", { params });
    return response.data;
  }

  /**
   * Get CodePath problem by ID - GET /codepath-problems/:id
   */
  async getCodePathProblem(id: string): Promise<CodePathProblemDetail> {
    const response = await apiClient.get(`/codepath-problems/${id}`);
    return response.data;
  }

  /**
   * Create CodePath problem (Admin) - POST /codepath-problems
   */
  async createCodePathProblem(
    data: CreateCodePathProblemInput,
  ): Promise<CodePathProblemDetail> {
    const response = await apiClient.post("/codepath-problems", data);
    return response.data;
  }

  /**
   * Update CodePath problem (Admin) - PUT /codepath-problems/:id
   */
  async updateCodePathProblem(
    id: string,
    data: UpdateCodePathProblemInput,
  ): Promise<CodePathProblemDetail> {
    const response = await apiClient.put(`/codepath-problems/${id}`, data);
    return response.data;
  }

  /**
   * Delete CodePath problem (Admin) - DELETE /codepath-problems/:id
   */
  async deleteCodePathProblem(id: string): Promise<BackendSuccessResponse> {
    const response = await apiClient.delete(`/codepath-problems/${id}`);
    return response.data;
  }

  /**
   * Publish CodePath problem (Admin) - POST /codepath-problems/:id/publish
   */
  async publishCodePathProblem(id: string): Promise<CodePathProblemDetail> {
    const response = await apiClient.post(`/codepath-problems/${id}/publish`);
    return response.data;
  }

  /**
   * Unpublish CodePath problem (Admin) - POST /codepath-problems/:id/unpublish
   */
  async unpublishCodePathProblem(id: string): Promise<CodePathProblemDetail> {
    const response = await apiClient.post(`/codepath-problems/${id}/unpublish`);
    return response.data;
  }

  /**
   * Create test case (Admin) - POST /codepath-problems/:id/test-cases
   */
  async createProblemTestCase(
    problemId: string,
    data: CreateProblemTestCaseInput,
  ): Promise<ProblemTestCase> {
    const response = await apiClient.post(
      `/codepath-problems/${problemId}/test-cases`,
      data,
    );
    return response.data;
  }

  /**
   * Update test case (Admin) - PUT /codepath-problems/:id/test-cases/:caseId
   */
  async updateProblemTestCase(
    problemId: string,
    caseId: string,
    data: UpdateProblemTestCaseInput,
  ): Promise<ProblemTestCase> {
    const response = await apiClient.put(
      `/codepath-problems/${problemId}/test-cases/${caseId}`,
      data,
    );
    return response.data;
  }

  /**
   * Delete test case (Admin) - DELETE /codepath-problems/:id/test-cases/:caseId
   */
  async deleteProblemTestCase(
    problemId: string,
    caseId: string,
  ): Promise<BackendSuccessResponse> {
    const response = await apiClient.delete(
      `/codepath-problems/${problemId}/test-cases/${caseId}`,
    );
    return response.data;
  }

  /**
   * Submit solution (Mentee) - POST /codepath-problems/:id/submit
   */
  async submitCodePathProblem(
    problemId: string,
    data: {
      code: string;
      language: "cpp" | "java" | "python" | "javascript";
    },
  ): Promise<CodePathSubmitResponse> {
    const response = await apiClient.post(
      `/codepath-problems/${problemId}/submit`,
      data,
      { timeout: 120000 },
    );
    return response.data;
  }

  /**
   * My submissions for a problem - GET /codepath-problems/:id/submissions/me
   */
  async getMyCodePathSubmissions(
    problemId: string,
  ): Promise<CodePathSubmissionsListResponse> {
    const response = await apiClient.get(
      `/codepath-problems/${problemId}/submissions/me`,
    );
    return response.data;
  }

  /**
   * Submission detail - GET /codepath-problems/submissions/:submissionId
   */
  async getCodePathSubmission(
    submissionId: string,
  ): Promise<CodePathSubmissionDetail> {
    const response = await apiClient.get(
      `/codepath-problems/submissions/${submissionId}`,
    );
    return response.data;
  }

  // ============ Contest Endpoints ============

  async getContests(status?: string): Promise<ContestSummary[]> {
    const response = await apiClient.get("/contests", {
      params: status ? { status } : undefined,
    });
    return response.data;
  }

  async getMyContests(): Promise<ContestSummary[]> {
    const response = await apiClient.get("/contests/my");
    return response.data;
  }

  async getContest(id: string): Promise<ContestDetail> {
    const response = await apiClient.get(`/contests/${id}`);
    return response.data;
  }

  async createContest(data: CreateContestInput): Promise<{
    contestId: string;
  }> {
    const response = await apiClient.post("/contests/create", data, {
      timeout: 120000,
    });
    return response.data;
  }

  async updateContest(
    id: string,
    data: Partial<CreateContestInput>,
  ): Promise<ContestDetail> {
    const response = await apiClient.put(`/contests/${id}`, data);
    return response.data;
  }

  async publishContest(id: string): Promise<{ status: string }> {
    const response = await apiClient.post(`/contests/${id}/publish`);
    return response.data;
  }

  async joinContest(id: string): Promise<{ participant: ContestDetail["participants"][0] }> {
    const response = await apiClient.post(`/contests/${id}/join`);
    return response.data;
  }

  async startContest(id: string): Promise<{ status: string; virtualStartTime: string }> {
    const response = await apiClient.post(`/contests/${id}/start`);
    return response.data;
  }

  async startVirtualContest(
    id: string,
  ): Promise<{ participant: ContestDetail["participants"][0] }> {
    const response = await apiClient.post(`/contests/${id}/virtual/start`);
    return response.data;
  }

  async submitContestSolution(
    contestId: string,
    data: {
      contestProblemId: string;
      code: string;
      language: "cpp" | "java" | "python" | "javascript";
    },
  ): Promise<ContestSubmitResponse> {
    const response = await apiClient.post(`/contests/${contestId}/submissions`, data, {
      timeout: 120000,
    });
    return response.data;
  }

  async finishContest(id: string): Promise<BackendSuccessResponse> {
    const response = await apiClient.post(`/contests/${id}/finish`);
    return response.data;
  }

  async getContestScoreboard(
    id: string,
    final = false,
  ): Promise<ContestScoreboardResponse> {
    const response = await apiClient.get(`/contests/${id}/scoreboard`, {
      params: { final },
    });
    return response.data;
  }

  async getMyContestSubmissions(
    id: string,
  ): Promise<{ submissions: ContestSubmissionRecord[] }> {
    const response = await apiClient.get(`/contests/${id}/my-submissions`);
    return response.data;
  }

  async completeContest(id: string): Promise<{ status: string }> {
    const response = await apiClient.post(`/contests/${id}/complete`);
    return response.data;
  }

  async cancelContest(id: string): Promise<{ status: string }> {
    const response = await apiClient.post(`/contests/${id}/cancel`);
    return response.data;
  }

  async deleteContest(id: string): Promise<BackendSuccessResponse> {
    const response = await apiClient.delete(`/contests/${id}`);
    return response.data;
  }

  // ============ Coach & Booking Endpoints ============

  async getCoaches(params?: {
    specialty?: string;
    available?: boolean;
  }): Promise<CoachProfile[]> {
    const response = await apiClient.get("/coaches", { params });
    return response.data;
  }

  async getCoach(id: string): Promise<CoachProfile> {
    const response = await apiClient.get(`/coaches/${id}`);
    return response.data;
  }

  async createCoachAccount(data: CreateCoachInput): Promise<{
    message: string;
    coach: CoachProfile;
  }> {
    const response = await apiClient.post("/coaches", data);
    return response.data;
  }

  async updateCoachProfile(
    id: string,
    data: {
      name?: string;
      specialty?: string;
      bio?: string;
      hourlyRate?: number | null;
      isAvailable?: boolean;
      bookingLink?: string;
    },
  ): Promise<{ message: string; coach: CoachProfile }> {
    const response = await apiClient.patch(`/coaches/${id}`, data);
    return response.data;
  }

  async uploadCoachAvatar(
    id: string,
    file: File,
  ): Promise<{ message: string; coach: CoachProfile }> {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await apiClient.post(`/coaches/${id}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async deleteCoachAvatar(id: string): Promise<{ message: string; coach: CoachProfile }> {
    const response = await apiClient.delete(`/coaches/${id}/avatar`);
    return response.data;
  }

  async createBooking(
    coachId: string,
    data: { startTime: string; endTime: string; notes?: string },
  ): Promise<{ message: string; booking: BookingSummary }> {
    const response = await apiClient.post(`/coaches/${coachId}/bookings`, data);
    return response.data;
  }

  async getMyBookings(): Promise<BookingSummary[]> {
    const response = await apiClient.get("/coaches/bookings/me");
    return response.data;
  }

  async updateBookingStatus(
    bookingId: string,
    data: { status: BookingStatus; meetingUrl?: string },
  ): Promise<{ message: string; booking: BookingSummary }> {
    const response = await apiClient.patch(`/coaches/bookings/${bookingId}`, data);
    return response.data;
  }

  // ============ Reference Library Endpoints ============

  async getMySnippets(params?: {
    topicId?: number;
    search?: string;
  }): Promise<SolutionSnippet[]> {
    const response = await apiClient.get("/reference", { params });
    return response.data;
  }

  async getSnippet(id: string): Promise<SolutionSnippet> {
    const response = await apiClient.get(`/reference/${id}`);
    return response.data;
  }

  async createSnippet(data: {
    title: string;
    language: string;
    code: string;
    topicId?: number | null;
    notes?: string;
    tags?: string;
    isPublic?: boolean;
  }): Promise<{ snippet: SolutionSnippet }> {
    const response = await apiClient.post("/reference", data);
    return response.data;
  }

  async updateSnippet(
    id: string,
    data: Partial<{
      title: string;
      language: string;
      code: string;
      topicId: number | null;
      notes: string;
      tags: string;
      isPublic: boolean;
    }>,
  ): Promise<{ snippet: SolutionSnippet }> {
    const response = await apiClient.put(`/reference/${id}`, data);
    return response.data;
  }

  async deleteSnippet(id: string): Promise<BackendSuccessResponse> {
    const response = await apiClient.delete(`/reference/${id}`);
    return response.data;
  }

  async curateSnippets(): Promise<ReferenceCurateResponse> {
    const response = await apiClient.post("/reference/curate", {}, {
      timeout: 120000,
    });
    return response.data;
  }

  async downloadReferenceExport(format: "pdf" | "zip"): Promise<Blob> {
    const response = await apiClient.get(`/reference/export/${format}`, {
      responseType: "blob",
    });
    return response.data;
  }

  async downloadSnippetPdf(id: string): Promise<Blob> {
    const response = await apiClient.get(`/reference/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  }

  // ============ Roadmap Generation ============

  async getMenteeTopicPerformanceOverview(
    topic: string,
  ): Promise<Record<string, unknown>> {
    const response = await apiClient.get(
      "/roadmaps/modules/topic/mentee-performance-overview",
      { params: { topic } },
    );
    return response.data;
  }

  async generateMyRoadmap(): Promise<GenerateRoadmapResponse> {
    const response = await apiClient.post("/roadmaps/generate-my-roadmap", {}, {
      timeout: 120000,
    });
    return response.data;
  }

  // ============ Nearby Peers ============

  async getNearbyMentees(params?: {
    country?: string;
    city?: string;
    minRating?: number;
    maxRating?: number;
    limit?: number;
  }): Promise<NearbyMentee[]> {
    const response = await apiClient.get("/users/mentees/nearby", { params });
    return response.data;
  }

  // ============ Topics ============

  async getTopics(): Promise<Topic[]> {
    const response = await apiClient.get("/topics");
    return response.data;
  }

  async getTopicById(id: number): Promise<Topic> {
    const response = await apiClient.get(`/topics/${id}`);
    return response.data;
  }

  async createTopic(payload: {
    title: string;
    tags: string;
    rating: string;
  }): Promise<Topic> {
    const response = await apiClient.post("/topics", payload);
    return response.data;
  }

  async updateTopic(
    id: number,
    payload: Partial<{ title: string; tags: string; rating: string }>,
  ): Promise<Topic> {
    const response = await apiClient.put(`/topics/${id}`, payload);
    return response.data;
  }

  async deleteTopic(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/topics/${id}`);
    return response.data;
  }
}

export const apiService = new APIService();
