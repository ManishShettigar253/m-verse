const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config();

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
 * Format conversational history for Google Gemini:
 * - Gemini requires contents: [ { role: 'user'|'model', parts: [{ text: ... }] }, ... ]
 * - The first message MUST be role: 'user'
 * - Roles MUST alternate (no two consecutive 'user' or 'model')
 * - The last message must be the current user prompt
 */
function buildGeminiContents(prompt, history = []) {
  const contents = [];
  if (Array.isArray(history) && history.length > 0) {
    const slice = history.slice(-10);
    for (const msg of slice) {
      if (!msg || !msg.text) continue;
      const role = msg.sender === "assistant" || msg.sender === "model" ? "model" : "user";

      // Gemini requires first message to be "user"
      if (contents.length === 0 && role !== "user") {
        continue;
      }

      // Merge with previous if role is identical to satisfy Gemini strict alternation rule
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += `\n${msg.text}`;
      } else {
        contents.push({
          role,
          parts: [{ text: msg.text }],
        });
      }
    }
  }

  // Append current user prompt
  if (contents.length > 0 && contents[contents.length - 1].role === "user") {
    contents[contents.length - 1].parts[0].text += `\n${prompt}`;
  } else {
    contents.push({
      role: "user",
      parts: [{ text: prompt }],
    });
  }

  return contents;
}

/**
 * Format conversational history for OpenAI-compatible APIs (Groq, GitHub Models, Cerebras, OpenRouter):
 * - messages: [ { role: 'user'|'assistant', content: string }, ... ]
 */
function buildOpenAIMessages(prompt, history = []) {
  const messages = [
    {
      role: "system",
      content:
        "You are mVerse Intelligence. Always maintain contextual continuity. Connect follow-up questions, pronouns (she/he/it/they), and brief queries (e.g. 'check reddit and tell me', 'what about her') directly to the topics, people, and themes discussed in previous turns.",
    },
  ];
  if (Array.isArray(history) && history.length > 0) {
    const slice = history.slice(-10);
    for (const msg of slice) {
      if (!msg || !msg.text) continue;
      const role = msg.sender === "assistant" || msg.sender === "model" ? "assistant" : "user";
      messages.push({
        role,
        content: msg.text,
      });
    }
  }
  messages.push({
    role: "user",
    content: prompt,
  });
  return messages;
}

/**
 * 1. Google Gemini (Fastest response with gemini-flash-lite-latest ~400-800ms)
 * https://aistudio.google.com/
 */
async function callGemini(prompt, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // Prioritize flash-lite for fastest time-to-first-token
  const models = [
    process.env.GEMINI_MODEL,
    "gemini-flash-lite-latest",
    "gemini-3-flash-preview",
    "gemini-flash-latest",
  ].filter(Boolean);

  const contents = buildGeminiContents(prompt, history);

  for (const model of models) {
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents,
          systemInstruction: {
            parts: [
              {
                text: "You are mVerse Intelligence. Always maintain contextual continuity. Connect follow-up questions, pronouns (she/he/it/they), and brief queries (e.g. 'check reddit and tell me', 'what about her', 'give more examples') directly to the topics, people, and themes discussed in previous conversation turns.",
              },
            ],
          },
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
async function callGroq(prompt, history = []) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const models = [
    process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
  ];

  const messages = buildOpenAIMessages(prompt, history);

  for (const model of models) {
    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model,
          messages,
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
async function callGitHubModels(prompt, history = []) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) return null;

  const models = [
    process.env.GITHUB_MODEL || "gpt-4o-mini",
    "meta-llama-3.1-70b-instruct",
  ];

  const messages = buildOpenAIMessages(prompt, history);

  for (const model of models) {
    try {
      const res = await axios.post(
        "https://models.inference.ai.azure.com/chat/completions",
        {
          model,
          messages,
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
async function callCerebras(prompt, history = []) {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) return null;

  const model = process.env.CEREBRAS_MODEL || "llama-3.3-70b";
  const messages = buildOpenAIMessages(prompt, history);

  try {
    const res = await axios.post(
      "https://api.cerebras.ai/v1/chat/completions",
      {
        model,
        messages,
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
async function callOpenRouter(prompt, history = []) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const models = [
    process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
  ];

  const messages = buildOpenAIMessages(prompt, history);

  for (const model of models) {
    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages,
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
 * Main Controller Handler with Speed-Optimized Fallback Cascade & Conversational Memory
 */
const getLLMResponse = async (req, res) => {
  const { input, history } = req.body;

  if (!input || typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ error: "Input prompt is required." });
  }

  const prompt = input.trim();
  const chatHistory = Array.isArray(history) ? history : [];
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
    providers.push({ name: "Gemini", fn: () => callGemini(prompt, chatHistory) });
  }
  if (process.env.GROQ_API_KEY) {
    providers.push({ name: "Groq", fn: () => callGroq(prompt, chatHistory) });
  }
  if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) {
    providers.push({ name: "GitHub Models", fn: () => callGitHubModels(prompt, chatHistory) });
  }
  if (process.env.CEREBRAS_API_KEY) {
    providers.push({ name: "Cerebras", fn: () => callCerebras(prompt, chatHistory) });
  }
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({ name: "OpenRouter", fn: () => callOpenRouter(prompt, chatHistory) });
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

/**
 * Fast Title Generator Handler: returns a generalized, meaningful 2-3 word chat title
 */
const getLLMTitle = async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages required." });
  }

  const promptSnippet = messages
    .slice(-4)
    .map((m) => `${m.sender === "user" ? "User" : "AI"}: ${m.text.slice(0, 150)}`)
    .join("\n");

  const titlePrompt = `Generate a concise, generalized 2 to 3 word title summarizing the central topic of this chat.
CRITICAL RULES:
- Output MUST be 2 or 3 words maximum.
- Generalized topic (e.g. "React State", "Quantum Computing Basics", "Tamil Web Series", "General Greeting").
- Return ONLY the 2-3 words in Title Case. No quotes, no markdown, no punctuation.

Chat:
${promptSnippet}
Title:`;

  const providers = [];
  if (process.env.GEMINI_API_KEY) {
    providers.push({ name: "Gemini", fn: () => callGemini(titlePrompt) });
  }
  if (process.env.GROQ_API_KEY) {
    providers.push({ name: "Groq", fn: () => callGroq(titlePrompt) });
  }
  if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) {
    providers.push({ name: "GitHub Models", fn: () => callGitHubModels(titlePrompt) });
  }
  if (process.env.CEREBRAS_API_KEY) {
    providers.push({ name: "Cerebras", fn: () => callCerebras(titlePrompt) });
  }
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({ name: "OpenRouter", fn: () => callOpenRouter(titlePrompt) });
  }

  for (const provider of providers) {
    try {
      const raw = await provider.fn();
      if (raw && typeof raw === "string") {
        const clean = raw
          .replace(/["'#*`]+/g, "")
          .replace(/[.!?]+$/g, "")
          .replace(/\btitle:\s*/i, "")
          .trim()
          .split(/\s+/)
          .slice(0, 3)
          .join(" ");
        if (clean && clean.length <= 32) {
          return res.json({ title: clean });
        }
      }
    } catch (e) {}
  }

  return res.status(200).json({ title: "General Chat" });
};

module.exports = { getLLMResponse, getLLMTitle };
