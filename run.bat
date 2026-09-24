@echo off
setlocal enabledelayedexpansion
title SmartFood Platform Launcher
color 0A

echo =====================================================================
echo              SMART FOOD DISTRIBUTION PROTOCOL [SYS.01]
echo =====================================================================
echo.

:: Set current directory to project root
cd /d "%~dp0"

:: Step 1: Free ports 8000 and 5173 if any previous instance is lingering
echo  [1/3] Releasing ports 8000 and 5173...
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":8000 " ^| findstr "LISTENING"') do taskkill /F /PID %%p >nul 2>&1
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do taskkill /F /PID %%p >nul 2>&1

:: Step 2: Start Backend Server in a new window
echo  [2/3] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "SmartFood - Backend (FastAPI)" cmd /k "python -m uvicorn backend.main:app --port 8000 --reload"

:: Step 3: Start Frontend Client in a new window
echo  [3/3] Launching Vite Frontend on http://localhost:5173 ...
start "SmartFood - Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo =====================================================================
echo  Services launched successfully!
echo   - Backend API:    http://127.0.0.1:8000
echo   - Swagger Docs:   http://127.0.0.1:8000/docs
echo   - Frontend UI:    http://localhost:5173
echo.
echo  Opening http://localhost:5173 in your default browser...
echo =====================================================================

:: Reliable 3-second delay without timeout redirection issues
ping 127.0.0.1 -n 4 >nul
start http://localhost:5173

echo.
echo  Keep the Backend and Frontend terminal windows open while working.
echo  Press any key to close this launcher window.
pause >nul
