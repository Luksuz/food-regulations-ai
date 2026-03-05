import fs from "fs";
import path from "path";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

const prompt = process.argv[2];
if (!prompt) {
  console.error("Usage: node scripts/generate-image.mjs \"your prompt here\" [--ref path/to/image.png]");
  process.exit(1);
}

// Optional reference image via --ref flag
const refIndex = process.argv.indexOf("--ref");
const messages = [];
const content = [{ type: "text", text: prompt }];

if (refIndex !== -1 && process.argv[refIndex + 1]) {
  const refPath = process.argv[refIndex + 1];
  const imageBuffer = fs.readFileSync(refPath);
  const base64Image = imageBuffer.toString("base64");
  const ext = path.extname(refPath).slice(1).replace("jpg", "jpeg");
  content.push({
    type: "image_url",
    image_url: { url: `data:image/${ext};base64,${base64Image}` },
  });
}

messages.push({ role: "user", content });

const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-3-pro-image-preview",
    messages,
    modalities: ["text", "image"],
    resolution: "4K",
  }),
});

const data = await response.json();

if (!response.ok) {
  console.error("API error:", JSON.stringify(data, null, 2));
  process.exit(1);
}

const message = data.choices?.[0]?.message;
if (!message) {
  console.error("No message in response:", JSON.stringify(data, null, 2));
  process.exit(1);
}

if (message.content) {
  console.log("Text:", message.content);
}

if (message.images?.length > 0) {
  const outDir = path.resolve("public/generated");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < message.images.length; i++) {
    const imageUrl = message.images[i].image_url?.url || message.images[i];
    if (typeof imageUrl === "string" && imageUrl.startsWith("data:image")) {
      const base64Data = imageUrl.split(",")[1];
      const extension = imageUrl.includes("png") ? "png" : "jpeg";
      const filename = path.join(outDir, `image-${Date.now()}-${i}.${extension}`);
      fs.writeFileSync(filename, Buffer.from(base64Data, "base64"));
      console.log(`Saved: ${filename}`);
    }
  }
} else {
  console.log("No images in response");
}
