# Use Local MongoDB (No SSL Issues!)

If MongoDB Atlas keeps giving SSL/connection errors, use local MongoDB instead.

## 📥 Install MongoDB Locally

### For Windows:

1. **Download MongoDB:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows
   - Version: Latest (7.0 or 6.0)
   - Package: MSI
   - Click "Download"

2. **Install:**
   - Run the downloaded .msi file
   - Choose "Complete" installation
   - Install as a Service (check the box)
   - Install MongoDB Compass (optional GUI tool)

3. **Verify Installation:**
   ```bash
   mongod --version
   ```

## 🔧 Update Your Project

### Update backend/config/database.js:

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use local MongoDB instead of Atlas
    const mongoURI = 'mongodb://localhost:27017/farmconnect';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected Successfully (Local)');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Update backend/.env:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/farmconnect
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

## 🚀 Start MongoDB Service

### Windows:
MongoDB should start automatically as a service.

To check if it's running:
```bash
# Open Services (Win + R, type: services.msc)
# Look for "MongoDB Server"
# Status should be "Running"
```

Or start manually:
```bash
net start MongoDB
```

## ✅ Test Connection

1. **Restart Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **You should see:**
   ```
   ✅ MongoDB Connected Successfully (Local)
   ```

3. **Try Login:**
   - Go to frontend
   - Register a new user
   - Login should work instantly!

## 🎉 Benefits of Local MongoDB

✅ No SSL/TLS errors
✅ No IP whitelist issues
✅ Faster (no network latency)
✅ Works offline
✅ No connection limits
✅ Perfect for development

## 🔄 Switch Back to Atlas Later

When you're ready for production, just change the connection string back to Atlas.

## 📊 View Your Data

Use MongoDB Compass (GUI tool):
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. You'll see your `farmconnect` database
4. Browse collections: farmers, buyers, crops, orders, etc.

## ⚠️ Important Notes

- Local MongoDB data is stored on your computer
- If you reinstall Windows, backup your data first
- For production, use MongoDB Atlas
- For development, local is faster and easier
