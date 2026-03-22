import { describe, it, expect } from "vitest";
import { normalizeScore } from "../normalize";
import type { BenchmarkMeta } from "../types";

describe("normalizeScore", () => {
  it("identity正規化はスコアをそのまま返す", () => {
    const meta: BenchmarkMeta = {
      name: "JGLUE",
      description: "test",
      scale: { min: 0, max: 100 },
      normalize: "identity",
    };
    expect(normalizeScore(85.2, meta)).toBe(85.2);
  });

  it("multiply_10正規化はスコアを10倍する", () => {
    const meta: BenchmarkMeta = {
      name: "MT-Bench JP",
      description: "test",
      scale: { min: 1, max: 10 },
      normalize: "multiply_10",
    };
    expect(normalizeScore(8.3, meta)).toBe(83);
  });

  it("0スコアでもidentity正規化は0を返す", () => {
    const meta: BenchmarkMeta = {
      name: "Test",
      description: "test",
      scale: { min: 0, max: 100 },
      normalize: "identity",
    };
    expect(normalizeScore(0, meta)).toBe(0);
  });

  it("0スコアでもmultiply_10正規化は0を返す", () => {
    const meta: BenchmarkMeta = {
      name: "Test",
      description: "test",
      scale: { min: 1, max: 10 },
      normalize: "multiply_10",
    };
    expect(normalizeScore(0, meta)).toBe(0);
  });
});
