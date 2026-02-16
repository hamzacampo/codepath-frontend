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
  ContactInfo,
  ContactInquirySafe,
  ContactInquiryDetails,
  BackendSuccessResponse,
  RoadmapSummary,
  ModuleWithProgress,
  MyRoadmapModulesWithProgress,
  UserAchievement,
  RoadmapWithModules,
  MenteeStatisticsResponse,
  ActivityByDateResponse,
  GrowthTimelineResponse,
  SkillLevel,
  ChatbotResponse,
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
    tag?: string | null;
  }): Promise<ProblemsResponse> {
    const query: Record<string, unknown> = {};
    if (params?.page != null) query.page = params.page;
    if (params?.limit != null) query.limit = params.limit;
    if (params?.minRating != null && params.minRating > 0) query.minRating = params.minRating;
    if (params?.tag != null && params.tag !== "all") query.tag = params.tag;
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
    platform: "Codeforces" | "LeetCode";
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
  }> {
    const response = await apiClient.post(
      "/external-accounts/codeforces/integrate",
      { handle }
    );
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
   * Body: { questionTitle, answer, score }
   * Returns: { message }
   */
  async createQuizQuestion(data: {
    questionTitle: string;
    answer: string;
    score: number;
  }): Promise<BackendSuccessResponse> {
    const response = await apiClient.post("/quiz/questions/create", data);
    return response.data;
  }

  /**
   * Update Quiz Question (Admin) - POST /quiz/questions/update/:id
   * Body: { questionTitle?, answer?, score? }
   * Returns: { message }
   */
  async updateQuizQuestion(
    id: number,
    data: {
      questionTitle?: string;
      answer?: string;
      score?: number;
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
   * Body: { answers: [{ questionId, userAnswer }] }
   * Returns: { level, totalScore, maxScore }
   */
  async submitQuizDB(
    answers: Array<{ questionId: number; userAnswer: string }>
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
  ): Promise<{ MenteeLevel: string; ResultAccuracy: number }> {
    const body: {
      answers: Array<{ question_id: number; selected_option: number }>;
      quizId?: number;
    } = { answers };
    if (quizId != null) body.quizId = quizId;
    const response = await apiClient.post("/quiz/submit", body);
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
   * Returns: ChatbotResponse (answer | response | message from FastAPI)
   */
  async askChatbot(question: string): Promise<ChatbotResponse> {
    const response = await apiClient.post("/chatbot/ask", { question });
    return response.data;
  }
}

export const apiService = new APIService();
