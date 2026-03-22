"use client";

import { type Model } from "@/lib/types";

interface ModelSelectorProps {
  allModels: Model[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxSelection?: number;
}

export function ModelSelector({
  allModels,
  selectedIds,
  onToggle,
  maxSelection = 4,
}: ModelSelectorProps) {
  const atMax = selectedIds.length >= maxSelection;

  return (
    <div className="flex flex-wrap gap-2">
      {allModels.map((model) => {
        const isSelected = selectedIds.includes(model.id);
        const isDisabled = !isSelected && atMax;
        return (
          <button
            key={model.id}
            onClick={() => !isDisabled && onToggle(model.id)}
            disabled={isDisabled}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all duration-150 ${
              isSelected
                ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                : isDisabled
                  ? "border-border text-text-sub/40 cursor-not-allowed"
                  : "border-border text-text-sub hover:border-blue-500/30 hover:text-text"
            }`}
            aria-pressed={isSelected}
          >
            {isSelected && (
              <span className="mr-1" aria-hidden="true">
                ×
              </span>
            )}
            {model.name}
          </button>
        );
      })}
      {atMax && (
        <span className="text-text-sub text-xs self-center ml-2">
          最大{maxSelection}モデルまで
        </span>
      )}
    </div>
  );
}
