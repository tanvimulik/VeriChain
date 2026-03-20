# Weather & AI API Testing Guide

## 🔧 Setup Instructions

### 1. Add API Keys to `.env` file

Open `backend/.env` and add your API keys:

```env
# OpenWeather API Key
OPENWEATHER_API_KEY=your_actual_openweather_api_key

# Gemini AI API Key (Gemini 2.5 Flash)
GEMINI_API_KEY=your_actual_gemini_api_key
```

### 2. Get API Keys

#### OpenWeather API Key:
1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Navigate to API Keys section
4. Copy your API key
5. Paste it in the `.env` file

#### Gemini API Key:
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Paste it in the `.env` file

### 3. Restart Backend Server

After adding the API keys, restart your backend:

```bash
cd backend
npm start
```

## 🧪 Testing the APIs

### Test 1: Weather API (Direct)

Test the weather endpoint directly using curl or browser:

```bash
# Test with Pune coordinates
curl "http://localhost:8000/api/weather/current?lat=18.5204&lon=73.8567"
```

Expected Response:
```json
{
  "temperature": 28.5,
  "humidity": 65,
  "pressure": 1013,
  "windSpeed": 3.5,
  "description": "clear sky",
  "city": "Pune"
}
```

### Test 2: AI Suggestions API (Requires Auth)

First, login as a farmer to get a token, then test:

```bash
# Get farmer token first (login via frontend or Postman)
# Then test AI suggestions
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  "http://localhost:8000/api/weather/farmer-suggestions?temp=28&humidity=65"
```

Expected Response:
```json
{
  "suggestion": "1. Water crops early morning to reduce evaporation...\n2. Monitor for pests...\n3. Consider mulching..."
}
```

### Test 3: Frontend Integration

1. Start both backend and frontend:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

2. Login as a farmer
3. Go to Farmer Dashboard
4. You should see:
   - **Weather Widget** (left card) - Shows current weather with temperature, humidity, wind, pressure
   - **AI Farming Tips** (right card) - Shows AI-generated suggestions based on weather and your crops

## 🎨 Features Added to Farmer Dashboard

### Weather Widget
- Real-time weather data based on farmer's location
- Shows temperature, humidity, wind speed, and pressure
- Beautiful gradient purple card design
- Refresh button to update weather
- Automatic location detection (with fallback to Pune)

### AI Suggestions Widget
- AI-powered farming tips using Gemini 2.5 Flash
- Personalized suggestions based on:
  - Current weather conditions
  - Farmer's listed crops
- Beautiful gradient pink card design
- Contextual advice for crop care

## 🔍 Troubleshooting

### Weather API Not Working
- Check if `OPENWEATHER_API_KEY` is set in `.env`
- Verify the API key is valid (test on OpenWeather website)
- Check backend console for error messages
- Free tier has rate limits (60 calls/minute)

### AI Suggestions Not Working
- Check if `GEMINI_API_KEY` is set in `.env`
- Verify the API key is valid
- Check backend console for Gemini API errors
- Ensure you're logged in as a farmer (requires auth token)
- Free tier has rate limits

### Location Not Detected
- Browser may block location access
- Grant location permission when prompted
- Fallback to Pune coordinates (18.5204, 73.8567) if denied

### CORS Errors
- Ensure backend is running on port 8000
- Check CORS is enabled in `backend/server.js`

## 📝 API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/weather/current` | GET | No | Get current weather by lat/lon |
| `/api/weather/farmer-suggestions` | GET | Yes | Get AI farming tips for farmer |
| `/api/weather/buyer-suggestions` | GET | Yes | Get AI suggestions for buyer |

## 🎯 Next Steps

1. Add your actual API keys to `.env`
2. Restart backend server
3. Test the weather widget on Farmer Dashboard
4. Verify AI suggestions are working
5. Customize the suggestions prompt in `backend/routes/weather.js` if needed

## 💡 Tips

- Weather data updates when you click "Refresh" button
- AI suggestions are generated based on your listed crops
- Location permission improves accuracy
- Both APIs work with free tier accounts
- Consider caching weather data to reduce API calls
