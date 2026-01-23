"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import { Info } from "lucide-react";
import {
  CharacterMentionDropdown,
  Character,
} from "./CharacterMentionDropdown";
import { cn } from "@/shared/utils/cn";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  characters: Character[];
  onMentionAdd: (character: Character) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
  placeholder?: string;
}

export function PromptInput({
  value,
  onChange,
  characters,
  onMentionAdd,
  onGenerate,
  isGenerating,
  placeholder = "Describe the image you want to create...\n\nUse @name to mention characters (e.g., @Sarah walking in a park at sunset)",
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mentionSearchTerm, setMentionSearchTerm] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(
    null
  );

  // Find the @ trigger position and show dropdown
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPosition = e.target.selectionStart;

      onChange(newValue);

      // Check if we're in a mention context
      const textBeforeCursor = newValue.slice(0, cursorPosition);
      const lastAtIndex = textBeforeCursor.lastIndexOf("@");

      if (lastAtIndex !== -1) {
        // Check if there's no space between @ and cursor
        const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
        if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
          setShowDropdown(true);
          setMentionStartIndex(lastAtIndex);
          setMentionSearchTerm(textAfterAt);

          // Calculate dropdown position
          if (textareaRef.current) {
            const textarea = textareaRef.current;
            const lineHeight = parseInt(
              getComputedStyle(textarea).lineHeight || "20"
            );
            const lines = textBeforeCursor.split("\n");
            const currentLineIndex = lines.length - 1;
            const topOffset = (currentLineIndex + 1) * lineHeight + 8;

            setDropdownPosition({
              top: topOffset,
              left: 0,
            });
          }
          return;
        }
      }

      setShowDropdown(false);
      setMentionStartIndex(null);
      setMentionSearchTerm("");
    },
    [onChange]
  );

  // Handle keyboard navigation in dropdown and shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Cmd/Ctrl + Enter to generate
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (onGenerate && !isGenerating && value.trim()) {
          onGenerate();
        }
        return;
      }

      if (showDropdown && e.key === "Escape") {
        setShowDropdown(false);
        setMentionStartIndex(null);
      }
    },
    [showDropdown, onGenerate, isGenerating, value]
  );

  // Handle character selection from dropdown
  const handleCharacterSelect = useCallback(
    (character: Character) => {
      if (mentionStartIndex === null) return;

      // Replace @searchTerm with @CharacterName
      const beforeMention = value.slice(0, mentionStartIndex);
      const afterMention = value.slice(
        mentionStartIndex + 1 + mentionSearchTerm.length
      );
      const newValue = `${beforeMention}@${character.name} ${afterMention}`;

      onChange(newValue);
      onMentionAdd(character);

      setShowDropdown(false);
      setMentionStartIndex(null);
      setMentionSearchTerm("");

      // Focus back on textarea
      textareaRef.current?.focus();
    },
    [value, mentionStartIndex, mentionSearchTerm, onChange, onMentionAdd]
  );

  const handleCloseDropdown = useCallback(() => {
    setShowDropdown(false);
    setMentionStartIndex(null);
    setMentionSearchTerm("");
  }, []);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-text-primary">
          Prompt
        </span>
        <div className="relative group">
          <Info className="h-3.5 w-3.5 text-text-placeholder cursor-help" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-bg-primary border border-border rounded-lg text-xs text-text-muted whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            Describe the image you want to generate. Use @name to mention characters.
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-border" />
          </div>
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full h-[120px] resize-none",
            "bg-bg-primary border border-border rounded-[12px]",
            "p-4 text-[13px] text-text-primary",
            "placeholder:text-text-placeholder",
            "focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:border-transparent",
            "transition-colors"
          )}
        />

        {showDropdown && (
          <CharacterMentionDropdown
            characters={characters}
            searchTerm={mentionSearchTerm}
            onSelect={handleCharacterSelect}
            onClose={handleCloseDropdown}
            position={dropdownPosition}
          />
        )}
      </div>
    </div>
  );
}
