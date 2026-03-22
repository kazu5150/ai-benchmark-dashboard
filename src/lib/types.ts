import { z } from "zod/v4";

const BenchmarkScoreSchema = z.object({
  score: z.number(),
  details: z.record(z.string(), z.number()).optional(),
});

const PriceSchema = z.object({
  input: z.number(),
  output: z.number(),
});

export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  price_per_1m_tokens: PriceSchema.nullable(),
  context_length: z.number(),
  release_date: z.string(),
  benchmarks: z.record(z.string(), BenchmarkScoreSchema.nullable()),
});

const BenchmarkMetaSchema = z.object({
  name: z.string(),
  description: z.string(),
  scale: z.object({
    min: z.number(),
    max: z.number(),
  }),
  normalize: z.enum(["identity", "multiply_10"]),
});

export const DatasetSchema = z.object({
  models: z.array(ModelSchema),
  benchmarks: z.record(z.string(), BenchmarkMetaSchema),
  last_updated: z.string(),
});

export type Model = z.infer<typeof ModelSchema>;
export type BenchmarkScore = z.infer<typeof BenchmarkScoreSchema>;
export type BenchmarkMeta = z.infer<typeof BenchmarkMetaSchema>;
export type Dataset = z.infer<typeof DatasetSchema>;
