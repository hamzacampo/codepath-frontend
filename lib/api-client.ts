import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

/** In-memory token used between register (step 1) and completion of step 2 — not persisted until step 2 is done */
let pendingAuthToken: string | null = null;

export function setPendingAuthToken(token: string | null): void {
  pendingAuthToken = token;
}

export function getPendingAuthToken(): string | null {
  return pendingAuthToken;
}

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // 20 seconds as per SRS
});

/**
 * Request interceptor to add auth token (pending token first, then persisted)
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = pendingAuthToken || localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors
 * Backend doesn't have refresh token endpoint, so we just handle 401 by redirecting to login
 */
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    // Node wraps JSON as { success, message, data } — unwrap so callers get the payload.
    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      "success" in body &&
      "data" in body
    ) {
      response.data = body.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    // Only force logout when the token is missing/invalid — not for role-based 401s
    // (e.g. Admin hitting Mentee-only /statistics/mentee returns 401 "Unauthorized").
    if (error.response?.status === 401) {
      const message =
        error.response?.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String((error.response.data as { message?: string }).message)
          : "";

      const isRoleDenied = message === "Unauthorized";
      if (!isRoleDenied && typeof window !== "undefined") {
        pendingAuthToken = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

