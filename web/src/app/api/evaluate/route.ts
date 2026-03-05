import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const maxDuration = 120;

async function runEvaluator(filePath: string, categories: string[]): Promise<string> {
  const { execFile } = await import("child_process");
  const { promisify } = await import("util");
  const exec = promisify(execFile);

  const catFlag = categories.length > 0 ? ["--cat", categories.join(",")] : [];
  const projectRoot = path.resolve(process.cwd(), "..");

  const { stdout, stderr } = await exec(
    "node",
    ["index.js", "evaluate", filePath, ...catFlag],
    { cwd: projectRoot, timeout: 120000 }
  );

  return stdout + (stderr || "");
}

function parseReport(raw: string) {
  // Extract the report between the === lines
  const reportMatch = raw.match(/={10,}\n([\s\S]*?)\n={10,}/);
  const report = reportMatch ? reportMatch[1].trim() : raw;

  // Extract compliance score
  const scoreMatch = report.match(/Compliance Score:\s*(\d+)/);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

  // Extract label text
  const labelMatch = raw.match(/--- Extracted Label ---\n([\s\S]*?)\n\n=== PHASE/);
  const labelText = labelMatch ? labelMatch[1].trim() : null;

  return { report, score, labelText };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const categories = (formData.get("categories") as string) || "animal-food-labeling,aafco-pet-food";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to temp file
    const ext = path.extname(file.name) || ".jpg";
    const tmpName = `upload-${randomUUID()}${ext}`;
    const tmpPath = path.resolve(process.cwd(), "..", "data", tmpName);

    await writeFile(tmpPath, buffer);

    try {
      const raw = await runEvaluator(tmpPath, categories.split(",").filter(Boolean));
      const { report, score, labelText } = parseReport(raw);

      return NextResponse.json({
        report,
        score,
        labelText,
        categories: categories.split(","),
        timestamp: new Date().toISOString(),
      });
    } finally {
      // Cleanup temp file
      await unlink(tmpPath).catch(() => {});
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[API] Evaluation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
