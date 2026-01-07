import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// export const askGemini = async (prompt) => {
//   const body = {
//     contents: [
//       {
//         role: "user",
//         parts: [{ text: prompt }],
//       },
//     ],
//   };

//   const response = await axios.post(
//     `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
//     body,
//     { headers: { "Content-Type": "application/json" } }
//   );

//   return (
//     response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""
//   );
// };

export const askGemini = async (prompt) => {
  try {
    if (!GEMINI_API_URL) {
      throw new ApiError(500, "GEMINI_API_URL is missing");
    }
    if (!GEMINI_API_KEY) {
      throw new ApiError(500, "GEMINI_API_KEY is missing");
    }

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    const response = await axios.post(
      GEMINI_API_URL,       
      body,
      {
        params: {
          key: GEMINI_API_KEY, 
        },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return (
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""
    );

  } catch (error) {
    if (error.response?.status === 429) {
      console.error("Gemini rate limit hit");

      throw new ApiError(
        429,
        "AI is busy right now. Please wait a few seconds and try again."
      );
    }

    console.error("Gemini Error:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data || error.message);

    throw new ApiError(
      error.response?.status || 500,
      "Gemini request failed"
    );
  }
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

export const getCodeHeadline = async (code, language) => {
  const prompt = `
    You are a coding assistant.
    Analyze the following ${language} code and produce ONLY a short headline (max 7-10 words)
    describing what the code does.

    ❗ STRICT RULES:
    - Return ONLY the headline.
    - Do NOT add explanations.
    - Do NOT wrap the output in quotes.
    - Do NOT add markdown.

    Code:
    ${code}
  `;

  const headline = await askGemini(prompt);

  return headline.trim();
};

