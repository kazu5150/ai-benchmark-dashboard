"use client";

import { useRef, useEffect, useState, type RefObject } from "react";
import * as d3 from "d3";

interface UseD3ChartOptions {
  renderChart: (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number
  ) => void;
  dependencies?: unknown[];
}

interface UseD3ChartReturn {
  svgRef: RefObject<SVGSVGElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  error: string | null;
  dimensions: { width: number; height: number };
}

export function useD3Chart({
  renderChart,
  dependencies = [],
}: UseD3ChartOptions): UseD3ChartReturn {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const lastWidthRef = useRef(0);
  const renderingRef = useRef(false);

  useEffect(() => {
    function render() {
      if (!svgRef.current || !containerRef.current) return;
      if (renderingRef.current) return;

      const { width, height } = containerRef.current.getBoundingClientRect();
      if (width === 0) return;

      renderingRef.current = true;

      setDimensions({ width: Math.round(width), height: Math.round(height) });

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      svg.attr("width", width).attr("height", height);

      try {
        renderChart(svg, width, height);
        setError(null);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "チャートの描画に失敗しました"
        );
      }

      lastWidthRef.current = Math.round(width);
      renderingRef.current = false;
    }

    // 初回描画
    requestAnimationFrame(render);

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const newWidth = Math.round(entry.contentRect.width);
      // 幅が変わった場合のみ再描画（高さ変更はchart自身が起こすのでスキップ）
      if (newWidth !== lastWidthRef.current && newWidth > 0) {
        requestAnimationFrame(render);
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderChart, ...dependencies]);

  return { svgRef, containerRef, error, dimensions };
}
