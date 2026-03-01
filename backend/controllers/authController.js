const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');
const Buyer = require('../models/Buyer');
const Admin = require('../models/Admin');
const LogisticsOrg = require('../models/LogisticsOrg');

const JWT_SECRET = 'your_secret_key_here';

// Farmer Registration
exports.registerFarmer = async (req, res) => {
  try {
    const { fullName, phone, aadhaar, village, farmSize, cropsGrown, password, email, gpsLocation } = req.body;

    // Check if farmer already exists
    const existingFarmer = await Farmer.findOne({ phone });
    if (existingFarmer) {
      return res.status(400).json({ message: 'Farmer with this phone already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const farmer = new Farmer({
      fullName,
      phone,
      aadhaar,
      village,
      farmSize,
      cropsGrown,
      password: hashedPassword,
      email,
      gpsLocation: gpsLocation || null,
    });

    await farmer.save();
    
    // Generate token
    const token = jwt.sign({ id: farmer._id, role: 'farmer' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      message: 'Farmer registered successfully', 
      token,
      farmer: {
        id: farmer._id,
        fullName: farmer.fullName,
        phone: farmer.phone,
        village: farmer.village,
        gpsLocation: farmer.gpsLocation
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Farmer Login
exports.loginFarmer = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const farmer = await Farmer.findOne({ phone });
    if (!farmer) {
      return res.status(400).json({ message: 'Farmer not found' });
    }

    const isPasswordMatch = await bcrypt.compare(password, farmer.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: farmer._id, role: 'farmer' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, farmer, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buyer Registration
exports.registerBuyer = async (req, res) => {
  try {
    const { businessName, businessType, phone, gst, deliveryAddress, city, state, password, email, gpsLocation } = req.body;

    const existingBuyer = await Buyer.findOne({ phone });
    if (existingBuyer) {
      return res.status(400).json({ message: 'Buyer with this phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const buyer = new Buyer({
      businessName,
      businessType,
      phone,
      gst,
      deliveryAddress,
      city,
      state,
      password: hashedPassword,
      email,
      gpsLocation: gpsLocation || null,
    });

    await buyer.save();
    
    // Generate token
    const token = jwt.sign({ id: buyer._id, role: 'buyer' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      message: 'Buyer registered successfully', 
      token,
      buyer: {
        id: buyer._id,
        businessName: buyer.businessName,
        phone: buyer.phone,
        city: buyer.city,
        gpsLocation: buyer.gpsLocation
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buyer Login
exports.loginBuyer = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const buyer = await Buyer.findOne({ phone });
    if (!buyer) {
      return res.status(400).json({ message: 'Buyer not found' });
    }

    const isPasswordMatch = await bcrypt.compare(password, buyer.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: buyer._id, role: 'buyer' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, buyer, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logistics Registration
exports.registerLogistics = async (req, res) => {
  try {
    const { organizationName, phone, email, password, address, operatingRegions } = req.body;

    const existingOrg = await LogisticsOrg.findOne({ phone });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization with this phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const logisticsOrg = new LogisticsOrg({
      organizationName,
      phone,
      email,
      password: hashedPassword,
      address,
      operatingRegions,
    });

    await logisticsOrg.save();
    
    // Generate token
    const token = jwt.sign({ id: logisticsOrg._id, role: 'logistics' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      message: 'Logistics organization registered successfully', 
      token,
      logisticsOrg: {
        id: logisticsOrg._id,
        organizationName: logisticsOrg.organizationName,
        phone: logisticsOrg.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logistics Login
exports.loginLogistics = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const logisticsOrg = await LogisticsOrg.findOne({ phone });
    if (!logisticsOrg) {
      return res.status(400).json({ message: 'Organization not found' });
    }

    const isPasswordMatch = await bcrypt.compare(password, logisticsOrg.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: logisticsOrg._id, role: 'logistics' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, logisticsOrg, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, admin, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
