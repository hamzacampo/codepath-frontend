"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as authLib from "@/lib/auth";
import { apiService } from "@/lib/api-service";
import type { User, LoginResponse, RegisterResponse } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = authLib.getUser();
    if (storedUser && authLib.isAuthenticated()) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response: LoginResponse = await apiService.login(email, password);
      
      // Backend returns: { message, accessToken, user: { id, email, role } }
      if (response.accessToken && response.user) {
        authLib.setAuthTokens({ accessToken: response.accessToken });
        authLib.setUser(response.user);
        setUser(response.user);
        return { success: true };
      } else {
        return {
          success: false,
          error: response.message || "Login failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Login failed",
      };
    }
  }, []);

  const registerMentee = useCallback(
    async (data: {
      fullName: string;
      username: string;
      email: string;
      password: string;
      phone?: string;
      country: string;
      bio?: string;
      roleId: number;
    }) => {
      try {
        const response: RegisterResponse = await apiService.registerMentee(data);
        
        // Backend returns: { message, newUserId }
        if (response.newUserId) {
          return { success: true, userId: response.newUserId };
        } else {
          return {
            success: false,
            error: response.message || "Registration failed",
          };
        }
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.message || error.message || "Registration failed",
        };
      }
    },
    []
  );

  // Legacy register method for backward compatibility
  // Note: This requires roleId, so caller should fetch roles first
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
      roleId?: number
    ) => {
      // If roleId is not provided, try to fetch it (Mentee role)
      let menteeRoleId = roleId;
      if (!menteeRoleId) {
        try {
          const roles = await apiService.getRoles();
          const menteeRole = roles.find((r) => r.title === "Mentee");
          if (!menteeRole) {
            return {
              success: false,
              error: "Mentee role not found. Please contact administrator.",
            };
          }
          menteeRoleId = menteeRole.id;
        } catch (error: any) {
          return {
            success: false,
            error: "Failed to fetch roles. Please try again.",
          };
        }
      }

      const result = await registerMentee({
        fullName: fullName || username,
        username,
        email,
        password,
        phone,
        country: country || "",
        bio,
        roleId: menteeRoleId!,
      });

      return result;
    },
    [registerMentee]
  );

  const logout = useCallback(() => {
    authLib.clearAuthTokens();
    setUser(null);
    router.push("/auth/login");
  }, [router]);

  const updateUser = useCallback((updatedUser: User) => {
    authLib.setUser(updatedUser);
    setUser(updatedUser);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: authLib.isAdmin(),
    isMentee: authLib.isMentee(),
    login,
    register,
    registerMentee,
    logout,
    updateUser,
  };
}

