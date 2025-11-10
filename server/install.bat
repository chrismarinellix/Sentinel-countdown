@echo off
REM Project Sentinel - Backend Installation Script
REM This script installs dependencies and sets up the backend server

echo.
echo ================================================================
echo    PROJECT SENTINEL - BACKEND INSTALLATION
echo ================================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Node.js found:
node --version
echo.

REM Check if PostgreSQL is accessible
echo [2/3] Checking PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: PostgreSQL command line tools not found in PATH
    echo PostgreSQL may still be installed, check services.msc
    echo.
) else (
    echo PostgreSQL found:
    psql --version
    echo.
)

REM Install dependencies
echo [3/3] Installing Node.js dependencies...
echo.
call npm install

if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ================================================================
echo    INSTALLATION COMPLETE!
echo ================================================================
echo.
echo NEXT STEPS:
echo.
echo 1. Make sure PostgreSQL is running
echo 2. Copy .env.example to .env and configure:
echo      - DB_HOST, DB_PORT, DB_NAME
echo      - DB_USER, DB_PASSWORD
echo      - SESSION_SECRET
echo.
echo 3. Initialize the database:
echo      npm run init-db
echo.
echo 4. Start the server:
echo      npm start
echo.
echo See SETUP.md for detailed instructions
echo.
pause
