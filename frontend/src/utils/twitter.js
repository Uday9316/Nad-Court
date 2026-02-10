// Twitter sharing utilities (no API needed for manual share)
import { getTodayCase } from '../data/cases.js'

// Generate tweet text for today's case
export function generateTweetText(case_) {
  return encodeURIComponent(
    `⚖️ NAD COURT - DAY ${case_.day}\n\n` +
    `Case: ${case_.id}\n` +
    `Type: ${case_.type}\n\n` +
    `Plaintiff: @${case_.plaintiff.username}\n` +
    `VS\n` +
    `Defendant: @${case_.defendant.username}\n\n` +
    `📋 ${case_.summary.slice(0, 80)}...\n\n` +
    `🗳️ Vote now:\n` +
    `${window.location.origin}\n\n` +
    `#Monad #NadCourt #CommunityJustice`
  )
}

// Generate Twitter share URL
export function getTwitterShareUrl(case_) {
  const text = generateTweetText(case_)
  return `https://twitter.com/intent/tweet?text=${text}`
}

// Open Twitter share window
export function shareOnTwitter(case_) {
  const url = getTwitterShareUrl(case_)
  window.open(url, '_blank', 'width=600,height=400')
}

// Generate today's case tweet
export function getTodayTweet() {
  const todayCase = getTodayCase()
  return {
    text: generateTweetText(todayCase),
    url: getTwitterShareUrl(todayCase),
    case: todayCase
  }
}