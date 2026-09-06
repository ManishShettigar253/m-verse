const axios = require("axios");

/**
 * Sanitize error messages so sensitive API keys or URLs are never leaked to client or logs.
 */
function sanitizeErrorMessage(msg) {
  if (!msg || typeof msg !== "string") return "An error occurred while generating response.";
  return msg
    .replace(/api_key:[A-Za-z0-9_-]+/gi, "api_key:[REDACTED]")
    .replace(/key=[A-Za-z0-9_-]+/gi, "key=[REDACTED]")
    .replace(/AIza[0-9A-Za-z-_]{35}/g, "[REDACTED_GEMINI_KEY]")
    .replace(/gsk_[0-9A-Za-z-_]{20,}/g, "[REDACTED_GROQ_KEY]")
    .replace(/sk-[0-9A-Za-z-_]{20,}/g, "[REDACTED_KEY]");
}

/**
 * 1. Google Gemini (Fastest response with gemini-flash-lite-latest ~400-800ms)
 * https://aistudio.google.com/
 */
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // Prioritize flash-lite for fastest time-to-first-token
  const models = [
    process.env.GEMINI_MODEL,
    "gemini-flash-lite-latest",
    "gemini-3-flash-preview",
    "gemini-flash-latest",
  ].filter(Boolean);

  for (const model of models) {
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 6000, // 6s fast timeout
        }
      );
      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`[mVerse LLM] Served by Gemini (${model})`);
        return text;
      }
    } catch (err) {
      console.warn(`[mVerse LLM] Gemini model ${model} error:`, err.response?.status, err.response?.data?.error?.message || err.message);
      if (err.response?.status === 403 || err.response?.data?.error?.message?.includes("suspended")) {
        throw err;
      }
    }
  }
  return null;
}

/**
 * 2. Groq Cloud (Ultra-fast LPU inference: ~250ms)
 * https://console.groq.com/keys
 */
async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const models = [
    process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
  ];

  for (const model of models) {
    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );
      const text = res.data?.choices?.[0]?.message?.content;
      if (text) {
        console.log(`[mVerse LLM] Served by Groq (${model})`);
        return text;
      }
    } catch (err) {
      console.warn(`[mVerse LLM] Groq model ${model} failed:`, err.response?.data?.error?.message || err.message);
    }
  }
  return null;
}

/**
 * 3. GitHub Models via Azure AI (Fast GPT-4o-mini ~800ms)
 * https://github.com/marketplace/models
 */
async function callGitHubModels(prompt) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) return null;

  const models = [
    process.env.GITHUB_MODEL || "gpt-4o-mini",
    "meta-llama-3.1-70b-instruct",
  ];

  for (const model of models) {
    try {
      const res = await axios.post(
        "https://models.inference.ai.azure.com/chat/completions",
        {
          model,
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 6000,
        }
      );
      const text = res.data?.choices?.[0]?.message?.content;
      if (text) {
        console.log(`[mVerse LLM] Served by GitHub Models (${model})`);
        return text;
      }
    } catch (err) {
      console.warn(`[mVerse LLM] GitHub Model ${model} failed:`, err.response?.data?.error?.message || err.message);
    }
  }
  return null;
}

/**
 * 4. Cerebras Cloud (Fast LPU inference ~400ms)
 * https://cloud.cerebras.ai/
 */
async function callCerebras(prompt) {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) return null;

  const model = process.env.CEREBRAS_MODEL || "llama-3.3-70b";
  try {
    const res = await axios.post(
      "https://api.cerebras.ai/v1/chat/completions",
      {
        model,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );
    const text = res.data?.choices?.[0]?.message?.content;
    if (text) {
      console.log(`[mVerse LLM] Served by Cerebras (${model})`);
      return text;
    }
  } catch (err) {
    console.warn(`[mVerse LLM] Cerebras failed:`, err.response?.data?.error?.message || err.message);
  }
  return null;
}

/**
 * 5. OpenRouter (Free models: meta-llama/llama-3.3-70b-instruct:free)
 * Kept as backup fallback because free models can have public queue delays
 * https://openrouter.ai/keys
 */
async function callOpenRouter(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const models = [
    process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
  ];

  for (const model of models) {
    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://m-verse-pi.vercel.app",
            "X-Title": "mVerse Intelligence",
            "Content-Type": "application/json",
          },
          timeout: 6000,
        }
      );
      const text = res.data?.choices?.[0]?.message?.content;
      if (text) {
        console.log(`[mVerse LLM] Served by OpenRouter (${model})`);
        return text;
      }
    } catch (err) {
      console.warn(`[mVerse LLM] OpenRouter model ${model} failed:`, err.response?.data?.error?.message || err.message);
    }
  }
  return null;
}

/**
 * Main Controller Handler with Speed-Optimized Fallback Cascade
 */
const getLLMResponse = async (req, res) => {
  const { input } = req.body;

  if (!input || typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ error: "Input prompt is required." });
  }

  const prompt = input.trim();
  let generatedText = null;
  let lastError = null;

  // Build active provider pipeline based on configured credentials
  // Speed ranking:
  // 1. Gemini (Flash Lite - instant ~400ms, currently active)
  // 2. Groq (if key configured - ultra-fast ~250ms)
  // 3. GitHub Models (if token configured - ~800ms)
  // 4. Cerebras (if key configured - ~400ms)
  // 5. OpenRouter (backup fallback - can have queue delays on free models)
  const providers = [];

  if (process.env.GEMINI_API_KEY) {
    providers.push({ name: "Gemini", fn: () => callGemini(prompt) });
  }
  if (process.env.GROQ_API_KEY) {
    providers.push({ name: "Groq", fn: () => callGroq(prompt) });
  }
  if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) {
    providers.push({ name: "GitHub Models", fn: () => callGitHubModels(prompt) });
  }
  if (process.env.CEREBRAS_API_KEY) {
    providers.push({ name: "Cerebras", fn: () => callCerebras(prompt) });
  }
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({ name: "OpenRouter", fn: () => callOpenRouter(prompt) });
  }

  for (const provider of providers) {
    try {
      generatedText = await provider.fn();
      if (generatedText) break;
    } catch (err) {
      lastError = err;
      console.error(`[mVerse LLM] ${provider.name} failed:`, err.response?.data || err.message);
    }
  }

  if (generatedText) {
    return res.json({ text: generatedText });
  }

  // If all providers failed or none are configured
  const rawMsg =
    lastError?.response?.data?.error?.message ||
    lastError?.message ||
    "All configured intelligence providers are currently unavailable or rate-limited. Please check provider API keys.";
  const cleanMsg = sanitizeErrorMessage(rawMsg);

  console.error("Error from LLM engine cascade:", cleanMsg);

  return res.status(500).json({
    text: `mVerse Engine notice: ${cleanMsg}`,
    error: cleanMsg,
  });
};

module.exports = { getLLMResponse };
