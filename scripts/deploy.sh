#!/bin/bash

set -e  # Exit on any error

echo "🚀 Deploying Next.js application..."

# Build the application
echo "🏗️  Building for production..."
./scripts/build.sh

# Deploy to GitHub Pages (static export)
echo "📤 Preparing static export for GitHub Pages..."

# Add export configuration to next.config.ts if not present
if ! grep -q "output.*export" next.config.ts 2>/dev/null; then
    echo "⚠️  Note: For GitHub Pages deployment, consider adding 'output: \"export\"' to next.config.ts"
fi

# Check if 'out' directory exists (created by next export)
if [ -d "out" ]; then
    echo "📁 Static files generated in 'out' directory"
    echo "💡 To deploy to GitHub Pages:"
    echo "   1. Enable GitHub Pages in repository settings"
    echo "   2. Set source to 'GitHub Actions' or upload 'out' directory contents"
    echo "   3. For automatic deployment, consider using GitHub Actions workflow"
else
    echo "⚠️  No 'out' directory found. Static export may not be configured."
    echo "💡 Add 'output: \"export\"' to next.config.ts for static site generation"
fi

# Alternative deployment options
echo ""
echo "🌐 Deployment options:"
echo "   • Vercel: npm i -g vercel && vercel"
echo "   • Netlify: npm i -g netlify-cli && netlify deploy"
echo "   • GitHub Pages: Configure static export and use GitHub Actions"

echo "✅ Deployment preparation completed!"
