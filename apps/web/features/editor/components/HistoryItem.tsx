"use client";

import { useMemo } from "react";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { cn } from "@/shared/utils/cn";

interface HistoryItemProps {
  id: Id<"generations">;
  imageUrl: string;
  prompt: string;
  characterMentions: Array<{
    characterId: Id<"characters">;
    characterName: string;
  }>;
  createdAt: number;
  onClick?: () => void;
  isSelected?: boolean;
}

export function HistoryItem({
  imageUrl,
  prompt,
  characterMentions,
  createdAt,
  onClick,
  isSelected,
}: HistoryItemProps) {
  const formattedTime = useMemo(() => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }
  }, [createdAt]);

  const truncatedPrompt = useMemo(() => {
    if (prompt.length > 40) {
      return prompt.slice(0, 40) + "...";
    }
    return prompt;
  }, [prompt]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-[12px]",
        "transition-colors text-left",
        isSelected
          ? "bg-accent-yellow/10 border border-accent-yellow/30"
          : "hover:bg-border/50 border border-transparent"
      )}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-[8px] overflow-hidden flex-shrink-0 bg-bg-input">
        <img
          src={imageUrl}
          alt={prompt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-sm text-text-primary line-clamp-2">{truncatedPrompt}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted">{formattedTime}</span>
          {characterMentions.length > 0 && (
            <>
              <span className="text-xs text-text-placeholder">•</span>
              <span className="text-xs text-accent-yellow truncate">
                {characterMentions.map((m) => `@${m.characterName}`).join(", ")}
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
