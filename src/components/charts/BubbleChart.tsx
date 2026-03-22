"use client";

import { useCallback } from "react";
import * as d3 from "d3";
import { useD3Chart } from "@/hooks/useD3Chart";
import type { Model } from "@/lib/types";
import { getAverageNormalizedScore } from "@/lib/data";

interface BubbleChartProps {
  models: Model[];
}

const CHART_COLORS = ["#E69F00", "#56B4E9", "#009E73", "#CC79A7", "#D55E00", "#0072B2"];

export function BubbleChart({ models }: BubbleChartProps) {
  const modelsWithPrice = models.filter(
    (m) => m.price_per_1m_tokens !== null && getAverageNormalizedScore(m) !== null
  );

  const renderChart = useCallback(
    (
      svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
      width: number,
      height: number
    ) => {
      const margin = { top: 20, right: 30, bottom: 50, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xExtent = d3.extent(modelsWithPrice, (m) =>
        getAverageNormalizedScore(m)
      ) as [number, number];
      const yExtent = d3.extent(
        modelsWithPrice,
        (m) => m.price_per_1m_tokens!.input
      ) as [number, number];
      const sizeExtent = d3.extent(
        modelsWithPrice,
        (m) => m.context_length
      ) as [number, number];

      const x = d3
        .scaleLinear()
        .domain([xExtent[0] - 5, xExtent[1] + 5])
        .range([0, innerWidth]);

      const y = d3
        .scaleLog()
        .domain([Math.max(0.1, yExtent[0] * 0.5), yExtent[1] * 2])
        .range([innerHeight, 0]);

      const size = d3
        .scaleSqrt()
        .domain(sizeExtent)
        .range([8, 40]);

      // 軸
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(5))
        .call((g) => g.selectAll("text").attr("fill", "#94a3b8"))
        .call((g) => g.selectAll("line").attr("stroke", "#334155"))
        .call((g) => g.select(".domain").attr("stroke", "#334155"));

      g.append("g")
        .call(
          d3
            .axisLeft(y)
            .ticks(5, "$.2f")
        )
        .call((g) => g.selectAll("text").attr("fill", "#94a3b8"))
        .call((g) => g.selectAll("line").attr("stroke", "#334155"))
        .call((g) => g.select(".domain").attr("stroke", "#334155"));

      // 軸ラベル
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .attr("fill", "#94a3b8")
        .attr("font-size", "12px")
        .text("平均正規化スコア");

      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .attr("fill", "#94a3b8")
        .attr("font-size", "12px")
        .text("入力トークン単価 ($/1M tokens)");

      // バブル
      modelsWithPrice.forEach((model, i) => {
        const avgScore = getAverageNormalizedScore(model)!;
        const price = model.price_per_1m_tokens!.input;
        const color = CHART_COLORS[i % CHART_COLORS.length];

        const bubble = g.append("g");

        bubble
          .append("circle")
          .attr("cx", x(avgScore))
          .attr("cy", y(price))
          .attr("r", 0)
          .attr("fill", color)
          .attr("fill-opacity", 0.6)
          .attr("stroke", color)
          .attr("stroke-width", 1.5)
          .transition()
          .duration(600)
          .delay(i * 80)
          .attr("r", size(model.context_length));

        // ラベル
        bubble
          .append("text")
          .attr("x", x(avgScore))
          .attr("y", y(price) - size(model.context_length) - 6)
          .attr("text-anchor", "middle")
          .attr("fill", "#f1f5f9")
          .attr("font-size", "10px")
          .attr("opacity", 0)
          .text(model.name)
          .transition()
          .duration(400)
          .delay(i * 80 + 400)
          .attr("opacity", 1);

        // ツールチップ
        bubble
          .append("circle")
          .attr("cx", x(avgScore))
          .attr("cy", y(price))
          .attr("r", size(model.context_length))
          .attr("fill", "transparent")
          .append("title")
          .text(
            `${model.name}\nスコア: ${avgScore.toFixed(1)}\n入力: $${price}/1M tokens\n出力: $${model.price_per_1m_tokens!.output}/1M tokens\nコンテキスト: ${(model.context_length / 1000).toFixed(0)}K`
          );
      });
    },
    [modelsWithPrice]
  );

  const { svgRef, containerRef, error } = useD3Chart({
    renderChart,
    dependencies: [modelsWithPrice],
  });

  if (modelsWithPrice.length === 0) {
    return (
      <div className="bg-surface rounded-lg p-8 text-center">
        <p className="text-text-sub">価格データのあるモデルがありません</p>
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
      className="w-full h-[400px]"
      role="img"
      aria-label="モデルの性能対コスト比較バブルチャート"
    >
      <svg ref={svgRef} />
    </div>
  );
}
