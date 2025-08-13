// server.js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch"; // used for fallback; not required if using official SDK
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "public")));

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.warn("Warning: OPENAI_API_KEY not set. Set it in the environment or .env file.");
}

// Endpoint: generate image
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, style = "realistic", size = "512x512" } = req.body;
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt is required." });
    }
    if (!OPENAI_KEY) {
      return res.status(500).json({ error: "Server missing OpenAI API key." });
    }

    // enhance the prompt lightly on server-side
    const styleHints = {
      realistic: ", photorealistic, ultra-detailed, high resolution",
      artistic: ", painterly, cinematic lighting, rich textures",
      cartoon: ", cartoon, bold colors, stylized, fun",
      abstract: ", abstract composition, geometric, modern art"
    };
    const enhancedPrompt = prompt + (styleHints[style] || "");

    // Call OpenAI Images API (Images: Generations)
    // Use the Images endpoint documented by OpenAI (gpt-image-1).
    // We use fetch here for clarity but you can use the official OpenAI SDK as well.
    const openaiResp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: enhancedPrompt,
        size: size, // e.g., "512x512"
        n: 1
      })
    });

    if (!openaiResp.ok) {
      const errText = await openaiResp.text();
      console.error("OpenAI API error:", openaiResp.status, errText);
      return res.status(502).json({ error: "OpenAI API error", detail: errText });
    }

    const body = await openaiResp.json();

    // OpenAI typically returns image data as a URL or base64 depending on endpoint/version.
    // Try to send URL if present; otherwise send base64 string.
    // Example: body.data[0].url or body.data[0].b64_json
    const item = (body.data && body.data[0]) || null;
    if (!item) {
      return res.status(502).json({ error: "Malformed response from OpenAI" });
    }

    // Prefer URL
    if (item.url) {
      return res.json({ url: item.url });
    }

    if (item.b64_json) {
      return res.json({ b64_json: item.b64_json });
    }

    // fallback: return entire body
    return res.json({ raw: body });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});