"use client";

import { cn } from "@/shared/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[12px] bg-border/50",
        className
      )}
    />
  );
}

// Pre-built skeleton layouts for common use cases

export function CharacterCardSkeleton() {
  return (
    <div className="bg-bg-panel rounded-[20px] border border-border p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="aspect-square rounded-[10px]" />
        <Skeleton className="aspect-square rounded-[10px]" />
        <Skeleton className="aspect-square rounded-[10px]" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-8 w-20 rounded-[10px]" />
        <Skeleton className="h-8 w-24 rounded-[10px]" />
      </div>
    </div>
  );
}

export function CharacterGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CharacterCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HistoryPanelSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 p-2">
          <Skeleton className="w-16 h-16 rounded-[10px] flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
