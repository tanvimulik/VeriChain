const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Get current weather by coordinates
exports.getCurrentWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    // Check if API key is configured
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your_openweather_api_key_here') {
      console.log('OpenWeather API key not configured, returning mock data');
      
      // Return mock weather data
      return res.json({
        temperature: 28,
        humidity: 65,
        pressure: 1013,
        windSpeed: 3.5,
        description: 'partly cloudy',
        city: 'Pune',
        mock: true
      });
    }

    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    const data = response.data;

    res.json({
      temperature: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
      city: data.name,
      mock: false
    });

  } catch (error) {
    console.error('Weather fetch error:', error.message);
    
    // Return mock data on error
    res.json({
      temperature: 28,
      humidity: 65,
      pressure: 1013,
      windSpeed: 3.5,
      description: 'partly cloudy',
      city: 'Pune',
      mock: true,
      error: 'Using mock data due to API error'
    });
  }
};