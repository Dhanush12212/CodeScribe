import fetch from "node-fetch";
import * as dotenv from "dotenv";
dotenv.config();

const MISTRAL_API_URL = process.env.MISTRAL_API_URL;

export const AskAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required." });

    const body = {
      model: "mistral:instruct",
      prompt: `
        You are a coding assistant.
        Reply in this strict JSON format:
        {
          "explanation": "Short and clear explanation only",
          "code": "Clean formatted code"
        }

        If Java is requested:
        - Use class name Main
        - Include public static void main(String[] args)

        Prompt: ${prompt}
      `,
      stream: false,
    };

    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to reach Mistral API." });
    }

    const data = await response.json();
    const rawText = data?.response || "";

    let explanation = "";
    let code = "";

    try {
      const parsed = JSON.parse(rawText);
      explanation = parsed.explanation || "";
      code = parsed.code || "";
    } catch {
      const codeMatch = rawText.match(/```[a-z]*([\s\S]*?)```/i);
      code = codeMatch ? codeMatch[1].trim() : "";
      explanation = rawText.replace(/```[\s\S]*?```/, "").trim();
    }

    res.status(200).json({ explanation, code });
  } catch (error) {
    console.error("❌ AskAI Error:", error);
    res.status(500).json({ error: error.message });
  }
};
