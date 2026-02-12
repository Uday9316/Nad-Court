import { useState, useEffect, useRef } from 'react'
import './App.css'
import './Arena.css'

// API URL - UPDATE THIS when ngrok changes
const API_URL = 'https://2295-51-20-69-171.ngrok-free.app'

const MOLTBOOK_AGENTS = {
  plaintiff: { name: 'JusticeBot-Alpha', id: 'plaintiff-agent' },
  defendant: { name: 'GuardianBot-Omega', id: 'defendant-agent' }
}

const JUDGES = [
  { id: 'portdev', name: 'PortDev', role: 'Technical' },
  { id: 'mikeweb', name: 'MikeWeb', role: 'Community' },
  { id: 'keone', name: 'Keone', role: 'On-Chain' },
  { id: 'james', name: 'James', role: 'Governance' },
  { id: 'harpal', name: 'Harpal', role: 'Merit' },
  { id: 'anago', name: 'Anago', role: 'Protocol' }
]

// Fetch live argument from API
const fetchArgument = async (role, caseData, round) => {
  try {
    const response = await fetch(`${API_URL}/api/generate-argument`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, caseData, round })
    })
    const data = await response.json()
    if (data.success) return data.argument
  } catch (e) {
    console.log('API error:', e)
  }
  return null
}

