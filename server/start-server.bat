@echo off
REM Project Sentinel - Server Startup Script

echo.
echo ================================================================
echo    STARTING PROJECT SENTINEL SERVER
echo ================================================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo.
    echo Please create .env file from .env.example:
    echo   1. Copy .env.example to .env
    echo   2. Edit .env with your database settings
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo ERROR: Dependencies not installed!
    echo.
    echo Please run: npm install
    echo Or: install.bat
    echo.
    pause
    exit /b 1
)

echo Starting server...
echo Press Ctrl+C to stop
echo.

REM Start the server
node server.js

pause
