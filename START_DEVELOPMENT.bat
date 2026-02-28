@echo off
REM FarmConnect - Development Mode Startup Script

echo.
echo ========================================
echo    🌾 FarmConnect - Development Mode
echo ========================================
echo.

REM Check if port 8000 is in use
netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ Port 8000 is already in use!
    pause
    exit /b 1
)

REM Check if port 3000 is in use
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ Port 3000 is already in use!
    pause
    exit /b 1
)

echo.
echo 🔧 Starting Backend on Port 8000...
start cmd /k "cd backend && npm install && npm run dev"

echo.
echo ⏳ Waiting for backend to start (5 seconds)...
timeout /t 5 /nobreak

echo.
echo 🔧 Starting Frontend on Port 3000...
start cmd /k "cd frontend && npm install && npm start"

echo.
echo ========================================
echo ✅ FarmConnect is Running!
echo ========================================
echo.
echo 🌐 URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000/api
echo.
echo 💡 Two terminal windows will open.
echo    Leave them running while you work.
echo.
echo Press any key to continue...
pause

echo.
echo ✅ Done! Both servers are starting...
