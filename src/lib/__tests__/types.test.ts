import { describe, it, expect } from "vitest";
import { ModelSchema, DatasetSchema } from "../types";

describe("ModelSchema", () => {
  it("有効なモデルデータをパースできる", () => {
    const valid = {
      id: "test-model",
      name: "Test Model",
      provider: "TestCo",
      price_per_1m_tokens: { input: 1, output: 2 },
      context_length: 128000,
      release_date: "2024-01-01",
      benchmarks: {
        jglue: { score: 85.0 },
      },
    };
    expect(() => ModelSchema.parse(valid)).not.toThrow();
  });

  it("price_per_1m_tokensがnullでもパースできる", () => {
    const valid = {
      id: "test-model",
      name: "Test Model",
      provider: "TestCo",
      price_per_1m_tokens: null,
      context_length: 8192,
      release_date: "2024-01-01",
      benchmarks: {},
    };
    expect(() => ModelSchema.parse(valid)).not.toThrow();
  });

  it("ベンチマークがnullでもパースできる", () => {
    const valid = {
      id: "test-model",
      name: "Test Model",
      provider: "TestCo",
      price_per_1m_tokens: null,
      context_length: 8192,
      release_date: "2024-01-01",
      benchmarks: {
        jglue: { score: 85.0 },
        rakuda: null,
      },
    };
    expect(() => ModelSchema.parse(valid)).not.toThrow();
  });

  it("必須フィールドが欠けているとエラー", () => {
    const invalid = {
      id: "test-model",
      // nameが欠落
      provider: "TestCo",
    };
    expect(() => ModelSchema.parse(invalid)).toThrow();
  });
});

describe("DatasetSchema", () => {
  it("有効なデータセットをパースできる", () => {
    const valid = {
      models: [
        {
          id: "test",
          name: "Test",
          provider: "Co",
          price_per_1m_tokens: null,
          context_length: 8192,
          release_date: "2024-01-01",
          benchmarks: {},
        },
      ],
      benchmarks: {
        jglue: {
          name: "JGLUE",
          description: "test",
          scale: { min: 0, max: 100 },
          normalize: "identity",
        },
      },
      last_updated: "2024-01-01",
    };
    expect(() => DatasetSchema.parse(valid)).not.toThrow();
  });
});
