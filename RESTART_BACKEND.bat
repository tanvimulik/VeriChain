@echo off
echo ========================================
echo   Restarting FarmConnect Backend
echo ========================================
echo.

cd backend

echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting backend server...
echo.

npm start
