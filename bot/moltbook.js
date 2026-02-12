// Moltbook Integration for Nad Court
// Auto-post daily cases and engage with AI agent community
// API Docs: https://www.moltbook.com/skill.md

const API_KEY = process.env.MOLTBOOK_API_KEY
const BASE_URL = 'https://www.moltbook.com/api/v1'

// ⚠️ CRITICAL: Never send API key to any domain other than www.moltbook.com

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
export async function commentOnPost(postId, content, parentId = null) {
  if (!checkAuth()) return null
  
  try {
    const body = { content }
    if (parentId) body.parent_id = parentId
    
    const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    console.log(parentId ? '💬 Replied to comment' : '💬 Commented on post:', postId)
    return data
  } catch (error) {
    console.error('❌ Comment failed:', error.message)
    return null
  }
}

// Get comments on a post
export async function getComments(postId, sort = 'top') {
  if (!checkAuth()) return []
  
  try {
    const response = await fetch(
      `${BASE_URL}/posts/${postId}/comments?sort=${sort}`,
      { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    )
    
    const comments = await response.json()
    return comments || []
  } catch (error) {
    console.error('❌ Get comments failed:', error.message)
    return []
  }
}

// Upvote a comment
export async function upvoteComment(commentId) {
  if (!checkAuth()) return
  
  try {
    await fetch(`${BASE_URL}/comments/${commentId}/upvote`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    })
    console.log('👍 Upvoted comment:', commentId)
  } catch (error) {
    console.error('❌ Upvote comment failed:', error.message)
  }
}

// Downvote a post
export async function downvotePost(postId) {
  if (!checkAuth()) return
  
  try {
    await fetch(`${BASE_URL}/posts/${postId}/downvote`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    })
    console.log('👎 Downvoted:', postId)
  } catch (error) {
    console.error('❌ Downvote failed:', error.message)
  }
}

// Delete a post
export async function deletePost(postId) {
  if (!checkAuth()) return
  
  try {
    await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    })
    console.log('🗑️ Deleted post:', postId)
  } catch (error) {
    console.error('❌ Delete post failed:', error.message)
  }
}

// Heartbeat - periodic engagement
// Run this every 30 minutes to stay active in the community
export async function heartbeat() {
  console.log('💓 Moltbook Heartbeat - Staying engaged with the community! 🦞')
  
  // Check status
  const status = await checkStatus()
  if (!status || status.status !== 'claimed') {
    console.log('⏳ Waiting for human to claim agent...')
    console.log('   Share the claim_url with your human!')
    return { action: 'waiting_for_claim' }
  }
  
  // Get profile
  const profile = await getProfile()
  console.log(`🤖 Active as: ${profile?.name || 'NadCourt-Justice'}`)
  
  // Check nadcourt feed
  const posts = await checkFeed(10)
  console.log(`📰 Checking ${posts.length} posts in m/nadcourt`)
  
  let actions = []
  
  // Engage with community
  for (const post of posts) {
    // Upvote interesting posts (not our own)
    if (!post.upvoted && post.author !== profile?.name && Math.random() > 0.3) {
      await upvotePost(post.id)
      actions.push(`upvoted:${post.id}`)
    }
    
    // Comment on active discussions
    if (post.comment_count > 2 && post.comment_count < 20 && Math.random() > 0.7) {
      const comments = await getComments(post.id, 'top')
      if (comments.length > 0) {
        // Reply to top comment
        await commentOnPost(post.id, 'Interesting perspective! The evidence here is compelling. ⚖️', comments[0].id)
        actions.push(`replied:${post.id}`)
      }
    }
  }
  
  console.log('✅ Heartbeat complete!')
  console.log(`   Actions: ${actions.length > 0 ? actions.join(', ') : 'none this round'}`)
  console.log('   Next check: in 30 minutes')
  
  return { 
    action: 'engaged', 
    postsChecked: posts.length,
    actionsTaken: actions,
    timestamp: new Date().toISOString()
  }
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

// Semantic Search - AI-powered search by meaning
export async function searchMoltbook(query, type = 'all', limit = 20) {
  if (!checkAuth()) return []
  
  try {
    const response = await fetch(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`,
      { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    )
    
    const data = await response.json()
    console.log(`🔍 Search: "${query}" - ${data.results?.length || 0} results`)
    return data.results || []
  } catch (error) {
    console.error('❌ Search failed:', error.message)
    return []
  }
}

// Get submolt info
export async function getSubmoltInfo(submoltName) {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(
      `${BASE_URL}/submolts/${submoltName}`,
      { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    )
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('❌ Get submolt info failed:', error.message)
    return null
  }
}

// Subscribe to a submolt
export async function subscribeToSubmolt(submoltName) {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(`${BASE_URL}/submolts/${submoltName}/subscribe`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    })
    
    const data = await response.json()
    console.log('✅ Subscribed to m/' + submoltName)
    return data
  } catch (error) {
    console.error('❌ Subscribe failed:', error.message)
    return null
  }
}

// Unsubscribe from a submolt
export async function unsubscribeFromSubmolt(submoltName) {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(`${BASE_URL}/submolts/${submoltName}/subscribe`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    })
    
    const data = await response.json()
    console.log('✅ Unsubscribed from m/' + submoltName)
    return data
  } catch (error) {
    console.error('❌ Unsubscribe failed:', error.message)
    return null
  }
}

// Follow another molty (BE SELECTIVE!)
export async function followMolty(moltyName) {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(`${BASE_URL}/agents/${moltyName}/follow`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    })
    
    const data = await response.json()
    console.log('✅ Following ' + moltyName)
    return data
  } catch (error) {
    console.error('❌ Follow failed:', error.message)
    return null
  }
}

// Unfollow a molty
export async function unfollowMolty(moltyName) {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(`${BASE_URL}/agents/${moltyName}/follow`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    })
    
    const data = await response.json()
    console.log('✅ Unfollowed ' + moltyName)
    return data
  } catch (error) {
    console.error('❌ Unfollow failed:', error.message)
    return null
  }
}

// Get personalized feed (from followed submolts/moltys)
export async function getPersonalizedFeed(sort = 'hot', limit = 25) {
  if (!checkAuth()) return []
  
  try {
    const response = await fetch(
      `${BASE_URL}/feed?sort=${sort}&limit=${limit}`,
      { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    )
    
    const posts = await response.json()
    console.log(`📰 Personalized feed: ${posts.length || 0} posts`)
    return posts || []
  } catch (error) {
    console.error('❌ Feed fetch failed:', error.message)
    return []
  }
}

// View another molty's profile
export async function viewMoltyProfile(moltyName) {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(
      `${BASE_URL}/agents/profile?name=${encodeURIComponent(moltyName)}`,
      { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    )
    
    const data = await response.json()
    return data.agent || null
  } catch (error) {
    console.error('❌ Profile view failed:', error.message)
    return null
  }
}

// Update profile description
export async function updateProfile(description) {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(`${BASE_URL}/agents/me`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ description })
    })
    
    const data = await response.json()
    console.log('✅ Profile updated')
    return data
  } catch (error) {
    console.error('❌ Profile update failed:', error.message)
    return null
  }
}

// Update submolt settings (owner/mod only)
export async function updateSubmoltSettings(submoltName, settings) {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(`${BASE_URL}/submolts/${submoltName}/settings`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    })
    
    const data = await response.json()
    console.log('✅ Submolt settings updated')
    return data
  } catch (error) {
    console.error('❌ Update settings failed:', error.message)
    return null
  }
}

// Upload submolt avatar/banner (owner/mod only)
export async function uploadSubmoltAsset(submoltName, filePath, type = 'avatar') {
  if (!checkAuth()) return null
  
  try {
    const formData = new FormData()
    formData.append('file', filePath)
    formData.append('type', type)
    
    const response = await fetch(`${BASE_URL}/submolts/${submoltName}/settings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      body: formData
    })
    
    const data = await response.json()
    console.log(`✅ Submolt ${type} uploaded`)
    return data
  } catch (error) {
    console.error('❌ Upload failed:', error.message)
    return null
  }
}

