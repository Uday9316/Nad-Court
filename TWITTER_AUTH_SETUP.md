# Twitter/X OAuth 2.0 Setup Guide for Nad Court

## Step 1: Create Project in Developer Portal

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Click **"Create Project"**
3. Project Name: `Nad Court`
4. Use Case: **"Making a bot"** or **"Other"**
5. Description: "Decentralized community justice system for Monad"
6. Click **"Next"** and complete setup

## Step 2: Create App Within Project

1. In your project, click **"Create App"**
2. App Name: `Nad-Court` (or unique name)
3. You'll get your API Keys - SAVE THESE!
   - API Key (Consumer Key)
   - API Secret (Consumer Secret)
   - Bearer Token

## Step 3: Setup OAuth 2.0 Authentication

1. Go to your app settings
2. Click **"Edit"** next to **"Authentication"**
3. Turn ON **"OAuth 2.0"**
4. Set **App Permission** to: **"Read and Write"**
5. Set **Type of App** to: **"Web App, Automated App or Bot"**

## Step 4: Configure Callback URLs

Add these callback URLs:
```
https://nad-court.vercel.app/callback
http://localhost:3000/callback
```

Website URL:
```
https://nad-court.vercel.app
```

## Step 5: Get Client ID and Secret

After saving, you'll see:
- **Client ID** (for OAuth 2.0)
- **Client Secret** (for OAuth 2.0)

Save these with your API keys!

## Step 6: Create .env File

Create `/home/ubuntu/.openclaw/workspace/AGENT_COURT_COMPLETE/.env`:

```bash
# Twitter API v2 Keys
TWITTER_API_KEY=PD2OCKVda6qtpPpwMf276npar
TWITTER_API_SECRET=unegbJq74qaUsFJ0tgSPOzXemiakw89449SNZlTZ9hG4JDq53J
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAGr67QEAAAAAetvPHiiRAs1RqagQbto8rWxyzXs%3Dgh7ekKfaXSc9wZUUBpkhGSXE6kn8VjkAcIyqiFvfNuCWZcp3I9

# OAuth 2.0 (Get these from Step 5)
TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here

# Contract
CONTRACT_ADDRESS=0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458
RPC_URL=https://rpc.monad.xyz
```

## Step 7: Update Bot Code

Replace `bot/twitter.js` with OAuth 2.0 version:

```javascript
// OAuth 2.0 Authentication
const CLIENT_ID = process.env.TWITTER_CLIENT_ID
const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET

// Get access token (run this once to authenticate)
async function getAccessToken() {
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials'
    })
  })
  
  const data = await response.json()
  return data.access_token
}

// Post tweet with OAuth 2.0
async function postTweet(text) {
  const token = await getAccessToken()
  
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  })
  
  return await response.json()
}
```

## Step 8: Generate Access Token

Run this to get your access token:

```bash
cd /home/ubuntu/.openclaw/workspace/AGENT_COURT_COMPLETE
npm install  # Install dependencies
node -e "
const authUrl = 'https://twitter.com/i/oauth2/authorize' +
  '?response_type=code' +
  '&client_id=' + process.env.TWITTER_CLIENT_ID +
  '&redirect_uri=https://nad-court.vercel.app/callback' +
  '&scope=tweet.read tweet.write users.read' +
  '&state=state123' +
  '&code_challenge=challenge' +
  '&code_challenge_method=plain'

console.log('Visit this URL to authorize:')
console.log(authUrl)
"
```

## Step 9: User Access Token (For Posting as @YourAccount)

### Option A: User Authentication Flow

1. User visits authorization URL
2. Grants permission
3. Twitter redirects to your callback with `code`
4. Exchange code for access token

### Option B: Simple Approach (Bot Account)

Create a separate Twitter account just for the bot:
1. Create @NadCourtBot
2. Use that account's credentials
3. Use Bearer Token for simple posting

## Quick Start (Bearer Token - Already Works!)

Your current Bearer Token should work for simple posting:

```bash
# Test it
curl -X POST https://api.twitter.com/2/tweets \
  -H "Authorization: Bearer AAAAAAAAAAAAAAAAAAAAAGr67QEAAAAAetvPHiiRAs1RqagQbto8rWxyzXs%3Dgh7ekKfaXSc9wZUUBpkhGSXE6kn8VjkAcIyqiFvfNuCWZcp3I9" \
  -H "Content-Type: application/json" \
  -d '{"text":"⚖️ Test tweet from Nad Court"}'
```

## Troubleshooting

**Error 403: Forbidden**
- Your app needs "Elevated" access level
- Apply at: https://developer.twitter.com/en/portal/products/elevated

**Error 401: Unauthorized**
- Check Bearer Token is correct
- Token may have expired, regenerate

**Callback URL Error**
- Must match exactly (including http vs https)
- No trailing slashes

## Need Help?

Twitter API Docs: https://developer.twitter.com/en/docs/twitter-api

## Summary Checklist

- [ ] Created Project in Developer Portal
- [ ] Created App with unique name
- [ ] Saved API Key, Secret, Bearer Token
- [ ] Enabled OAuth 2.0 with "Read and Write"
- [ ] Added callback URLs
- [ ] Created .env file with all credentials
- [ ] Tested with curl command above
- [ ] Applied for Elevated access (if needed)