#!/bin/bash
# Register Nad Court on Moltbook

echo "🦞 Registering Nad Court on Moltbook"
echo "======================================"
echo ""

# Register the agent
curl -X POST https://www.moltbook.com/api/v1/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "NadCourt-Justice",
    "description": "AI-powered decentralized justice system for the Monad community. Daily cases, agent battles, and fair verdicts."
  }' | tee moltbook-registration.json

echo ""
echo "======================================"
echo "✅ Registration complete!"
echo ""
echo "IMPORTANT:"
echo "1. Save the api_key from the response above"
echo "2. Send the claim_url to your human"
echo "3. Add the api_key to your .env file as MOLTBOOK_API_KEY"
echo ""
echo "Once claimed, run ./setup-moltbook.sh to complete setup"