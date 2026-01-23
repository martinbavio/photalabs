"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useUpload } from "@/shared/hooks/useUpload";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";

interface ImageSlotProps {
  imageUrl?: string | null;
  onUpload: (storageId: Id<"_storage">) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export function ImageSlot({
  imageUrl,
  onUpload,
  onRemove,
  disabled = false,
}: ImageSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, error, upload, reset } = useUpload();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      reset();
      const storageId = await upload(file);
      if (storageId) {
        onUpload(storageId);
      }
    },
    [upload, onUpload, reset]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [handleFileSelect]
  );

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading && !imageUrl) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading, imageUrl]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading || imageUrl) return;

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        handleFileSelect(file);
      }
    },
    [disabled, isUploading, imageUrl, handleFileSelect]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    },
    [onRemove]
  );

  // Filled state - show image with remove button
  if (imageUrl) {
    return (
      <div className="relative group h-[120px] rounded-[12px] overflow-hidden border border-border">
        <img
          src={imageUrl}
          alt="Character reference"
          className="w-full h-full object-cover"
        />
        {onRemove && !disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-bg-primary/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bg-primary"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        )}
      </div>
    );
  }

  // Empty/uploading state
  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-2.5 h-[120px] rounded-[12px]",
        "bg-bg-input border border-border transition-colors",
        !disabled && !isUploading && "cursor-pointer hover:border-text-muted",
        isDragging && "border-accent-yellow border-dashed",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {isUploading ? (
        <>
          <Loader2 className="w-6 h-6 text-text-placeholder animate-spin" />
          <span className="text-[11px] font-medium text-text-placeholder">
            Uploading...
          </span>
        </>
      ) : (
        <>
          <ImagePlus className="w-6 h-6 text-text-placeholder" />
          <span className="text-[11px] font-medium text-text-placeholder">
            Upload
          </span>
        </>
      )}

      {error && (
        <span className="text-[10px] text-error absolute bottom-1">
          {error}
        </span>
      )}
    </div>
  );
}
