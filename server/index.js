const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import MongoDB connection
const connectDB = require('./config/database');
const PORT = process.env.PORT || 5000;


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
connectDB();

// Middleware - CORS with proper configuration
app.use(cors({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Make io accessible to routes
  app.set('io', io);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/buyers', require('./routes/buyers'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      mongodb: 'connected'
    });
  });

  // Root endpoint
app.get('/', (req, res) => {
    res.json({
      message: 'FarmConnect API Server',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        auth: '/api/auth/*',
        farmers: '/api/farmers/*',
        buyers: '/api/buyers/*',
        crops: '/api/crops/*',
        orders: '/api/orders/*'
      }
    });
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('🟢 New client connected:', socket.id);

    socket.on('join-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`👤 User ${userId} joined their room`);
    });

    socket.on('track-truck', (truckId) => {
      socket.join(`truck-${truckId}`);
      console.log(`🚚 Tracking truck ${truckId}`);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ 
      error: 'Something went wrong!', 
      message: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  });

  server.listen(PORT, () => {
    console.log('====================================');
    console.log('🚀 Server Started Successfully!');
    console.log(`📡 Running on Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('🔗 Connected Successfully!');
    console.log('====================================');
  });

  const shutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down...`);
  
    try {
      io.close();
    } catch {}
  
    server.close(() => {
      console.log('👋 HTTP server closed');
      process.exit(0);
    });
  
    // If something (e.g. open sockets) prevents a clean close, exit anyway.
    setTimeout(() => {
      console.error('⏱️ Force exiting after shutdown timeout');
      process.exit(1);
    }, 5000).unref();
  };
  
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  // nodemon uses SIGUSR2 on restart
  process.once('SIGUSR2', () => shutdown('SIGUSR2'));
  
  module.exports = { app, io };