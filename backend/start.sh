#!/bin/bash

# TalkAI Backend Startup Script

echo "🚀 Starting TalkAI Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
    echo "   Required variables:"
    echo "   - MONGO_URI (MongoDB connection string)"
    echo "   - JWT_SECRET (for JWT tokens)"
    echo "   - EMAIL_USER and EMAIL_PASS (for email service)"
    echo "   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (for OAuth)"
    echo ""
    echo "💡 You can start the server now, but some features may not work without proper configuration."
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if MongoDB is running (optional check)
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Please start MongoDB or use MongoDB Atlas."
        echo "   To start local MongoDB: mongod"
    fi
else
    echo "⚠️  MongoDB not found. Please install MongoDB or use MongoDB Atlas."
fi

# Start the server
echo "🎯 Starting server..."
echo "   Development mode: npm run dev"
echo "   Production mode: npm start"
echo ""

# Check if nodemon is available for development
if command -v nodemon &> /dev/null || [ -d "node_modules/.bin/nodemon" ]; then
    echo "🔄 Starting in development mode with auto-restart..."
    npm run dev
else
    echo "⚡ Starting in production mode..."
    npm start
fi 