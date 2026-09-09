"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { apiService } from "@/lib/api-service";

/**
 * useAuth hook - Wrapper around Zustand auth store
 * Provides the same interface as before but uses global Zustand store
 * This ensures user state is shared across all components
 */
export function useAuth() {
  const router = useRouter();
  const {
    user,
    loading,
    isAuthenticated,
    login: storeLogin,
    registerMentee: storeRegisterMentee,
    logout: storeLogout,
    updateUser: storeUpdateUser,
    initialize,
  } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Wrapper for login with role-based redirect
  const login = useCallback(
    async (email: string, password: string) => {
      const result = await storeLogin(email, password);
      if (result.success) {
        const role = useAuthStore.getState().user?.role;
        router.push(role === "Admin" ? "/admin" : "/dashboard");
      }
      return result;
    },
    [storeLogin, router]
  );

  // Wrapper for registerMentee - roleId is automatically set by backend
  const registerMentee = useCallback(
    async (data: {
      fullName: string;
      username: string;
      email: string;
      password: string;
      phone?: string;
      country: string;
      bio?: string;
    }) => {
      return await storeRegisterMentee(data);
    },
    [storeRegisterMentee]
  );

  // Legacy register method for backward compatibility
  const register = useCallback(
    async (
      username: string,
      email: string,
      password: string,
      codeforcesHandle?: string,
      leetcodeHandle?: string,
      fullName?: string,
      phone?: string,
      country?: string,
      bio?: string,
      roleId?: number // Deprecated - backend automatically sets roleId
    ) => {
      // Backend automatically sets roleId to Mentee, so we don't need to fetch it
      return await storeRegisterMentee({
        fullName: fullName || username,
        username,
        email,
        password,
        phone,
        country: country || "",
        bio,
      });
    },
    [storeRegisterMentee]
  );

  // Wrapper for logout with router redirect
  const logout = useCallback(() => {
    storeLogout();
    router.push("/auth/login");
  }, [storeLogout, router]);

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin: user?.role === "Admin",
    isMentee: user?.role === "Mentee",
    login,
    register,
    registerMentee,
    logout,
    updateUser: storeUpdateUser,
  };
}

