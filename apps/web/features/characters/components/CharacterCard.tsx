"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";

interface CharacterCardProps {
  id: Id<"characters">;
  name: string;
  imageCount: number;
  createdAt: number;
  avatarUrl: string | null;
  imageUrls: (string | null)[];
  onEdit: (id: Id<"characters">) => void;
  onDelete: (id: Id<"characters">) => void;
}

export function CharacterCard({
  id,
  name,
  imageCount,
  createdAt,
  avatarUrl,
  imageUrls,
  onEdit,
  onDelete,
}: CharacterCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formattedDate = useMemo(() => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Created today";
    } else if (diffDays === 1) {
      return "Created yesterday";
    } else if (diffDays < 7) {
      return `Created ${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Created ${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else {
      return `Created ${date.toLocaleDateString()}`;
    }
  }, [createdAt]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(id);
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="flex flex-col gap-[18px] p-[22px] bg-bg-panel rounded-[18px] border border-border">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        {/* Character Info */}
        <div className="flex items-center gap-[14px]">
          {/* Avatar */}
          <div className="w-[52px] h-[52px] rounded-[14px] overflow-hidden bg-border flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted text-lg font-semibold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold text-text-primary">
              {name}
            </span>
            <span className="text-xs text-text-muted">
              {imageCount} images • {formattedDate}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-[10px]">
          <button
            type="button"
            onClick={() => onEdit(id)}
            className="flex items-center justify-center w-[38px] h-[38px] rounded-[10px] bg-border hover:bg-border/80 transition-colors"
            title="Edit character"
          >
            <Pencil className="w-[18px] h-[18px] text-text-muted" />
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="flex items-center justify-center w-[38px] h-[38px] rounded-[10px] bg-border hover:bg-error/20 transition-colors group"
            title="Delete character"
          >
            <Trash2 className="w-[18px] h-[18px] text-text-muted group-hover:text-error" />
          </button>
        </div>
      </div>

      {/* Training Images Grid */}
      <div className="grid grid-cols-5 gap-[10px]">
        {imageUrls.slice(0, 5).map((url, index) => (
          <div
            key={index}
            className="h-[100px] rounded-[10px] overflow-hidden bg-border"
          >
            {url ? (
              <img
                src={url}
                alt={`${name} reference ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-bg-input" />
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleDeleteCancel}
          />
          <div className="relative bg-bg-panel rounded-[16px] border border-border p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Delete Character
            </h3>
            <p className="text-sm text-text-muted mb-6">
              Are you sure you want to delete &quot;{name}&quot;? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="px-4 py-2 rounded-[10px] bg-border text-text-muted text-sm font-medium hover:bg-border/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-[10px] bg-error text-white text-sm font-medium hover:bg-error/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
