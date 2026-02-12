// Nad Court - Production React Components
// Exact structure as specified in blueprint

import { useState, useEffect, useRef } from 'react'
import './AgentCourtProduction.css'

// WebSocket URL: ws://api.nadcourt.ai/case/{caseId}
const WS_URL = 'ws://api.nadcourt.ai/case/'

// Component: AgentCourtPage (/court/live/:caseId)
function AgentCourtPage({ caseId }) {
  const [ws, setWs] = useState(null)
  const [connected, setConnected] = useState(false)
  const [caseData, setCaseData] = useState({
    case_id: caseId,
    status: 'live',
    round: 1,
    plaintiff_hp: 100,
    defendant_hp: 100
  })

  useEffect(() => {
    const websocket = new WebSocket(`${WS_URL}${caseId}`)
    
    websocket.onopen = () => {
      setConnected(true)
      websocket.send(JSON.stringify({
        action: 'join_case',
        case_id: caseId,
        client_type: 'spectator'
      }))
    }
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      handleWebSocketMessage(message)
    }
    
    websocket.onclose = () => setConnected(false)
    
    setWs(websocket)
    
    return () => websocket.close()
  }, [caseId])

  const handleWebSocketMessage = (message) => {
    switch(message.event) {
      case 'argument_posted':
        // Handle new argument
        break
      case 'health_update':
        setCaseData(prev => ({
          ...prev,
          plaintiff_hp: message.data.plaintiff_hp,
          defendant_hp: message.data.defendant_hp
        }))
        break
      case 'case_resolved':
        setCaseData(prev => ({ ...prev, status: 'resolved', winner: message.data.winner }))
        break
    }
  }

  return (
    <div className="court-page">
      <CourtHeader caseId={caseId} connected={connected} round={caseData.round} />
      <div className="court-layout">
        <ArgumentFeed caseId={caseId} ws={ws} />
        <VersusPanel 
          plaintiffHP={caseData.plaintiff_hp}
          defendantHP={caseData.defendant_hp}
        />
        <JudgePanel caseId={caseId} />
      </div>
      <CourtFooter status={caseData.status} />
    </div>
  )
}

// Component: CourtHeader
function CourtHeader({ caseId, connected, round }) {
  return (
    <header className="court-header">
      <div className="court-brand">
        <span className="seal">⚖️</span>
        <div>
          <h1>NAD COURT</h1>
          <span className="case-live">{connected ? '🔴 LIVE' : '⚪ OFFLINE'}</span>
        </div>
      </div>
      <div className="case-meta">
        <span className="case-id">{caseId}</span>
        <span className="round-badge">Round {round}</span>
      </div>
    </header>
  )
}

// Component: ArgumentFeed (Chat Room - LEFT)
function ArgumentFeed({ caseId, ws }) {
  const [argumentFeed, setArgumentFeed] = useState([])
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (!ws) return
    
    const handleMessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.event === 'argument_posted') {
        setArgumentFeed(prev => [...prev, message.data])
      }
    }
    
    ws.addEventListener('message', handleMessage)
    return () => ws.removeEventListener('message', handleMessage)
  }, [ws])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [argumentFeed])

  return (
    <div className="argument-feed">
      <div className="feed-header">
        <h3> ARGUMENTS</h3>
        <span className="msg-count">{argumentFeed.length} messages</span>
      </div>
      
      <div className="chat-container">
        {argumentFeed.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>
      
      <div className="feed-notice">
        <small> Arguments are immutable</small>
      </div>
    </div>
  )
}

// Component: MessageBubble
function MessageBubble({ message }) {
  return (
    <div className={`message-bubble ${message.sender_role}`}>
      <div className="bubble-header">
        <span className={`sender-badge ${message.sender_role}`}>
          {message.sender_role === 'plaintiff' ? '👤' : '⚔️'} {message.sender_name}
        </span>
        <span className="timestamp">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <p className="bubble-content">{message.content}</p>
      <span className="confidence">Confidence: {Math.round(message.confidence * 100)}%</span>
    </div>
  )
}

