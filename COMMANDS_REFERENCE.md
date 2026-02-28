# FarmConnect - Commands Reference

## Initial Setup Commands

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Seed FPO Locations (IMPORTANT - Run First!)
```bash
cd backend
npm run seed:fpos
```

Expected output:
```
✅ Connected to MongoDB
🗑️  Cleared existing FPO data
✅ Successfully seeded 15 FPOs
```

## Running the Application

### Option 1: Production Mode (Recommended)
```bash
# Build frontend first
cd frontend
npm run build

# Run backend (serves frontend)
cd ../backend
npm start
```
Access: http://localhost:8000

### Option 2: Development Mode
**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Access: 
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### Option 3: Windows Batch Files
```bash
# Production
START_PRODUCTION.bat

# Development
START_DEVELOPMENT.bat
```

## Database Commands

### Seed FPO Locations
```bash
cd backend
npm run seed:fpos
```

### Check MongoDB Connection
```bash
# In backend directory
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
```

## Testing Commands

### Test Backend Health
```bash
curl http://localhost:8000/api/health
```

### Test FPO API (No GPS)
```bash
curl http://localhost:8000/api/farmer/storage/nearby-fpos
```

### Test FPO API (With GPS)
```bash
curl "http://localhost:8000/api/farmer/storage/nearby-fpos?latitude=22.5993&longitude=75.2979"
```

## Development Commands

### Backend Development with Auto-Reload
```bash
cd backend
npm run dev
```

### Frontend Development with Hot Reload
```bash
cd frontend
npm start
```

### Build Frontend for Production
```bash
cd frontend
npm run build
```

## Troubleshooting Commands

### Clear npm Cache
```bash
npm cache clean --force
```

### Reinstall Dependencies
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Check Node Version
```bash
node --version
npm --version
```

### Check Running Processes
```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :8000
lsof -i :3000
```

### Kill Process on Port
```bash
# Windows
# Find PID first, then:
taskkill /PID <PID> /F

# Mac/Linux
kill -9 $(lsof -t -i:8000)
kill -9 $(lsof -t -i:3000)
```

## Git Commands

### Clone Repository
```bash
git clone <repository-url>
cd Farm_Not_Final
```

### Check Status
```bash
git status
```

### Pull Latest Changes
```bash
git pull origin main
```

## MongoDB Commands

### Connect to MongoDB (if using local)
```bash
mongosh "mongodb+srv://cluster.mongodb.net/farmconnect"
```

### View Collections
```javascript
show collections
```

### Count FPOs
```javascript
db.fpostorages.countDocuments()
```

### View FPOs
```javascript
db.fpostorages.find().pretty()
```

### Clear FPOs (if needed)
```javascript
db.fpostorages.deleteMany({})
```

## Package Scripts

### Backend (package.json)
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "seed:fpos": "node seedFPOs.js"
}
```

### Frontend (package.json)
```json
{
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test"
}
```

## Environment Variables

### Backend (.env)
```env
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### Frontend (.env.development)
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### Frontend (.env.production)
```env
REACT_APP_API_URL=/api
```

## Quick Command Sequences

### First Time Setup
```bash
# 1. Install everything
cd backend && npm install
cd ../frontend && npm install

# 2. Seed FPO data
cd ../backend && npm run seed:fpos

# 3. Build frontend
cd ../frontend && npm run build

# 4. Start backend
cd ../backend && npm start
```

### Daily Development
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start
```

### Before Deployment
```bash
# 1. Build frontend
cd frontend && npm run build

# 2. Test production mode
cd ../backend && npm start

# 3. Test all features
# Open http://localhost:8000
```

## API Testing with curl

### Register Farmer
```bash
curl -X POST http://localhost:8000/api/auth/farmer/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Farmer",
    "phone": "9999999999",
    "aadhaar": "123456789012",
    "village": "Test Village",
    "farmSize": "1-2 acres",
    "password": "test123"
  }'
```

### Login Farmer
```bash
curl -X POST http://localhost:8000/api/auth/farmer/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9999999999",
    "password": "test123"
  }'
```

### Get Nearby FPOs (with token)
```bash
curl http://localhost:8000/api/farmer/storage/nearby-fpos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Useful Aliases (Optional)

Add to your `.bashrc` or `.zshrc`:

```bash
# FarmConnect aliases
alias fc-backend="cd ~/path/to/Farm_Not_Final/backend && npm start"
alias fc-frontend="cd ~/path/to/Farm_Not_Final/frontend && npm start"
alias fc-seed="cd ~/path/to/Farm_Not_Final/backend && npm run seed:fpos"
alias fc-build="cd ~/path/to/Farm_Not_Final/frontend && npm run build"
```

## Common Issues & Solutions

### Issue: Port already in use
```bash
# Kill process on port 8000
# Windows: netstat -ano | findstr :8000, then taskkill /PID <PID> /F
# Mac/Linux: kill -9 $(lsof -t -i:8000)
```

### Issue: MongoDB connection failed
```bash
# Check .env file
cat backend/.env

# Test connection
cd backend
node -e "require('./config/database')();"
```

### Issue: FPOs not showing
```bash
# Re-run seed script
cd backend
npm run seed:fpos

# Verify in MongoDB
# Check fpostorages collection has 15 documents
```

### Issue: GPS not working
- Ensure HTTPS (or localhost)
- Check browser permissions
- Try different browser
- Fallback: Shows all FPOs without distance

## Performance Monitoring

### Check Backend Response Time
```bash
time curl http://localhost:8000/api/health
```

### Check FPO Query Performance
```bash
time curl "http://localhost:8000/api/farmer/storage/nearby-fpos?latitude=22.5993&longitude=75.2979"
```

## Backup Commands

### Backup MongoDB
```bash
mongodump --uri="mongodb+srv://..." --out=./backup
```

### Restore MongoDB
```bash
mongorestore --uri="mongodb+srv://..." ./backup
```

---

**Keep this file handy for quick reference!**
