import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

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
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        pendingAuthToken = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;

