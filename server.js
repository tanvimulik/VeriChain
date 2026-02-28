const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const cropRoutes = require('./routes/cropRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const priceRoutes = require('./routes/priceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const truckRoutes = require('./routes/truckRoutes');
const clusterRoutes = require('./routes/clusterRoutes');
const cron = require('node-cron');
const { runClustering } = require('./services/clusteringService');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/weather', require('./routes/weather'));
app.use('/api/trucks', truckRoutes);
app.use('/api/clusters', clusterRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ message: '✅ FarmConnect Backend is Running' });
});

// Serve React app for all non-API routes (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 FarmConnect Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  
  // Start clustering cron job (runs every 5 minutes)
  cron.schedule('*/5 * * * *', async () => {
    console.log('⏰ Running scheduled clustering...');
    try {
      const result = await runClustering();
      console.log(`✅ Scheduled clustering complete: ${result.message}`);
    } catch (error) {
      console.error('❌ Scheduled clustering failed:', error.message);
    }
  });
  
  console.log('⏰ Clustering cron job scheduled (every 5 minutes)');
});
