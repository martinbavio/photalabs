"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@photalabs/backend/convex/_generated/api";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { Character } from "../components/CharacterMentionDropdown";

interface GenerateState {
  prompt: string;
  mentionedCharacters: Character[];
  referenceImageId: Id<"_storage"> | null;
  referenceImageUrl: string | null;
  generatedImageUrl: string | null;
  isGenerating: boolean;
}

export function useGenerate() {
  const [state, setState] = useState<GenerateState>({
    prompt: "",
    mentionedCharacters: [],
    referenceImageId: null,
    referenceImageUrl: null,
    generatedImageUrl: null,
    isGenerating: false,
  });

  const createGeneration = useMutation(api.generations.create);
  const characters = useQuery(api.characters.getByUser) ?? [];

  // Get reference image URL
  const referenceImageUrlQuery = useQuery(
    api.storage.getUrl,
    state.referenceImageId ? { storageId: state.referenceImageId } : "skip"
  );

  const setPrompt = useCallback((prompt: string) => {
    setState((prev) => ({ ...prev, prompt }));
  }, []);

  const addMention = useCallback((character: Character) => {
    setState((prev) => {
      // Avoid duplicates
      if (prev.mentionedCharacters.some((c) => c._id === character._id)) {
        return prev;
      }
      return {
        ...prev,
        mentionedCharacters: [...prev.mentionedCharacters, character],
      };
    });
  }, []);

  const setReferenceImage = useCallback((storageId: Id<"_storage">) => {
    setState((prev) => ({ ...prev, referenceImageId: storageId }));
  }, []);

  const removeReferenceImage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      referenceImageId: null,
      referenceImageUrl: null,
    }));
  }, []);

  const generate = useCallback(async () => {
    if (!state.prompt.trim()) return;

    setState((prev) => ({ ...prev, isGenerating: true }));

    try {
      // Parse prompt to extract current mentions
      const mentionPattern = /@(\w+)/g;
      const mentionedNames = new Set<string>();
      let match;
      while ((match = mentionPattern.exec(state.prompt)) !== null) {
        mentionedNames.add(match[1].toLowerCase());
      }

      // Filter to only include characters that are still mentioned in the prompt
      const validMentions = state.mentionedCharacters.filter((char) =>
        mentionedNames.has(char.name.toLowerCase())
      );

      // Create generation with character mentions
      const characterMentions = validMentions.map((char) => ({
        characterId: char._id,
        characterName: char.name,
      }));

      await createGeneration({
        prompt: state.prompt,
        characterMentions,
        referenceImageId: state.referenceImageId ?? undefined,
      });

      // Simulate delay for mock generation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate a new mock image URL
      const seed = Math.floor(Math.random() * 1000);
      const generatedImageUrl = `https://picsum.photos/seed/${seed}/1024/1024`;

      setState((prev) => ({
        ...prev,
        generatedImageUrl,
        isGenerating: false,
      }));
    } catch (error) {
      console.error("Generation failed:", error);
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, [state.prompt, state.mentionedCharacters, state.referenceImageId, createGeneration]);

  const reset = useCallback(() => {
    setState({
      prompt: "",
      mentionedCharacters: [],
      referenceImageId: null,
      referenceImageUrl: null,
      generatedImageUrl: null,
      isGenerating: false,
    });
  }, []);

  return {
    // State
    prompt: state.prompt,
    mentionedCharacters: state.mentionedCharacters,
    referenceImageId: state.referenceImageId,
    referenceImageUrl: referenceImageUrlQuery ?? null,
    generatedImageUrl: state.generatedImageUrl,
    isGenerating: state.isGenerating,
    characters,

    // Actions
    setPrompt,
    addMention,
    setReferenceImage,
    removeReferenceImage,
    generate,
    reset,
  };
}
