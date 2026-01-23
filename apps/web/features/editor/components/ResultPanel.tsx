"use client";

import { Eye } from "lucide-react";
import { ImagePreview } from "./ImagePreview";
import { cn } from "@/shared/utils/cn";

interface ResultPanelProps {
  imageUrl: string | null;
  isLoading: boolean;
}

export function ResultPanel({ imageUrl, isLoading }: ResultPanelProps) {
  const status = isLoading ? "Generating" : imageUrl ? "Complete" : "Ready";

  return (
    <div
      className={cn(
        "flex-1 flex flex-col gap-6",
        "bg-bg-panel rounded-[20px] p-7",
        "border border-border"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-heading)]">
            Result
          </h2>

          <span
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium",
              "bg-[#1A1A1E] border border-border",
              status === "Generating" && "text-accent-yellow",
              status === "Complete" && "text-success",
              status === "Ready" && "text-text-muted"
            )}
          >
            {status}
          </span>
        </div>

        <button
          disabled={!imageUrl}
          className={cn(
            "flex items-center gap-2",
            "bg-[#1A1A1E] rounded-[10px] px-3.5 py-2.5",
            "border border-border",
            "text-text-muted text-xs font-medium",
            "hover:bg-border transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Eye className="h-4 w-4" />
          <span>Preview</span>
        </button>
      </div>

      {/* Image Preview */}
      <ImagePreview imageUrl={imageUrl} isLoading={isLoading} />
    </div>
  );
}
