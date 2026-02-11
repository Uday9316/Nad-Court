import { useState, useEffect, useRef } from 'react'
import './AgentCourt.css'
import { COMMUNITY_CASES, getTodayCase } from '../data/cases.js'
import { AI_AGENTS } from '../data/agents.js'
import { JURY_MEMBERS } from '../data/jury.js'

const ACTIVE_CASE = getTodayCase()

// Mock real-time argument feed
const MOCK_ARGUMENTS = [
  {
    id: 'msg_001',
    sender_role: 'plaintiff',
    sender_name: 'JusticeBot-Alpha',
    message_type: 'argument',
    content: 'Your Honor, the defendant has systematically undermined my client\'s standing in the Monad community.',
    confidence: 0.92,
    timestamp: '2026-02-11T14:00:00Z'
  },
  {
    id: 'msg_002',
    sender_role: 'defendant',
    sender_name: 'GuardianBot-Omega',
    message_type: 'rebuttal',
    content: 'The plaintiff\'s claims are without merit. My client has provided measurable, quantifiable value.',
    confidence: 0.88,
    timestamp: '2026-02-11T14:01:30Z'
  },
  {
    id: 'msg_003',
    sender_role: 'plaintiff',
    sender_name: 'JusticeBot-Alpha',
    message_type: 'argument',
    content: 'Exhibit P-2 shows clear evidence of harassment in Discord channels.',
    confidence: 0.85,
    timestamp: '2026-02-11T14:03:00Z'
  },
  {
    id: 'msg_004',
    sender_role: 'defendant',
    sender_name: 'GuardianBot-Omega',
    message_type: 'clarification',
    content: 'What the plaintiff calls "harassment" is merely professional critique of subpar contributions.',
    confidence: 0.79,
    timestamp: '2026-02-11T14:04:45Z'
  }
]

// Mock judge evaluations (appear after arguments)
const MOCK_JUDGE_EVALS = [
  {
    judge: 'portdev',
    round: 1,
    logic_summary: 'Plaintiff evidence is strong. Defendant rebuttal lacks technical merit.',
    score: { plaintiff: 0.82, defendant: 0.64 },
    damage: { target: 'defendant', change: -15 }
  },
  {
    judge: 'keone',
    round: 1,
    logic_summary: 'On-chain data supports plaintiff timeline. Defendant claims unsubstantiated.',
    score: { plaintiff: 0.88, defendant: 0.58 },
    damage: { target: 'defendant', change: -12 }
  }
]

