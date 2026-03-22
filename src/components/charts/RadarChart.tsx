"use client";

import { useCallback, useMemo } from "react";
import * as d3 from "d3";
import { useD3Chart } from "@/hooks/useD3Chart";
import type { Model, BenchmarkMeta } from "@/lib/types";
import { normalizeScore } from "@/lib/normalize";

interface RadarChartProps {
  models: Model[];
  benchmarks: Record<string, BenchmarkMeta>;
}

const CHART_COLORS = ["#E69F00", "#56B4E9", "#009E73", "#CC79A7"];

export function RadarChart({ models, benchmarks }: RadarChartProps) {
  const benchmarkKeys = useMemo(() => Object.keys(benchmarks), [benchmarks]);

  const renderChart = useCallback(
    (
      svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
      width: number,
      height: number
    ) => {
      const size = Math.min(width, height);
      const margin = 60;
      const radius = (size - margin * 2) / 2;
      const center = { x: width / 2, y: size / 2 };
      const levels = 5;

      const g = svg
        .append("g")
        .attr("transform", `translate(${center.x},${center.y})`);

      const angleSlice = (Math.PI * 2) / benchmarkKeys.length;

      // グリッド円
      for (let level = 1; level <= levels; level++) {
        const r = (radius / levels) * level;
        g.append("circle")
          .attr("r", r)
          .attr("fill", "none")
          .attr("stroke", "#334155")
          .attr("stroke-width", 0.5)
          .attr("stroke-dasharray", level < levels ? "2,2" : "none");

        g.append("text")
          .attr("x", 4)
          .attr("y", -r)
          .attr("fill", "#64748b")
          .attr("font-size", "10px")
          .attr("font-family", "var(--font-jetbrains), monospace")
          .text(`${(level / levels) * 100}`);
      }

      // 軸線とラベル
      benchmarkKeys.forEach((key, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        g.append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", x)
          .attr("y2", y)
          .attr("stroke", "#334155")
          .attr("stroke-width", 0.5);

        const labelX = Math.cos(angle) * (radius + 24);
        const labelY = Math.sin(angle) * (radius + 24);

        g.append("text")
          .attr("x", labelX)
          .attr("y", labelY)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("fill", "#94a3b8")
          .attr("font-size", "11px")
          .text(benchmarks[key].name);
      });

      // モデルポリゴン
      models.forEach((model, modelIdx) => {
        const points: [number, number][] = [];
        benchmarkKeys.forEach((key, i) => {
          const bench = model.benchmarks[key];
          if (!bench) return;
          const normalized = normalizeScore(bench.score, benchmarks[key]);
          const angle = angleSlice * i - Math.PI / 2;
          const r = (normalized / 100) * radius;
          points.push([Math.cos(angle) * r, Math.sin(angle) * r]);
        });

        if (points.length < 3) return;

        const color = CHART_COLORS[modelIdx % CHART_COLORS.length];
        const line = d3
          .lineRadial<[number, number]>()
          .angle((_d, i) => {
            // 欠損軸スキップに対応するインデックス計算
            const availableIndices: number[] = [];
            benchmarkKeys.forEach((key, idx) => {
              if (model.benchmarks[key]) availableIndices.push(idx);
            });
            return angleSlice * availableIndices[i] - Math.PI / 2;
          })
          .radius((d) => {
            const [x, y] = d;
            return Math.sqrt(x * x + y * y);
          })
          .curve(d3.curveLinearClosed);

        // エリア
        const path = g
          .append("path")
          .datum(points)
          .attr("d", line as unknown as string)
          .attr("fill", color)
          .attr("fill-opacity", 0)
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .attr("stroke-opacity", 0);

        // ポイントのパスを直接構築（lineRadialが正しく動作しない場合の代替）
        const pathData =
          "M" +
          points.map(([x, y]) => `${x},${y}`).join("L") +
          "Z";

        path.attr("d", pathData);

        // アニメーション
        path
          .transition()
          .duration(600)
          .delay(modelIdx * 150)
          .attr("fill-opacity", 0.15)
          .attr("stroke-opacity", 1);

        // データポイント
        points.forEach(([x, y], i) => {
          const availableKeys = benchmarkKeys.filter(
            (k) => model.benchmarks[k] != null
          );
          const key = availableKeys[i];
          const bench = model.benchmarks[key];

          g.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 4)
            .attr("fill", color)
            .attr("stroke", "#0f172a")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0)
            .transition()
            .duration(600)
            .delay(modelIdx * 150 + 300)
            .attr("opacity", 1);

          g.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 8)
            .attr("fill", "transparent")
            .append("title")
            .text(
              `${model.name}\n${benchmarks[key].name}: ${bench?.score}`
            );
        });
      });

      // 凡例
      const legend = svg
        .append("g")
        .attr("transform", `translate(${width - 180},${20})`);

      models.forEach((model, i) => {
        const color = CHART_COLORS[i % CHART_COLORS.length];
        const row = legend
          .append("g")
          .attr("transform", `translate(0,${i * 22})`);

        row
          .append("rect")
          .attr("width", 12)
          .attr("height", 12)
          .attr("rx", 2)
          .attr("fill", color);

        row
          .append("text")
          .attr("x", 18)
          .attr("y", 10)
          .attr("fill", "#f1f5f9")
          .attr("font-size", "12px")
          .text(model.name);
      });
    },
    [models, benchmarks, benchmarkKeys]
  );

  const { svgRef, containerRef, error } = useD3Chart({
    renderChart,
    dependencies: [models, benchmarks],
  });

  if (models.length < 2) {
    return (
      <div className="bg-surface rounded-lg p-8 text-center">
        <p className="text-text-sub">2つ以上のモデルを選択してください</p>
        <p className="text-text-sub text-sm mt-2">
          ↑ 上のモデル選択UIからモデルを追加
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-lg p-6 text-center">
        <p className="text-red-400">チャートの描画に失敗しました</p>
        <p className="text-text-sub text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full aspect-square max-w-[600px] mx-auto"
      role="img"
      aria-label={`${models.map((m) => m.name).join("、")}のベンチマーク比較レーダーチャート`}
    >
      <svg ref={svgRef} />
    </div>
  );
}
