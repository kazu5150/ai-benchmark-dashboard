"use client";

import { getDataset, getRanking } from "@/lib/data";
import { MobileNav } from "@/components/MobileNav";

export default function BenchmarksPage() {
  const dataset = getDataset();
  const benchmarkKeys = Object.keys(dataset.benchmarks);

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-xl font-semibold">ベンチマーク一覧</h1>

        {benchmarkKeys.map((key) => {
          const meta = dataset.benchmarks[key];
          const ranking = getRanking(key);

          return (
            <section key={key} className="bg-surface rounded-lg p-6">
              <h2 className="text-lg font-medium">{meta.name}</h2>
              <p className="text-text-sub text-sm mt-1 mb-4">
                {meta.description}
              </p>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-text-sub font-medium w-12">
                      #
                    </th>
                    <th className="text-left py-2 px-3 text-text-sub font-medium">
                      モデル
                    </th>
                    <th className="text-left py-2 px-3 text-text-sub font-medium">
                      プロバイダー
                    </th>
                    <th className="text-right py-2 px-3 text-text-sub font-medium">
                      スコア
                    </th>
                    <th className="text-right py-2 px-3 text-text-sub font-medium">
                      正規化
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map(({ model, score, normalizedScore }, idx) => (
                    <tr
                      key={model.id}
                      className="border-b border-border/50 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-2 px-3 font-[family-name:var(--font-jetbrains)] text-text-sub">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 text-text font-medium">
                        {model.name}
                      </td>
                      <td className="py-2 px-3 text-text-sub">
                        {model.provider}
                      </td>
                      <td className="py-2 px-3 text-right font-[family-name:var(--font-jetbrains)]">
                        {score}
                      </td>
                      <td className="py-2 px-3 text-right font-[family-name:var(--font-jetbrains)] text-text-sub">
                        {normalizedScore.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>
      <MobileNav />
    </>
  );
}
