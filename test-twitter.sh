#!/bin/bash
# Test Twitter API credentials

echo "🐦 Testing Twitter API Credentials"
echo "===================================="
echo ""

# Load .env
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
else
    echo "❌ .env file not found!"
    echo "Create .env file first with your Twitter credentials"
    exit 1
fi

# Check if Bearer Token exists
if [ -z "$TWITTER_BEARER_TOKEN" ]; then
    echo "❌ TWITTER_BEARER_TOKEN not found in .env"
    exit 1
fi

echo "✅ Bearer Token found"
echo ""
echo "Testing API connection..."
echo ""

# Test 1: Get my user info (validates token)
echo "Test 1: Getting user info..."
curl -s -X GET "https://api.twitter.com/2/users/me" \
  -H "Authorization: Bearer $TWITTER_BEARER_TOKEN" | head -20

echo ""
echo ""

# Test 2: Post a test tweet (if write access)
echo "Test 2: Posting test tweet..."
echo "(This will actually post to your timeline!)"
echo ""
read -p "Do you want to post a test tweet? (y/n): " confirm

if [ "$confirm" = "y" ]; then
    curl -X POST "https://api.twitter.com/2/tweets" \
      -H "Authorization: Bearer $TWITTER_BEARER_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "text": "⚖️ Nad Court is now live!\n\nDecentralized community justice for @monad_xyz 🏛️\n\nCase #1: Bitlover082 vs 0xCoha\n\nVote now 👇\nhttps://nad-court.vercel.app"
      }'
    
    echo ""
    echo ""
    echo "✅ Test tweet posted! Check your Twitter."
else
    echo "Skipped test tweet."
fi

echo ""
echo "===================================="
echo "✅ Twitter API test complete!"
echo ""
echo "If you see JSON output above, your credentials work!"
echo "If you see errors, check your Bearer Token."