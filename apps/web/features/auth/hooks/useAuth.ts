"use client";

import { useQuery } from "convex/react";
import { api } from "@photalabs/backend/convex/_generated/api";

// Mock user for E2E tests
const E2E_MOCK_USER = {
  _id: "e2e-user",
  _creationTime: Date.now(),
  name: "John Doe",
  email: "john@example.com",
  image: null,
  tokenIdentifier: "e2e-token",
};

function isE2EAuthDisabled() {
  if (typeof window === "undefined") {
    return false;
  }

  const localStorageDisabled =
    window.localStorage.getItem("e2e_auth_disabled") === "true";
  const cookieDisabled =
    typeof document !== "undefined" &&
    document.cookie
      .split("; ")
      .some((cookie) => cookie.startsWith("e2e_auth_disabled=true"));

  return localStorageDisabled || cookieDisabled;
}

export function useAuth() {
  // In E2E mode, default to authenticated unless explicitly disabled via storage/cookie
  // This allows layout tests to access authenticated pages while auth tests can disable it
  if (process.env.NEXT_PUBLIC_E2E === "1") {
    // Check if auth should be disabled (for testing login page and redirects)
    const isAuthDisabled = isE2EAuthDisabled();

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
