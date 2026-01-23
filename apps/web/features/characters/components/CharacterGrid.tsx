"use client";

import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { CharacterCard } from "./CharacterCard";

interface Character {
  _id: Id<"characters">;
  name: string;
  imageIds: Id<"_storage">[];
  imageUrls: (string | null)[];
  createdAt: number;
}

interface CharacterGridProps {
  characters: Character[];
  onEdit: (id: Id<"characters">) => void;
  onDelete: (id: Id<"characters">) => void;
}

export function CharacterGrid({
  characters,
  onEdit,
  onDelete,
}: CharacterGridProps) {
  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-bg-panel border border-border flex items-center justify-center mb-4">
          <span className="text-2xl">👤</span>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No characters yet
        </h3>
        <p className="text-sm text-text-muted max-w-sm">
          Create your first character by clicking the &quot;Create Character&quot;
          button above. Characters help you generate consistent images.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {characters.map((character) => (
        <CharacterCard
          key={character._id}
          id={character._id}
          name={character.name}
          imageCount={character.imageIds.length}
          createdAt={character.createdAt}
          avatarUrl={character.imageUrls[0]}
          imageUrls={character.imageUrls}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
