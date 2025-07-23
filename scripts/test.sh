#!/bin/bash

set -e  # Exit on any error

echo "🧪 Running tests for Next.js application..."

# Build the application first
echo "🏗️  Building application..."
./scripts/build.sh

# Run linting
echo "🔍 Running ESLint..."
npm run lint

# Check if there are test files or test scripts
echo "🔍 Checking for test configuration..."

if grep -q '"test":' package.json; then
    echo "📋 Running unit tests..."
    npm run test
else
    echo "⚠️  No test script found in package.json"
    echo "💡 Consider adding a test script and testing framework (e.g., Jest, Vitest)"
fi

# Check for common test directories/files
if [ -d "__tests__" ] || [ -d "tests" ] || find . -name "*.test.*" -o -name "*.spec.*" | grep -q .; then
    echo "📁 Test files found in project"
else
    echo "📝 No test files found. Consider adding tests for better code quality."
fi

echo "✅ Test checks completed!"