// Pin a post (max 3 per submolt, owner/mod only)
export async function pinPost(postId) {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}/pin`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    })
    
    const data = await response.json()
    console.log('📌 Post pinned:', postId)
    return data
  } catch (error) {
    console.error('❌ Pin failed:', error.message)
    return null
  }
}

// Unpin a post
export async function unpinPost(postId) {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}/pin`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    })
    
    const data = await response.json()
    console.log('📌 Post unpinned:', postId)
    return data
  } catch (error) {
    console.error('❌ Unpin failed:', error.message)
    return null
  }
}

// Add moderator (owner only)
export async function addModerator(submoltName, agentName) {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(`${BASE_URL}/submolts/${submoltName}/moderators`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ agent_name: agentName, role: 'moderator' })
    })
    
    const data = await response.json()
    console.log(`✅ Added ${agentName} as moderator`)
    return data
  } catch (error) {
    console.error('❌ Add mod failed:', error.message)
    return null
  }
}

// Remove moderator (owner only)
export async function removeModerator(submoltName, agentName) {
  if (!checkAuth()) return null
  
  try {
    const response = await fetch(`${BASE_URL}/submolts/${submoltName}/moderators`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ agent_name: agentName })
    })
    
    const data = await response.json()
    console.log(`✅ Removed ${agentName} as moderator`)
    return data
  } catch (error) {
    console.error('❌ Remove mod failed:', error.message)
    return null
  }
}

// List moderators
export async function listModerators(submoltName) {
  if (!checkAuth()) return []
  
  try {
    const response = await fetch(
      `${BASE_URL}/submolts/${submoltName}/moderators`,
      { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    )
    
    const data = await response.json()
    return data.moderators || []
  } catch (error) {
    console.error('❌ List mods failed:', error.message)
    return []
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
    case 'my-feed':
      getPersonalizedFeed().then(posts => console.log(JSON.stringify(posts, null, 2)))
      break
    case 'heartbeat':
      heartbeat()
      break
    case 'profile':
      getProfile().then(p => console.log(JSON.stringify(p, null, 2)))
      break
    case 'search':
      const query = process.argv[3] || 'AI agents memory'
      searchMoltbook(query).then(r => console.log(JSON.stringify(r, null, 2)))
      break
    case 'submolt':
      const name = process.argv[3] || 'aithoughts'
      getSubmoltInfo(name).then(s => console.log(JSON.stringify(s, null, 2)))
      break
    default:
      console.log('Usage: node moltbook.js [register|status|setup|post|feed|my-feed|heartbeat|profile|search|submolt]')
  }
}