"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, ChevronDown, Info } from "lucide-react";
import { PromptInput } from "./PromptInput";
import { ReferenceImageUpload } from "./ReferenceImageUpload";
import { GenerateButton } from "./GenerateButton";
import { Character } from "./CharacterMentionDropdown";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { cn } from "@/shared/utils/cn";

interface InputPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  characters: Character[];
  onMentionAdd: (character: Character) => void;
  referenceImageId: Id<"_storage"> | null;
  referenceImageUrl: string | null;
  onReferenceImageUpload: (storageId: Id<"_storage">) => void;
  onReferenceImageRemove: () => void;
  onGenerate: () => void;
  onReset: () => void;
  isGenerating: boolean;
}

export function InputPanel({
  prompt,
  onPromptChange,
  characters,
  onMentionAdd,
  referenceImageId,
  referenceImageUrl,
  onReferenceImageUpload,
  onReferenceImageRemove,
  onGenerate,
  onReset,
  isGenerating,
}: InputPanelProps) {
  const [modifierLabel, setModifierLabel] = useState("Cmd/Ctrl");

  useEffect(() => {
    const platform =
      (navigator as { userAgentData?: { platform?: string } }).userAgentData
        ?.platform ?? navigator.platform ?? "";
    const isApple = /Mac|iPhone|iPad|iPod/i.test(platform);
    setModifierLabel(isApple ? "⌘" : "Ctrl");
  }, []);

  return (
    <div
      className={cn(
        "flex-1 flex flex-col gap-6",
        "bg-bg-panel rounded-[20px] p-7",
        "border border-border"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-heading)]">
          Input
        </h2>

        <button
          className={cn(
            "flex items-center gap-2",
            "bg-[#1A1A1E] rounded-[10px] px-3.5 py-2",
            "border border-border",
            "text-text-muted text-xs font-medium",
            "hover:bg-border transition-colors"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Form</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Prompt Section */}
      <PromptInput
        value={prompt}
        onChange={onPromptChange}
        characters={characters}
        onMentionAdd={onMentionAdd}
        onGenerate={onGenerate}
        isGenerating={isGenerating}
      />

      {/* Reference Image Section */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-text-primary">
            Reference Image (optional)
          </span>
          <Info className="h-3.5 w-3.5 text-text-placeholder" />
        </div>

        <ReferenceImageUpload
          imageId={referenceImageId}
          imageUrl={referenceImageUrl}
          onUpload={onReferenceImageUpload}
          onRemove={onReferenceImageRemove}
        />
      </div>

      {/* Button Section */}
      <div className="flex flex-col gap-2 mt-auto">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onReset}
            className={cn(
              "px-6 py-3.5",
              "bg-[#1A1A1E] rounded-[12px]",
              "border border-border",
              "text-text-muted text-sm font-medium",
              "hover:bg-border transition-colors"
            )}
          >
            Reset
          </button>

          <GenerateButton
            onClick={onGenerate}
            isLoading={isGenerating}
            disabled={!prompt.trim()}
          />
        </div>
        <p className="text-xs text-text-placeholder">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-border rounded text-text-muted">
            {modifierLabel}
          </kbd>{" "}
          +{" "}
          <kbd className="px-1.5 py-0.5 bg-border rounded text-text-muted">
            Enter
          </kbd>{" "}
          to generate
        </p>
      </div>
    </div>
  );
}
