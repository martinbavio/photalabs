"use client";

import { cn } from "@/shared/utils/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-[22px]",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={cn("relative", sizes[size])}>
        {/* Logo mark matching Pencil design: outlined circle with two ellipses */}
        <svg
          viewBox="0 0 32 32"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle with stroke only */}
          <circle
            cx="16"
            cy="16"
            r="15"
            stroke="#e8e700"
            strokeWidth="2"
            fill="none"
          />
          {/* Left ellipse - taller */}
          <ellipse cx="11.5" cy="16" rx="4.5" ry="10" fill="#e8e700" />
          {/* Right ellipse - shorter */}
          <ellipse cx="20.5" cy="12.5" rx="3.5" ry="6.5" fill="#e8e700" />
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
