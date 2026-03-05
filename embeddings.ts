import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: "<OPENROUTER_API_KEY>"
});

const embedding = await openrouter.embeddings.generate({
  requestBody: {
    model: "google/gemini-embedding-001",
    input: "Your text string goes here",
    encodingFormat: "float"
  }
});

console.log(embedding.data[0].embedding);