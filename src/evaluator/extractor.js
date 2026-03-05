import fs from "fs";
import path from "path";
import { openai, MODELS } from "../utils/openai.js";

/**
 * Extracts structured label data from a pet food / animal feed label image
 * using GPT-4o vision.
 * @param {string} imagePath - Path to the label image file.
 * @returns {Promise<string>} Structured label text.
 */
export async function extractLabel(imagePath) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }

  const ext = path.extname(imagePath).slice(1).toLowerCase().replace("jpg", "jpeg");
  const supportedFormats = ["png", "jpeg", "gif", "webp"];

  // If it's a .txt file (simulated label), just return its contents
  if (ext === "txt") {
    console.log("[extractor] Reading simulated label from text file");
    return fs.readFileSync(imagePath, "utf-8");
  }

  if (!supportedFormats.includes(ext)) {
    throw new Error(`Unsupported image format: .${ext}. Use PNG, JPEG, GIF, or WEBP.`);
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const dataUrl = `data:image/${ext};base64,${base64Image}`;

  console.log("[extractor] Sending label image to Gemini 3 Flash for OCR...");

  const response = await openai.chat.completions.create({
    model: MODELS.vision,
    messages: [
      {
        role: "system",
        content: `You are an expert at reading pet food and animal feed product labels.
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
Be thorough - capture every piece of text on the label.`,
      },
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

  console.log("[extractor] Label extraction complete");
  return extracted;
}
