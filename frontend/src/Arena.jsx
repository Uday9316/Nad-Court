import { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import './Arena.css'
import { AI_AGENTS, AGENT_MOVES, ACTIVE_CASE, BATTLE_COMMENTARY } from './data/agents.js'

const CONTRACT_ADDRESS = "0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458"

function Arena() {
  const [gameState, setGameState] = useState('intro') // intro, fighting, verdict
  const [plaintiffHP, setPlaintiffHP] = useState(100)
  const [defendantHP, setDefendantHP] = useState(100)
  const [currentRound, setCurrentRound] = useState(0)
  const [lastMove, setLastMove] = useState(null)
  const [comboCount, setComboCount] = useState({ plaintiff: 0, defendant: 0 })
  const [winner, setWinner] = useState(null)
  const [shake, setShake] = useState(null)
  const [commentary, setCommentary] = useState('')
  const [battleLog, setBattleLog] = useState([])
  
  const maxRounds = Math.max(AGENT_MOVES.plaintiff.length, AGENT_MOVES.defendant.length)

  const addToLog = (message) => {
    setBattleLog(prev => [...prev.slice(-4), message])
  }

  const executeMove = (side, moveIndex) => {
    const move = AGENT_MOVES[side][moveIndex]
    const isPlaintiff = side === 'plaintiff'
    const agent = isPlaintiff ? AI_AGENTS.plaintiff : AI_AGENTS.defendant
    
    setLastMove({ side, move, damage: move.damage, agent: agent.name })
    
    // Commentary
    const comment = BATTLE_COMMENTARY[side][Math.floor(Math.random() * BATTLE_COMMENTARY[side].length)]
    setCommentary(comment)
    addToLog(`${agent.name} uses ${move.name}!`)
    
    // Apply damage with combo multiplier
    const combo = comboCount[side]
    const multiplier = 1 + (combo * 0.1)
    const finalDamage = Math.floor(move.damage * multiplier)
    
    if (isPlaintiff) {
      setDefendantHP(prev => Math.max(0, prev - finalDamage))
      setComboCount(prev => ({ ...prev, plaintiff: prev.plaintiff + 1, defendant: 0 }))
      setShake('defendant')
      addToLog(`GuardianBot-Omega takes ${finalDamage} damage!`)
    } else {
      setPlaintiffHP(prev => Math.max(0, prev - finalDamage))
      setComboCount(prev => ({ ...prev, defendant: prev.defendant + 1, plaintiff: 0 }))
      setShake('plaintiff')
      addToLog(`JusticeBot-Alpha takes ${finalDamage} damage!`)
    }
    
    setTimeout(() => setShake(null), 500)
    
    // Check for winner
    const nextRound = currentRound + 1
    setCurrentRound(nextRound)
    
    if (nextRound >= maxRounds || (plaintiffHP <= finalDamage && !isPlaintiff) || (defendantHP <= finalDamage && isPlaintiff)) {
      setTimeout(() => determineWinner(), 1000)
    }
  }

  const determineWinner = () => {
    if (plaintiffHP > defendantHP) {
      setWinner({ side: 'plaintiff', agent: AI_AGENTS.plaintiff, person: ACTIVE_CASE.plaintiff })
      addToLog(`🏆 JusticeBot-Alpha wins! ${ACTIVE_CASE.plaintiff.username} is vindicated!`)
    } else if (defendantHP > plaintiffHP) {
      setWinner({ side: 'defendant', agent: AI_AGENTS.defendant, person: ACTIVE_CASE.defendant })
      addToLog(`🏆 GuardianBot-Omega wins! ${ACTIVE_CASE.defendant.username} is protected!`)
    } else {
      setWinner({ side: 'draw', agent: null, person: null })
      addToLog("⚖️ DRAW - Case requires human jury review!")
    }
    setGameState('verdict')
  }

  const resetGame = () => {
    setPlaintiffHP(100)
    setDefendantHP(100)
    setCurrentRound(0)
    setComboCount({ plaintiff: 0, defendant: 0 })
    setWinner(null)
    setLastMove(null)
    setBattleLog([])
    setCommentary('')
    setGameState('intro')
  }

  return (
    <div className="arena">
      {/* Scanline effect */}
      <div className="scanlines" />
      
      {/* Header */}
      <header className="arena-header">
        <div className="arena-title">
          <span className="glitch" data-text="AI_BATTLE">AI_BATTLE</span>
          <span className="subtitle">AGENT vs AGENT</span>
        </div>
        <div className="case-badge">
          Fighting for: {ACTIVE_CASE.id}
        </div>
      </header>

      {/* Main Stage */}
      <main className="stage">
        
        {/* VS Screen */}
        {gameState === 'intro' && (
          <div className="vs-screen">
            <div className="representatives">
              <div className="rep plaintiff-rep">
                <span className="rep-label">Representing</span>
                <span className="rep-name">{ACTIVE_CASE.plaintiff.username}</span>
              </div>
              <div className="rep defendant-rep">
                <span className="rep-label">Representing</span>
                <span className="rep-name">{ACTIVE_CASE.defendant.username}</span>
              </div>
            </div>

            <div className="vs-fighters">
              <div className="fighter agent-plaintiff">
                <div className="agent-avatar">{AI_AGENTS.plaintiff.avatar}</div>
                <h2>{AI_AGENTS.plaintiff.name}</h2>
                <div className="agent-stats">
                  <span>STR: {AI_AGENTS.plaintiff.stats.strength}</span>
                  <span>DEF: {AI_AGENTS.plaintiff.stats.defense}</span>
                  <span>INT: {AI_AGENTS.plaintiff.stats.intellect}</span>
                </div>
                <p className="agent-desc">{AI_AGENTS.plaintiff.description}</p>
              </div>
              
              <div className="vs-badge">
                <span className="vs-text">VS</span>
                <span className="ai-indicator">🤖 AI BATTLE 🤖</span>
              </div>
              
              <div className="fighter agent-defendant">
                <div className="agent-avatar">{AI_AGENTS.defendant.avatar}</div>
                <h2>{AI_AGENTS.defendant.name}</h2>
                <div className="agent-stats">
                  <span>STR: {AI_AGENTS.defendant.stats.strength}</span>
                  <span>DEF: {AI_AGENTS.defendant.stats.defense}</span>
                  <span>INT: {AI_AGENTS.defendant.stats.intellect}</span>
                </div>
                <p className="agent-desc">{AI_AGENTS.defendant.description}</p>
              </div>
            </div>
            
            <button className="fight-btn cyber" onClick={() => setGameState('fighting')}>
              <span className="btn-text">INITIALIZE_BATTLE.exe</span>
              <span className="btn-glitch"></span>
            </button>
          </div>
        )}

        {/* Fighting Game */}
        {gameState === 'fighting' && (
          <div className="battle-arena">
            {/* Commentary Bar */}
            <div className="commentary-bar">
              <span className="pulse">▶</span>
              <span className="commentary-text">{commentary || BATTLE_COMMENTARY.neutral[0]}</span>
            </div>

            {/* Health Bars */}
            <div className="health-bars">
              <div className="health-bar plaintiff-bar">
                <div className="bar-header">
                  <span className="agent-name">{AI_AGENTS.plaintiff.name}</span>
                  {comboCount.plaintiff > 1 && (
                    <span className="combo-badge">{comboCount.plaintiff}x COMBO</span>
                  )}
                </div>
                <div className="bar-container">
                  <div 
                    className={`bar-fill plaintiff-fill ${shake === 'plaintiff' ? 'shake-damage' : ''}`}
                    style={{ width: `${plaintiffHP}%` }}
                  >
                    <div className="bar-scanline"></div>
                  </div>
                  <span className="hp-text">{plaintiffHP}/100 HP</span>
                </div>
              </div>
              
              <div className="round-counter">
                <span className="round-label">ROUND</span>
                <span className="round-num">{currentRound + 1}</span>
              </div>
              
              <div className="health-bar defendant-bar">
                <div className="bar-header">
                  {comboCount.defendant > 1 && (
                    <span className="combo-badge defender">{comboCount.defendant}x COMBO</span>
                  )}
                  <span className="agent-name">{AI_AGENTS.defendant.name}</span>
                </div>
                <div className="bar-container">
                  <div 
                    className={`bar-fill defendant-fill ${shake === 'defendant' ? 'shake-damage' : ''}`}
                    style={{ width: `${defendantHP}%` }}
                  >
                    <div className="bar-scanline"></div>
                  </div>
                  <span className="hp-text">{defendantHP}/100 HP</span>
                </div>
              </div>
            </div>

            {/* Battle Log */}
            <div className="battle-log">
              {battleLog.map((log, idx) => (
                <div key={idx} className="log-entry">{log}</div>
              ))}
            </div>

            {/* Agents Display */}
            <div className="agents-display">
              <div className={`agent-sprite plaintiff-agent ${shake === 'plaintiff' ? 'hit' : ''} ${lastMove?.side === 'plaintiff' ? 'attacking' : ''}`}>
                <div className="agent-visual">{AI_AGENTS.plaintiff.avatar}</div>
                <div className="agent-core">
                  <span className="core-label">AI CORE</span>
                  <div className="core-bar">
                    <div className="core-fill" style={{width: `${plaintiffHP}%`}}></div>
                  </div>
                </div>
              </div>
              
              <div className="battle-center">
                {lastMove && (
                  <div className={`move-execution ${lastMove.side}-execution`}>
                    <span className="move-agent">{lastMove.agent}</span>
                    <span className="move-icon">{lastMove.move.icon}</span>
                    <span className="move-name">{lastMove.move.name}</span>
                    <span className="move-damage">-{lastMove.damage} HP</span>
                  </div>
                )}
              </div>
              
              <div className={`agent-sprite defendant-agent ${shake === 'defendant' ? 'hit' : ''} ${lastMove?.side === 'defendant' ? 'attacking' : ''}`}>
                <div className="agent-visual">{AI_AGENTS.defendant.avatar}</div>
                <div className="agent-core">
                  <span className="core-label">AI CORE</span>
                  <div className="core-bar">
                    <div className="core-fill defendant" style={{width: `${defendantHP}%`}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Move Controls */}
            <div className="move-controls">
              <div className="control-side plaintiff-controls">
                <div className="control-header">
                  <span className="control-title">{AI_AGENTS.plaintiff.name}</span>
                  <span className="control-sub">Plaintiff Agent</span>
                </div>
                <div className="moves-grid">
                  {AGENT_MOVES.plaintiff.map((move, idx) => (
                    <button 
                      key={idx}
                      className="move-btn cyber-btn"
                      onClick={() => executeMove('plaintiff', idx)}
                      disabled={currentRound !== idx || winner}
                    >
                      <span className="move-icon">{move.icon}</span>
                      <div className="move-details">
                        <span className="move-name">{move.name}</span>
                        <span className="move-desc">{move.desc}</span>
                        <span className="move-damage">{move.damage} DMG</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="vs-divider cyber-divider">
                <div className="divider-line"></div>
                <span className="vs-icon">VS</span>
                <div className="divider-line"></div>
              </div>
              
              <div className="control-side defendant-controls">
                <div className="control-header">
                  <span className="control-title">{AI_AGENTS.defendant.name}</span>
                  <span className="control-sub">Defendant Agent</span>
                </div>
                <div className="moves-grid">
                  {AGENT_MOVES.defendant.map((move, idx) => (
                    <button 
                      key={idx}
                      className="move-btn cyber-btn defendant"
                      onClick={() => executeMove('defendant', idx)}
                      disabled={currentRound !== idx || winner}
                    >
                      <span className="move-icon">{move.icon}</span>
                      <div className="move-details">
                        <span className="move-name">{move.name}</span>
                        <span className="move-desc">{move.desc}</span>
                        <span className="move-damage">{move.damage} DMG</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verdict Screen */}
        {gameState === 'verdict' && (
          <div className="verdict-screen">
            <div className="winner-display">
              <div className="winner-agent">
                <span className="winner-avatar">{winner?.agent?.avatar || '⚖️'}</span>
                <h2 className="winner-name">{winner?.agent?.name || 'DRAW'}</h2>
                <span className="winner-label">VICTORIOUS</span>
              </div>
              
              <div className="represented-party">
                <span className="rep-label">Representing</span>
                <span className="rep-person">{winner?.person?.username || 'Both parties'}</span>
                <p className="rep-verdict">
                  {winner?.side === 'plaintiff' 
                    ? `${ACTIVE_CASE.plaintiff.username} wins the case!`
                    : winner?.side === 'defendant'
                    ? `${ACTIVE_CASE.defendant.username} wins the case!`
                    : 'Case requires jury review'
                  }
                </p>
              </div>
            </div>
            
            <div className="final-stats cyber-stats">
              <div className="stat-comparison">
                <div className="stat-item">
                  <span className="stat-label">{AI_AGENTS.plaintiff.name}</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{width: `${plaintiffHP}%`}}></div>
                  </div>
                  <span className="stat-value">{plaintiffHP} HP</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{AI_AGENTS.defendant.name}</span>
                  <div className="stat-bar">
                    <div className="stat-fill defendant" style={{width: `${defendantHP}%`}}></div>
                  </div>
                  <span className="stat-value">{defendantHP} HP</span>
                </div>
              </div>
            </div>
            
            <div className="verdict-actions">
              <button className="cyber-btn secondary" onClick={resetGame}>
                🔄 NEW_BATTLE.exe
              </button>
              <a href="/" className="cyber-btn primary">
                📋 VIEW_CASE_FILE
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Arena