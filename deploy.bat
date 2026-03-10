@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Deploying to AWS EC2
echo ========================================
echo.

REM Push to GitHub
echo [1/3] Pushing code to GitHub...
git add .
git commit -m "Auto-deploy: %date% %time%"
git push origin main

if errorlevel 1 (
    echo ❌ Git push failed!
    pause
    exit /b 1
)

echo ✅ Code pushed to GitHub

REM Deploy on EC2
echo.
echo [2/3] Deploying on EC2...
ssh -i "C:\Users\shyam11\Downloads\Mee.pem" ubuntu@13.51.178.89 "cd ~/Admin-dashboard && bash deploy.sh"

if errorlevel 1 (
    echo ❌ EC2 deployment failed!
    pause
    exit /b 1
)

echo ✅ EC2 deployment complete

echo.
echo ========================================
echo   ✅ Deployment Successful!
echo ========================================
echo.
echo Your app is live at: http://13.51.178.89
echo.
pause
