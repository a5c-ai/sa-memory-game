#!/bin/bash

set -e  # Exit on any error

echo "🔧 Installing dependencies..."
./scripts/install.sh

echo "🏗️  Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"