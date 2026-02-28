const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Farmer, Buyer, LogisticsOrg } = require('../models');

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('🔍 Registration request body:', req.body);
    const { phone, password, role, ...profileData } = req.body;

    // Validate required fields
    if (!phone || !password || !role) {
      console.log('❌ Missing required fields:', { phone: !!phone, password: !!password, role: !!role });
      return res.status(400).json({ error: 'Phone, password, and role are required' });
    }

    // Check if user exists
    console.log('🔍 Checking if user exists with phone:', phone);
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      console.log('❌ User already exists with phone:', phone);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    console.log('👤 Creating user with role:', role);
    const user = await User.create({
      phone,
      passwordHash,
      role
    });
    console.log('✅ User created successfully:', user._id);

    // Create role-specific profile
    console.log('📋 Creating profile for role:', role, 'with data:', profileData);
    if (role === 'farmer') {
      await Farmer.create({
        userId: user._id,
        name: profileData.name,
        village: profileData.village,
        farmType: profileData.farm_type || profileData.farmType,
        farmSize: profileData.farm_size || profileData.farmSize,
        aadhaarNumber: profileData.aadhaar_number || profileData.aadhaarNumber,
        latitude: profileData.latitude,
        longitude: profileData.longitude,
        location: {
          type: 'Point',
          coordinates: [profileData.longitude || 0, profileData.latitude || 0]
        }
      });
    } else if (role === 'buyer') {
      console.log('🏪 Creating buyer profile...');
      const buyerData = {
        userId: user._id,
        name: profileData.name,
        buyerType: profileData.buyer_type || profileData.buyerType,
        businessName: profileData.name, // Use name as businessName since frontend sends business name as 'name'
        deliveryAddress: profileData.delivery_address || profileData.deliveryAddress,
        latitude: profileData.latitude,
        longitude: profileData.longitude,
        location: {
          type: 'Point',
          coordinates: [profileData.longitude || 0, profileData.latitude || 0]
        }
      };
      console.log('🏪 Buyer data to be created:', buyerData);
      await Buyer.create(buyerData);
      console.log('✅ Buyer profile created successfully');
    } else if (role === 'logistics') {
      await LogisticsOrg.create({
        userId: user._id,
        orgName: profileData.org_name || profileData.orgName,
        contactNumber: profileData.contact_number || profileData.contactNumber,
        totalTrucks: profileData.total_trucks || profileData.totalTrucks || 0,
        serviceAreas: profileData.service_areas || profileData.serviceAreas || []
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, phone: user.phone, role: user.role }
    });

  } catch (error) {
    console.error('❌ Registration error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      errors: error.errors
    });
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        verified: user.verified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ valid: true, user });

  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
