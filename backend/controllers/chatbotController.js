// server/controllers/chatbotController.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import MarketPrice from '../models/MarketPrice.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// System prompt for low-literacy users
const getSystemPrompt = (userType, language = 'english') => {
  const basePrompt = `You are a helpful assistant for a Farm-to-Market Digital Marketplace. 
  User type: ${userType === 'farmer' ? 'Farmer' : 'Buyer'}
  
  IMPORTANT GUIDELINES:
  1. Use VERY SIMPLE language - as if talking to someone with basic reading skills
  2. Keep sentences short (max 8-10 words)
  3. Use emojis to make it visually engaging 🌾 🛒 💰
  4. Avoid technical terms
  5. Be friendly and encouraging
  6. Use numbers instead of words (use "5" not "five")
  7. Break information into small chunks
  8. If asked in Hindi or regional language, respond in same language
  
  You can help with:
  - Current market prices of crops
  - Trust scores of buyers/farmers
  - How to sell/buy crops
  - Price predictions
  - Transportation help
  - Payment questions
  - Quality checking tips
  - Platform navigation help`;
  
  return basePrompt;
};

// Chatbot controller
export const chatWithBot = async (req, res) => {
  try {
    const { message, language = 'english' } = req.body;
    const userId = req.user?.id;
    const userType = req.user?.type || 'farmer';

    // Get user context if logged in
    let userContext = '';
    if (userId) {
      const user = await User.findById(userId);
      userContext = `User name: ${user.name}, Location: ${user.location}`;
    }

    // Get real market data for context
    const recentPrices = await MarketPrice.find()
      .sort({ date: -1 })
      .limit(5)
      .lean();

    const marketContext = recentPrices.map(p => 
      `${p.crop}: ₹${p.price}/${p.unit} (${p.trend})`
    ).join(', ');

    // Prepare prompt with context
    const prompt = `
    ${getSystemPrompt(userType, language)}
    
    Current market data: ${marketContext}
    ${userContext}
    
    User message: ${message}
    
    Respond in ${language} language.
    Keep it simple and helpful.
    `;

    // Generate response from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Store chat history (optional)
    // await saveChatHistory(userId, message, response);

    res.json({ 
      success: true, 
      message: response,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sorry, I am having trouble. Please try again.' 
    });
  }
};

// Get quick price info
export const getQuickPrice = async (req, res) => {
  try {
    const { crop } = req.query;
    
    const priceData = await MarketPrice.find({ 
      crop: { $regex: crop, $options: 'i' } 
    })
    .sort({ date: -1 })
    .limit(1);

    if (priceData.length > 0) {
      res.json({
        success: true,
        data: priceData[0]
      });
    } else {
      res.json({
        success: false,
        message: 'Price not found for this crop'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching price' });
  }
};

// Get trust score
export const getTrustScore = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('name trustScore totalTransactions userType badge');
    
    if (user) {
      res.json({
        success: true,
        data: {
          name: user.name,
          trustScore: user.trustScore,
          transactions: user.totalTransactions,
          badge: user.badge,
          type: user.userType
        }
      });
    } else {
      res.json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching trust score' });
  }
};