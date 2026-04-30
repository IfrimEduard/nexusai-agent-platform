@echo off
chcp 65001 >nul 2>&1
title NexusAI Agent Platform

echo.
echo  ========================================
echo   NexusAI Agent Platform
echo  ========================================
echo.

:: Auto-setup if needed
if not exist node_modules (
    echo   First run detected - setting up...
    echo.
    call setup.bat
    if %ERRORLEVEL% neq 0 exit /b 1
)

:: Check .env
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
    ) else (
        echo   [ERROR] No .env file. Run setup.bat first.
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
        echo   [INFO] Ollama installed but not running - start from Start Menu
    )
) else (
    echo   [INFO] Ollama not installed - get it from https://ollama.com
)

echo.
echo   Starting NexusAI...
echo   Open your browser at: http://localhost:5173
echo.
echo   Press Ctrl+C to stop the server
echo.

:: Open browser after delay
start "" /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: Start dev server
call npm run dev
