"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { History } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@photalabs/backend/convex/_generated/api";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { InputPanel, ResultPanel, useGenerate } from "@/features/editor";
import { cn } from "@/shared/utils/cn";

// Lazy load HistoryPanel - only shown when user clicks History button
const HistoryPanel = dynamic(
  () => import("@/features/editor/components/HistoryPanel").then((mod) => mod.HistoryPanel),
  { ssr: false }
);

export default function CreatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [historyOpen, setHistoryOpen] = useState(false);
  const hasRestoredRef = useRef(false);

  const {
    prompt,
    setPrompt,
    characters,
    addMention,
    referenceImageId,
    referenceImageUrl,
    setReferenceImage,
    removeReferenceImage,
    generatedImageUrl,
    isGenerating,
    model,
    setModel,
    generate,
    reset,
    restore,
  } = useGenerate();

  // Handle restore from URL params (when coming from history page)
  const restoreId = searchParams.get("restore") as Id<"generations"> | null;
  const generationToRestore = useQuery(
    api.generations.getById,
    restoreId ? { id: restoreId } : "skip"
  );

  useEffect(() => {
    if (generationToRestore && restoreId && !hasRestoredRef.current) {
      restore(generationToRestore);
      hasRestoredRef.current = true;
      // Clear the URL param after restoring
      const params = new URLSearchParams(searchParams.toString());
      params.delete("restore");
      const next = params.toString();
      router.replace(next ? `/create?${next}` : "/create");
    }
  }, [generationToRestore, restoreId, restore, router, searchParams]);

  const handleHistorySelect = (generation: {
    _id: Id<"generations">;
    prompt: string;
    characterMentions: Array<{
      characterId: Id<"characters">;
      characterName: string;
    }>;
    referenceImageId?: Id<"_storage">;
    // Legacy records have generatedImageUrl, new records have generatedImageId
    generatedImageId?: Id<"_storage">;
    generatedImageUrl: string | null;
  }) => {
    restore(generation);
    setHistoryOpen(false);
  };

  return (
    <div className="flex flex-col gap-7 h-full p-9 px-11">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-medium text-text-primary font-[family-name:var(--font-heading)]">
            Create Image
          </h1>
          <p className="text-sm text-text-muted">
            Generate stunning images with AI
          </p>
        </div>

        <button
          onClick={() => setHistoryOpen(true)}
          className={cn(
            "flex items-center gap-2",
            "bg-bg-panel rounded-[12px] px-[18px] py-3",
            "border border-border",
            "text-text-muted text-[13px] font-medium",
            "hover:bg-border transition-colors"
          )}
        >
          <History className="h-[18px] w-[18px]" />
          <span>History</span>
        </button>
      </div>

      {/* Editor Panels */}
      <div className="flex gap-7 flex-1 min-h-0">
        <InputPanel
          prompt={prompt}
          onPromptChange={setPrompt}
          characters={characters}
          onMentionAdd={addMention}
          referenceImageId={referenceImageId}
          referenceImageUrl={referenceImageUrl}
          onReferenceImageUpload={setReferenceImage}
          onReferenceImageRemove={removeReferenceImage}
          onGenerate={generate}
          onReset={reset}
          isGenerating={isGenerating}
          model={model}
          onModelChange={setModel}
        />

        <ResultPanel imageUrl={generatedImageUrl} isLoading={isGenerating} />
      </div>

      {/* History Panel */}
      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleHistorySelect}
      />
    </div>
  );
}
