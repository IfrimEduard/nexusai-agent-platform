@echo off
chcp 65001 >nul 2>&1
title NexusAI Setup

echo.
echo  ========================================
echo   NexusAI Agent Platform - Setup
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

:: Configure .env
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo.
        echo   [SETUP] Created .env from .env.example
        echo.
        echo   ============================================
        echo    ACTION REQUIRED
        echo   ============================================
        echo.
        echo   Open .env and fill in your Supabase credentials:
        echo     VITE_SUPABASE_URL      = your project URL
        echo     VITE_SUPABASE_ANON_KEY = your anon key
        echo.
        echo   Get them from: https://supabase.com/dashboard
        echo   Project Settings ^> API
        echo.
        echo   Opening .env in Notepad...
        echo.
        notepad .env
        echo   After editing .env, run this script again.
        pause
        exit /b 0
    ) else (
        (
            echo VITE_SUPABASE_URL=https://your-project-id.supabase.co
            echo VITE_SUPABASE_ANON_KEY=your-anon-key-here
            echo VITE_OLLAMA_URL=http://localhost:11434
        ) > .env
        echo   [SETUP] Created .env with placeholders
        echo   Edit .env with your real credentials, then re-run.
        notepad .env
        pause
        exit /b 0
    )
) else (
    echo   [OK] .env already exists
)

:: Validate .env
findstr /C:"your-project-id" .env >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo   [WARN] .env still has placeholder values
    echo   Edit .env with your real Supabase credentials.
    notepad .env
    pause
    exit /b 0
)

findstr /C:"your-anon-key-here" .env >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo   [WARN] .env still has placeholder values
    echo   Edit .env with your real Supabase credentials.
    notepad .env
    pause
    exit /b 0
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
call npm run build
if %ERRORLEVEL% neq 0 (
    echo   [WARN] Build had issues - app may still work
) else (
    echo   [OK] Build successful
)

:: Done
echo.
echo  ========================================
echo   NexusAI Agent Platform is ready!
echo  ========================================
echo.
echo   Start the app:  launch.bat
echo   Or manually:    npm run dev
echo.
echo   The app will open at http://localhost:5173
echo.
pause
