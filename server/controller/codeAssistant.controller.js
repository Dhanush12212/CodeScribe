import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const MISTRAL_API_URL = process.env.MISTRAL_API_URL;

export const AskAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required." });

    // Set response headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const requestBody = {
      model: "mistral:latest",
      prompt: `
You are a professional coding assistant.
Return strictly in JSON format as:
{
  "explanation": "Explain the concept",
  "code": "Write clean code"
}

If the prompt requests Java code:
- Use class name "Main"
- Include public static void main(String args[])

Prompt: ${prompt}`,
      stream: true,
    };

    const response = await axios.post(MISTRAL_API_URL, requestBody, {
      responseType: "stream",
    });

    response.data.on("data", (chunk) => {
      const text = chunk.toString();
      if (text.includes("[DONE]")) {
        res.write("event: done\ndata: [DONE]\n\n");
        res.end();
      } else {
        res.write(`data: ${JSON.stringify({ token: text })}\n\n`);
      }
    });

    response.data.on("end", () => {
      res.write("event: done\ndata: [DONE]\n\n");
      res.end();
    });

    response.data.on("error", (err) => {
      console.error("Stream error:", err.message);
      res.end();
    });
  } catch (err) {
    console.error("❌ Error in AskAI controller:", err.message);
    if (!res.headersSent)
      res.status(500).json({ error: "Internal server error." });
  }
};