// Fetch judge evaluation
const fetchEvaluation = async (judge, caseData, plaintiffArgs, defendantArgs) => {
  try {
    const response = await fetch(`${API_URL}/api/judge-evaluation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        judge, 
        caseData, 
        plaintiffArgs, 
        defendantArgs,
        round: 1
      })
    })
    const data = await response.json()
    if (data.success) return data.evaluation
  } catch (e) {
    console.log('Judge API error:', e)
  }
  return null
}

function App() {
  const [view, setView] = useState('home')
  const [messages, setMessages] = useState([])
  const [plaintiffHealth, setPlaintiffHealth] = useState(100)
  const [defendantHealth, setDefendantHealth] = useState(100)
  const [currentRound, setCurrentRound] = useState(1)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('idle') // idle, generating, judging, verdict
  const [evaluations, setEvaluations] = useState([])
  const [verdict, setVerdict] = useState(null)
  
  const caseData = {
    id: 'LIVE-CASE-001',
    type: 'Beef Resolution',
    plaintiff: 'Bitlover082',
    defendant: '0xCoha',
    summary: 'Dispute over bug discovery attribution'
  }

  const startLiveCase = async () => {
    setLoading(true)
    setStatus('generating')
    setMessages([])
    setEvaluations([])
    setVerdict(null)
    setPlaintiffHealth(100)
    setDefendantHealth(100)
    
    const plaintiffArgs = []
    const defendantArgs = []
    
    // Generate 6 rounds (12 arguments)
    for (let round = 1; round <= 6; round++) {
      setCurrentRound(round)
      
      // Plaintiff
      const pArg = await fetchArgument('plaintiff', caseData, round)
      if (pArg) {
        plaintiffArgs.push(pArg)
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          author: MOLTBOOK_AGENTS.plaintiff.name,
          content: pArg,
          side: 'plaintiff',
          round
        }])
      }
      
      await new Promise(r => setTimeout(r, 500))
      
      // Defendant
      const dArg = await fetchArgument('defendant', caseData, round)
      if (dArg) {
        defendantArgs.push(dArg)
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          author: MOLTBOOK_AGENTS.defendant.name,
          content: dArg,
          side: 'defendant',
          round
        }])
      }
      
      await new Promise(r => setTimeout(r, 500))
    }
    
    // Judges evaluate
    setStatus('judging')
    const evals = []
    
    for (const judge of JUDGES) {
      const evalData = await fetchEvaluation(judge.name, caseData, plaintiffArgs, defendantArgs)
      if (evalData) {
        evals.push({ judge: judge.name, ...evalData })
        setEvaluations([...evals])
        
        // Update health
        const pScore = (evalData.scores.plaintiff.logic + evalData.scores.plaintiff.evidence + evalData.scores.plaintiff.rebuttal + evalData.scores.plaintiff.clarity) / 4
        const dScore = (evalData.scores.defendant.logic + evalData.scores.defendant.evidence + evalData.scores.defendant.rebuttal + evalData.scores.defendant.clarity) / 4
        const diff = pScore - dScore
        
        if (diff > 0) {
          setDefendantHealth(h => Math.max(10, h - diff * 0.5))
        } else {
          setPlaintiffHealth(h => Math.max(10, h - Math.abs(diff) * 0.5))
        }
      }
      await new Promise(r => setTimeout(r, 300))
    }
    
    // Calculate verdict
    const pWins = evals.filter(e => e.winner === 'plaintiff').length
    const dWins = evals.filter(e => e.winner === 'defendant').length
    setVerdict({
      winner: pWins > dWins ? 'plaintiff' : 'defendant',
      plaintiffWins: pWins,
      defendantWins: dWins
    })
    
    setStatus('verdict')
    setLoading(false)
  }

  return (
    <div className="agent-court">
      <header className="court-header">
        <h1>🤖 Agent Court</h1>
        <nav>
          <button onClick={() => setView('home')}>Cases</button>
          <button onClick={() => setView('live')}>Live Court</button>
        </nav>
      </header>

      {view === 'home' && (
        <div className="cases-list">
          <h2>Active Cases</h2>
          <div className="case-card">
            <h3>{caseData.id}</h3>
            <p>{caseData.plaintiff} vs {caseData.defendant}</p>
            <p>Type: {caseData.type}</p>
            <button onClick={() => setView('live')}>Enter Court</button>
          </div>
        </div>
      )}

      {view === 'live' && (
        <div className="live-court">
          <div className="court-info">
            <h2>{caseData.id}: {caseData.plaintiff} vs {caseData.defendant}</h2>
            <p>Status: {status === 'idle' ? 'Ready to start' : status === 'generating' ? `Generating Round ${currentRound}/6...` : status === 'judging' ? 'Judges Evaluating...' : 'Complete'}</p>
          </div>

          {status === 'idle' && (
            <button onClick={startLiveCase} disabled={loading} className="start-btn">
              {loading ? 'Starting...' : '▶️ Start Live AI Case'}
            </button>
          )}

          {/* Health Bars */}
          {(status === 'judging' || status === 'verdict') && (
            <div className="health-bars">
              <div className="health-bar">
                <span>JusticeBot-Alpha</span>
                <div className="bar"><div className="fill plaintiff" style={{width: `${plaintiffHealth}%`}}/></div>
                <span>{Math.round(plaintiffHealth)}%</span>
              </div>
              <div className="health-bar">
                <span>GuardianBot-Omega</span>
                <div className="bar"><div className="fill defendant" style={{width: `${defendantHealth}%`}}/></div>
                <span>{Math.round(defendantHealth)}%</span>
              </div>
            </div>
          )}

          {/* Arguments */}
          <div className="arguments-feed">
            {messages.map((msg, i) => (
              <div key={msg.id} className={`argument ${msg.side}`}>
                <div className="arg-header">
                  <strong>{msg.author}</strong>
                  <span>Round {msg.round}</span>
                </div>
                <p>{msg.content}</p>
              </div>
            ))}
          </div>

          {/* Judge Evaluations */}
          {evaluations.length > 0 && (
            <div className="evaluations">
              <h3>⚖️ Judge Evaluations</h3>
              {evaluations.map((e, i) => (
                <div key={i} className="evaluation">
                  <h4>{e.judge}</h4>
                  <p>Winner: <strong>{e.winner?.toUpperCase()}</strong></p>
                  <p>{e.reasoning}</p>
                </div>
              ))}
            </div>
          )}

          {/* Verdict */}
          {verdict && (
            <div className="verdict">
              <h2>🏆 FINAL VERDICT</h2>
              <h3>{verdict.winner === 'plaintiff' ? 'JusticeBot-Alpha' : 'GuardianBot-Omega'} WINS!</h3>
              <p>Judges: {verdict.plaintiffWins} - {verdict.defendantWins}</p>
              <button onClick={() => {setStatus('idle'); setMessages([]); setVerdict(null);}}>New Case</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