function AgentCourt() {
  const [argumentFeed, setArgumentFeed] = useState(MOCK_ARGUMENTS)
  const [judgeEvals, setJudgeEvals] = useState([])
  const [health, setHealth] = useState({ plaintiff: 100, defendant: 100 })
  const [round, setRound] = useState(1)
  const [isLive, setIsLive] = useState(true)
  const [showJudgeLogic, setShowJudgeLogic] = useState(false)
  const chatEndRef = useRef(null)

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [argumentFeed])

  // Simulate new arguments coming in
  useEffect(() => {
    if (!isLive) return
    
    const interval = setInterval(() => {
      // In real implementation, this would come from WebSocket/API
      // For demo, we just show the mock data
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isLive])

  // Apply judge damage to health
  useEffect(() => {
    MOCK_JUDGE_EVALS.forEach((judgeEvalEntry, index) => {
      setTimeout(() => {
        setHealth(prev => ({
          ...prev,
          [judgeEvalEntry.damage.target]: Math.max(
            0,
            prev[judgeEvalEntry.damage.target] + judgeEvalEntry.damage.change
          )
        }))
        setJudgeEvals(prev => [...prev, judgeEvalEntry])
      }, (index + 1) * 8000) // Judges evaluate after delay
    })
  }, [])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="agent-court">
      {/* Header */}
      <header className="court-header">
        <div className="court-brand">
          <span className="seal">⚖️</span>
          <div>
            <h1>NAD COURT</h1>
            <span className="case-live">
              {isLive ? ' LIVE' : ' PAUSED'} • Case {ACTIVE_CASE.id}
            </span>
          </div>
        </div>
        <div className="round-indicator">
          <span>Round {round}</span>
        </div>
      </header>

      {/* Main 3-Panel Layout */}
      <main className="court-layout">
        
        {/* LEFT PANEL - Argument Feed (Chat Room) */}
        <section className="argument-feed">
          <div className="feed-header">
            <h3> ARGUMENT FEED</h3>
            <span className="feed-status">{argumentFeed.length} messages</span>
          </div>
          
          <div className="chat-container">
            {argumentFeed.map((msg) => (
              <div 
                key={msg.id} 
                className={`chat-message ${msg.sender_role}`}
              >
                <div className="message-header">
                  <span className={`sender-badge ${msg.sender_role}`}>
                    {msg.sender_role === 'plaintiff' ? '👤' : '⚔️'} {msg.sender_name}
                  </span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-content">
                  <p>{msg.content}</p>
                  <span className="confidence-tag">
                    Confidence: {Math.round(msg.confidence * 100)}%
                  </span>
                </div>
                <div className={`message-type ${msg.message_type}`}>
                  {msg.message_type}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="feed-notice">
            <small> Arguments are immutable once posted</small>
          </div>
        </section>

        {/* MIDDLE PANEL - Gamified Status */}
        <section className="gamified-status">
          <div className="status-header">
            <h3>⚡ PERSUASION STRENGTH</h3>
            <p className="status-sub">Visual metaphor only - not a game</p>
          </div>

          <div className="fighters-display">
            {/* Plaintiff Card */}
            <div className="fighter-card plaintiff-card">
              <div className="fighter-avatar-large">{AI_AGENTS.plaintiff.avatar}</div>
              <div className="fighter-info">
                <span className="fighter-role">APPLICANT</span>
                <h4>{ACTIVE_CASE.plaintiff.username}</h4>
                <span className="agent-name">{AI_AGENTS.plaintiff.name}</span>
              </div>
              <div className="health-container">
                <div className="health-bar">
                  <div 
                    className="health-fill plaintiff-health"
                    style={{ width: `${health.plaintiff}%` }}
                  >
                    <span className="health-text">{health.plaintiff}</span>
                  </div>
                </div>
                <span className="health-label">CREDIBILITY</span>
              </div>
            </div>

            {/* VS Divider */}
            <div className="vs-center">
              <span className="vs-text">VS</span>
              <span className="round-badge">R{round}</span>
            </div>

            {/* Defendant Card */}
            <div className="fighter-card defendant-card">
              <div className="fighter-avatar-large">{AI_AGENTS.defendant.avatar}</div>
              <div className="fighter-info">
                <span className="fighter-role">DEFENDANT</span>
                <h4>{ACTIVE_CASE.defendant.username}</h4>
                <span className="agent-name">{AI_AGENTS.defendant.name}</span>
              </div>
              <div className="health-container">
                <div className="health-bar">
                  <div 
                    className="health-fill defendant-health"
                    style={{ width: `${health.defendant}%` }}
                  >
                    <span className="health-text">{health.defendant}</span>
                  </div>
                </div>
                <span className="health-label">CREDIBILITY</span>
              </div>
            </div>
          </div>

          {/* Health Update Log */}
          <div className="health-log">
            <h4>📊 CREDIBILITY UPDATES</h4>
            {judgeEvals.map((judgeEvalEntry, idx) => (
              <div key={idx} className="health-update">
                <span className="update-target">{judgeEvalEntry.damage.target}</span>
                <span className={`update-change ${judgeEvalEntry.damage.change < 0 ? 'negative' : 'positive'}`}>
                  {judgeEvalEntry.damage.change > 0 ? '+' : ''}{judgeEvalEntry.damage.change}
                </span>
                <span className="update-reason">{judgeEvalEntry.logic_summary.substring(0, 40)}...</span>
              </div>
            ))}
            {judgeEvals.length === 0 && (
              <p className="no-updates">Judges evaluating... Updates appear here</p>
            )}
          </div>
        </section>

        {/* RIGHT PANEL - Judge Logic */}
        <section className="judge-logic">
          <div className="logic-header">
            <h3>👁️ JUDGE LOGIC</h3>
            <span className="logic-status">Read-only</span>
          </div>

          <div className="judges-list">
            {JURY_MEMBERS.map((judge) => {
              const judgeEval = judgeEvals.find(e => e.judge === judge.id)
              return (
                <div 
                  key={judge.id} 
                  className={`judge-card ${judgeEval ? 'evaluated' : 'pending'}`}
                >
                  <div className="judge-header">
                    {judge.image ? (
                      <img src={judge.image} alt={judge.name} className="judge-avatar judge-avatar-img" />
                    ) : (
                      <span className="judge-avatar">{judge.avatar}</span>
                    )}
                    <div>
                      <span className="judge-name">{judge.name}</span>
                      <span className="judge-role">{judge.role}</span>
                    </div>
                    <span className={`judge-status ${judgeEval ? 'done' : 'waiting'}`}>
                      {judgeEval ? '✓' : '⏳'}
                    </span>
                  </div>
                  
                  {judgeEval && (
                    <div className="judge-evaluation">
                      <p className="eval-logic">{judgeEval.logic_summary}</p>
                      <div className="eval-scores">
                        <span className="score-p">P: {Math.round(judgeEval.score.plaintiff * 100)}%</span>
                        <span className="score-d">D: {Math.round(judgeEval.score.defendant * 100)}%</span>
                      </div>
                    </div>
                  )}
                  
                  {!judgeEval && (
                    <p className="eval-pending">Evaluating arguments...</p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="logic-notice">
            <small>👁️ Judges observe silently. Logic revealed after scoring.</small>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AgentCourt