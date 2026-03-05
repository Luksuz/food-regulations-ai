import { getOpenAI, MODELS } from "./openai";
import vectorData from "../../data/vectors.json";

interface VectorEntry {
  id: number;
  text: string;
  metadata: {
    source: string;
    category: string;
    tokens: number;
  };
  embedding: number[];
}

// Load the pre-built index once at module level — works on Vercel because
// it's bundled at build time, no filesystem reads at runtime.
const store: VectorEntry[] = vectorData as VectorEntry[];

export async function embedQuery(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: MODELS.embedding,
    input: text,
  });
  return response.data[0].embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function listCategories(): string[] {
  return [...new Set(store.map((s) => s.metadata.category || "general"))];
}

export function search(
  queryEmbedding: number[],
  topK = 6,
  categories: string[] | null = null
) {
  let candidates = store;

  if (categories && categories.length > 0) {
    candidates = store.filter((entry) =>
      categories.includes(entry.metadata.category)
    );
  }

  const scored = candidates.map((entry) => ({
    ...entry,
    score: cosineSimilarity(queryEmbedding, entry.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
