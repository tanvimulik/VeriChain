@echo off
REM FarmConnect - One-Click Startup Script for Production Mode

echo.
echo ========================================
echo    🌾 FarmConnect - Farm to Market
echo ========================================
echo.

REM Check if backend is already running
netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ Port 8000 is already in use!
    echo Please close the existing application first.
    echo To kill the process:
    echo netstat -ano | findstr :8000
    echo taskkill /PID ^<PID^> /F
    pause
    exit /b 1
)

echo.
echo 📦 Building Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Frontend build complete!
echo.
echo 🚀 Starting Backend Server...
cd ..\backend
call npm install
call npm run dev

if %errorlevel% neq 0 (
    echo ❌ Backend startup failed!
    pause
    exit /b 1
)

REM If we reach here, the server is running
echo.
echo ========================================
echo ✅ FarmConnect is Running!
echo ========================================
echo.
echo 🌐 Open your browser:
echo    http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
pause
