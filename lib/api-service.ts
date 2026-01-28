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
  FavouriteProblem,
  QuizQuestionSafe,
  QuizQuestionList,
  QuizQuestionForMentee,
  ContactInfo,
  ContactInquirySafe,
  ContactInquiryDetails,
  BackendSuccessResponse,
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
   * Body: { fullName, username, email, password, phone?, country, bio?, roleId }
   * Returns: { message, newUserId }
   */
  async registerMentee(data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    country: string;
    bio?: string;
    roleId: number;
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
   * Returns: { mentee, externalAccountIntegration }
   */
  async getMenteeProfile(): Promise<MenteeProfileResponse> {
    const response = await apiClient.get("/users/mentees/profile/view");
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
  }): Promise<ProblemsResponse> {
    const response = await apiClient.get("/problems", { params });
    return response.data;
  }

  /**
   * Get Problem - GET /problems/:contestId/:index
   * Returns: Problem data from Codeforces
   */
  async getProblem(
    contestId: number,
    index: string
  ): Promise<CodeforcesProblem> {
    const response = await apiClient.get(`/problems/${contestId}/${index}`);
    return response.data;
  }

  /**
   * Get Favourite Problems - GET /problems/favourites
   * Returns: FavouriteProblem[]
   */
  async getFavouriteProblems(): Promise<FavouriteProblem[]> {
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
}

export const apiService = new APIService();
