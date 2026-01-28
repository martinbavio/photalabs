"use client";

import { memo, useEffect, useRef, useState, useMemo } from "react";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { cn } from "@/shared/utils/cn";

export interface Character {
  _id: Id<"characters">;
  name: string;
  imageUrls: (string | null)[];
}

interface CharacterMentionDropdownProps {
  characters: Character[];
  searchTerm: string;
  onSelect: (character: Character) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

// Memoize to prevent re-renders when parent's callback refs change
export const CharacterMentionDropdown = memo(function CharacterMentionDropdown({
  characters,
  searchTerm,
  onSelect,
  onClose,
  position,
}: CharacterMentionDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Memoize filtered characters to avoid recalculating on every render
  const filteredCharacters = useMemo(
    () =>
      characters.filter((char) =>
        char.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [characters, searchTerm]
  );

  // Reset highlighted index when filtered results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (filteredCharacters.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCharacters.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCharacters.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSelect(filteredCharacters[highlightedIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, filteredCharacters, highlightedIndex, onSelect]);

  if (filteredCharacters.length === 0) {
    return (
      <div
        ref={dropdownRef}
        style={{ top: position.top, left: position.left }}
        className="absolute z-50 w-64 bg-bg-panel border border-border rounded-[12px] p-2 shadow-lg"
      >
        <p className="text-sm text-text-muted px-3 py-2">
          {characters.length === 0
            ? "No characters created yet"
            : "No matching characters"}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      style={{ top: position.top, left: position.left }}
      className="absolute z-50 w-64 bg-bg-panel border border-border rounded-[12px] p-2 shadow-lg max-h-48 overflow-y-auto"
    >
      {filteredCharacters.map((character, index) => (
        <button
          key={character._id}
          onClick={() => onSelect(character)}
          onMouseEnter={() => setHighlightedIndex(index)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
            "text-left text-sm text-text-primary",
            "transition-colors",
            highlightedIndex === index ? "bg-border" : "hover:bg-border"
          )}
        >
          {character.imageUrls[0] ? (
            <img
              src={character.imageUrls[0]}
              alt={character.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-text-muted">
              {character.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span>{character.name}</span>
        </button>
      ))}
    </div>
  );
});
