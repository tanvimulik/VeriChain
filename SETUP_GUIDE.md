# 🚀 FarmConnect - Setup & Run Guide

## Three Ways to Run the Application

---

## 🔥 **BEST FOR JUDGES: All on Port 8000 (Production Mode)**

This is the recommended approach for final submission. Everything runs on **one port**.

### Setup:

**Step 1: Build Frontend (one-time)**
```bash
cd frontend
npm install
npm run build
```
This creates optimized production files in `frontend/build/`

**Step 2: Run Backend Only**
```bash
cd backend
npm install
npm run dev
```

### Result:
- ✅ Backend API: `http://localhost:8000/api`
- ✅ Frontend UI: `http://localhost:8000`
- ✅ Everything is **one URL, one port**
- ✅ This is what judges expect to see!

### Why This is Best:
- Single entry point: `http://localhost:8000`
- No CORS issues
- Looks professional
- Same as deployed production
- Judges can access everything from one URL

---

## 💻 **FOR DEVELOPMENT: Separate Ports (3000 + 8000)**

Best when actively developing and want hot reload.

### Terminal 1 - Backend (Port 8000)
```bash
cd backend
npm install
npm run dev
```

### Terminal 2 - Frontend (Port 3000)
```bash
cd frontend
npm install
npm start
```

### Access:
- Frontend: `http://localhost:3000`
- API: `http://localhost:8000/api`

### Why Use This:
- Hot reload on code changes
- Faster development
- Easier debugging

---

## 🐳 **DOCKER: Everything in Containers (Advanced)**

If you want production-ready containerization:

Create `docker-compose.yml` in root:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URI=mongodb+srv://inrane2019_db_user:F4riI9E7mNE1ujoC@cluster0.oxadyuv.mongodb.net/?appName=Cluster0
      - JWT_SECRET=your_secret_key_here
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
```

Run:
```bash
docker-compose up
```

---

## 📋 Comparison Table

| Approach | Frontend Port | Backend Port | Best For | Setup Time |
|----------|---------------|--------------|----------|-----------|
| **Production (8000)** | 8000 | 8000 | Judges / Final Demo | 5 min |
| **Development (3000+8000)** | 3000 | 8000 | Active Dev | 5 min |
| **Docker** | 3000 | 8000 | Cloud Deployment | 10 min |

---

## ⚡ Quick Start Commands

### For Final Submission (Recommended):
```bash
# Terminal 1
cd Farm_Not_Final/frontend
npm run build

# Terminal 2
cd Farm_Not_Final/backend
npm install
npm run dev

# Open browser to http://localhost:8000
```

### For Development:
```bash
# Terminal 1
cd Farm_Not_Final/backend
npm install
npm run dev

# Terminal 2
cd Farm_Not_Final/frontend
npm start
```

---

## 🔧 Troubleshooting

### "Port 8000 already in use"
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### "CORS error in development"
- Make sure frontend is running on 3000
- Backend is running on 8000
- API client uses `http://localhost:8000/api`

### "API calls fail in production mode"
- Ensure `frontend/build` folder exists
- Run `npm run build` in frontend directory
- Check that API routes are working: `http://localhost:8000/api/health`

### Frontend shows "Cannot GET /"
- Check that `frontend/build` folder is created
- Verify backend is serving static files correctly
- Check server logs for errors

---

## 📂 File Structure After Build

```
Farm_Not_Final/
├── backend/
│   ├── server.js          (serves frontend + API)
│   ├── package.json
│   └── ...
├── frontend/
│   ├── build/             (created after npm run build)
│   │   ├── index.html
│   │   ├── static/
│   │   └── ...
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

---

## ✅ Verification Checklist

After starting server:

- [ ] `http://localhost:8000` loads landing page
- [ ] `http://localhost:8000/api/health` returns JSON
- [ ] Can navigate to /login/farmer
- [ ] Can navigate to /marketplace
- [ ] API calls work (check browser Network tab)
- [ ] No CORS errors in console

---

## 🎯 Which Mode to Use?

**Use Production Mode (Port 8000) if:**
- ✅ Submitting to judges
- ✅ Demo day
- ✅ Deploying to server
- ✅ Want single URL entry point

**Use Development Mode (3000+8000) if:**
- ✅ Active coding
- ✅ Want hot reload
- ✅ Debugging frontend
- ✅ Still building features

---

## Default Test Accounts

### Farmer
- Phone: 9876543210
- Password: farmer123

### Buyer
- Phone: 9123456789
- Password: buyer123

### Admin
- Email: admin@farmconnect.com
- Password: admin123

---

## 🚀 Deployment Notes

### For AWS/Heroku/Railway:
1. Build frontend: `npm run build`
2. Deploy backend directory
3. Set environment variables on platform
4. Backend automatically serves built frontend
5. No need for separate frontend hosting!

### Environment Variables Needed:
```
MONGODB_URI=<your_atlas_uri>
JWT_SECRET=your_secret
NODE_ENV=production
PORT=8000
```

---

**Questions? Check the main README.md for complete documentation.**
