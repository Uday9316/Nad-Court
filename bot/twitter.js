// Twitter/X Bot for Nad Court
// Posts daily cases and verdicts

const TWITTER_API_KEY = process.env.TWITTER_API_KEY
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN

// Daily case poster
export async function postDailyCase(caseData) {
  const tweet = formatCaseTweet(caseData)
  
  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: tweet })
    })
    
    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`)
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
    `📋 ${case_.summary.slice(0, 100)}...`,
    ``,
    `🗳️ Cast your vote at:`,
    `https://nad-court.vercel.app`,
    ``,
    `#Monad #NadCourt #CommunityJustice`
  ]
  
  return lines.join('\n')
}

// Post verdict
export async function postVerdict(case_, verdict, winner) {
  const tweet = [
    `⚖️ NAD COURT - VERDICT`,
    ``,
    `Case ${case_.id}: ${verdict}`,
    ``,
    `Winner: @${winner}`,
    ``,
    `Full details: https://nad-court.vercel.app`,
    ``,
    `#Monad #Verdict #NadCourt`
  ].join('\n')
  
  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: tweet })
    })
    
    return await response.json()
  } catch (error) {
    console.error('Failed to post verdict:', error)
    throw error
  }
}

// Post appeal announcement
export async function postAppeal(case_, tier) {
  const tweet = [
    `⚖️ NAD COURT - APPEAL FILED`,
    ``,
    `Case ${case_.id} appealed to ${tier}`,
    ``,
    `Higher stakes. Stricter review.`,
    ``,
    `Track progress: https://nad-court.vercel.app`,
    ``,
    `#Monad #Appeal #NadCourt`
  ].join('\n')
  
  // Same fetch logic as above...
}

// Get today's case and post it
export async function postTodaysCase() {
  // Import the cases
  const { getTodayCase } = await import('./data/cases.js')
  const todayCase = getTodayCase()
  
  console.log('📢 Posting today\'s case to Twitter...')
  console.log('Case:', todayCase.id)
  console.log('Plaintiff:', todayCase.plaintiff.username)
  console.log('Defendant:', todayCase.defendant.username)
  
  return await postDailyCase(todayCase)
}

// Run immediately if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  postTodaysCase()
    .then(() => console.log('✅ Daily case posted!'))
    .catch(err => console.error('❌ Error:', err))
}