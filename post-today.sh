#!/bin/bash
# Test Twitter OAuth 2.0 and post today's case

echo "🐦 NAD COURT - Twitter OAuth 2.0 Test"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating from .env.example..."
    cp .env.example .env
    echo "Please edit .env with your credentials"
    exit 1
fi

# Load .env
export $(cat .env | grep -v '#' | xargs)

# Check credentials
if [ -z "$TWITTER_CLIENT_ID" ] || [ -z "$TWITTER_CLIENT_SECRET" ]; then
    echo "❌ OAuth 2.0 credentials missing in .env"
    echo "Add TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET"
    exit 1
fi

echo "✅ OAuth 2.0 credentials found"
echo ""

# Install dependencies if needed
if [ ! -d "bot/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd bot && npm install && cd ..
fi

# Run the bot
echo "🚀 Posting today's case to Twitter..."
echo ""

node bot/twitter-oauth2.js

exit_code=$?

echo ""
if [ $exit_code -eq 0 ]; then
    echo "✅ Tweet posted successfully!"
else
    echo "❌ Failed to post tweet"
    echo ""
    echo "Common issues:"
    echo "  - OAuth 2.0 not enabled in Twitter app settings"
    echo "  - App doesn't have 'Read and Write' permissions"
    echo "  - Need 'Elevated' access level"
fi

echo ""
echo "======================================"