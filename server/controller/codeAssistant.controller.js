import http from "http";
import ApiError from "../utils/ApiError.utils.js";

const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "http://127.0.0.1:11434/api/generate";

const AskAI = async (req, res) => {
  try {
    const { input } = req.query;
    if (!input || input.trim() === "") {
      throw new ApiError(400, "Prompt cannot be empty");
    }

    const model = "deepseek-coder";
    const CleanPrompt = `
You are CodeScribe — a precise coding assistant.
Respond ONLY with a valid JSON array like:
[
  {"type": "explanation", "content": "Brief explanation..."},
  {"type": "code", "language": "javascript", "content": "console.log('Hello');"}
]
Do NOT add commentary, markdown fences, or notes — just pure JSON.
    `;

    const data = JSON.stringify({
      model,
      prompt: `${CleanPrompt}\n\nUser prompt:\n${input}`,
      stream: true,
    });

    const url = new URL(DEEPSEEK_API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const request = http.request(options, (response) => {
      response.on("data", (chunk) => {
        const lines = chunk
          .toString("utf8")
          .split("\n")
          .filter((l) => l.trim().startsWith("{"));

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              // Append raw text from model
              fullResponse += parsed.response;
            }
          } catch {
            // skip incomplete lines
          }
        }
      });

      response.on("end", () => {
        // 🧹 Cleanup stage — remove unwanted whitespace & broken chars
        let cleaned = fullResponse
          .replace(/\\n+/g, " ") // remove literal \n
          .replace(/\n+/g, " ") // remove real newlines
          .replace(/\r+/g, " ")
          .replace(/\t+/g, " ")
          .replace(/\s{2,}/g, " ") // collapse extra spaces
          .replace(/```(?:json)?/gi, "") // strip code fences
          .trim();

        // 🧩 Attempt to extract valid JSON substring
        const startIdx = cleaned.indexOf("[");
        const endIdx = cleaned.lastIndexOf("]");
        if (startIdx !== -1 && endIdx !== -1) {
          cleaned = cleaned.slice(startIdx, endIdx + 1);
        }

        try {
          const structured = JSON.parse(cleaned);
          for (const item of structured) {
            res.write(`data: ${JSON.stringify(item)}\n\n`);
          }
        } catch (err) {
          console.warn("⚠️ Could not parse JSON. Sending fallback text.");
          res.write(
            `data: ${JSON.stringify({
              type: "text",
              content: cleaned,
            })}\n\n`
          );
        }

        res.write("data: [DONE]\n\n");
        res.end();
      });
    });

    request.on("error", (err) => {
      console.error("Stream error:", err.message);
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          content: "Stream error: " + err.message,
        })}\n\n`
      );
      res.end();
    });

    request.write(data);
    request.end();
  } catch (err) {
    console.error("ModelService Error:", err.message);
    res.status(500).json({
      error: "Failed to connect to DeepSeek model.",
      details: err.message,
    });
  }
};

export { AskAI };
