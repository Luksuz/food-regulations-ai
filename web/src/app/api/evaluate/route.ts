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
    const files = formData.getAll("files") as File[];
    const categories =
      (formData.get("categories") as string) || "animal-food-labeling,aafco-pet-food";

    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Extract text from all files in parallel
    const extractions = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const text = await extractLabelFromBuffer(buffer, file.name);
        return { name: file.name, text };
      })
    );

    // Combine all extracted text
    const labelText =
      extractions.length === 1
        ? extractions[0].text
        : extractions
            .map((e, i) => `=== File ${i + 1}: ${e.name} ===\n${e.text}`)
            .join("\n\n");

    // RAG-powered compliance evaluation
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
