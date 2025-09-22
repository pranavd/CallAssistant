@echo off
REM Call Assistant Setup Script for Windows
REM This script helps new developers set up the project quickly

echo 🚀 Call Assistant Setup Script
echo ================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js ^(v18+^) from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ npm version: 
npm --version

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies.
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  .env.local file not found.
    echo 📋 Creating .env.local from template...
    
    if exist ".env.local.template" (
        copy ".env.local.template" ".env.local" >nul
        echo ✅ .env.local created from template.
        echo 📝 Please edit .env.local and add your Azure configuration:
        echo    - VITE_CLIENT_ID ^(Azure AD Application ID^)
        echo    - VITE_TENANT_ID ^(Azure AD Tenant ID^)
        echo    - VITE_ACS_CONNECTION_EP ^(ACS Endpoint^)
        echo    - VITE_ACS_CONNECTION_KEY ^(ACS Access Key^)
    ) else (
        echo ❌ .env.local.template not found. Please create .env.local manually.
    )
) else (
    echo ✅ .env.local file exists.
)

echo.
echo 🎉 Setup Complete!
echo ================================
echo Next steps:
echo 1. Edit .env.local with your Azure configuration
echo 2. Run 'npm run dev' to start the development server
echo 3. Open http://localhost:5173 in your browser
echo.
echo 📚 For detailed setup instructions, see README.md

pause