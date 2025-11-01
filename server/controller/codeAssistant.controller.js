import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const MISTRAL_API_URL = process.env.MISTRAL_API_URL;

export const AskAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const requestBody = {
      model: "mistral:instruct",
      prompt: `
        You are a professional coding assistant.
        Return strictly in JSON format as:
        {
          "explanation": "Explain the concept",
          "code": "Write clean code"
        }

          If the prompt requests Java code, ALWAYS:
  - Use the class name "Main".
  - Include the standard Java entry point:
    public static void main(String args[])

        Prompt: ${prompt}
        `,
      stream: false
    }; 
    const response = await axios.post(MISTRAL_API_URL, requestBody); 

    const rawOutput = response.data.response?.trim() || response.data.output?.trim();

    if (!rawOutput) {
      return res.status(500).json({ error: "No valid response field from model." });
    }

    const cleanedOutput = rawOutput.replace(/```json|```/g, "").trim();

    let output;
    try {
      output = JSON.parse(cleanedOutput);
    } catch (err) { 
      output = {
        explanation: "Unable to parse structured JSON output. Here's the raw response:",
        code: rawOutput
      };
    }

    return res.status(200).json(output);

  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
};
