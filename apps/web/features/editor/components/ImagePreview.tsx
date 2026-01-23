"use client";

import { cn } from "@/shared/utils/cn";

interface ImagePreviewProps {
  imageUrl: string | null;
  isLoading?: boolean;
}

export function ImagePreview({ imageUrl, isLoading }: ImagePreviewProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 rounded-[16px] bg-bg-primary border border-border">
        <div className="h-[72px] w-[72px] rounded-full border-[3px] border-accent-yellow animate-spin border-t-transparent" />
        <div className="text-center">
          <p className="text-[15px] font-medium text-text-muted">
            Generating image...
          </p>
          <p className="text-[13px] text-text-placeholder mt-1">
            This may take a few seconds
          </p>
        </div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="flex-1 rounded-[16px] overflow-hidden border border-border bg-bg-primary">
        <img
          src={imageUrl}
          alt="Generated"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 rounded-[16px] bg-bg-primary border border-border">
      <div className="h-[72px] w-[72px] rounded-full border-[3px] border-accent-yellow" />
      <div className="text-center">
        <p className="text-[15px] font-medium text-text-muted">
          Waiting for your input...
        </p>
        <p className="text-[13px] text-text-placeholder mt-1">
          Enter a prompt and click Generate to create an image
        </p>
      </div>
    </div>
  );
}
