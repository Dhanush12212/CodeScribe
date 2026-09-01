import ApiError from "../utils/ApiError.utils.js";
import { askGemini, extractJson, extractCodeBlocks, cleanupDebuggedCode } from "../utils/gemini.utils.js";
import { runReviewCode } from "../utils/reviewCode.utils.js";
import { User } from "../models/user.model.js";

const AI_USAGE_LIMIT = 10;

/**
 * Check if user has exceeded AI usage limit. Resets count monthly.
 * Returns the user document if allowed, or throws a 403 error.
 */
const checkAndIncrementAIUsage = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(401, "User not found");

  const now = new Date();
  const resetDate = new Date(user.aiUsageResetDate);

  // Reset count if a new month has started
  if (
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()
  ) {
    user.aiUsageCount = 0;
    user.aiUsageResetDate = now;
  }

  if (user.aiUsageCount >= AI_USAGE_LIMIT) {
    throw new ApiError(
      403,
      `AI usage limit reached (${AI_USAGE_LIMIT}/${AI_USAGE_LIMIT}). Your limit resets next month.`
    );
  }

  user.aiUsageCount += 1;
  await user.save();
  return user;
};

export const AskAI = async (req, res) => {
  try {
    await checkAndIncrementAIUsage(req.user.id);

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
        parsed?.code
          ?.replace(/\\"/g, '"')
          .replace(/\\n/g, "\n")
          .trim() ?? "",
    });

  } catch (error) {
    console.error("AskAI Error:", error);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Gemini request failed",
    });
  }
};

export const DebugAI = async (req, res) => {
  try {
    await checkAndIncrementAIUsage(req.user.id);

    const { code, language } = req.body;
    if (!code) throw new ApiError(400, "Code is required");

    const fullPrompt = `
      You are a professional code debugger.

      IMPORTANT RULES (strict):
      - Modify the code to fix all errors.
      - ADD INLINE COMMENTS at the EXACT lines where fixes are made.
      - Inline comments must start with: FIXED:
      - Do NOT add explanations outside the code.
      - No markdown.
      - ALWAYS escape quotes inside JSON values.
      - Respond ONLY in JSON:

      {
        "debuggedCode": "<escaped code with FIXED comments inline>"
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
  } catch (error) {
    console.error("DebugAI Error:", error);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Gemini debugging failed",
    });
  }
};


export const AIPrompt = async (req, res) => {
  try {
    await checkAndIncrementAIUsage(req.user.id);

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
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || "Failed to update code using AI" });
  }
};

export const reviewCode = async (req, res) => {
  try {
    await checkAndIncrementAIUsage(req.user.id);

    const { code } = req.body;
    if (!code) throw new ApiError(400, "Code is required");

    const result = await runReviewCode(code);
    if (!result) return res.status(500).json({ error: "Invalid JSON" });

    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || "Code review failed" });
  }
};

