const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

exports.generateSuggestion = async (prompt) => {
  try {
    // Check if API key is configured
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('Gemini API key not configured, returning default suggestions');
      
      // Return helpful default suggestions based on prompt content
      if (prompt.includes('Farmer grows')) {
        return `🌾 Farming Tips:\n\n1. Monitor soil moisture regularly - water early morning or evening\n2. Check for pests and diseases on leaves and stems\n3. Apply organic fertilizer to boost crop health\n\nNote: Configure GEMINI_API_KEY for personalized AI suggestions.`;
      } else {
        return `🌤️ Weather-Based Tips:\n\n1. Stay hydrated and protect crops from extreme weather\n2. Fresh seasonal vegetables are best for nutrition\n3. Plan harvesting based on weather forecasts\n\nNote: Configure GEMINI_API_KEY for personalized AI suggestions.`;
      }
    }

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
    
    // Return helpful fallback suggestions
    if (prompt.includes('Farmer grows')) {
      return `🌾 General Farming Tips:\n\n1. Water crops during cooler hours to reduce evaporation\n2. Inspect plants regularly for signs of stress or disease\n3. Maintain proper spacing between plants for air circulation`;
    } else {
      return `🌤️ General Tips:\n\n1. Choose fresh, seasonal produce for best quality\n2. Store vegetables in cool, dry conditions\n3. Plan purchases based on weather conditions`;
    }
  }
};