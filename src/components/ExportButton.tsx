"use client";

import { useCallback, useState, type RefObject } from "react";
import { toPng } from "html-to-image";

interface ExportButtonProps {
  targetRef: RefObject<HTMLElement | null>;
  filename?: string;
}

export function ExportButton({
  targetRef,
  filename = "benchmark-chart",
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!targetRef.current || exporting) return;

    setExporting(true);
    try {
      const dataUrl = await toPng(targetRef.current, {
        backgroundColor: "#0f172a",
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // PNG書き出しに失敗した場合は何もしない
    } finally {
      setExporting(false);
    }
  }, [targetRef, filename, exporting]);

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="px-4 py-2 text-sm bg-surface border border-border rounded-lg text-text-sub hover:text-text hover:border-blue-500/30 transition-colors disabled:opacity-50"
    >
      {exporting ? "書き出し中..." : "PNG書き出し"}
    </button>
  );
}
