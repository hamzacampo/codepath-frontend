/**
 * Zustand store for authentication state
 * Provides global user state that can be shared across all components
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import * as authLib from "@/lib/auth";
import { setPendingAuthToken, getPendingAuthToken } from "@/lib/api-client";
import { apiService } from "@/lib/api-service";
import type { LoginResponse, RegisterResponse } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  /** Set after step 1 (register), cleared when step 2 is completed — not persisted */
  pendingUser: User | null;

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerMentee: (data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    country: string;
    bio?: string;
  }) => Promise<{ success: boolean; error?: string; userId?: string }>;
  /** Call when user completes step 2 (assessment) — persists token and user */
  finalizeRegistration: () => void;
  logout: () => void;
  updateUser: (user: User) => void;
  initialize: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      isAuthenticated: false,
      pendingUser: null,

      // Initialize auth state from localStorage
      initialize: () => {
        const storedUser = authLib.getUser();
        const hasToken = authLib.isAuthenticated();
        
        if (storedUser && hasToken) {
          set({ user: storedUser, isAuthenticated: true, loading: false });
        } else {
          set({ user: null, isAuthenticated: false, loading: false });
        }
      },

      // Login action
      login: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const response: LoginResponse = await apiService.login(email, password);

          if (response.accessToken && response.user) {
            authLib.setAuthTokens({ accessToken: response.accessToken });
            authLib.setUser(response.user);
            set({
              user: response.user,
              isAuthenticated: true,
              loading: false,
            });
            return { success: true };
          } else {
            set({ loading: false });
            return {
              success: false,
              error: response.message || "Login failed",
            };
          }
        } catch (error: any) {
          set({ loading: false });
          return {
            success: false,
            error: error.response?.data?.message || error.message || "Login failed",
          };
        }
      },

      // Register mentee — token and user are kept in memory until step 2 is completed (finalizeRegistration)
      registerMentee: async (data) => {
        try {
          set({ loading: true });
          const response: RegisterResponse = await apiService.registerMentee(data);

          if (response.accessToken && response.user) {
            setPendingAuthToken(response.accessToken);
            set({
              pendingUser: response.user,
              user: null,
              isAuthenticated: false,
              loading: false,
            });
            return { success: true, userId: response.user.id };
          } else {
            set({ loading: false });
            return {
              success: false,
              error: response.message || "Registration failed",
            };
          }
        } catch (error: any) {
          set({ loading: false });
          return {
            success: false,
            error: error.response?.data?.message || error.message || "Registration failed",
          };
        }
      },

      finalizeRegistration: () => {
        const token = getPendingAuthToken();
        const { pendingUser } = get();
        if (token && pendingUser) {
          setPendingAuthToken(null);
          authLib.setAuthTokens({ accessToken: token });
          authLib.setUser(pendingUser);
          set({
            user: pendingUser,
            isAuthenticated: true,
            pendingUser: null,
          });
        }
      },

      // Logout action
      logout: () => {
        setPendingAuthToken(null);
        authLib.clearAuthTokens();
        set({
          user: null,
          isAuthenticated: false,
          pendingUser: null,
          loading: false,
        });
      },

      // Update user action
      updateUser: (user: User) => {
        authLib.setUser(user);
        set({ user });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ loading });
      },
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        user: state.user, // Only persist user, not loading/actions
      }),
    }
  )
);

// Helper selectors
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === "Admin");
export const useIsMentee = () => useAuthStore((state) => state.user?.role === "Mentee");
