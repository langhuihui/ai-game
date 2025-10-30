#!/bin/bash
# Quick start script for Matrix Game Server

cd "$(dirname "$0")"

echo "🎮 Starting Matrix Game Server..."
echo ""

# Check if dist exists
if [ ! -d "dist" ]; then
  echo "❌ dist/ directory not found. Running build first..."
  npm run build
fi

echo "🚀 Launching server..."
echo ""
npm start

