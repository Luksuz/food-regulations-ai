import { NextRequest, NextResponse } from "next/server";
import { extractLabelFromBuffer } from "@/lib/extractor";
import { evaluateCompliance } from "@/lib/complianceEngine";

export const maxDuration = 120;

function parseScore(report: string): number | null {
  const match = report.match(/Compliance Score:\s*(\d+)/);
  return match ? parseInt(match[1]) : null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const categories =
      (formData.get("categories") as string) || "animal-food-labeling,aafco-pet-food";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Phase 1: Extract label text (Vision OCR or plain text)
    const labelText = await extractLabelFromBuffer(buffer, file.name);

    // Phase 2: RAG-powered compliance evaluation
    const catList = categories.split(",").filter(Boolean);
    const report = await evaluateCompliance(
      labelText,
      catList.length > 0 ? catList : null
    );

    const score = parseScore(report);

    return NextResponse.json({
      report,
      score,
      labelText,
      categories: catList,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[API] Evaluation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
