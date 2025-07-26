@echo off
ECHO =================================================================
ECHO  AI Photo Ace Development Server Starter
ECHO =================================================================
ECHO.
ECHO This script will start the required development servers in separate windows.
ECHO Make sure you have run 'npm install' first.
ECHO.
ECHO You will need two API keys in a '.env' file for all features to work:
ECHO   - REMOVE_BG_API_KEY (from remove.bg)
ECHO   - GEMINI_API_KEY (from Google AI Studio)
ECHO.
ECHO See README.md for more details.
ECHO.
PAUSE

REM This command starts the Genkit AI flows server in a new window.
ECHO Starting Genkit server...
start "Genkit AI" cmd /c "npm run genkit:watch"

REM This command starts the Next.js web application server in a new window.
ECHO Starting Next.js server...
start "Next.js App" cmd /c "npm run dev"

ECHO.
ECHO Both servers have been launched in new windows.
ECHO The application should be available at http://localhost:9002
ECHO.
