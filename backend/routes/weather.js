const express = require('express');
const router = express.Router();
const { getCurrentWeather } = require('../controllers/weatherController');
const { generateSuggestion } = require('../services/aiService');
const authMiddleware = require('../middleware/auth');
const Crop = require('../models/Crop');
const Farmer = require('../models/Farmer');

// 1️⃣ Basic Weather (Public)
router.get('/current', getCurrentWeather);

// 2️⃣ Farmer Weather Suggestions
router.get('/farmer-suggestions', authMiddleware, async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ userId: req.user.userId });
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });

    const crops = await Crop.find({ farmerId: farmer._id, status: 'available' });

    const cropNames = crops.map(c => c.cropType).join(', ') || 'general crops';

    const prompt = `
    Current weather: temperature ${req.query.temp}°C, humidity ${req.query.humidity}%.
    Farmer grows: ${cropNames}.
    Give 3 short practical suggestions for crop care in under 80 words.
    Keep it simple and actionable.
    `;

    const suggestion = await generateSuggestion(prompt);

    res.json({ suggestion });

  } catch (error) {
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// 3️⃣ Buyer Weather Suggestions
router.get('/buyer-suggestions', authMiddleware, async (req, res) => {
  try {
    const prompt = `
    Weather: temperature ${req.query.temp}°C, humidity ${req.query.humidity}%.
    Suggest:
    1. 3 vegetables/fruits good to consume in this weather.
    2. 2 crops likely to perform well.
    Keep response under 80 words.
    `;

    const suggestion = await generateSuggestion(prompt);

    res.json({ suggestion });

  } catch (error) {
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

module.exports = router;