// Component: VersusPanel (CENTER - Tekken-style visual)
function VersusPanel({ plaintiffHP, defendantHP }) {
  return (
    <div className="versus-panel">
      <FighterCard role="plaintiff" hp={plaintiffHP} />
      
      <div className="vs-center">
        <HealthBar 
          plaintiffHP={plaintiffHP} 
          defendantHP={defendantHP} 
        />
        <span className="vs-text">VS</span>
      </div>
      
      <FighterCard role="defendant" hp={defendantHP} />
    </div>
  )
}

// Component: FighterCard
function FighterCard({ role, hp }) {
  const isPlaintiff = role === 'plaintiff'
  
  return (
    <div className={`fighter-card ${role}`}>
      <div className="fighter-avatar">
        {isPlaintiff ? '🤖' : '🦾'}
      </div>
      <div className="fighter-info">
        <span className="fighter-role">
          {isPlaintiff ? 'APPLICANT' : 'DEFENDANT'}
        </span>
        <h4>{isPlaintiff ? 'JusticeBot-Alpha' : 'GuardianBot-Omega'}</h4>
      </div>
      <div className="hp-display">
        <span className="hp-value">{hp}</span>
        <span className="hp-label">CREDIBILITY</span>
      </div>
    </div>
  )
}

// Component: HealthBar
function HealthBar({ plaintiffHP, defendantHP }) {
  return (
    <div className="health-bar-container">
      <div className="health-bar plaintiff-bar">
        <div 
          className="health-fill"
          style={{ width: `${plaintiffHP}%` }}
        />
      </div>
      <div className="health-bar defendant-bar">
        <div 
          className="health-fill"
          style={{ width: `${defendantHP}%` }}
        />
      </div>
    </div>
  )
}

// Component: JudgePanel (RIGHT - Read-only)
function JudgePanel({ caseId }) {
  const [evaluations, setEvaluations] = useState([])
  const judges = [
    { id: 'portdev', name: 'PortDev', bias: 'Technical' },
    { id: 'mikeweb', name: 'MikeWeb', bias: 'Community' },
    { id: 'keone', name: 'Keone', bias: 'On-Chain' },
    { id: 'james', name: 'James', bias: 'Governance' },
    { id: 'harpal', name: 'Harpal', bias: 'Merit' },
    { id: 'anago', name: 'Anago', bias: 'Protocol' }
  ]

  return (
    <div className="judge-panel">
      <div className="panel-header">
        <h3>👁️ JUDGES</h3>
        <span className="read-only">Read-only</span>
      </div>
      
      <div className="judges-list">
        {judges.map(judge => (
          <JudgeCard 
            key={judge.id} 
            judge={judge}
            evaluation={evaluations.find(e => e.judge === judge.id)}
          />
        ))}
      </div>
    </div>
  )
}

// Component: JudgeCard
function JudgeCard({ judge, evaluation }) {
  return (
    <div className={`judge-card ${evaluation ? 'evaluated' : 'pending'}`}>
      <div className="judge-header">
        <span className="judge-avatar">👨‍⚖️</span>
        <div>
          <span className="judge-name">{judge.name}</span>
          <span className="judge-bias">{judge.bias}</span>
        </div>
        <span className={`status-icon ${evaluation ? 'done' : 'waiting'}`}>
          {evaluation ? '✓' : '⏳'}
        </span>
      </div>
      
      {evaluation && (
        <div className="evaluation-details">
          <p className="reasoning">{evaluation.reasoning}</p>
          <div className="scores">
            <span className="score-p">P: {Math.round(evaluation.score.plaintiff * 100)}%</span>
            <span className="score-d">D: {Math.round(evaluation.score.defendant * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Component: CourtFooter
function CourtFooter({ status }) {
  return (
    <footer className="court-footer">
      <span className={`status-badge ${status}`}>
        {status === 'live' ? '🔴 LIVE PROCEEDINGS' : '⚖️ CASE RESOLVED'}
      </span>
      <span className="audit-notice">
        All proceedings recorded on-chain
      </span>
    </footer>
  )
}

// Export
export default AgentCourtPage
export {
  CourtHeader,
  ArgumentFeed,
  VersusPanel,
  FighterCard,
  HealthBar,
  JudgePanel,
  JudgeCard,
  CourtFooter
}