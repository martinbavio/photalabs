"use client";

import { useQuery } from "convex/react";
import { api } from "@photalabs/backend/convex/_generated/api";

export function useAuth() {
  const user = useQuery(api.users.viewer);
  const isAuthenticated = useQuery(api.users.isAuthenticated);

  return {
    user,
    isAuthenticated: isAuthenticated ?? false,
    isLoading: isAuthenticated === undefined,
  };
}
