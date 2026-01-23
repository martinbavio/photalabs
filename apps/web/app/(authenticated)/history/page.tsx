"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownAZ, ChevronDown } from "lucide-react";
import { HistoryGrid, useHistory } from "@/features/history";
import { Generation } from "@/features/history";
import { cn } from "@/shared/utils/cn";

export default function HistoryPage() {
  const router = useRouter();
  const { generations, isLoading, totalCount } = useHistory();
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const handleSelectGeneration = (generation: Generation) => {
    // Navigate to editor with generation data via URL params
    const params = new URLSearchParams();
    params.set("restore", generation._id);
    router.push(`/create?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-7 h-full p-9 px-11">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-medium text-text-primary font-[family-name:var(--font-heading)]">
            History
          </h1>
          <p className="text-sm text-text-muted">
            {totalCount} {totalCount === 1 ? "image" : "images"} created
          </p>
        </div>

        {/* Sort Button */}
        <div className="relative">
          <button
            onClick={() => setSortMenuOpen(!sortMenuOpen)}
            className={cn(
              "flex items-center gap-1.5",
              "bg-bg-panel rounded-[12px] px-4 py-3",
              "border border-border",
              "text-text-muted text-[13px] font-medium",
              "hover:bg-border transition-colors"
            )}
          >
            <ArrowDownAZ className="h-[18px] w-[18px]" />
            <span>Recent</span>
            <ChevronDown className="h-4 w-4 text-text-placeholder" />
          </button>

          {/* Sort dropdown - could be expanded in future */}
          {sortMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setSortMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-20 bg-bg-panel border border-border rounded-[12px] py-1 min-w-[140px] shadow-lg">
                <button
                  onClick={() => setSortMenuOpen(false)}
                  className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-border transition-colors"
                >
                  Most Recent
                </button>
                <button
                  onClick={() => setSortMenuOpen(false)}
                  className="w-full px-4 py-2.5 text-left text-sm text-text-muted hover:bg-border transition-colors"
                >
                  Oldest First
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Grid */}
      <div className="flex-1 overflow-auto">
        <HistoryGrid
          generations={generations}
          onSelect={handleSelectGeneration}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
