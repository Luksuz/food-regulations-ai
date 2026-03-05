import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { openai, MODELS } from "../utils/openai.js";

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Extracts category from filename convention: "Name [category].pdf"
 * Falls back to "general" if no bracket tag found.
 */
function categoryFromFilename(filename) {
  const match = filename.match(/\[([^\]]+)\]/);
  return match ? match[1].trim().toLowerCase() : "general";
}

/**
 * Strips noise from eCFR PDF text exports:
 * - Page footers/headers
 * - Federal Register citation lines (e.g. "[41 FR 38619, Sept. 10, 1976, ...]")
 * - Garbled spaced-out OCR text (e.g. "C  E  S  G  E  N  E  R  A  L")
 */
function cleanPdfText(text) {
  return text
    // eCFR footer blocks
    .replace(/21 CFR Part \d+.*?\(up to date as of.*?\)[\s\S]*?\(enhanced display\)page \d+ of \d+/g, "")
    .replace(/^page \d+ of \d+\s*$/gm, "")
    // Federal Register citations: [41 FR 38619, Sept. 10, 1976, as amended at...]
    .replace(/\[\d+ FR \d+,[\s\S]*?\]/g, "")
    // Garbled spaced-out text (3+ single chars separated by spaces)
    .replace(/(?:[A-Z]\s{2,}){3,}[A-Z]/g, "")
    // Clean up leftover blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Splits text into logical sections using CFR structural patterns.
 */
function splitBySections(text) {
  const cleaned = cleanPdfText(text);
  const normalized = cleaned.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  const parts = normalized.split(
    /\n(?=§\s*\d)|(?=Subpart\s+[A-Z])|(?=PART\s+\d)|(?=[A-Z][A-Z\s]{10,}\n)|\n\n/
  );

  return parts.filter((s) => s.trim().length > 0).map((s) => s.trim());
}

/**
 * Groups splits into chunks of ~400-800 tokens.
 * Never produces a chunk smaller than MIN_CHUNK_TOKENS — always merges small
 * tails/headers into neighbors.
 */
function groupIntoChunks(splits, minTokens = 400, maxTokens = 800) {
  const MIN_CHUNK_TOKENS = 100;
  const chunks = [];
  let currentChunk = "";
  let currentTokens = 0;

  for (const split of splits) {
    const splitTokens = estimateTokens(split);

    // Skip truly empty/whitespace-only splits
    if (split.trim().length < 10) continue;

    // If adding this split would exceed max, flush current — but only if
    // the current chunk is already big enough to stand alone
    if (currentTokens + splitTokens > maxTokens && currentTokens >= MIN_CHUNK_TOKENS) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
      currentTokens = 0;
    }

    currentChunk += (currentChunk ? "\n\n" : "") + split;
    currentTokens += splitTokens;

    // Flush if we've reached a good size
    if (currentTokens >= minTokens) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
      currentTokens = 0;
    }
  }

  // Merge tail into last chunk if it's too small to stand alone
  if (currentChunk.trim().length > 0) {
    if (currentTokens < MIN_CHUNK_TOKENS && chunks.length > 0) {
      chunks[chunks.length - 1] += "\n\n" + currentChunk.trim();
    } else {
      chunks.push(currentChunk.trim());
    }
  }

  return chunks;
}

async function ocrPdfWithVision(pdfPath) {
  const buffer = fs.readFileSync(pdfPath);
  const base64Pdf = buffer.toString("base64");

  console.log(`[ingest] PDF has no extractable text — using Gemini Vision OCR...`);

  const response = await openai.chat.completions.create({
    model: MODELS.vision,
    messages: [
      {
        role: "system",
        content: `You are a document OCR specialist. Extract ALL text from this regulatory PDF document.
Preserve the original structure: section numbers, headings, paragraphs, lists, and tables.
Output the raw extracted text only — no commentary, no markdown formatting, no summaries.`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract all text from this regulatory document:" },
          { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64Pdf}` } },
        ],
      },
    ],
    max_tokens: 16000,
  });

  const text = response.choices[0]?.message?.content;
  if (!text || text.trim().length < 50) {
    throw new Error(`Vision OCR returned insufficient text for: ${pdfPath}`);
  }

  console.log(`[ingest] Vision OCR extracted ${text.length} characters`);
  return text;
}

/**
 * Processes a single file. Category is read from the filename [tag].
 */
export async function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);
  const category = categoryFromFilename(filename);
  let text;

  if (ext === ".txt") {
    text = fs.readFileSync(filePath, "utf-8");
  } else if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(buffer);
    text = parsed.text;

    if (!text || text.trim().length < 50) {
      text = await ocrPdfWithVision(filePath);
    } else {
      console.log(`[ingest] Extracted ${text.length} chars via pdf-parse (${parsed.numpages} pages)`);
    }
  } else {
    throw new Error(`Unsupported file type: ${ext}. Use .pdf or .txt`);
  }

  if (!text || text.trim().length === 0) {
    throw new Error(`No text extracted from: ${filePath}`);
  }

  const splits = splitBySections(text);
  const chunks = groupIntoChunks(splits);

  console.log(`[ingest] "${filename}" [${category}]: ${splits.length} sections -> ${chunks.length} chunks`);

  return chunks.map((chunkText, i) => ({
    id: i,
    text: chunkText,
    metadata: {
      source: filename,
      category,
      tokens: estimateTokens(chunkText),
    },
  }));
}

/**
 * Scans a directory for .pdf and .txt files, extracts categories from filenames.
 */
export async function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    throw new Error(`Not a valid directory: ${dirPath}`);
  }

  const files = fs.readdirSync(dirPath)
    .filter((f) => [".pdf", ".txt"].includes(path.extname(f).toLowerCase()))
    .map((f) => path.join(dirPath, f));

  if (files.length === 0) {
    throw new Error(`No .pdf or .txt files found in: ${dirPath}`);
  }

  // Show category assignments
  console.log(`[ingest] Found ${files.length} file(s):`);
  for (const f of files) {
    const name = path.basename(f);
    const cat = categoryFromFilename(name);
    console.log(`  ${name} -> [${cat}]`);
  }

  const allChunks = [];
  let globalId = 0;
  let failed = 0;

  for (const file of files) {
    console.log(`\n[ingest] Processing: ${path.basename(file)}`);
    try {
      const chunks = await processFile(file);
      for (const chunk of chunks) {
        chunk.id = globalId++;
        allChunks.push(chunk);
      }
    } catch (err) {
      failed++;
      console.error(`[ingest] SKIPPED ${path.basename(file)}: ${err.message}`);
    }
  }

  if (allChunks.length === 0) {
    throw new Error(`No text could be extracted from any of the ${files.length} files`);
  }

  if (failed > 0) {
    console.log(`\n[ingest] Warning: ${failed}/${files.length} file(s) failed and were skipped`);
  }

  return allChunks;
}
