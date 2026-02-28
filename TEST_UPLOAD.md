# Testing Image Upload - Troubleshooting Guide

## Error: "Failed to upload image 1: Route not found"

This error means the backend server doesn't recognize the `/api/upload/image` route.

## Solution Steps:

### Step 1: Restart Backend Server ⚠️ IMPORTANT

The backend server must be restarted to load the new upload routes!

**Stop the current backend:**
- Press `Ctrl + C` in the backend terminal

**Start backend again:**
```bash
cd backend
npm start
```

You should see:
```
🚀 FarmConnect Server running on port 8000
📍 Health check: http://localhost:8000/api/health
```

### Step 2: Verify Upload Directory Exists

The directory has been created at:
```
backend/uploads/crops/
```

### Step 3: Test the Upload Route

Open a new terminal and test:

```bash
# Test if backend is running
curl http://localhost:8000/api/health

# Should return: {"message":"✅ FarmConnect Backend is Running"}
```

### Step 4: Check Backend Console

When you try to upload, check the backend terminal for errors. You should see:
- Request received
- File being processed
- Success or error message

### Step 5: Common Issues & Fixes

#### Issue 1: "Route not found"
**Cause**: Backend not restarted after adding upload routes
**Fix**: Restart backend server (Step 1)

#### Issue 2: "Cannot find module './routes/uploadRoutes'"
**Cause**: File not created properly
**Fix**: Verify file exists at `backend/routes/uploadRoutes.js`

#### Issue 3: "ENOENT: no such file or directory"
**Cause**: Uploads directory doesn't exist
**Fix**: Directory created at `backend/uploads/crops/`

#### Issue 4: "Unauthorized" or "No token"
**Cause**: Not logged in or token expired
**Fix**: 
- Logout and login again
- Check localStorage has token
- Verify token in browser DevTools → Application → Local Storage

#### Issue 5: "Multer error"
**Cause**: File validation failed
**Fix**: 
- Check file is an image (JPEG, PNG, GIF, WebP)
- Check file size < 5MB
- Try a different image

### Step 6: Test Upload Flow

1. **Login as Farmer**
2. **Go to Add Crop page**
3. **Open Browser DevTools** (F12)
4. **Go to Network tab**
5. **Click "Choose File"**
6. **Select an image**
7. **Fill other fields**
8. **Click "Publish Listing"**
9. **Watch Network tab for:**
   - Request to `/api/upload/image`
   - Status should be 200 OK
   - Response should have `imageUrl`

### Step 7: Verify Upload Worked

Check if file was uploaded:
```bash
# Windows
dir backend\uploads\crops

# Should show uploaded image files
```

### Step 8: Check Backend Logs

Backend terminal should show:
```
POST /api/upload/image 200 - - ms
```

If you see:
```
POST /api/upload/image 404 - - ms
```
Then routes are not loaded → Restart backend!

## Quick Checklist

- [ ] Backend server restarted after adding upload routes
- [ ] `backend/routes/uploadRoutes.js` file exists
- [ ] `backend/config/multer.js` file exists
- [ ] `backend/uploads/crops/` directory exists
- [ ] Logged in as farmer (token in localStorage)
- [ ] Image file is valid (JPEG/PNG/GIF/WebP, < 5MB)
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000

## Testing Commands

### Test Backend Health:
```bash
curl http://localhost:8000/api/health
```

### Check if uploads directory exists:
```bash
# Windows PowerShell
Test-Path backend/uploads/crops

# Should return: True
```

### List uploaded files:
```bash
# Windows
dir backend\uploads\crops
```

## Expected Flow

1. User selects image → Preview shows
2. User clicks "Publish Listing"
3. Frontend shows "Uploading Images..."
4. Image uploads to `/api/upload/image`
5. Backend saves to `uploads/crops/`
6. Backend returns image URL
7. Frontend saves crop with image URL
8. Success message shown

## If Still Not Working

1. **Check backend terminal** for error messages
2. **Check browser console** (F12) for errors
3. **Check Network tab** for failed requests
4. **Verify token** in localStorage
5. **Try a different image** (smaller, different format)
6. **Clear browser cache** and try again
7. **Restart both** frontend and backend

## Contact Points

If upload still fails, check:
- Backend console output
- Browser console errors
- Network tab request/response
- File permissions on uploads folder

The most common issue is **forgetting to restart the backend** after adding new routes!
