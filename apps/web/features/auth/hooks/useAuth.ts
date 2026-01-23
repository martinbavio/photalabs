"use client";

import { useQuery } from "convex/react";
import { api } from "@photalabs/backend/convex/_generated/api";

// Mock user for E2E tests
const E2E_MOCK_USER = {
  name: "John Doe",
  email: "john@example.com",
};

export function useAuth() {
  // In E2E mode, default to authenticated unless explicitly disabled via localStorage
  // This allows layout tests to access authenticated pages while auth tests can disable it
  if (process.env.NEXT_PUBLIC_E2E === "1") {
    // Check if auth should be disabled (for testing login page and redirects)
    const isAuthDisabled =
      typeof window !== "undefined" &&
      window.localStorage.getItem("e2e_auth_disabled") === "true";

    if (isAuthDisabled) {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    }

    // Default to authenticated in E2E mode
    return {
      user: E2E_MOCK_USER,
      isAuthenticated: true,
      isLoading: false,
    };
  }

  const user = useQuery(api.users.viewer);
  const isAuthenticated = useQuery(api.users.isAuthenticated);

  return {
    user,
    isAuthenticated: isAuthenticated ?? false,
    isLoading: isAuthenticated === undefined,
  };
}
