"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/features/auth";
import { cn } from "@/shared/utils/cn";

export function UserProfile() {
  const { user } = useAuth();
  const { signOut } = useAuthActions();

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-3 rounded-[var(--radius-button)] bg-bg-input">
      <div className="w-10 h-10 rounded-full bg-accent-purple flex items-center justify-center text-white text-sm font-medium">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {displayName}
        </p>
        <p className="text-xs text-text-muted truncate">
          {user?.email || "Creator"}
        </p>
      </div>
      <button
        onClick={() => signOut()}
        className={cn(
          "p-2 rounded-lg text-text-muted hover:text-text-primary",
          "hover:bg-bg-panel transition-colors"
        )}
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
