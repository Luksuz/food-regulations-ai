import { getOpenAI, MODELS } from "./openai";
import { retrieveContext } from "./retriever";

export async function evaluateCompliance(
  labelText: string,
  categories: string[] | null = null
): Promise<string> {
  const queryParts = [
    labelText.slice(0, 500),
    "labeling requirements guaranteed analysis ingredients",
    "nutritional adequacy statement feeding directions",
    "marketing claims labeling violations",
  ];
  const combinedQuery = queryParts.join(" ");

  const catLabel = categories ? categories.join(", ") : "all";
  const chunks = await retrieveContext(combinedQuery, 8, categories);

  const regulatoryContext = chunks
    .map(
      (c, i) =>
        `--- Chunk ${i + 1} [${c.metadata.category}] (source: ${c.metadata.source}, relevance: ${c.score.toFixed(3)}) ---\n${c.text}`
    )
    .join("\n\n");

  const response = await getOpenAI().chat.completions.create({
    model: MODELS.chat,
    messages: [
      {
        role: "system",
        content: `You are a regulatory compliance expert for food, animal feed, and pet food labeling. You have deep expertise in FDA regulations (21 CFR), AAFCO Model Regulations, GRAS standards, and state feed control laws.

INSTRUCTIONS:
- Evaluate the extracted product label against ONLY the provided regulatory context.
- Each regulation chunk is tagged with its category and source file — cite these in your findings.
- List any violations, missing required elements, or unsubstantiated marketing claims.
- Do NOT hallucinate rules outside the provided context. If the context doesn't cover a specific area, say "Insufficient regulatory context to evaluate [area]."
- Be specific: cite the source document and quote relevant passages.

OUTPUT FORMAT - Structured Markdown report:

# Label Compliance Report

## Product Overview
(Product name, type, species if applicable, manufacturer)

## Regulations Evaluated Against
(List the source documents and categories used)

## Compliance Score: XX/100

## Required Elements Check
| Element | Status | Source Regulation | Details |
|---------|--------|-------------------|---------|
(List each required labeling element)

## Violations Found
(Numbered list with regulation source and category)

## Missing Required Elements
(Elements required but absent from the label)

## Marketing Claims Analysis
(Evaluate each marketing claim against the regulatory context)

## Recommendations
(Prioritized actions to achieve compliance)

## Regulatory Context Coverage
(Areas where provided regulations were insufficient)`,
      },
      {
        role: "user",
        content: `EXTRACTED PRODUCT LABEL:
${labelText}

REGULATORY CONTEXT (categories: ${catLabel}):
${regulatoryContext}

Please evaluate this label for regulatory compliance.`,
      },
    ],
    max_tokens: 3000,
    temperature: 0.1,
  });

  const report = response.choices[0]?.message?.content;
  if (!report) {
    throw new Error("No response from compliance evaluation LLM");
  }

  return report;
}
