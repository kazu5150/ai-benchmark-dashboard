import type { BenchmarkMeta } from "./types";

/**
 * ベンチマークスコアを0-100スケールに正規化する
 */
export function normalizeScore(
  score: number,
  meta: BenchmarkMeta
): number {
  switch (meta.normalize) {
    case "multiply_10":
      return score * 10;
    case "identity":
    default:
      return score;
  }
}
