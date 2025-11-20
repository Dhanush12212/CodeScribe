import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();
import ApiError from "../utils/ApiError.utils.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;
 

const AskAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) 
      throw new ApiError(400, "Prompt is required"); 

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
    console.error("AskAI Error:", error?.response?.data || error.message);
    throw new ApiError(500, "Gemini request failed.");
  }
};


const DebugAI = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) 
      throw new ApiError(400, "Code is required" );

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
    console.error("DebugAI Error:", error?.response?.data || error.message);
    throw new ApiError(500, "Gemini debugging failed"); 
  }
};
  
// api/v1/codeAssistant/AIPrompt
const AIPrompt = async (req, res) => {
  try {
    const { prompt, code } = req.body;

    if (!prompt) throw new ApiError(400, "Prompt is required");

    const fullPrompt = `
      You are an AI code assistant. Modify the given code based on the user's request.
      Ensure clean, correct, and readable output.
      Return ONLY the updated code. Do not include explanations, comments or markdown.
      Add a one line comment for what is added or updated.
      
      User Request:
      ${prompt}

      Original Code:
      ${code}
    `;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const textOutput =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
 
    let cleanedCode =
      textOutput.match(/```[a-z]*\n?([\s\S]*?)```/i)?.[1]?.trim()
      || textOutput.trim();

      return res.status(200).json({ updatedCode: cleanedCode });
      
  } catch (error) {
    console.error("Gemini Code Update Error:", error?.response?.data || error.message);
    return res.status(500).json({ error: "Failed to update code using AI" });
  }
}; 

const reviewCode = async (req, res) => {
  const { code } = req.body;

  const prompt = `
    You are a senior software engineer.

    Return ONLY valid JSON with the following fields:
    {
      "time_complexity": "",
      "space_complexity": "",
      "best_practices": [],
      "optimized_code": "",
      "reasoning": ""
    }

    Do NOT include backticks.
    Do NOT include explanations.

    Code to review:
    ${code}
    `;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    let text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
 
    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let json;

    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error("JSON Parse Failed. Raw text:", text);
      return res.status(500).json({
        error: "Invalid JSON returned from AI",
      });
    }
 
    const formatted = {
      time_complexity: json.time_complexity || "Not provided",
      space_complexity: json.space_complexity || "Not provided",
      best_practices: Array.isArray(json.best_practices)
        ? json.best_practices
        : typeof json.best_practices === "string"
        ? json.best_practices.split("\n").map((v) => v.trim()).filter(Boolean)
        : [],
      optimized_code: json.optimized_code || "",
      reasoning: json.reasoning || "",
    };

    return res.json(formatted);
  } catch (error) {
    console.error("Gemini Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Code review failed" });
  }
};


export { AskAI, DebugAI, AIPrompt, reviewCode };
