import ApiError from "../utils/ApiError.utils.js";
import {
  askGemini,
  extractJson,
  extractCodeBlocks,
  cleanupDebuggedCode,
} from "../utils/gemini.utils.js";
import { runReviewCode } from "../utils/reviewCode.utils.js";

export const AskAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) throw new ApiError(400, "Prompt is required");

    const fullPrompt = `
      You are a concise coding assistant.
      Respond strictly in JSON:
      {
        "explanation": "",
        "code": ""
      }

      If Java: use class Main + main method.

      Prompt:
      ${prompt}
    `;

    const raw = await askGemini(fullPrompt);
    const parsed = extractJson(raw);

    return res.json({
      explanation: parsed?.explanation ?? "",
      code:
        parsed?.code?.replace(/\\"/g, '"').replace(/\\n/g, "\n").trim() ?? "",
    });
  } catch {
    throw new ApiError(500, "Gemini request failed.");
  }
};

export const DebugAI = async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) throw new ApiError(400, "Code is required");

    const fullPrompt = `
      You are a professional code debugger.

      IMPORTANT RULES (strict):
        - ALWAYS escape quotes inside the returned JSON value.
            • Every " inside the code must be written as \" so JSON is valid.
        - Do NOT escape the outer JSON quotes.
        - KEEP THE ORIGINAL STRING CONTENT exactly the same.
        - For C:
            • Do NOT split string literals across multiple lines.
            • Keep printf/puts/Console.WriteLine strings in a SINGLE line.
            • If the string contains a newline, write it as "\\n".
            • Never break the quote in the middle.
        - Produce clean, correct, runnable code.
        - No markdown.
        - No explanation except ONE comment line at the top explaining the fix.
        - Respond ONLY in this exact JSON format:
        {
          "debuggedCode": "<escaped code>"
        }

      Language: ${language}
      Code:
      ${code}
    `;

    const raw = await askGemini(fullPrompt);
    const parsed = extractJson(raw);

    let debuggedCode = parsed?.debuggedCode || extractCodeBlocks(raw);

    debuggedCode = cleanupDebuggedCode(debuggedCode);

    return res.json({ debuggedCode });
  } catch {
    throw new ApiError(500, "Gemini debugging failed");
  }
};

export const AIPrompt = async (req, res) => {
  try {
    const { prompt, code } = req.body;
    if (!prompt) throw new ApiError(400, "Prompt is required");

    const fullPrompt = `
      Modify code based on request.
      Return ONLY updated code. No markdown.

      Request:
      ${prompt}

      Code:
      ${code}
    `;

    const raw = await askGemini(fullPrompt);
    const cleaned = extractCodeBlocks(raw);

    return res.json({ updatedCode: cleaned });
  } catch {
    return res.status(500).json({ error: "Failed to update code using AI" });
  }
};

export const reviewCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) throw new ApiError(400, "Code is required");

    const result = await runReviewCode(code);
    if (!result) return res.status(500).json({ error: "Invalid JSON" });

    return res.json(result);
  } catch {
    return res.status(500).json({ error: "Code review failed" });
  }
};
