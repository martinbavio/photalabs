"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@photalabs/backend/convex/_generated/api";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { X, Check, Lightbulb, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { ImageSlot } from "./ImageSlot";
import { showToast } from "@/shared/hooks/useToast";

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterId?: Id<"characters">; // If provided, edit mode
  onSuccess?: () => void;
}

const MIN_IMAGES = 3;
const MAX_IMAGES = 5;

export function CharacterModal({
  isOpen,
  onClose,
  characterId,
  onSuccess,
}: CharacterModalProps) {
  const [name, setName] = useState("");
  const [imageIds, setImageIds] = useState<Id<"_storage">[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track newly uploaded images during this session (for cleanup on failure)
  const [newlyUploadedIds, setNewlyUploadedIds] = useState<Set<Id<"_storage">>>(
    new Set()
  );

  const isEditMode = !!characterId;

  // Fetch character data if editing
  const character = useQuery(
    api.characters.get,
    characterId ? { id: characterId } : "skip"
  );

  // Resolve storage IDs to URLs
  const imageUrls = useQuery(
    api.storage.getUrls,
    imageIds.length > 0 ? { storageIds: imageIds } : "skip"
  );

  // Mutations
  const createCharacter = useMutation(api.characters.create);
  const updateCharacter = useMutation(api.characters.update);
  const deleteFile = useMutation(api.storage.deleteFile);

  // Initialize form when editing
  useEffect(() => {
    if (isEditMode && character) {
      setName(character.name);
      setImageIds(character.imageIds);
    } else if (!isEditMode) {
      // Reset form for create mode
      setName("");
      setImageIds([]);
    }
  }, [isEditMode, character]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      if (!isEditMode) {
        setName("");
        setImageIds([]);
      }
      setNewlyUploadedIds(new Set());
    }
  }, [isOpen, isEditMode]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  const handleImageUpload = useCallback(
    (storageId: Id<"_storage">, index: number) => {
      setImageIds((prev) => {
        const newIds = [...prev];
        newIds[index] = storageId;
        return newIds.filter(Boolean);
      });
      // Track this as a newly uploaded image
      setNewlyUploadedIds((prev) => new Set(prev).add(storageId));
    },
    []
  );

  const handleImageRemove = useCallback(
    async (index: number) => {
      const storageIdToRemove = imageIds[index];

      setImageIds((prev) => prev.filter((_, i) => i !== index));

      // Delete from storage if this is a newly uploaded file (not from the original character)
      if (storageIdToRemove && newlyUploadedIds.has(storageIdToRemove)) {
        try {
          await deleteFile({ storageId: storageIdToRemove });
          setNewlyUploadedIds((prev) => {
            const next = new Set(prev);
            next.delete(storageIdToRemove);
            return next;
          });
        } catch {
          // Silently fail - file might not exist
        }
      }
    },
    [imageIds, deleteFile, newlyUploadedIds]
  );

  const handleSave = useCallback(async () => {
    if (imageIds.length < MIN_IMAGES) {
      setError(`Please upload at least ${MIN_IMAGES} images`);
      showToast.error(`Please upload at least ${MIN_IMAGES} images`);
      return;
    }

    if (!name.trim()) {
      setError("Please enter a character name");
      showToast.error("Please enter a character name");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (isEditMode && characterId) {
        await updateCharacter({
          id: characterId,
          name: name.trim(),
          imageIds,
        });
        showToast.success("Character updated successfully!");
      } else {
        await createCharacter({
          name: name.trim(),
          imageIds,
        });
        showToast.success("Character created successfully!");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save character";
      setError(errorMessage);
      showToast.error(errorMessage);
      // Clean up newly uploaded images on failure to prevent orphans
      if (newlyUploadedIds.size > 0) {
        await Promise.allSettled(
          Array.from(newlyUploadedIds).map((id) =>
            deleteFile({ storageId: id })
          )
        );
        setNewlyUploadedIds(new Set());
        setImageIds((prev) =>
          prev.filter((id) => !newlyUploadedIds.has(id))
        );
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    imageIds,
    name,
    isEditMode,
    characterId,
    updateCharacter,
    createCharacter,
    onSuccess,
    onClose,
    newlyUploadedIds,
    deleteFile,
  ]);

  const handleClose = useCallback(() => {
    if (!isSaving) {
      onClose();
    }
  }, [isSaving, onClose]);

  const canSave = imageIds.length >= MIN_IMAGES && name.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-[580px] max-h-[90vh] overflow-y-auto bg-bg-panel rounded-[22px] border border-border p-[30px] flex flex-col gap-[26px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-semibold text-text-primary font-[family-name:var(--font-heading)]">
            {isEditMode ? "Edit Character" : "Create New Character"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="flex items-center justify-center w-[38px] h-[38px] rounded-[10px] bg-border hover:bg-border/80 transition-colors disabled:opacity-50"
          >
            <X className="w-[18px] h-[18px] text-text-muted" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-text-muted">
          Create a character by uploading 3-5 reference images. These will be
          used to generate consistent images of this character.
        </p>

        {/* Name Section */}
        <div className="flex flex-col gap-[10px]">
          <label className="text-[13px] font-semibold text-text-primary">
            Character Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter character name..."
            disabled={isSaving}
            className={cn(
              "w-full bg-bg-primary text-text-primary placeholder:text-text-placeholder",
              "border border-border rounded-[12px]",
              "px-[18px] py-[16px] text-sm",
              "focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:border-transparent",
              "transition-colors disabled:opacity-50"
            )}
          />
        </div>

        {/* Images Section */}
        <div className="flex flex-col gap-[14px] flex-1">
          {/* Images Label */}
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-text-primary">
              Reference Images
            </span>
            <span className="text-xs text-text-muted">
              {imageIds.length}/{MAX_IMAGES} uploaded
            </span>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-5 gap-[14px]">
            {Array.from({ length: MAX_IMAGES }).map((_, index) => (
              <ImageSlot
                key={index}
                imageUrl={imageUrls?.[index]}
                onUpload={(storageId) => handleImageUpload(storageId, index)}
                onRemove={
                  imageIds[index] ? () => handleImageRemove(index) : undefined
                }
                disabled={isSaving}
              />
            ))}
          </div>

          {/* Tips Section */}
          <div className="flex gap-[14px] p-[16px] bg-accent-yellow/[0.06] rounded-[12px]">
            <Lightbulb className="w-[20px] h-[20px] text-accent-yellow flex-shrink-0" />
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-accent-yellow">
                Tips for best results
              </span>
              <ul className="text-xs text-text-muted space-y-1">
                <li>• Use clear, well-lit photos</li>
                <li>• Include different angles and expressions</li>
                <li>• Avoid blurry or low-quality images</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-error text-center">{error}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-[14px]">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="px-[22px] py-[14px] rounded-[12px] bg-border text-text-muted text-sm font-medium hover:bg-border/80 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className={cn(
              "flex items-center gap-[10px] px-[26px] py-[14px] rounded-[12px]",
              "bg-accent-yellow text-bg-primary text-sm font-bold",
              "transition-opacity",
              (!canSave || isSaving) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin" />
            ) : (
              <Check className="w-[18px] h-[18px]" />
            )}
            {isEditMode ? "Save Changes" : "Save Character"}
          </button>
        </div>
      </div>
    </div>
  );
}
