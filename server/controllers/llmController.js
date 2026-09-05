const axios = require("axios");

const getLLMResponse = async (req, res) => {
  const { input } = req.body;

  try {
    const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

    // Call generative language endpoint with Gemini 3.6 Flash
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: input }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    // Extract generated text from response
    const generatedText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated from mVerse Intelligence.";

    res.json({ text: generatedText });
  } catch (error) {
    const errorMsg = error?.response?.data?.error?.message || error.message;
    console.error("Error from LLM engine:", error?.response?.data || error.message);
    res.status(500).json({
      text: `mVerse Engine notice: ${errorMsg}`,
      error: errorMsg,
    });
  }
};

module.exports = { getLLMResponse };
