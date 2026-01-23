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
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-button)] bg-[#1A1A1E] border border-border group cursor-pointer"
      onClick={() => signOut()}
      role="button"
      tabIndex={0}
      title="Click to sign out"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[#4D65FF] flex items-center justify-center text-white text-[13px] font-bold shrink-0">
        {initials}
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-text-primary truncate">
          {displayName}
        </p>
        <p className="text-[11px] text-text-muted">25 credits left</p>
      </div>

      {/* Logout icon - shows on hover */}
      <LogOut className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
}
