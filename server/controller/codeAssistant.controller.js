import fetch from "node-fetch";
import * as dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;

export const AskAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required." });
 
    const body = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
                You are a concise coding assistant.
                Respond strictly in JSON format:
                {
                  "explanation": "Short and clear explanation",
                  "code": "Clean and formatted code"
                }

                If Java is requested:
                - Use class name Main
                - Include public static void main(String[] args)

                Prompt: ${prompt}
              `,
            },
          ],
        },
      ],
    };

    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return res.status(500).json({
        error: "Failed to reach Gemini API.",
        details: errorText,
      });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    let explanation = "";
    let code = "";

    try { 
      const parsed = JSON.parse(rawText);
      explanation = parsed.explanation || "";
      code = parsed.code || "";
    } catch { 
      const explanationMatch = rawText.match(/"explanation"\s*:\s*"([^"]+)"/);
      const codeMatch = rawText.match(/"code"\s*:\s*"([\s\S]+)"/);

      explanation = explanationMatch ? explanationMatch[1] : "";
      code = codeMatch ? codeMatch[1] : "";
 
      if (!code) {
        const codeBlock = rawText.match(/```[a-z]*([\s\S]*?)```/i);
        code = codeBlock ? codeBlock[1].trim() : "";
      }
    }
 
    explanation = explanation.replace(/\\"/g, '"').trim();
    code = code.replace(/\\"/g, '"').replace(/\\n/g, "\n").trim();
 
    return res.status(200).json({ explanation, code });
  } catch (error) {
    console.error("❌ AskAI Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
