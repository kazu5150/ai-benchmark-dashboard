"use client";

import { useCallback } from "react";
import * as d3 from "d3";
import { useD3Chart } from "@/hooks/useD3Chart";
import type { Model, BenchmarkMeta } from "@/lib/types";
import { normalizeScore } from "@/lib/normalize";

interface HeatmapProps {
  models: Model[];
  benchmarks: Record<string, BenchmarkMeta>;
  onModelClick?: (modelId: string) => void;
}

const CHART_COLORS = {
  low: "#1e293b",
  mid: "#3b82f6",
  high: "#f59e0b",
  na: "#334155",
  text: "#f1f5f9",
  textSub: "#94a3b8",
};

export function Heatmap({ models, benchmarks, onModelClick }: HeatmapProps) {
  const benchmarkKeys = Object.keys(benchmarks);

  const renderChart = useCallback(
    (
      svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
      width: number,
      height: number
    ) => {
      const margin = { top: 60, right: 20, bottom: 20, left: 180 };
      const cellHeight = 36;
      const cellPadding = 2;
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = models.length * cellHeight;

      svg.attr("height", margin.top + innerHeight + margin.bottom);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const colorScale = d3
        .scaleLinear<string>()
        .domain([0, 50, 100])
        .range([CHART_COLORS.low, CHART_COLORS.mid, CHART_COLORS.high]);

      const cellWidth = innerWidth / benchmarkKeys.length;

      // ベンチマーク名ヘッダー
      g.selectAll(".bench-label")
        .data(benchmarkKeys)
        .enter()
        .append("text")
        .attr("x", (_d, i) => i * cellWidth + cellWidth / 2)
        .attr("y", -12)
        .attr("text-anchor", "middle")
        .attr("fill", CHART_COLORS.textSub)
        .attr("font-size", "12px")
        .text((d) => benchmarks[d].name);

      // 各モデル行
      models.forEach((model, rowIdx) => {
        const row = g
          .append("g")
          .attr("transform", `translate(0,${rowIdx * cellHeight})`);

        // モデル名
        row
          .append("text")
          .attr("x", -8)
          .attr("y", cellHeight / 2)
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "central")
          .attr("fill", CHART_COLORS.text)
          .attr("font-size", "13px")
          .attr("cursor", onModelClick ? "pointer" : "default")
          .text(model.name)
          .on("click", () => onModelClick?.(model.id));

        // スコアセル
        benchmarkKeys.forEach((key, colIdx) => {
          const bench = model.benchmarks[key];
          const normalized = bench
            ? normalizeScore(bench.score, benchmarks[key])
            : null;

          const cell = row
            .append("g")
            .attr(
              "transform",
              `translate(${colIdx * cellWidth + cellPadding},${cellPadding})`
            );

          cell
            .append("rect")
            .attr("width", cellWidth - cellPadding * 2)
            .attr("height", cellHeight - cellPadding * 2)
            .attr("rx", 4)
            .attr(
              "fill",
              normalized !== null ? colorScale(normalized) : CHART_COLORS.na
            )
            .attr("opacity", 0)
            .transition()
            .duration(600)
            .delay(rowIdx * 30 + colIdx * 15)
            .attr("opacity", 1);

          cell
            .append("text")
            .attr("x", (cellWidth - cellPadding * 2) / 2)
            .attr("y", (cellHeight - cellPadding * 2) / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", CHART_COLORS.text)
            .attr("font-size", "12px")
            .attr("font-family", "var(--font-jetbrains), monospace")
            .text(normalized !== null ? normalized.toFixed(1) : "N/A");

          // ツールチップ
          if (normalized !== null) {
            const ranking = models
              .filter((m) => m.benchmarks[key]?.score != null)
              .map((m) => ({
                id: m.id,
                score: normalizeScore(
                  m.benchmarks[key]!.score,
                  benchmarks[key]
                ),
              }))
              .sort((a, b) => b.score - a.score);
            const rank =
              ranking.findIndex((r) => r.id === model.id) + 1;

            cell
              .append("title")
              .text(
                `${model.name}\n${benchmarks[key].name}: ${bench!.score}\n正規化: ${normalized.toFixed(1)}/100\n順位: ${rank}/${ranking.length}`
              );
          }
        });
      });
    },
    [models, benchmarks, benchmarkKeys, onModelClick]
  );

  const { svgRef, containerRef, error } = useD3Chart({
    renderChart,
    dependencies: [models, benchmarks],
  });

  if (error) {
    return (
      <div className="bg-surface rounded-lg p-6 text-center">
        <p className="text-red-400">データ読込エラー</p>
        <p className="text-text-sub text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="bg-surface rounded-lg p-8 text-center">
        <p className="text-text-sub">データを準備中です</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto"
      role="img"
      aria-label={`${models.length}モデル × ${benchmarkKeys.length}ベンチマークのスコアヒートマップ`}
    >
      <svg ref={svgRef} className="min-w-[600px]" />
    </div>
  );
}
