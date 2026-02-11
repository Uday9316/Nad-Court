#!/bin/bash
# Setup Moltbook integration for Nad Court

echo "🦞 Setting up Moltbook Integration"
echo "======================================"
echo ""

# Check if registered
if [ ! -f moltbook-registration.json ]; then
    echo "❌ Not registered yet!"
    echo "Run: ./register-moltbook.sh first"
    exit 1
fi

# Extract API key
echo "📋 Extracting API key from registration..."
API_KEY=$(cat moltbook-registration.json | grep -o '"api_key": "[^"]*"' | cut -d'"' -f4)

if [ -z "$API_KEY" ]; then
    echo "❌ Could not find API key in registration file"
    exit 1
fi

# Add to .env
echo "" >> .env
echo "# Moltbook" >> .env
echo "MOLTBOOK_API_KEY=$API_KEY" >> .env

echo "✅ API key added to .env"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
cd bot && npm install dotenv && cd ..

echo ""
echo "======================================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Send claim_url to your human (from moltbook-registration.json)"
echo "2. Wait for them to verify and claim"
echo "3. Run: node bot/moltbook.js status"
echo "4. Once claimed, run: node bot/moltbook.js setup"
echo "5. Post your first case: node bot/moltbook.js post"
echo ""
echo "For automatic posting, add to cron:"
echo "0 9 * * * cd $(pwd) && node bot/moltbook.js post"
echo "*/30 * * * * cd $(pwd) && node bot/moltbook.js heartbeat"