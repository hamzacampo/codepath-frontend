/**
 * Mock API service - Only for login and register
 * Uses the same interface as the real API for easy switching
 */

import type {
  User,
  ApiResponse,
} from "@/types";
import { mockUser } from "./mock-data";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class MockAPI {
  // Auth endpoints only
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> {
    await delay(800);
    if (email === "admin@codepath.com" && password === "admin") {
      return {
        success: true,
        data: {
          user: { ...mockUser, role: "admin" },
          tokens: {
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
          },
        },
      };
    }
    if (email && email.includes("@") && password.length >= 6) {
      return {
        success: true,
        data: {
          user: mockUser,
          tokens: {
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
          },
        },
      };
    }
    return {
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      },
    };
  }

  async register(
    username: string,
    email: string,
    password: string,
    codeforcesHandle?: string,
    leetcodeHandle?: string
  ): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> {
    await delay(1000);
    if (username.length < 3) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Username must be at least 3 characters",
        },
      };
    }
    return {
      success: true,
      data: {
        user: {
          ...mockUser,
          username,
          email,
          codeforcesHandle,
          leetcodeHandle,
        } as User,
        tokens: {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
        },
      },
    };
  }
}

export const mockAPI = new MockAPI();
