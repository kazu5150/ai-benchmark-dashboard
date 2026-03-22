import { describe, it, expect } from "vitest";
import {
  getDataset,
  getModels,
  getModelById,
  getModelsByIds,
  getRanking,
  getModelNormalizedScores,
  getAverageNormalizedScore,
} from "../data";

describe("getDataset", () => {
  it("データセットをロードできる", () => {
    const dataset = getDataset();
    expect(dataset.models.length).toBeGreaterThan(0);
    expect(Object.keys(dataset.benchmarks).length).toBeGreaterThan(0);
  });
});

describe("getModels", () => {
  it("モデル一覧を返す", () => {
    const models = getModels();
    expect(models.length).toBeGreaterThan(0);
    expect(models[0]).toHaveProperty("id");
    expect(models[0]).toHaveProperty("name");
  });
});

describe("getModelById", () => {
  it("存在するIDでモデルを取得できる", () => {
    const model = getModelById("gpt-4o");
    expect(model).toBeDefined();
    expect(model!.name).toBe("GPT-4o");
  });

  it("存在しないIDはundefinedを返す", () => {
    const model = getModelById("nonexistent");
    expect(model).toBeUndefined();
  });
});

describe("getModelsByIds", () => {
  it("複数のIDでモデルを取得できる", () => {
    const models = getModelsByIds(["gpt-4o", "claude-opus-4"]);
    expect(models).toHaveLength(2);
  });

  it("存在しないIDはスキップされる", () => {
    const models = getModelsByIds(["gpt-4o", "nonexistent"]);
    expect(models).toHaveLength(1);
  });
});

describe("getRanking", () => {
  it("ベンチマーク別のランキングを返す", () => {
    const ranking = getRanking("jglue");
    expect(ranking.length).toBeGreaterThan(0);
    // 降順であること
    for (let i = 1; i < ranking.length; i++) {
      expect(ranking[i - 1].normalizedScore).toBeGreaterThanOrEqual(
        ranking[i].normalizedScore
      );
    }
  });

  it("存在しないベンチマークは空配列を返す", () => {
    const ranking = getRanking("nonexistent");
    expect(ranking).toHaveLength(0);
  });
});

describe("getModelNormalizedScores", () => {
  it("モデルの全ベンチマーク正規化スコアを返す", () => {
    const model = getModelById("gpt-4o")!;
    const scores = getModelNormalizedScores(model);
    expect(scores.length).toBeGreaterThan(0);
    // MT-Benchは×10で正規化されるはず
    const mtBench = scores.find((s) => s.key === "mt_bench_ja");
    expect(mtBench).toBeDefined();
    expect(mtBench!.score).toBe(83); // 8.3 × 10
  });

  it("欠損ベンチマークはnullで返す", () => {
    const model = getModelById("llama-3-1-70b")!;
    const scores = getModelNormalizedScores(model);
    const jmmlu = scores.find((s) => s.key === "japanese_mmlu");
    expect(jmmlu).toBeDefined();
    expect(jmmlu!.score).toBeNull();
  });
});

describe("getAverageNormalizedScore", () => {
  it("平均正規化スコアを計算する", () => {
    const model = getModelById("gpt-4o")!;
    const avg = getAverageNormalizedScore(model);
    expect(avg).not.toBeNull();
    expect(avg!).toBeGreaterThan(0);
    expect(avg!).toBeLessThanOrEqual(100);
  });
});
