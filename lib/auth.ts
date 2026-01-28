/**
 * Authentication utilities for JWT token management
 * Matches backend API structure
 */

import type { User } from "../types";

export interface AuthTokens {
  accessToken: string;
}

/**
 * Store authentication token
 */
export function setAuthTokens(tokens: AuthTokens): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", tokens.accessToken);
  }
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
}

/**
 * Clear authentication tokens
 */
export function clearAuthTokens(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
}

/**
 * Store user data
 */
export function setUser(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
}

/**
 * Get user data
 */
export function getUser(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

/**
 * Check if user has specific role
 * Backend roles are "Admin" and "Mentee" (case-sensitive)
 */
export function hasRole(role: string): boolean {
  const user = getUser();
  return user?.role === role;
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  return hasRole("Admin");
}

/**
 * Check if user is mentee
 */
export function isMentee(): boolean {
  return hasRole("Mentee");
}

