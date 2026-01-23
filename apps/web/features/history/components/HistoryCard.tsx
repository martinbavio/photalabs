"use client";

import { useMemo } from "react";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { cn } from "@/shared/utils/cn";

interface HistoryCardProps {
  id: Id<"generations">;
  imageUrl: string | null;
  prompt: string;
  characterMentions: Array<{
    characterId: Id<"characters">;
    characterName: string;
  }>;
  createdAt: number;
  onClick?: () => void;
}

export function HistoryCard({
  imageUrl,
  prompt,
  characterMentions,
  createdAt,
  onClick,
}: HistoryCardProps) {
  const formattedTime = useMemo(() => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, [createdAt]);

  const truncatedPrompt = useMemo(() => {
    if (prompt.length > 60) {
      return prompt.slice(0, 60) + "...";
    }
    return prompt;
  }, [prompt]);

  return (
    <div
      className={cn(
        "group relative rounded-[14px] overflow-hidden cursor-pointer",
        "transition-transform duration-200 hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      {/* Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={prompt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-48 bg-bg-input flex items-center justify-center">
          <span className="text-text-muted text-sm">Image unavailable</span>
        </div>
      )}

      {/* Hover Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          "flex flex-col justify-end p-4"
        )}
      >
        <p className="text-sm text-white font-medium line-clamp-2">
          {truncatedPrompt}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-white/70">{formattedTime}</span>
          {characterMentions.length > 0 && (
            <>
              <span className="text-xs text-white/50">•</span>
              <span className="text-xs text-accent-yellow">
                {characterMentions.map((m) => `@${m.characterName}`).join(", ")}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
