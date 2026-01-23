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
        <svg
          viewBox="0 0 33 32"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.5068 0C7.50502 0 0.234375 7.08769 0.234375 15.8629C0.234375 24.6381 7.50502 31.7258 16.5068 31.7258C25.5085 31.7258 32.7792 24.6381 32.7792 15.8629C32.7792 7.12519 25.5085 0 16.5068 0ZM16.5068 30.0383C8.50522 30.0383 2.00395 23.7006 2.00395 15.9004C2.00395 8.10022 8.50522 1.76255 16.5068 1.76255C24.5083 1.76255 31.0096 8.10022 31.0096 15.9004C31.0096 23.7006 24.5083 30.0383 16.5068 30.0383Z"
            fill="#E8E800"
          />
          <path
            d="M16.0073 5.96289C11.5834 6.75041 7.69803 10.0505 7.62109 15.8631C7.7365 21.6758 11.6219 24.9759 16.0073 25.7634V5.96289Z"
            fill="#E8E800"
          />
          <path
            d="M17.0078 5.96289V18.0757C20.1238 18.0757 23.2398 16.0506 23.3167 12.0005C23.2398 7.98793 20.1238 5.96289 17.0078 5.96289Z"
            fill="#E8E800"
          />
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
