/**
 * Mock data for development - Only user data needed for auth endpoints
 * Note: Mock API is deprecated - use real backend API
 */

import type { User } from "@/types";

// Mock User - Matches backend User type: { id, email, role }
export const mockUser: User = {
  id: "1",
  email: "john@example.com",
  role: "Mentee", // Backend uses "Admin" or "Mentee"
};
