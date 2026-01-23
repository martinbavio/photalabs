"use client";

import { cn } from "@/shared/utils/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "relative rounded-full bg-accent-yellow flex items-center justify-center",
          sizes[size]
        )}
      >
        {/* Abstract shapes inside the circle */}
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="20" cy="20" r="20" fill="#e8e700" />
          {/* Triangle */}
          <path d="M14 14L20 26L26 14H14Z" fill="#0B0B0E" />
          {/* Small circle */}
          <circle cx="20" cy="11" r="3" fill="#0B0B0E" />
        </svg>
      </div>
      {showText && (
        <span
          className={cn(
            "font-semibold text-text-primary font-[family-name:var(--font-heading)]",
            textSizes[size]
          )}
        >
          PhotaLabs
        </span>
      )}
    </div>
  );
}
