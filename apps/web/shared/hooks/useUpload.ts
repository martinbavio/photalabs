"use client";

import { useMutation } from "convex/react";
import { api } from "@photalabs/backend/convex/_generated/api";
import { Id } from "@photalabs/backend/convex/_generated/dataModel";
import { useState, useCallback } from "react";

interface UploadState {
  isUploading: boolean;
  error: string | null;
  progress: number;
}

interface UseUploadReturn extends UploadState {
  upload: (file: File) => Promise<Id<"_storage"> | null>;
  reset: () => void;
}

/**
 * Hook for uploading files to Convex storage.
 * Handles the two-step process: get upload URL, then POST file.
 */
export function useUpload(): UseUploadReturn {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    error: null,
    progress: 0,
  });

  const reset = useCallback(() => {
    setState({ isUploading: false, error: null, progress: 0 });
  }, []);

  const upload = useCallback(
    async (file: File): Promise<Id<"_storage"> | null> => {
      setState({ isUploading: true, error: null, progress: 0 });

      try {
        // Validate file type (images only)
        if (!file.type.startsWith("image/")) {
          throw new Error("Only image files are allowed");
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error("File size must be less than 10MB");
        }

        // Step 1: Get upload URL from Convex
        setState((prev) => ({ ...prev, progress: 25 }));
        const uploadUrl = await generateUploadUrl();

        // Step 2: Upload file directly to Convex storage
        setState((prev) => ({ ...prev, progress: 50 }));
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error("Failed to upload file");
        }

        setState((prev) => ({ ...prev, progress: 75 }));
        const { storageId } = await result.json();

        setState({ isUploading: false, error: null, progress: 100 });
        return storageId as Id<"_storage">;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed";
        setState({ isUploading: false, error: message, progress: 0 });
        return null;
      }
    },
    [generateUploadUrl]
  );

  return {
    ...state,
    upload,
    reset,
  };
}
