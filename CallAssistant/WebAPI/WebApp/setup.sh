#!/bin/bash

# Call Assistant Setup Script
# This script helps new developers set up the project quickly

echo "🚀 Call Assistant Setup Script"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18+) from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found."
    echo "📋 Creating .env.local from template..."
    
    if [ -f ".env.local.template" ]; then
        cp .env.local.template .env.local
        echo "✅ .env.local created from template."
        echo "📝 Please edit .env.local and add your Azure configuration:"
        echo "   - VITE_CLIENT_ID (Azure AD Application ID)"
        echo "   - VITE_TENANT_ID (Azure AD Tenant ID)"
        echo "   - VITE_ACS_CONNECTION_EP (ACS Endpoint)"
        echo "   - VITE_ACS_CONNECTION_KEY (ACS Access Key)"
    else
        echo "❌ .env.local.template not found. Please create .env.local manually."
    fi
else
    echo "✅ .env.local file exists."
fi

echo ""
echo "🎉 Setup Complete!"
echo "================================"
echo "Next steps:"
echo "1. Edit .env.local with your Azure configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "📚 For detailed setup instructions, see README.md"