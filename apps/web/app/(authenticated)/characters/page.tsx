"use client";

import { useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { CharacterGrid, CharacterModal, useCharacters } from "@/features/characters";

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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
        </div>
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
