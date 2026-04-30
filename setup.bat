@echo off
chcp 65001 >nul 2>&1
title NexusAI Setup

echo.
echo  ========================================
echo   NexusAI Agent Platform - One-Click Setup
echo  ========================================
echo.

:: Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   [ERROR] Node.js not found!
    echo   Download from: https://nodejs.org
    echo   Install the LTS version, then re-run this script.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo   [OK] Node.js %NODE_VER%

:: Check npm
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   [ERROR] npm not found!
    echo   Reinstall Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo   [OK] npm %NPM_VER%

:: Install dependencies
echo.
echo   Installing dependencies...
call npm install --loglevel=error
if %ERRORLEVEL% neq 0 (
    echo   [ERROR] npm install failed!
    echo   Try deleting node_modules and running: npm install
    echo.
    pause
    exit /b 1
)
echo   [OK] Dependencies installed

:: Configure .env (auto-copy from .env.example with real credentials)
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo   [OK] .env created with Supabase credentials
    ) else (
        (
            echo VITE_SUPABASE_URL=https://ebgxlnfpbsovnhtkzknz.supabase.co
            echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZ3hsbmZwYnNvdm5odGt6a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODQyODksImV4cCI6MjA5Mjk2MDI4OX0.sr-lbLwBsYvoA5WpF_5bgCGNS3BRxHfkrM43YrW06ws
            echo VITE_OLLAMA_URL=http://localhost:11434
        ) > .env
        echo   [OK] .env created with Supabase credentials
    )
) else (
    echo   [OK] .env already exists
)

:: Check Ollama
echo.
echo   Checking Ollama (optional - for local models)...
where ollama >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo   [OK] Ollama found
    curl -s http://localhost:11434/api/tags >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo   [OK] Ollama is running
    ) else (
        echo   [INFO] Ollama not running. Start it from your Start Menu or run: ollama serve
    )
) else (
    echo   [INFO] Ollama not installed. Get it from https://ollama.com for local model support
)

:: Build check
echo.
echo   Verifying build...
call npm run build >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   [WARN] Build had issues - app may still work
) else (
    echo   [OK] Build successful
)

:: Done
echo.
echo  ========================================
echo   NexusAI is ready!
echo  ========================================
echo.
echo   Double-click:  launch.bat
echo   Or run:        npm run dev
echo.
echo   Opens at: http://localhost:5173
echo.
pause
