"use client";

import { cn } from "@/shared/utils/cn";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "w-full bg-bg-input text-text-primary placeholder:text-text-placeholder",
            "border border-border rounded-[var(--radius-input)]",
            "px-4 py-3.5 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:border-transparent",
            "transition-colors",
            error && "border-error focus:ring-error",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
