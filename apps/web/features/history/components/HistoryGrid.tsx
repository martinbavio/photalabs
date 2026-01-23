"use client";

import { ImageIcon } from "lucide-react";
import { Generation } from "../hooks/useHistory";
import { HistoryCard } from "./HistoryCard";

interface HistoryGridProps {
  generations: Generation[];
  onSelect?: (generation: Generation) => void;
  isLoading?: boolean;
}

export function HistoryGrid({
  generations,
  onSelect,
  isLoading,
}: HistoryGridProps) {
  if (isLoading) {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="mb-4 break-inside-avoid rounded-[14px] bg-bg-panel animate-pulse"
            style={{ height: `${180 + Math.random() * 100}px` }}
          />
        ))}
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-bg-panel border border-border flex items-center justify-center mb-4">
          <ImageIcon className="w-8 h-8 text-text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No images yet
        </h3>
        <p className="text-sm text-text-muted max-w-sm">
          Start creating images in the editor and they will appear here in your
          gallery.
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
      {generations.map((generation) => (
        <div key={generation._id} className="mb-4 break-inside-avoid">
          <HistoryCard
            id={generation._id}
            imageUrl={generation.generatedImageUrl}
            prompt={generation.prompt}
            characterMentions={generation.characterMentions}
            createdAt={generation.createdAt}
            onClick={() => onSelect?.(generation)}
          />
        </div>
      ))}
    </div>
  );
}
