import { loadIndex, search, embedQuery } from "./vectorStore.js";

/**
 * Retrieves the most relevant regulatory chunks for a query.
 * @param {string} queryText - The query text to search for.
 * @param {number} topK - Number of results (default 6).
 * @param {string[]} [categories] - Filter to specific regulation categories.
 */
export async function retrieveContext(queryText, topK = 6, categories = null) {
  const store = loadIndex();
  const queryEmbedding = await embedQuery(queryText);
  const results = search(store, queryEmbedding, topK, categories);

  const catBreakdown = {};
  results.forEach((r) => {
    const cat = r.metadata.category || "general";
    catBreakdown[cat] = (catBreakdown[cat] || 0) + 1;
  });

  console.log(`[retriever] Retrieved ${results.length} chunks (scores: ${results.map((r) => r.score.toFixed(3)).join(", ")})`);
  console.log(`[retriever] From categories:`, catBreakdown);

  return results.map((r) => ({
    text: r.text,
    metadata: r.metadata,
    score: r.score,
  }));
}
