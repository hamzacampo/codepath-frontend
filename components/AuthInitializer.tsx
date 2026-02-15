"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

/**
 * Component to initialize auth store on app load
 * This ensures the auth state is loaded from localStorage when the app starts
 */
export default function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null; // This component doesn't render anything
}
