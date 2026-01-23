"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@photalabs/backend/convex/_generated/api";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { Character } from "../components/CharacterMentionDropdown";
import { showToast } from "@/shared/hooks/useToast";

// Supported image generation models
export type ImageModel = "dall-e-3" | "nano-banana-pro";

export const IMAGE_MODELS: { value: ImageModel; label: string }[] = [
  { value: "dall-e-3", label: "DALL-E 3" },
  { value: "nano-banana-pro", label: "Nano Banana Pro" },
];

interface GenerateState {
  prompt: string;
  mentionedCharacters: Character[];
  referenceImageId: Id<"_storage"> | null;
  referenceImageUrl: string | null;
  generatedImageId: Id<"_storage"> | null;
  isGenerating: boolean;
  model: ImageModel;
}

type CharacterMention = {
  characterId: Id<"characters">;
  characterName: string;
};

export function useGenerate() {
  const [state, setState] = useState<GenerateState>({
    prompt: "",
    mentionedCharacters: [],
    referenceImageId: null,
    referenceImageUrl: null,
    generatedImageId: null,
    isGenerating: false,
    model: "dall-e-3",
  });

  const generateAction = useAction(api.generations.generate);
  const charactersQuery = useQuery(api.characters.getByUser);
  const characters = charactersQuery ?? [];
  const hasCharactersLoaded = charactersQuery !== undefined;
  const pendingMentionsRef = useRef<CharacterMention[] | null>(null);

  // Get reference image URL
  const referenceImageUrlQuery = useQuery(
    api.storage.getUrl,
    state.referenceImageId ? { storageId: state.referenceImageId } : "skip"
  );

  // Get generated image URL from storage
  const generatedImageUrlQuery = useQuery(
    api.storage.getUrl,
    state.generatedImageId ? { storageId: state.generatedImageId } : "skip"
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

  const setModel = useCallback((model: ImageModel) => {
    setState((prev) => ({ ...prev, model }));
  }, []);

  const generate = useCallback(async () => {
    if (!state.prompt.trim()) {
      showToast.error("Please enter a prompt");
      return;
    }

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

      // Call the generate action (handles OpenAI/Google AI + storage)
      const result = await generateAction({
        prompt: state.prompt,
        characterMentions,
        referenceImageId: state.referenceImageId ?? undefined,
        model: state.model,
      });

      setState((prev) => ({
        ...prev,
        generatedImageId: result.generatedImageId,
        isGenerating: false,
      }));

      showToast.success("Image generated successfully!");
    } catch (error) {
      console.error("Generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate image";
      showToast.error(errorMessage);
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, [state.prompt, state.mentionedCharacters, state.referenceImageId, state.model, generateAction]);

  const reset = useCallback(() => {
    setState({
      prompt: "",
      mentionedCharacters: [],
      referenceImageId: null,
      referenceImageUrl: null,
      generatedImageId: null,
      isGenerating: false,
      model: "dall-e-3",
    });
  }, []);

  const resolveMentions = useCallback(
    (mentions: CharacterMention[]) => {
      if (mentions.length === 0) return [];
      return mentions
        .map((mention) => {
          const found = characters.find((c) => c._id === mention.characterId);
          if (!found) return null;
          return {
            _id: found._id,
            name: found.name,
            imageUrls: found.imageUrls,
          };
        })
        .filter((c): c is Character => c !== null);
    },
    [characters]
  );

  useEffect(() => {
    if (!hasCharactersLoaded || !pendingMentionsRef.current) return;
    const resolved = resolveMentions(pendingMentionsRef.current);
    setState((prev) => ({
      ...prev,
      mentionedCharacters: resolved,
    }));
    pendingMentionsRef.current = null;
  }, [hasCharactersLoaded, resolveMentions]);

  // Restore a generation from history
  const restore = useCallback(
    (generation: {
      prompt: string;
      characterMentions: CharacterMention[];
      referenceImageId?: Id<"_storage">;
      // Legacy records have generatedImageUrl, new records have generatedImageId
      generatedImageId?: Id<"_storage">;
      generatedImageUrl: string | null; // Resolved URL from query
    }) => {
      const mentions = generation.characterMentions ?? [];
      const mentionedChars: Character[] = hasCharactersLoaded
        ? resolveMentions(mentions)
        : [];

      if (!hasCharactersLoaded && mentions.length > 0) {
        pendingMentionsRef.current = mentions;
      }

      setState({
        prompt: generation.prompt,
        mentionedCharacters: mentionedChars,
        referenceImageId: generation.referenceImageId ?? null,
        referenceImageUrl: null, // Will be resolved by query
        generatedImageId: generation.generatedImageId ?? null,
        isGenerating: false,
      });
    },
    [hasCharactersLoaded, resolveMentions]
  );

  return {
    // State
    prompt: state.prompt,
    mentionedCharacters: state.mentionedCharacters,
    referenceImageId: state.referenceImageId,
    referenceImageUrl: referenceImageUrlQuery ?? null,
    generatedImageUrl: generatedImageUrlQuery ?? null,
    isGenerating: state.isGenerating,
    model: state.model,
    characters,

    // Actions
    setPrompt,
    addMention,
    setReferenceImage,
    removeReferenceImage,
    setModel,
    generate,
    reset,
    restore,
  };
}
