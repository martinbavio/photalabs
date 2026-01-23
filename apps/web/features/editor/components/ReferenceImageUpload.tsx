"use client";

import { useCallback, useState } from "react";
import { CloudUpload, X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@photalabs/backend/convex/_generated/api";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { cn } from "@/shared/utils/cn";

interface ReferenceImageUploadProps {
  imageId: Id<"_storage"> | null;
  imageUrl: string | null;
  onUpload: (storageId: Id<"_storage">) => void;
  onRemove: () => void;
}

export function ReferenceImageUpload({
  imageId,
  imageUrl,
  onUpload,
  onRemove,
}: ReferenceImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;

      setIsUploading(true);
      try {
        // Get upload URL from Convex
        const uploadUrl = await generateUploadUrl();

        // Upload file directly to Convex storage
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();

        onUpload(storageId);
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [generateUploadUrl, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileSelect(file);
    };
    input.click();
  }, [handleFileSelect]);

  if (imageUrl) {
    return (
      <div className="relative">
        <div className="rounded-[12px] overflow-hidden border border-border bg-bg-primary">
          <img
            src={imageUrl}
            alt="Reference"
            className="w-full h-[100px] object-cover"
          />
        </div>
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 rounded-full bg-bg-panel/80 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "flex flex-col items-center justify-center gap-2.5",
        "h-[100px] rounded-[12px]",
        "bg-bg-primary border border-border",
        "cursor-pointer transition-colors",
        isDragging && "border-accent-yellow bg-accent-yellow/5",
        isUploading && "opacity-50 cursor-wait"
      )}
    >
      {isUploading ? (
        <svg
          className="h-7 w-7 animate-spin text-text-placeholder"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <CloudUpload className="h-7 w-7 text-text-placeholder" />
      )}
      <span className="text-xs text-text-placeholder">
        {isUploading ? "Uploading..." : "Drop image here or click to upload"}
      </span>
    </div>
  );
}
