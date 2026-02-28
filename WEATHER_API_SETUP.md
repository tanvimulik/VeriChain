# ☁️ Weather API Setup & Testing Guide

## 📋 What You've Added

You've successfully added a weather API system with AI-powered suggestions:

### Files Created:
1. `backend/routes/weather.js` - Weather API routes
2. `backend/controllers/weatherController.js` - Weather data fetching
3. `backend/services/aiService.js` - Gemini AI integration
4. Weather routes registered in `backend/server.js`

---

## 🔑 Required API Keys

You need to add these to your `backend/.env` file:

```env
# OpenWeather API (for weather data)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Google Gemini API (for AI suggestions)
GEMINI_API_KEY=your_gemini_api_key_here
```

### How to Get API Keys:

#### 1. OpenWeather API Key (FREE)
1. Go to https://openweathermap.org/api
2. Click "Sign Up" (free tier available)
3. Verify your email
4. Go to "API keys" section
5. Copy your API key
6. Add to `.env`: `OPENWEATHER_API_KEY=your_key_here`

#### 2. Google Gemini API Key (FREE)
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Add to `.env`: `GEMINI_API_KEY=your_key_here`

---

## 🧪 Testing the Weather API

### 1. Test Basic Weather (No Auth Required)

```bash
# Test with Pune coordinates
curl "http://localhost:8000/api/weather/current?lat=18.5204&lon=73.8567"
```

**Expected Response:**
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

### 2. Test Farmer Weather Suggestions (Requires Auth)

```bash
# First login as farmer to get token
curl -X POST http://localhost:8000/api/auth/farmer/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","password":"password123"}'

# Then use the token
curl "http://localhost:8000/api/weather/farmer-suggestions?temp=28&humidity=65" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "suggestion": "1. Water crops early morning to reduce evaporation. 2. Monitor for pests in humid conditions. 3. Ensure proper drainage to prevent waterlogging."
}
```

### 3. Test Buyer Weather Suggestions (Requires Auth)

```bash
# Login as buyer first
curl -X POST http://localhost:8000/api/auth/buyer/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","password":"password123"}'

# Then use the token
curl "http://localhost:8000/api/weather/buyer-suggestions?temp=28&humidity=65" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "suggestion": "Good weather for: 1. Tomatoes, cucumbers, leafy greens. 2. Crops performing well: Onions, potatoes. Stay hydrated!"
}
```

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch weather"
**Solution:** Check if OPENWEATHER_API_KEY is set in `.env` and valid

### Issue: "No suggestions available right now"
**Solution:** Check if GEMINI_API_KEY is set in `.env` and valid

### Issue: "Latitude and longitude required"
**Solution:** Make sure you're passing `lat` and `lon` query parameters

### Issue: "Farmer not found" or "Buyer not found"
**Solution:** Make sure you're logged in and passing valid JWT token

---

## 📱 Frontend Integration Example

### Fetch Weather for User's Location

```javascript
// Get user's GPS location
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  
  // Fetch weather
  const response = await fetch(
    `http://localhost:8000/api/weather/current?lat=${latitude}&lon=${longitude}`
  );
  const weather = await response.json();
  
  console.log('Temperature:', weather.temperature);
  console.log('Humidity:', weather.humidity);
  console.log('Description:', weather.description);
});
```

### Fetch AI Suggestions for Farmer

```javascript
const token = localStorage.getItem('token');

const response = await fetch(
  `http://localhost:8000/api/weather/farmer-suggestions?temp=28&humidity=65`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const data = await response.json();
console.log('AI Suggestion:', data.suggestion);
```

---

## 🎯 API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/weather/current` | GET | No | Get current weather by coordinates |
| `/api/weather/farmer-suggestions` | GET | Yes | Get AI suggestions for farmers |
| `/api/weather/buyer-suggestions` | GET | Yes | Get AI suggestions for buyers |

### Query Parameters:

**For `/current`:**
- `lat` (required): Latitude
- `lon` (required): Longitude

**For `/farmer-suggestions` and `/buyer-suggestions`:**
- `temp` (required): Current temperature
- `humidity` (required): Current humidity

---

## ✅ Quick Start Checklist

- [ ] Add `OPENWEATHER_API_KEY` to `backend/.env`
- [ ] Add `GEMINI_API_KEY` to `backend/.env`
- [ ] Restart backend server: `npm start`
- [ ] Test basic weather endpoint
- [ ] Test farmer suggestions (with auth)
- [ ] Test buyer suggestions (with auth)
- [ ] Integrate into frontend dashboard

---

## 🚀 Next Steps

1. **Add Weather Widget to Farmer Dashboard**
   - Show current temperature, humidity, weather icon
   - Display AI-powered crop care suggestions

2. **Add Weather Widget to Buyer Dashboard**
   - Show current weather
   - Display recommended crops to buy based on weather

3. **Weather-Based Notifications**
   - Alert farmers about extreme weather
   - Suggest best times for harvesting

4. **Weather History**
   - Store weather data for analytics
   - Show weather trends over time

---

**Status**: Weather API is set up and ready to use once API keys are added! 🌤️
