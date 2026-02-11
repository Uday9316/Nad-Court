// Moltbook Integration for Nad Court
// Auto-post daily cases and engage with AI agent community

import dotenv from 'dotenv'
dotenv.config()

const API_KEY = process.env.MOLTBOOK_API_KEY
const BASE_URL = 'https://www.moltbook.com/api/v1'

// Check auth
function checkAuth() {
  if (!API_KEY) {
    console.error('❌ MOLTBOOK_API_KEY not found in .env')
    return false
  }
  return true
}

function getHeaders() {
  return {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
}

// Register Nad Court as a Molty (run once)
export async function registerAgent() {
  try {
    const response = await fetch(`${BASE_URL}/agents/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'NadCourt-Justice',
        description: 'AI-powered decentralized justice system for the Monad community. Daily agent battles, fair verdicts, community governance. 🤖⚖️🦞'
      })
    })
    
    const data = await response.json()
    
    if (data.agent?.api_key) {
      console.log('✅ Registered successfully!')
      console.log('🔑 API Key:', data.agent.api_key)
      console.log('🔗 Claim URL:', data.agent.claim_url)
      console.log('📝 Verification Code:', data.agent.verification_code)
      console.log('\n⚠️  SAVE THIS API KEY TO .env AS MOLTBOOK_API_KEY')
      return data.agent
    }
    
    console.error('❌ Registration failed:', data)
    return null
  } catch (error) {
    console.error('❌ Registration error:', error.message)
    return null
  }
}

// Check if agent is claimed
export async function checkStatus() {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(`${BASE_URL}/agents/status`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    })
    const data = await response.json()
    console.log('📊 Status:', data.status)
    return data
  } catch (error) {
    console.error('❌ Status check failed:', error.message)
    return null
  }
}

// Post daily case to nadcourt submolt
export async function postDailyCase(caseData, battleResult = null) {
  if (!checkAuth()) return null
  
  let title, content
  
  if (battleResult) {
    // Post verdict
    title = `⚖️ VERDICT: ${caseData.id} - ${battleResult.winner} Wins!`
    content = `🏆 **${battleResult.winner}** defeats ${battleResult.loser}!

📊 Final Score: ${battleResult.plaintiffHP} - ${battleResult.defendantHP}
⚔️ Total Moves: ${battleResult.totalMoves}
💥 Highest Damage: ${battleResult.maxDamage}

The battle has concluded. Justice served. 🤖⚖️

View full battle: https://nad-court.vercel.app/arena/${caseData.id}`
  } else {
    // Post new case
    title = `⚔️ NEW CASE: ${caseData.id} - ${caseData.type}`
    content = `**${caseData.plaintiff.username}** vs **${caseData.defendant.username}**

${caseData.summary}

🤖 Agents preparing for battle...
⚖️ Justice will be served in 24h

Follow this case: https://nad-court.vercel.app/case/${caseData.id}`
  }
  
  try {
    const response = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        submolt: 'nadcourt',
        title: title,
        content: content,
        url: `https://nad-court.vercel.app/case/${caseData.id}`
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Posted to Moltbook:', data.id || 'success')
      return data
    }
    
    console.error('❌ Post failed:', data)
    return null
  } catch (error) {
    console.error('❌ Post error:', error.message)
    return null
  }
}

// Create nadcourt submolt
export async function createSubmolt() {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(`${BASE_URL}/submolts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: 'nadcourt',
        display_name: 'Nad Court',
        description: 'AI-powered decentralized justice system. Daily agent battles, fair verdicts, community governance. 🤖⚖️',
        emoji: '⚖️'
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Created submolt: m/nadcourt')
      return data
    }
    
    // May already exist
    console.log('ℹ️ Submolt may already exist:', data)
    return null
  } catch (error) {
    console.error('❌ Create submolt error:', error.message)
    return null
  }
}

// Check feed and engage
export async function checkFeed(limit = 10) {
  if (!checkAuth()) return []
  
  try {
    const response = await fetch(
      `${BASE_URL}/submolts/nadcourt/feed?sort=new&limit=${limit}`,
      { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    )
    
    const posts = await response.json()
    console.log(`📰 Found ${posts.length || 0} posts in nadcourt`)
    return posts || []
  } catch (error) {
    console.error('❌ Feed check failed:', error.message)
    return []
  }
}

// Upvote a post
export async function upvotePost(postId) {
  if (!checkAuth()) return
  
  try {
    await fetch(`${BASE_URL}/posts/${postId}/upvote`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    })
    console.log('👍 Upvoted:', postId)
  } catch (error) {
    console.error('❌ Upvote failed:', error.message)
  }
}

// Comment on a post
export async function commentOnPost(postId, content) {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content })
    })
    
    const data = await response.json()
    console.log('💬 Commented on:', postId)
    return data
  } catch (error) {
    console.error('❌ Comment failed:', error.message)
    return null
  }
}

// Heartbeat - periodic engagement
export async function heartbeat() {
  console.log('💓 Moltbook Heartbeat')
  
  // Check status
  const status = await checkStatus()
  if (!status || status.status !== 'claimed') {
    console.log('⏳ Waiting for human to claim agent...')
    return { action: 'waiting_for_claim' }
  }
  
  // Check feed
  const posts = await checkFeed(5)
  
  // Engage with community (upvote relevant posts)
  for (const post of posts.slice(0, 3)) {
    if (!post.upvoted && Math.random() > 0.5) {
      await upvotePost(post.id)
    }
  }
  
  console.log('✅ Heartbeat complete')
  return { action: 'engaged', postsChecked: posts.length }
}

// Get profile
export async function getProfile() {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(`${BASE_URL}/agents/me`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    })
    
    const data = await response.json()
    return data.agent || null
  } catch (error) {
    console.error('❌ Profile fetch failed:', error.message)
    return null
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2]
  
  switch(command) {
    case 'register':
      registerAgent()
      break
    case 'status':
      checkStatus().then(s => console.log(s))
      break
    case 'setup':
      createSubmolt()
      break
    case 'post':
      // Import case data and post
      import('../frontend/src/data/cases.js').then(({ getTodayCase }) => {
        postDailyCase(getTodayCase())
      })
      break
    case 'feed':
      checkFeed().then(posts => console.log(JSON.stringify(posts, null, 2)))
      break
    case 'heartbeat':
      heartbeat()
      break
    case 'profile':
      getProfile().then(p => console.log(JSON.stringify(p, null, 2)))
      break
    default:
      console.log('Usage: node moltbook.js [register|status|setup|post|feed|heartbeat|profile]')
  }
}