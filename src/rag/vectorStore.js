import fs from "fs";
import path from "path";
import { openai, MODELS } from "../utils/openai.js";

const DATA_DIR = path.resolve("data");
const INDEX_PATH = path.join(DATA_DIR, "vectors.json");

async function embedTexts(texts) {
  const BATCH_SIZE = 20;
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    console.log(`[embed] Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)} (${batch.length} texts)`);

    let response;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await openai.embeddings.create({
          model: MODELS.embedding,
          input: batch,
        });
        if (response.data && Array.isArray(response.data)) break;
        throw new Error(`Unexpected response: ${JSON.stringify(response).slice(0, 200)}`);
      } catch (err) {
        console.error(`[embed] Batch ${Math.floor(i / BATCH_SIZE) + 1} attempt ${attempt}/3 failed: ${err.message}`);
        if (attempt === 3) throw err;
        const wait = attempt * 3000;
        console.log(`[embed] Retrying in ${wait / 1000}s...`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }

    const sorted = response.data.sort((a, b) => a.index - b.index);
    allEmbeddings.push(...sorted.map((d) => d.embedding));
  }

  return allEmbeddings;
}

export async function embedQuery(text) {
  const response = await openai.embeddings.create({
    model: MODELS.embedding,
    input: text,
  });
  return response.data[0].embedding;
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function buildIndex(chunks) {
  console.log(`[vectorStore] Embedding ${chunks.length} chunks...`);

  const texts = chunks.map((c) => c.text);
  const embeddings = await embedTexts(texts);

  const store = chunks.map((chunk, i) => ({
    id: chunk.id,
    text: chunk.text,
    metadata: chunk.metadata,
    embedding: embeddings[i],
  }));

  fs.writeFileSync(INDEX_PATH, JSON.stringify(store, null, 2));

  // Log per-category stats
  const catStats = {};
  store.forEach((s) => {
    const cat = s.metadata.category || "general";
    catStats[cat] = (catStats[cat] || 0) + 1;
  });
  console.log(`[vectorStore] Index saved: ${store.length} vectors, dim=${embeddings[0].length}`);
  console.log(`[vectorStore] Categories:`, catStats);

  return store;
}

export function loadIndex() {
  if (!fs.existsSync(INDEX_PATH)) {
    throw new Error(`Vector index not found at ${INDEX_PATH}. Run "node index.js ingest" first.`);
  }
  const store = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  console.log(`[vectorStore] Loaded index with ${store.length} vectors`);
  return store;
}

/**
 * Returns all unique categories in the index.
 */
export function listCategories() {
  const store = loadIndex();
  const categories = [...new Set(store.map((s) => s.metadata.category || "general"))];
  return categories;
}

/**
 * Searches the index with optional category filtering.
 * @param {Array} store - The loaded vector store.
 * @param {number[]} queryEmbedding - Query embedding vector.
 * @param {number} topK - Number of results.
 * @param {string[]} [categories] - If provided, only search within these categories.
 */
export function search(store, queryEmbedding, topK = 6, categories = null) {
  let candidates = store;

  if (categories && categories.length > 0) {
    candidates = store.filter((entry) => categories.includes(entry.metadata.category));
    console.log(`[vectorStore] Filtered to ${candidates.length} chunks in categories: [${categories.join(", ")}]`);
  }

  const scored = candidates.map((entry) => ({
    ...entry,
    score: cosineSimilarity(queryEmbedding, entry.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
