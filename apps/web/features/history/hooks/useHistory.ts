"use client";

import { useQuery } from "convex/react";
import { api } from "@photalabs/backend/convex/_generated/api";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";

export interface Generation {
  _id: Id<"generations">;
  _creationTime: number;
  userId: Id<"users">;
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

export function useHistory() {
  const generations = useQuery(api.generations.getByUser) ?? [];

  return {
    generations: generations as Generation[],
    isLoading: generations === undefined,
    totalCount: generations.length,
  };
}

export function useRecentHistory(limit: number = 10) {
  const generations = useQuery(api.generations.getRecent, { limit }) ?? [];

  return {
    generations: generations as Generation[],
    isLoading: generations === undefined,
  };
}
