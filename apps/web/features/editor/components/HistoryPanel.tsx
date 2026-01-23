"use client";

import { useEffect } from "react";
import { X, ImageIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@photalabs/backend/convex/_generated/api";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { HistoryItem } from "./HistoryItem";
import { cn } from "@/shared/utils/cn";
import { HistoryPanelSkeleton } from "@/shared/components/Skeleton";

interface Generation {
  _id: Id<"generations">;
  prompt: string;
  characterMentions: Array<{
    characterId: Id<"characters">;
    characterName: string;
  }>;
  referenceImageId?: Id<"_storage">;
  referenceImageUrl: string | null;
  generatedImageUrl: string;
  createdAt: number;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (generation: Generation) => void;
  selectedId?: Id<"generations">;
}

export function HistoryPanel({
  isOpen,
  onClose,
  onSelect,
  selectedId,
}: HistoryPanelProps) {
  const generationsQuery = useQuery(api.generations.getRecent, { limit: 20 });
  const isLoading = generationsQuery === undefined;
  const generations = generationsQuery ?? [];

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-[380px] z-50",
          "bg-bg-panel border-l border-border",
          "flex flex-col",
          "animate-in slide-in-from-right duration-200"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-semibold text-text-primary">History</h2>
            <p className="text-xs text-text-muted">
              {generations.length} recent{" "}
              {generations.length === 1 ? "generation" : "generations"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-border hover:bg-border/80 transition-colors"
          >
            <X className="w-[18px] h-[18px] text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <HistoryPanelSkeleton count={5} />
          ) : generations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-14 h-14 rounded-full bg-bg-input border border-border flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-text-muted" />
              </div>
              <p className="text-sm text-text-muted">
                No generations yet.
                <br />
                Create your first image!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(generations as Generation[]).map((generation) => (
                <HistoryItem
                  key={generation._id}
                  id={generation._id}
                  imageUrl={generation.generatedImageUrl}
                  prompt={generation.prompt}
                  characterMentions={generation.characterMentions}
                  createdAt={generation.createdAt}
                  onClick={() => onSelect(generation)}
                  isSelected={selectedId === generation._id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-text-muted text-center">
            Click an item to restore it to the editor
          </p>
        </div>
      </div>
    </>
  );
}
