import { askGemini, extractJson } from "./gemini.utils.js";

export const runReviewCode = async (code) => {
  const prompt = `
    You are an AI code assistant.

    Return ONLY valid JSON:
    {
      "time_complexity": "",
      "space_complexity": "",
      "best_practices": [],
      "optimized_code": "",
      "reasoning": ""
    }

    - Escape all double quotes inside optimized_code using \\"
    - No markdown, no backticks
    - Reasoning should be bullet points (*)

    Code:
    ${code}
  `;

  const raw = await askGemini(prompt);

  let cleanText = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim()
    .replace(/\\t/g, "    ")
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");

  const extracted = extractJson(cleanText);
  if (!extracted) return null;

  let optimized = extracted.optimized_code || "";
  optimized = optimized
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "    ")
    .replace(/\\"/g, '"')
    .trim();

  let reasoning = extracted.reasoning || "";
  const cleanedReasoning = reasoning
    .replace(/\n/g, " ")
    .split("*")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => `• ${x}`);

  const bestPractices = Array.isArray(extracted.best_practices)
    ? extracted.best_practices
    : typeof extracted.best_practices === "string"
    ? extracted.best_practices.split("\n").map((x) => x.trim()).filter(Boolean)
    : [];

  return {
    time_complexity: extracted.time_complexity || "Not provided",
    space_complexity: extracted.space_complexity || "Not provided",
    optimized_code: optimized,
    reasoning: cleanedReasoning,
    best_practices: bestPractices,
  };
};
