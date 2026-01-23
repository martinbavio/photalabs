"use client";

import { History } from "lucide-react";
import { InputPanel, ResultPanel, useGenerate } from "@/features/editor";
import { cn } from "@/shared/utils/cn";

export default function CreatePage() {
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
    generate,
    reset,
  } = useGenerate();

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
        />

        <ResultPanel imageUrl={generatedImageUrl} isLoading={isGenerating} />
      </div>
    </div>
  );
}
