#!/bin/bash

set -e  # Exit on any error

echo "🛠️  Setting up development environment..."

# Install dependencies
echo "📦 Installing dependencies..."
./scripts/install.sh

# Verify Node.js and npm versions
echo "🔍 Verifying environment..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Check if Next.js project is properly configured
if [ -f "next.config.ts" ]; then
    echo "✅ Next.js configuration found"
fi

if [ -f "tsconfig.json" ]; then
    echo "✅ TypeScript configuration found"
fi

if [ -f "tailwind.config.ts" ] || [ -f "postcss.config.mjs" ]; then
    echo "✅ Tailwind CSS configuration found"
fi

echo "🎉 Development environment setup completed!"
echo "💡 Run './scripts/dev-run.sh' to start the development server"
