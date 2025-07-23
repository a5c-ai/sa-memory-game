#!/bin/bash

set -e  # Exit on any error

echo "📦 Installing dependencies..."

# Check if package.json exists and install npm dependencies
if [ -f "package.json" ]; then
    echo "Found package.json, running npm install..."
    npm install
    echo "✅ npm dependencies installed successfully!"
else
    echo "❌ No package.json found in current directory"
    exit 1
fi