import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  throw new Error("Missing OPENROUTER_API_KEY in .env file");
}

export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey,
  defaultHeaders: {
    "HTTP-Referer": "https://food-regulations-ai.local",
    "X-OpenRouter-Title": "Food Regulations AI",
  },
});

export const MODELS = {
  chat: "google/gemini-3-flash-preview",
  vision: "google/gemini-3-flash-preview",
  embedding: "openai/text-embedding-3-small",
};
