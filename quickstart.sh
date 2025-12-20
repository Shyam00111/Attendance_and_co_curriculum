#!/bin/bash
# 🚀 EduTrack - Quick Start Script

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          🎓 EduTrack - Quick Start Guide 🎓               ║"
echo "║     Attendance & Co-Curriculum Management System          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Ask user what to do
echo "What would you like to do?"
echo "1) Start Backend"
echo "2) Start Frontend"
echo "3) Start Both (requires 2 terminals)"
echo "4) Fresh Install (npm install for both)"
echo "5) Setup MongoDB"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Starting Backend..."
        cd backend
        if [ ! -d "node_modules" ]; then
            echo "Installing dependencies..."
            npm install
        fi
        npm start
        ;;
    2)
        echo "🚀 Starting Frontend..."
        cd frontend
        if [ ! -d "node_modules" ]; then
            echo "Installing dependencies..."
            npm install
        fi
        npm run dev
        ;;
    3)
        echo "🚀 Starting Both Backend and Frontend..."
        echo "Opening in two terminal windows..."
        gnome-terminal -- bash -c "cd backend && npm start; bash" &
        sleep 2
        gnome-terminal -- bash -c "cd frontend && npm run dev; bash" &
        ;;
    4)
        echo "📦 Installing dependencies..."
        echo "Backend..."
        cd backend
        npm install
        echo "Frontend..."
        cd ../frontend
        npm install
        echo "✅ Dependencies installed!"
        ;;
    5)
        echo "📦 MongoDB Setup Instructions:"
        echo ""
        echo "Option A: Local MongoDB"
        echo "1. Download from https://www.mongodb.com/try/download/community"
        echo "2. Install and start MongoDB service"
        echo "3. MongoDB will run on mongodb://localhost:27017"
        echo ""
        echo "Option B: MongoDB Atlas (Cloud) - RECOMMENDED"
        echo "1. Go to https://www.mongodb.com/cloud/atlas"
        echo "2. Create free account"
        echo "3. Create cluster"
        echo "4. Get connection string"
        echo "5. Update MONGO_URI in backend/.env"
        echo ""
        echo "Example MONGO_URI:"
        echo "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dbname"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
