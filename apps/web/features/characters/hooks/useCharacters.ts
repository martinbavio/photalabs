"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@photalabs/backend/convex/_generated/api";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { useState, useCallback } from "react";

export function useCharacters() {
  const characters = useQuery(api.characters.getByUser);
  const removeCharacter = useMutation(api.characters.remove);

  const [isDeleting, setIsDeleting] = useState<Id<"characters"> | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (id: Id<"characters">) => {
      setIsDeleting(id);
      setDeleteError(null);

      try {
        await removeCharacter({ id });
      } catch (error) {
        setDeleteError(
          error instanceof Error ? error.message : "Failed to delete character"
        );
      } finally {
        setIsDeleting(null);
      }
    },
    [removeCharacter]
  );

  return {
    characters: characters ?? [],
    isLoading: characters === undefined,
    isDeleting,
    deleteError,
    handleDelete,
  };
}
