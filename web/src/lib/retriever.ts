import { search, embedQuery } from "./vectorStore";

export async function retrieveContext(
  queryText: string,
  topK = 6,
  categories: string[] | null = null
) {
  const queryEmbedding = await embedQuery(queryText);
  const results = search(queryEmbedding, topK, categories);

  return results.map((r) => ({
    text: r.text,
    metadata: r.metadata,
    score: r.score,
  }));
}
