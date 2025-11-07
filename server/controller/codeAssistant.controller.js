import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;
 

const AskAI = async (req, res) => {
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
                  "explanation": "brief and clear explanation",
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

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    const data = response.data;
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
    console.error("❌ AskAI Error:", error?.response?.data || error.message);
    return res.status(500).json({ error: "Gemini request failed.", details: error.message });
  }
};
 

const DebugAI = async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required." });

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
                You are a professional code debugger.
                Fix syntax errors, improve readability, and ensure the code runs correctly.
                
                Respond strictly in JSON format:
                {
                  "debuggedCode": "Fixed and clean code"
                }

                Language: ${language || "unknown"}
                Code to debug:
                ${code}
              `,
            },
          ],
        },
      ],
    };

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    const data = response.data;
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    let debuggedCode = "";

    try {
      const parsed = JSON.parse(rawText);
      debuggedCode = parsed.debuggedCode || "";
    } catch {
      const match = rawText.match(/"debuggedCode"\s*:\s*"([\s\S]+)"/);
      debuggedCode = match ? match[1] : "";

      if (!debuggedCode) {
        const codeBlock = rawText.match(/```[a-z]*([\s\S]*?)```/i);
        debuggedCode = codeBlock ? codeBlock[1].trim() : "";
      }
    }

    debuggedCode = debuggedCode.replace(/\\"/g, '"').replace(/\\n/g, "\n").trim();
    return res.status(200).json({ debuggedCode });
  } catch (error) {
    console.error("❌ DebugAI Error:", error?.response?.data || error.message);
    return res.status(500).json({ error: "Gemini debugging failed.", details: error.message });
  }
};

export { AskAI, DebugAI };
