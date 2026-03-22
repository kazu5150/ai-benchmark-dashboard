"use client";

import { useRouter } from "next/navigation";
import { Heatmap } from "@/components/charts/Heatmap";
import { MobileNav } from "@/components/MobileNav";
import { getDataset, getRanking } from "@/lib/data";

export default function OverviewPage() {
  const router = useRouter();
  const dataset = getDataset();
  const benchmarkKeys = Object.keys(dataset.benchmarks);

  const handleModelClick = (modelId: string) => {
    router.push(`/compare?models=${modelId}`);
  };

  // インラインバッジ: 各ベンチマークの1位
  const topModels = benchmarkKeys.map((key) => {
    const ranking = getRanking(key);
    const top = ranking[0];
    return {
      benchmark: dataset.benchmarks[key].name,
      model: top?.model.name ?? "N/A",
      modelId: top?.model.id,
    };
  });

  return (
    <>
      <div className="space-y-6">
        {/* コンパクトヘッダー */}
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-xl font-semibold">Overview</h1>
            <p className="text-text-sub text-sm mt-0.5">
              {dataset.models.length}モデル &middot; 最終更新:{" "}
              {dataset.last_updated}
            </p>
          </div>
        </div>

        {/* ヒートマップ */}
        <section>
          <Heatmap
            models={dataset.models}
            benchmarks={dataset.benchmarks}
            onModelClick={handleModelClick}
          />
        </section>

        {/* インラインバッジ */}
        <div className="flex flex-wrap gap-2 text-sm">
          {topModels.map(({ benchmark, model, modelId }) => (
            <button
              key={benchmark}
              onClick={() =>
                modelId && router.push(`/compare?models=${modelId}`)
              }
              className="px-3 py-1 bg-surface border border-border rounded-full text-text-sub hover:text-text hover:border-blue-500/30 transition-colors"
            >
              <span className="text-text-sub">{benchmark} 1位:</span>{" "}
              <span className="text-text font-medium font-[family-name:var(--font-jetbrains)]">
                {model}
              </span>
            </button>
          ))}
        </div>
      </div>
      <MobileNav />
    </>
  );
}
