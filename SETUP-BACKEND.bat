@echo off
REM Project Sentinel - Automated Backend Setup
REM This script sets up the enterprise backend step-by-step

color 0A
echo.
echo ================================================================
echo    PROJECT SENTINEL - ENTERPRISE BACKEND SETUP
echo ================================================================
echo.
echo This script will guide you through setting up the backend server
echo to fix the API key CORS issue and enable all enterprise features.
echo.
pause

REM Step 1: Check Node.js
echo.
echo [Step 1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Node.js is not installed!
    echo.
    echo Please download and install Node.js 18+ from:
    echo https://nodejs.org/
    echo.
    echo After installing, run this script again.
    pause
    exit /b 1
)
echo OK: Node.js is installed
node --version
echo.

REM Step 2: Check PostgreSQL
echo [Step 2/5] Checking PostgreSQL installation...
psql --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo WARNING: PostgreSQL command line tools not found
    echo.
    echo PostgreSQL might not be installed. You need PostgreSQL 14+
    echo Download from: https://www.postgresql.org/download/windows/
    echo.
    set /p continue="Do you want to continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
) else (
    echo OK: PostgreSQL is installed
    psql --version
)
echo.

REM Step 3: Create .env file
echo [Step 3/5] Configuring environment...
cd server

if exist ".env" (
    echo.
    echo WARNING: .env file already exists
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" goto skip_env
)

copy .env.example .env >nul
echo OK: .env file created from template
echo.
echo IMPORTANT: You need to edit .env file with your settings:
echo   1. DB_PASSWORD - Your PostgreSQL password
echo   2. ANTHROPIC_API_KEY - Your API key from console.anthropic.com
echo   3. SESSION_SECRET - A long random string
echo.
set /p edit_now="Do you want to edit .env now? (y/n): "
if /i "%edit_now%"=="y" (
    notepad .env
)

:skip_env

REM Step 4: Install dependencies
echo.
echo [Step 4/5] Installing dependencies...
echo This may take 2-3 minutes...
echo.
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.
echo OK: Dependencies installed successfully
echo.

REM Step 5: Database setup
echo [Step 5/5] Database initialization...
echo.
echo Before initializing, make sure:
echo   1. PostgreSQL is running
echo   2. You have created the database:
echo.
echo      psql -U postgres
echo      CREATE DATABASE sentinel;
echo      CREATE USER sentinel_user WITH PASSWORD 'password';
echo      GRANT ALL ON DATABASE sentinel TO sentinel_user;
echo      \q
echo.
set /p db_ready="Have you created the database? (y/n): "

if /i "%db_ready%"=="y" (
    echo.
    echo Initializing database...
    call npm run init-db
    if errorlevel 1 (
        echo.
        echo ERROR: Database initialization failed
        echo Check that:
        echo   - PostgreSQL is running
        echo   - Database 'sentinel' exists
        echo   - Credentials in .env are correct
        pause
        exit /b 1
    )
    echo.
    echo OK: Database initialized successfully
) else (
    echo.
    echo SKIPPED: Database initialization
    echo You can run it later with: npm run init-db
)

echo.
echo ================================================================
echo    SETUP COMPLETE!
echo ================================================================
echo.
echo Your enterprise backend is ready to start!
echo.
echo NEXT STEPS:
echo.
echo 1. Make sure you've edited .env with:
echo    - DB_PASSWORD (your PostgreSQL password)
echo    - ANTHROPIC_API_KEY (from console.anthropic.com)
echo    - SESSION_SECRET (random string)
echo.
echo 2. Start the server:
echo    npm start
echo.
echo 3. Open in browser:
echo    http://localhost:3000/login.html
echo.
echo 4. Login as: chris.marinelli / password
echo.
echo 5. The API key will now work (no more CORS errors!)
echo.
echo Press any key to start the server now...
pause >nul

echo.
echo Starting Project Sentinel Server...
echo Press Ctrl+C to stop the server
echo.
call npm start

pause
