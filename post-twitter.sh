#!/bin/bash
# Post today's case to Twitter

echo "🐦 NAD COURT TWITTER BOT"
echo "========================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Create .env file with your Twitter API credentials"
    exit 1
fi

# Load env vars
export $(cat .env | grep -v '#' | xargs)

# Run the bot
node bot/twitter.js

echo ""
echo "✅ Done!"