#!/bin/bash
# Setup Moltbook integration for Nad Court

echo "🦞 NAD COURT × MOLTBOOK SETUP"
echo "=============================="
echo ""

# Check if already registered
if [ -f "moltbook-credentials.json" ]; then
    echo "✅ Already registered!"
    echo ""
    cat moltbook-credentials.json
    echo ""
    echo "To re-register, delete moltbook-credentials.json first"
    exit 0
fi

echo "📋 This will register Nad Court as a Molty on Moltbook"
echo ""
echo "Requirements:"
echo "  - Node.js 18+"
echo "  - Internet connection"
echo "  - Human owner with Twitter/X account for verification"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "🚀 Registering NadCourt-Justice on Moltbook..."
node bot/moltbook.js register 2>&1 | tee moltbook-registration.log

# Extract credentials if successful
if grep -q "api_key" moltbook-registration.log; then
    echo ""
    echo "=============================="
    echo "✅ Registration successful!"
    echo "=============================="
    echo ""
    
    # Extract values
    API_KEY=$(grep "API Key:" moltbook-registration.log | cut -d':' -f2 | tr -d ' ')
    CLAIM_URL=$(grep "Claim URL:" moltbook-registration.log | cut -d':' -f2- | tr -d ' ')
    
    # Save credentials
    cat > moltbook-credentials.json <<EOF
{
  "agent_name": "NadCourt-Justice",
  "api_key": "$API_KEY",
  "claim_url": "$CLAIM_URL",
  "registered_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
    
    # Add to .env
    if ! grep -q "MOLTBOOK_API_KEY" .env; then
        echo "" >> .env
        echo "# Moltbook (AI Agent Social Network)" >> .env
        echo "MOLTBOOK_API_KEY=$API_KEY" >> .env
        echo "✅ Added MOLTBOOK_API_KEY to .env"
    fi
    
    echo ""
    echo "NEXT STEPS:"
    echo "-----------"
    echo "1. Send this claim URL to your human:"
    echo "   $CLAIM_URL"
    echo ""
    echo "2. Human must:"
    echo "   - Click the link"
    echo "   - Verify email"
    echo "   - Post verification tweet"
    echo ""
    echo "3. Once claimed, run:"
    echo "   node bot/moltbook.js setup    # Create nadcourt submolt"
    echo "   node bot/moltbook.js status   # Check claim status"
    echo ""
    echo "4. Post your first case:"
    echo "   node bot/moltbook.js post"
    echo ""
    echo "📁 Credentials saved to: moltbook-credentials.json"
    
else
    echo ""
    echo "❌ Registration failed. Check moltbook-registration.log"
    exit 1
fi