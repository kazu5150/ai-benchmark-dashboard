"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RadarChart } from "@/components/charts/RadarChart";
import { BubbleChart } from "@/components/charts/BubbleChart";
import { ModelSelector } from "@/components/ModelSelector";
import { ExportButton } from "@/components/ExportButton";
import { getDataset, getModelsByIds } from "@/lib/data";

export function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dataset = getDataset();
  const chartRef = useRef<HTMLDivElement>(null);

  // URLパラメータからモデルを復元
  const initialModels = searchParams.get("models")?.split(",").filter(Boolean) ?? [];
  const validInitialModels = initialModels.filter((id) =>
    dataset.models.some((m) => m.id === id)
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(validInitialModels);
  const selectedModels = getModelsByIds(selectedIds);

  // URLを同期
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedIds.length > 0) {
      params.set("models", selectedIds.join(","));
    }
    const query = params.toString();
    router.replace(`/compare${query ? `?${query}` : ""}`, { scroll: false });
  }, [selectedIds, router]);

  const handleToggle = useCallback(
    (id: string) => {
      setSelectedIds((prev) =>
        prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id]
      );
    },
    []
  );

  // 初回ロード時にURLが空なら人気モデルをサジェスト
  useEffect(() => {
    // 初回のみ: 何も選択されていなければサジェストを表示するが自動選択はしない
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">モデル比較</h1>

      {/* モデル選択 */}
      <section>
        <h2 className="text-sm text-text-sub mb-3">
          モデルを選択（最大4つ）
        </h2>
        <ModelSelector
          allModels={dataset.models}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          maxSelection={4}
        />
      </section>

      {/* レーダーチャート */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">ベンチマーク比較</h2>
          {selectedModels.length >= 2 && (
            <ExportButton
              targetRef={chartRef}
              filename="benchmark-radar"
            />
          )}
        </div>
        <div ref={chartRef}>
          <RadarChart
            models={selectedModels}
            benchmarks={dataset.benchmarks}
          />
        </div>
      </section>

      {/* バブルチャート */}
      <section>
        <h2 className="text-lg font-medium mb-4">コストパフォーマンス</h2>
        <BubbleChart models={selectedModels.length > 0 ? selectedModels : dataset.models} />
      </section>
    </div>
  );
}
