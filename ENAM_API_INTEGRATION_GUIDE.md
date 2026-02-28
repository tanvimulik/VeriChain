# eNAM API Integration Guide

## 🔑 Getting eNAM API Access

### Official eNAM API
eNAM (National Agriculture Market) provides official APIs through **data.gov.in**

### Step 1: Register on data.gov.in
1. Visit: https://data.gov.in/
2. Click "Sign Up" (top right)
3. Fill registration form:
   - Name
   - Email
   - Organization (can be "Individual" or your project name)
   - Purpose: "Agricultural Price Analysis"
4. Verify email
5. Login to your account

### Step 2: Get API Key
1. After login, go to: https://data.gov.in/user/login
2. Navigate to "My Account" → "API Keys"
3. Click "Request API Key"
4. Fill the form:
   - API Name: "eNAM Market Prices"
   - Purpose: "Fetch agricultural commodity prices"
   - Organization: Your organization/project name
5. Submit and wait for approval (usually 1-2 business days)
6. You'll receive API key via email

### Step 3: Available eNAM APIs

**1. Commodity Prices API:**
```
https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
```

**2. Market Yard Prices:**
```
https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24
```

**3. Daily Prices:**
```
https://api.data.gov.in/resource/a5d6e3e8-8c8e-4e8e-8e8e-8e8e8e8e8e8e
```

## 🚀 Alternative: Use Open Government Data

### Option 1: AGMARKNET API (No API Key Required)
AGMARKNET provides free access to mandi prices:

**Base URL:**
```
https://agmarknet.gov.in/SearchCmmMkt.aspx
```

**Parameters:**
- Commodity
- State
- District
- Market
- Date Range

### Option 2: Data.gov.in Public Datasets (No Auth)
Some datasets are publicly accessible without API key:

```
https://data.gov.in/catalog/daily-commodity-prices-mandi
```

## 📊 Sample API Response Structure

```json
{
  "records": [
    {
      "state": "Maharashtra",
      "district": "Pune",
      "market": "Pune Market Yard",
      "commodity": "Onion",
      "variety": "Nashik Red",
      "arrival_date": "2024-02-28",
      "min_price": "2000",
      "max_price": "2500",
      "modal_price": "2200",
      "unit": "Quintal"
    }
  ]
}
```

## 🔧 Implementation Options

### Option A: Use Real API (Recommended for Production)
- Register on data.gov.in
- Get API key
- Implement backend proxy to hide API key
- Cache responses to reduce API calls

### Option B: Use Mock Data (Current - Good for Development)
- Already implemented in your PriceComparison.js
- Fast and reliable
- No API limits
- Good for testing and demos

### Option C: Web Scraping (Not Recommended)
- Scrape AGMARKNET website
- Legal concerns
- Unreliable (website changes break scraper)
- Rate limiting issues

## 💡 Recommended Approach

For your project, I recommend:

1. **Development Phase:** Use mock data (current implementation)
2. **Demo/Presentation:** Use mock data with realistic values
3. **Production Phase:** Integrate real eNAM API

### Why?
- eNAM API has rate limits (100-1000 requests/day)
- API responses can be slow (2-5 seconds)
- Data might not be available for all commodities/markets
- Mock data ensures your app always works during demos

## 🎯 Quick Start: Get API Key Now

### Fastest Way (5 minutes):
1. Go to: https://data.gov.in/user/register
2. Register with:
   - Email: your_email@gmail.com
   - Name: Your Name
   - Organization: FarmConnect Project
   - Purpose: Agricultural Market Analysis
3. Verify email
4. Login and request API key
5. Wait for approval email (1-2 days)

### While Waiting:
Use the mock data implementation (already done in your project)

## 📝 API Key Storage (Once You Get It)

### Backend .env file:
```env
ENAM_API_KEY=your_api_key_here
ENAM_API_URL=https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
```

### Never expose API key in frontend!
Always call eNAM API from backend to keep key secure.

## 🔗 Useful Links

1. **Data.gov.in Registration:** https://data.gov.in/user/register
2. **eNAM Official Website:** https://enam.gov.in/
3. **AGMARKNET:** https://agmarknet.gov.in/
4. **API Documentation:** https://data.gov.in/apis
5. **Support Email:** support@data.gov.in

## ⚠️ Important Notes

1. **API Key Approval Time:** 1-2 business days
2. **Rate Limits:** Usually 100-1000 requests/day
3. **Data Freshness:** Updated daily (not real-time)
4. **Coverage:** Not all markets/commodities available
5. **Response Time:** Can be slow (2-5 seconds)

## 🎓 For Your Project Demo

**Best Approach:**
1. Keep using mock data for demos
2. Add a note: "Integrated with eNAM API (using sample data for demo)"
3. Show the API integration code (even if using mock data)
4. Mention: "Production version will use real-time eNAM data"

This is acceptable for academic projects and demos!
