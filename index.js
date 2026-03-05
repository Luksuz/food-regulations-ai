import fs from "fs";
import path from "path";
import { processFile, processDirectory } from "./src/ingest/pdfProcessor.js";
import { buildIndex, listCategories } from "./src/rag/vectorStore.js";
import { extractLabel } from "./src/evaluator/extractor.js";
import { evaluateCompliance } from "./src/evaluator/complianceEngine.js";

const [command, targetPath, ...rest] = process.argv.slice(2);

function usage() {
  console.log(`
  Food Label Compliance Evaluator (RAG MVP)

  Usage:
    node index.js ingest [path]                          Ingest regulatory PDFs
    node index.js evaluate <label-path> [--cat a,b]      Evaluate a label
    node index.js categories                             List indexed categories

  Ingest:
    node index.js ingest                   Scan data/ for PDFs
    node index.js ingest data/             Same, explicit path
    node index.js ingest data/file.pdf     Single file

  Category is read from the filename: "My Regs [pet-food].pdf" -> category: pet-food
  Files without a [tag] get category "general".

  Evaluate:
    node index.js evaluate data/label.jpg                         Search all categories
    node index.js evaluate data/label.jpg --cat animal-food-labeling
    node index.js evaluate data/label.txt --cat animal-food-labeling,gras-substances
  `);
}

function parseFlag(args, flag) {
  const idx = args.indexOf(flag);
  if (idx === -1 || !args[idx + 1]) return null;
  return args[idx + 1];
}

async function ingest(targetPath) {
  console.log("\n=== PHASE: INGEST & INDEX ===\n");

  const target = targetPath || path.resolve("data");

  let chunks;
  const stat = fs.statSync(target);

  if (stat.isDirectory()) {
    chunks = await processDirectory(target);
  } else {
    chunks = await processFile(target);
  }

  console.log(`\n[ingest] Total chunks to embed: ${chunks.length}`);
  await buildIndex(chunks);
  console.log("\nIngestion complete. Vector index ready for queries.\n");
}

async function evaluate(imagePath, rest) {
  if (!imagePath) {
    console.error("Missing label path. Usage: node index.js evaluate <path> [--cat <category>]");
    process.exit(1);
  }

  const catFlag = parseFlag(rest, "--cat");
  const categories = catFlag ? catFlag.split(",").map((s) => s.trim()) : null;

  if (!categories) {
    console.log("[info] No --cat specified — searching all regulation categories.\n");
  }

  console.log("=== PHASE: EXTRACT LABEL ===\n");
  const labelText = await extractLabel(imagePath);
  console.log("\n--- Extracted Label ---");
  console.log(labelText);

  console.log("\n=== PHASE: COMPLIANCE EVALUATION ===\n");
  const report = await evaluateCompliance(labelText, categories);
  console.log("\n" + "=".repeat(60));
  console.log(report);
  console.log("=".repeat(60) + "\n");
}

if (!command) {
  usage();
  process.exit(1);
}

try {
  if (command === "ingest") {
    await ingest(targetPath);
  } else if (command === "evaluate") {
    await evaluate(targetPath, rest);
  } else if (command === "categories") {
    const cats = listCategories();
    console.log("\nIndexed regulation categories:");
    cats.forEach((c) => console.log(`  - ${c}`));
    console.log();
  } else {
    console.error(`Unknown command: ${command}`);
    usage();
    process.exit(1);
  }
} catch (err) {
  console.error(`\n[ERROR] ${err.message}`);
  if (err.response?.data) {
    console.error("[API Error]", JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
}
