"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { CharacterGrid, useCharacters } from "@/features/characters";
import { CharacterGridSkeleton } from "@/shared/components/Skeleton";

// Lazy load CharacterModal - it's a heavy component (300+ lines with image upload logic)
// that's only shown when user clicks "Create Character" or edits a character
const CharacterModal = dynamic(
  () => import("@/features/characters/components/CharacterModal").then((mod) => mod.CharacterModal),
  { ssr: false }
);

export default function CharactersPage() {
  const { characters, isLoading, handleDelete } = useCharacters();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState<Id<"characters"> | undefined>();

  const handleCreateClick = useCallback(() => {
    setEditingCharacterId(undefined);
    setIsModalOpen(true);
  }, []);

  const handleEditClick = useCallback((id: Id<"characters">) => {
    setEditingCharacterId(id);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingCharacterId(undefined);
  }, []);

  return (
    <div className="flex flex-col gap-7 p-9">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-medium text-text-primary font-[family-name:var(--font-heading)]">
            Characters
          </h1>
          <p className="text-sm text-text-muted">
            Create and manage your AI characters for consistent image generation
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateClick}
          className="flex items-center gap-2.5 px-[22px] py-[14px] rounded-[12px] bg-accent-yellow text-bg-primary text-sm font-bold hover:bg-accent-yellow/90 transition-colors"
        >
          <Plus className="w-[18px] h-[18px]" />
          Create Character
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <CharacterGridSkeleton count={4} />
      ) : (
        <CharacterGrid
          characters={characters}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      )}

      {/* Modal */}
      <CharacterModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        characterId={editingCharacterId}
      />
    </div>
  );
}
