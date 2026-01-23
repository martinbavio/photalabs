"use client";

import { Zap } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function GenerateButton({
  onClick,
  isLoading,
  disabled,
}: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "flex-1 flex items-center justify-center gap-2.5",
        "bg-accent-yellow text-bg-primary",
        "rounded-[12px] py-3.5 px-7",
        "font-semibold text-sm",
        "transition-colors hover:bg-accent-yellow/90",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    >
      {isLoading ? (
        <svg
          className="h-[18px] w-[18px] animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <Zap className="h-[18px] w-[18px]" fill="currentColor" />
      )}
      <span>Generate</span>
    </button>
  );
}
