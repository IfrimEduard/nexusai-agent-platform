@echo off
chcp 65001 >nul 2>&1
title NexusAI Agent Platform

echo.
echo  ========================================
echo   NexusAI Agent Platform
echo  ========================================
echo.

:: Check .env
if not exist .env (
    echo   [ERROR] No .env file found. Run setup.bat first.
    echo.
    pause
    exit /b 1
)

:: Check node_modules
if not exist node_modules (
    echo   Installing dependencies...
    call npm install --loglevel=error
    if %ERRORLEVEL% neq 0 (
        echo   [ERROR] Failed to install dependencies.
        echo.
        pause
        exit /b 1
    )
)

:: Check Ollama status
echo   Checking Ollama...
where ollama >nul 2>&1
if %ERRORLEVEL% equ 0 (
    curl -s http://localhost:11434/api/tags >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo   [OK] Ollama running - local models available
    ) else (
        echo   [INFO] Ollama installed but not running
        echo   Start it from Start Menu or run: ollama serve
    )
) else (
    echo   [INFO] Ollama not installed - install from https://ollama.com for local models
)

echo.
echo   Starting dev server...
echo   App will open at http://localhost:5173
echo.
echo   Local models: Models ^> Local Models to scan, import, or install
echo.

:: Open browser after delay
start "" /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: Start dev server (this keeps the window open)
call npm run dev
