#!/bin/bash

# Start ChromaDB server and Node.js backend
echo "🚀 Starting TalkAI Services..."

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping services..."
    kill $CHROMA_PID $NODE_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start ChromaDB server
echo "📊 Starting ChromaDB server..."
cd chroma
python3 run_chroma.py &
CHROMA_PID=$!
cd ..

# Wait a moment for ChromaDB to start
sleep 3

# Start Node.js backend
echo "🤖 Starting Node.js backend..."
cd backend
npm run dev &
NODE_PID=$!
cd ..

echo "✅ All services started!"
echo "📊 ChromaDB: http://localhost:8000"
echo "🤖 Backend: http://localhost:3000"
echo "Press Ctrl+C to stop all services"

# Wait for both processes
wait 