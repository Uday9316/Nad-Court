// Moltbook Integration for Nad Court
// Auto-post daily cases and engage with community

import dotenv from 'dotenv'
dotenv.config()

const API_KEY = process.env.MOLTBOOK_API_KEY
const BASE_URL = 'https://www.moltbook.com/api/v1'

// Check if API key is configured
function checkAuth() {
  if (!API_KEY) {
    console.error('❌ MOLTBOOK_API_KEY not found in .env')
    console.log('1. Run: ./register-moltbook.sh')
    console.log('2. Save api_key to .env as MOLTBOOK_API_KEY')
    return false
  }
  return true
}

// Get authorization headers
function getHeaders() {
  return {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
}

// Check agent status
export async function checkStatus() {
  try {
    const response = await fetch(`${BASE_URL}/agents/status`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    })
    return await response.json()
  } catch (error) {
    console.error('Failed to check status:', error)
    return null
  }
}

// Post daily case to Moltbook
export async function postDailyCase(caseData, winner = null) {
  if (!checkAuth()) return
  
  const title = winner 
    ? `⚖️ VERDICT: ${caseData.id} - ${winner.agent} wins!`
    : `⚖️ NEW CASE: ${caseData.id} - ${caseData.type}`
  
  const content = winner
    ? `${winner.agent} (representing ${winner.person.username}) wins the case!\n\nFinal HP: ${winner.finalStats}\n\nThe battle has concluded. ⚔️`
    : `**${caseData.plaintiff.username}** vs **${caseData.defendant.username}**\n\nType: ${caseData.type}\n\nThe agents are preparing for battle...\n\n🤖 JusticeBot-Alpha vs 🦾 GuardianBot-Omega`

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
    console.log('✅ Posted to Moltbook:', data.id || data)
    return data
  } catch (error) {
    console.error('❌ Failed to post:', error)
    return null
  }
}

// Comment on a post
export async function commentOnPost(postId, content) {
  if (!checkAuth()) return
  
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content })
    })
    return await response.json()
  } catch (error) {
    console.error('Failed to comment:', error)
    return null
  }
}

// Get feed and engage
export async function checkFeed() {
  if (!checkAuth()) return
  
  try {
    // Get posts from nadcourt submolt
    const response = await fetch(
      `${BASE_URL}/submolts/nadcourt/feed?sort=new&limit=10`,
      { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    )
    
    const posts = await response.json()
    console.log(`📰 Found ${posts.length} posts in nadcourt`)
    
    // Look for posts to engage with
    for (const post of posts.slice(0, 3)) {
      // Simple engagement logic
      if (!post.upvoted && Math.random() > 0.5) {
        await upvotePost(post.id)
      }
    }
    
    return posts
  } catch (error) {
    console.error('Failed to check feed:', error)
    return []
  }
}

// Upvote a post
export async function upvotePost(postId) {
  try {
    await fetch(`${BASE_URL}/posts/${postId}/upvote`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    })
    console.log('👍 Upvoted post:', postId)
  } catch (error) {
    console.error('Failed to upvote:', error)
  }
}

// Create nadcourt submolt if it doesn't exist
export async function createSubmolt() {
  if (!checkAuth()) return
  
  try {
    const response = await fetch(`${BASE_URL}/submolts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: 'nadcourt',
        display_name: 'Nad Court',
        description: 'AI-powered decentralized justice system. Daily agent battles, fair verdicts, community governance.',
        emoji: '⚖️'
      })
    })
    
    const data = await response.json()
    console.log('✅ Submolt created:', data)
    return data
  } catch (error) {
    // Submolt might already exist
    console.log('Submolt may already exist:', error.message)
    return null
  }
}

// Heartbeat - check Moltbook every 30 min
export async function heartbeat() {
  console.log('💓 Moltbook Heartbeat')
  
  // Check status
  const status = await checkStatus()
  if (!status || status.status !== 'claimed') {
    console.log('⏳ Waiting for human to claim agent...')
    return
  }
  
  // Check feed and engage
  await checkFeed()
  
  console.log('✅ Heartbeat complete')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2]
  
  switch(command) {
    case 'status':
      checkStatus().then(s => console.log('Status:', s))
      break
    case 'post':
      // Import case and post it
      import('./data/agents.js').then(({ ACTIVE_CASE }) => {
        postDailyCase(ACTIVE_CASE)
      })
      break
    case 'feed':
      checkFeed()
      break
    case 'setup':
      createSubmolt()
      break
    case 'heartbeat':
      heartbeat()
      break
    default:
      console.log('Usage: node moltbook.js [status|post|feed|setup|heartbeat]')
  }
}