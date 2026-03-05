import OpenAI from "openai";

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENROUTER_API_KEY environment variable");
    }
    _openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
      defaultHeaders: {
        "HTTP-Referer": "https://food-regulations-ai.vercel.app",
        "X-OpenRouter-Title": "LabelGuard AI",
      },
    });
  }
  return _openai;
}

export const MODELS = {
  chat: "google/gemini-3-flash-preview",
  vision: "google/gemini-3-flash-preview",
  embedding: "openai/text-embedding-3-small",
};
