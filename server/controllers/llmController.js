const axios = require("axios");

const getLLMResponse = async (req, res) => {
  const { input } = req.body; // Get the input from the request body

  try {
    console.log("Received input:", input);
    console.log("Sending request to Gemini API...");

    // Call Gemini API with the correct endpoint and payload
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: input } // Pass the input as the text for the Gemini model
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json" // Set content type to JSON
        }
      }
    );

    // Log the response for debugging
    console.log("Gemini API response:", response.data);

    // Extract the text from the response
    const generatedText = response.data.candidates[0]?.content?.parts[0]?.text || "No response from Gemini.";

    // Send the generated text to the frontend
    res.json({ text: generatedText });

  } catch (error) {
    console.error("Error from Gemini API:", error);
    res.status(500).send("Error with Gemini API");
  }
};

module.exports = { getLLMResponse };
