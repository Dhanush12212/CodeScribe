import axios from "axios";

const codeAssistant = async (req, res) => {
  const { mode, input } = req.body;

  let prompt;
  if (mode === "generate") {
    prompt = `You are an expert programmer. Generate clean, efficient, and well-commented code for:\n\n${input}`;
  } else if (mode === "debug") {
    prompt = `You are a code debugger. Analyze and fix this code with explanations:\n\n${input}`;
  } else {
    return res.status(400).json({ error: "Invalid mode" });
  }

  try {
    const response = await axios.post("http://127.0.0.1:11434/api/generate", {
      model: "deepseek-coder",
      prompt,
      stream: false,
    });

    // axios automatically parses JSON
    res.json({ result: response.data.response });
  } catch (err) {
    console.error("Error calling Ollama:", err.message);
    res.status(500).json({ error: "Ollama request failed" });
  }
};

export { codeAssistant };
