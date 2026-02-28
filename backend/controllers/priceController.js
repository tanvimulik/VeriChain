const axios = require('axios');

// Public API endpoints (no authentication required)
const DATA_GOV_API = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

// Fetch real-time mandi prices
exports.getMandiPrices = async (req, res) => {
  try {
    const { commodity, state, limit = 50 } = req.query;

    // Build query parameters
    const params = {
      'api-key': process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
      format: 'json',
      limit: limit,
    };

    // Add filters if provided
    if (commodity) {
      params.filters = JSON.stringify({ commodity: commodity });
    }

    // Fetch from data.gov.in
    const response = await axios.get(DATA_GOV_API, {
      params: params,
      timeout: 10000,
    });

    // Transform data to our format
    const prices = response.data.records.map(record => ({
      commodity: record.commodity,
      variety: record.variety || 'Standard',
      market: record.market,
      state: record.state,
      district: record.district,
      minPrice: parseFloat(record.min_price) || 0,
      maxPrice: parseFloat(record.max_price) || 0,
      modalPrice: parseFloat(record.modal_price) || 0,
      priceDate: record.arrival_date,
      unit: 'Quintal',
    }));

    res.json({
      success: true,
      count: prices.length,
      data: prices,
    });
  } catch (error) {
    console.error('Error fetching mandi prices:', error.message);
    
    // Return fallback data if API fails
    res.json({
      success: true,
      fallback: true,
      message: 'Using cached data',
      data: getFallbackPrices(),
    });
  }
};

// Get prices by commodity
exports.getPricesByCommodity = async (req, res) => {
  try {
    const { commodity } = req.params;
    
    const params = {
      'api-key': process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
      format: 'json',
      filters: JSON.stringify({ commodity: commodity }),
      limit: 20,
    };

    const response = await axios.get(DATA_GOV_API, { params, timeout: 10000 });

    const prices = response.data.records.map(record => ({
      market: record.market,
      state: record.state,
      district: record.district,
      minPrice: parseFloat(record.min_price) || 0,
      maxPrice: parseFloat(record.max_price) || 0,
      modalPrice: parseFloat(record.modal_price) || 0,
      priceDate: record.arrival_date,
    }));

    res.json({
      success: true,
      commodity: commodity,
      data: prices,
    });
  } catch (error) {
    console.error('Error fetching commodity prices:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching prices',
      error: error.message,
    });
  }
};

// Get prices by state
exports.getPricesByState = async (req, res) => {
  try {
    const { state } = req.params;
    
    const params = {
      'api-key': process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
      format: 'json',
      filters: JSON.stringify({ state: state }),
      limit: 50,
    };

    const response = await axios.get(DATA_GOV_API, { params, timeout: 10000 });

    const prices = response.data.records.map(record => ({
      commodity: record.commodity,
      market: record.market,
      district: record.district,
      modalPrice: parseFloat(record.modal_price) || 0,
      priceDate: record.arrival_date,
    }));

    res.json({
      success: true,
      state: state,
      data: prices,
    });
  } catch (error) {
    console.error('Error fetching state prices:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching prices',
      error: error.message,
    });
  }
};

// Fallback data when API is unavailable
function getFallbackPrices() {
  return [
    {
      commodity: 'Onion',
      variety: 'Nashik Red',
      market: 'Lasalgaon',
      state: 'Maharashtra',
      district: 'Nashik',
      minPrice: 2000,
      maxPrice: 2500,
      modalPrice: 2200,
      priceDate: new Date().toISOString().split('T')[0],
      unit: 'Quintal',
    },
    {
      commodity: 'Tomato',
      variety: 'Hybrid',
      market: 'Pune',
      state: 'Maharashtra',
      district: 'Pune',
      minPrice: 1500,
      maxPrice: 2000,
      modalPrice: 1800,
      priceDate: new Date().toISOString().split('T')[0],
      unit: 'Quintal',
    },
    {
      commodity: 'Potato',
      variety: 'Local',
      market: 'Nashik',
      state: 'Maharashtra',
      district: 'Nashik',
      minPrice: 1200,
      maxPrice: 1600,
      modalPrice: 1400,
      priceDate: new Date().toISOString().split('T')[0],
      unit: 'Quintal',
    },
  ];
}

// Get available commodities list
exports.getCommoditiesList = async (req, res) => {
  try {
    const commodities = [
      'Onion', 'Tomato', 'Potato', 'Wheat', 'Rice', 'Maize',
      'Bajra', 'Jowar', 'Tur', 'Gram', 'Groundnut', 'Soybean',
      'Cotton', 'Sugarcane', 'Banana', 'Mango', 'Orange', 'Apple',
    ];

    res.json({
      success: true,
      data: commodities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching commodities',
    });
  }
};
