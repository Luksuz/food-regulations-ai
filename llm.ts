import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";

import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;

const FoodRegulationResponse = z.object({
  product_name: z.string().describe("The name of the food product being analyzed"),
  is_compliant: z.boolean().describe("Whether the product complies with the relevant regulations"),
  regulations: z.array(
    z.object({
      regulation_name: z.string().describe("Name or code of the regulation"),
      status: z.enum(["compliant", "non_compliant", "requires_review"]).describe("Compliance status"),
      details: z.string().describe("Explanation of the compliance assessment"),
    })
  ).describe("List of applicable regulations and their compliance status"),
  recommended_actions: z.array(z.string()).describe("Actions needed to achieve or maintain compliance"),
  summary: z.string().describe("Brief overall compliance summary"),
});

const chat = new ChatOpenAI(
  {
    model: '<model_name>',
    temperature: 0,
    apiKey: apiKey,
  },
  {
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': '<YOUR_SITE_URL>',
      'X-OpenRouter-Title': '<YOUR_SITE_NAME>',
    },
  },
);

const structuredChat = chat.withStructuredOutput(FoodRegulationResponse);

// Example usage
const response = await structuredChat.invoke([
  new SystemMessage("You are a food regulation compliance expert. Analyze food products for regulatory compliance and return structured results."),
  new HumanMessage("Analyze a granola bar that contains oats, honey, almonds, and artificial colorant Red 40 for EU food regulation compliance."),
]);

console.log(response);

