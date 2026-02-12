import { useState, useEffect, useRef } from 'react'
import './Arena.css'

// API URL - UPDATE THIS when ngrok changes
const API_URL = 'https://2295-51-20-69-171.ngrok-free.app'

const JUDGES = ['PortDev', 'MikeWeb', 'Keone', 'James', 'Harpal', 'Anago']

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
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('idle') // idle, generating, judging, verdict
  const [currentRound, setCurrentRound] = useState(1)
  const [messages, setMessages] = useState([])
  const [plaintiffHealth, setPlaintiffHealth] = useState(100)
  const [defendantHealth, setDefendantHealth] = useState(100)
  const [evaluations, setEvaluations] = useState([])
  const [verdict, setVerdict] = useState(null)
  
  const caseData = {
    id: 'BEEF-4760',
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
      
      // Plaintiff argument
      const pArg = await fetchArgument('plaintiff', caseData, round)
      if (pArg) {
        plaintiffArgs.push(pArg)
        setMessages(prev => [...prev, {
          id: Date.now(),
          author: 'JusticeBot-Alpha',
          content: pArg,
          side: 'plaintiff',
          round
        }])
      }
      
      await new Promise(r => setTimeout(r, 500))
      
      // Defendant argument
      const dArg = await fetchArgument('defendant', caseData, round)
      if (dArg) {
        defendantArgs.push(dArg)
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          author: 'GuardianBot-Omega',
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
      const evalData = await fetchEvaluation(judge, caseData, plaintiffArgs, defendantArgs)
      if (evalData) {
        evals.push({ judge, ...evalData })
        setEvaluations([...evals])
        
        // Update health bars
        const pScore = (evalData.scores.plaintiff.logic + evalData.scores.plaintiff.evidence + evalData.scores.plaintiff.rebuttal + evalData.scores.plaintiff.clarity) / 4
        const dScore = (evalData.scores.defendant.logic + evalData.scores.defendant.evidence + evalData.scores.defendant.rebuttal + evalData.scores.defendant.clarity) / 4
        const diff = pScore - dScore
        
        if (diff > 0) {
          setDefendantHealth(h => Math.max(10, h - diff * 0.3))
        } else {
          setPlaintiffHealth(h => Math.max(10, h - Math.abs(diff) * 0.3))
        }
      }
      await new Promise(r => setTimeout(r, 200))
    }
    
    // Final verdict
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
    <div className="arena">
      {/* Header */}
      <header className="arena-header">
        <div className="arena-title">
          <span className="title-icon">⚖️</span>
          <div>
            <h1>AGENT COURT</h1>
            <div className="subtitle">LIVE AI JUSTICE</div>
          </div>
        </div>
        <button className="wallet-btn">CONNECT WALLET</button>
      </header>

      {/* Main Stage */}
      <main className="stage">
        {status === 'idle' && (
          <div className="vs-screen">
            <div className="vs-fighters">
              <div className="fighter plaintiff">
                <div className="fighter-avatar">🤖</div>
                <h2>JusticeBot-Alpha</h2>
                <p className="fighter-desc">AI Plaintiff Advocate</p>
              </div>
              
              <div className="vs-badge">
                <div className="vs-text">VS</div>
                <div className="case-type">{caseData.type}</div>
              </div>
              
              <div className="fighter defendant">
                <div className="fighter-avatar">🛡️</div>
                <h2>GuardianBot-Omega</h2>
                <p className="fighter-desc">AI Defense Advocate</p>
              </div>
            </div>
            
            <button onClick={startLiveCase} disabled={loading} className="fight-btn">
              {loading ? 'INITIALIZING...' : '⚔️ START LIVE BATTLE'}
            </button>
          </div>
        )}

        {(status === 'generating' || status === 'judging' || status === 'verdict') && (
          <div className="battle-arena">
            {/* Health Bars */}
            <div className="health-bars">
              <div className="health-bar-container">
                <span className="fighter-name">JusticeBot-Alpha</span>
                <div className="health-bar">
                  <div className="health-fill" style={{width: `${plaintiffHealth}%`}}></div>
                </div>
                <span className="health-text">{Math.round(plaintiffHealth)}%</span>
              </div>
              
              <div className="round-indicator">
                {status === 'generating' ? `ROUND ${currentRound}/6` : status === 'judging' ? 'JUDGES EVALUATING' : 'FINAL VERDICT'}
              </div>
              
              <div className="health-bar-container">
                <span className="fighter-name">GuardianBot-Omega</span>
                <div className="health-bar defendant">
                  <div className="health-fill" style={{width: `${defendantHealth}%`}}></div>
                </div>
                <span className="health-text">{Math.round(defendantHealth)}%</span>
              </div>
            </div>

            {/* Arguments Feed */}
            <div className="battle-log">
              {messages.map((msg, i) => (
                <div key={msg.id} className={`log-entry ${msg.side}`}>
                  <div className="log-header">
                    <span className="log-author">{msg.author}</span>
                    <span className="log-round">Round {msg.round}</span>
                  </div>
                  <p className="log-content">{msg.content}</p>
                </div>
              ))}
            </div>

            {/* Judge Evaluations */}
            {evaluations.length > 0 && (
              <div className="judges-panel">
                <h3>⚖️ JUDGE EVALUATIONS</h3>
                <div className="judges-grid">
                  {evaluations.map((e, i) => (
                    <div key={i} className="judge-card">
                      <h4>{e.judge}</h4>
                      <div className={`judge-winner ${e.winner}`}>{e.winner?.toUpperCase()}</div>
                      <p className="judge-reasoning">{e.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Verdict */}
            {verdict && (
              <div className="final-verdict">
                <h2>🏆 CHAMPION</h2>
                <div className={`winner-announcement ${verdict.winner}`}>
                  <div className="winner-avatar">{verdict.winner === 'plaintiff' ? '🤖' : '🛡️'}</div>
                  <h3>{verdict.winner === 'plaintiff' ? 'JusticeBot-Alpha' : 'GuardianBot-Omega'}</h3>
                  <p className="winner-score">{verdict.plaintiffWins} - {verdict.defendantWins}</p>
                </div>
                <button onClick={() => setStatus('idle')} className="rematch-btn">⚔️ REMATCH</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
