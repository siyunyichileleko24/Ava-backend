// Ava backend proxy
// Keeps your Anthropic API key on the server — never in the app.

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Basic abuse protection: 20 requests per minute per IP
const limiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
app.use("/chat", limiter);

const SYSTEM_PROMPT =
  "You are Ava, a friendly, helpful, and concise public-facing AI assistant. Keep answers clear and approachable.";

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }
    // Cap conversation length sent to the API to control cost/abuse
    const trimmed = messages.slice(-20);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: trimmed
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return res.status(502).json({ error: "Upstream API error" });
    }

    const textBlock = (data.content || []).find((b) => b.type === "text");
    const reply = textBlock ? textBlock.text : "Sorry, I couldn't generate a response.";

    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Ava backend running on port ${PORT}`));
