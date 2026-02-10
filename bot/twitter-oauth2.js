// Twitter/X Bot with OAuth 2.0
// Posts daily cases from Nad Court

import dotenv from 'dotenv'
import { getTodayCase } from './data/cases.js'

dotenv.config()

const CLIENT_ID = process.env.TWITTER_CLIENT_ID
const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET

// Store access token (in production, use Redis/database)
let accessToken = null
let tokenExpiry = null

// Get OAuth 2.0 access token using Client Credentials flow
async function getAccessToken() {
  // Check if we have a valid token
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken
  }

  try {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token request failed: ${error}`)
    }

    const data = await response.json()
    accessToken = data.access_token
    // Set expiry 5 minutes before actual expiration
    tokenExpiry = Date.now() + ((data.expires_in - 300) * 1000)
    
    console.log('✅ OAuth 2.0 token obtained')
    return accessToken
  } catch (error) {
    console.error('❌ Failed to get access token:', error)
    throw error
  }
}

// Post a tweet
async function postTweet(text) {
  const token = await getAccessToken()
  
  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(JSON.stringify(error))
    }

    const data = await response.json()
    console.log('✅ Tweet posted:', data.data.id)
    return data
  } catch (error) {
    console.error('❌ Failed to post tweet:', error)
    throw error
  }
}

// Format case for Twitter
function formatCaseTweet(case_) {
  const lines = [
    `⚖️ NAD COURT - DAY ${case_.day}`,
    ``,
    `Case: ${case_.id}`,
    `Type: ${case_.type}`,
    ``,
    `Plaintiff: @${case_.plaintiff.username}`,
    `VS`,
    `Defendant: @${case_.defendant.username}`,
    ``,
    `📋 ${case_.summary.slice(0, 90)}...`,
    ``,
    `🗳️ Cast your vote:`,
    `https://nad-court.vercel.app`,
    ``,
    `#Monad #NadCourt #CommunityJustice`
  ]
  
  return lines.join('\n')
}

// Post today's case
export async function postTodaysCase() {
  try {
    const todayCase = getTodayCase()
    console.log('📢 Posting today\'s case...')
    console.log('Case:', todayCase.id)
    
    const tweetText = formatCaseTweet(todayCase)
    const result = await postTweet(tweetText)
    
    console.log('✅ Success! Tweet ID:', result.data.id)
    console.log('🔗 https://twitter.com/i/web/status/' + result.data.id)
    
    return result
  } catch (error) {
    console.error('❌ Error posting case:', error)
    throw error
  }
}

// Post verdict
export async function postVerdict(caseId, winner, verdict) {
  const tweet = [
    `⚖️ NAD COURT - VERDICT`,
    ``,
    `Case ${caseId}: ${verdict}`,
    ``,
    `Winner: @${winner}`,
    ``,
    `Full details: https://nad-court.vercel.app`,
    ``,
    `#Monad #Verdict #NadCourt`
  ].join('\n')
  
  return await postTweet(tweet)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🐦 Nad Court Twitter Bot')
  console.log('========================\n')
  
  postTodaysCase()
    .then(() => {
      console.log('\n✅ Done!')
      process.exit(0)
    })
    .catch(err => {
      console.error('\n❌ Failed:', err.message)
      process.exit(1)
    })
}