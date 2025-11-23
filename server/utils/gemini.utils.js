import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const askGemini = async (prompt) => {
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  };

  const response = await axios.post(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    body,
    { headers: { "Content-Type": "application/json" } }
  );

  return (
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""
  );
};

export const extractJson = (text) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
};

export const extractCodeBlocks = (text) => {
  const match = text.match(/```[a-zA-Z]*\n?([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
};
 
export const cleanupDebuggedCode = (code) => {
  if (!code) return "";

  return (
    code 
      .replace(/\\\\/g, "\\") 
      .replace(/\\"/g, '"') 
      .replace(/\\n/g, "\\n")
      .replace(/\\t/g, "\\t") 
      .replace(/\r/g, "")
      .trim()
  );
};
