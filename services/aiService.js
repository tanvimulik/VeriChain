const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

exports.generateSuggestion = async (prompt) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    return response.data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error('Gemini error:', error.response?.data || error.message);
    return "No suggestions available right now.";
  }
};