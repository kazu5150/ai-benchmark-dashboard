import { DatasetSchema, type Dataset, type Model } from "./types";
import { normalizeScore } from "./normalize";
import rawData from "../../data/models.json";

let cachedDataset: Dataset | null = null;

export function getDataset(): Dataset {
  if (cachedDataset) return cachedDataset;
  cachedDataset = DatasetSchema.parse(rawData);
  return cachedDataset;
}

export function getModels(): Model[] {
  return getDataset().models;
}

export function getModelById(id: string): Model | undefined {
  return getModels().find((m) => m.id === id);
}

export function getModelsByIds(ids: string[]): Model[] {
  return ids
    .map((id) => getModelById(id))
    .filter((m): m is Model => m !== undefined);
}

export function getBenchmarkKeys(): string[] {
  return Object.keys(getDataset().benchmarks);
}

/**
 * 指定ベンチマークのモデル別正規化スコアをランキング順で返す
 */
export function getRanking(
  benchmarkKey: string
): { model: Model; score: number; normalizedScore: number }[] {
  const dataset = getDataset();
  const meta = dataset.benchmarks[benchmarkKey];
  if (!meta) return [];

  return dataset.models
    .filter((m) => m.benchmarks[benchmarkKey]?.score != null)
    .map((m) => {
      const raw = m.benchmarks[benchmarkKey]!.score;
      return {
        model: m,
        score: raw,
        normalizedScore: normalizeScore(raw, meta),
      };
    })
    .sort((a, b) => b.normalizedScore - a.normalizedScore);
}

/**
 * モデルの全ベンチマーク正規化スコアを返す（レーダーチャート用）
 */
export function getModelNormalizedScores(
  model: Model
): { key: string; name: string; score: number | null }[] {
  const dataset = getDataset();
  return Object.entries(dataset.benchmarks).map(([key, meta]) => {
    const bench = model.benchmarks[key];
    return {
      key,
      name: meta.name,
      score: bench ? normalizeScore(bench.score, meta) : null,
    };
  });
}

/**
 * 全ベンチマークの平均正規化スコアを計算
 */
export function getAverageNormalizedScore(model: Model): number | null {
  const scores = getModelNormalizedScores(model)
    .map((s) => s.score)
    .filter((s): s is number => s !== null);
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
