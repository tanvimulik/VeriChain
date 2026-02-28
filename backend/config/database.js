const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection from environment variable
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Atlas Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.log('');
    console.log('⚠️  IMPORTANT: You need to whitelist your IP in MongoDB Atlas');
    console.log('📍 Steps to fix:');
    console.log('   1. Go to: https://cloud.mongodb.com/');
    console.log('   2. Click "Network Access" in left sidebar');
    console.log('   3. Click "Add IP Address"');
    console.log('   4. Click "Allow Access from Anywhere"');
    console.log('   5. Click "Confirm"');
    console.log('   6. Wait 2 minutes and restart backend');
    console.log('');
    process.exit(1);
  }
};

module.exports = connectDB;
