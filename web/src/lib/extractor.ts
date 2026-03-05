import { getOpenAI, MODELS } from "./openai";

const SYSTEM_PROMPT = `You are an expert at reading pet food and animal feed product labels.
Extract ALL text from the label image and organize it into these sections:

1. **Product Name** (brand + product name + any descriptors)
2. **Species/Life Stage** (e.g., "For Adult Dogs", "All Life Stages")
3. **Guaranteed Analysis** (crude protein, fat, fiber, moisture, etc.)
4. **Ingredients List** (complete list in order)
5. **Nutritional Adequacy Statement** (AAFCO statement if present)
6. **Feeding Directions**
7. **Marketing Claims** (any health, quality, or sourcing claims like "grain-free", "human-grade", "supports joint health")
8. **Net Weight**
9. **Manufacturer Info** (name, address, contact)
10. **Other** (anything else on the label)

If a section is not visible or not present, write "NOT FOUND".
Be thorough - capture every piece of text on the label.`;

/**
 * Extracts label text from an image buffer using Vision, or returns
 * plain text content directly for .txt files.
 */
export async function extractLabelFromBuffer(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  // Plain text file — return directly
  if (ext === "txt") {
    return buffer.toString("utf-8");
  }

  // Image file — use Vision
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };

  const mime = mimeMap[ext];
  if (!mime) {
    throw new Error(`Unsupported file format: .${ext}. Use JPG, PNG, WEBP, GIF, or TXT.`);
  }

  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mime};base64,${base64}`;

  const response = await getOpenAI().chat.completions.create({
    model: MODELS.vision,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Please extract all label information from this pet food / animal feed product label:" },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    max_tokens: 2000,
  });

  const extracted = response.choices[0]?.message?.content;
  if (!extracted) {
    throw new Error("No response from Vision API");
  }

  return extracted;
}
