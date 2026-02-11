import { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import './Arena.css'
import { COMMUNITY_CASES, getTodayCase, VERDICT_OPTIONS } from './data/cases.js'

const CONTRACT_ADDRESS = "0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458"
const MONAD_CHAIN_ID = 143

// Today's case
const TODAY_CASE = getTodayCase()

// Icons
const Icons = {
  Fist: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 12v-1h-1v-1h-1v-1h-1V8h-1V7h-1V6h-1V5h-2v1H9v1H8v1H7v1H6v1H5v1H4v2h1v1h1v1h1v1h1v1h1v1h2v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-2h-1z"/></svg>,
  Sword: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>,
  Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Bolt: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Trophy: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>
}

// Argument moves database
const ARGUMENT_MOVES = {
  plaintiff: [
    { name: "OG Status", damage: 15, icon: "👑", desc: "Claims early community membership" },
    { name: "Survivor's Tale", damage: 20, icon: "💪", desc: "Survived previous purge" },
    { name: "Content Creation", damage: 18, icon: "🎨", desc: "Created lore and memes" },
    { name: "Community Love", damage: 12, icon: "❤️", desc: "People want them back" }
  ],
  defendant: [
    { name: "Utility Builder", damage: 16, icon: "⚙️", desc: "Built helpful bots and tools" },
    { name: "Metrics Leader", damage: 22, icon: "📊", desc: "Top of Kaito leaderboard" },
    { name: "New Blood", damage: 14, icon: "🌟", desc: "Fresh perspective and energy" },
    { name: "Silent Majority", damage: 17, icon: "🤐", desc: "Community prefers them" }
  ]
}

function App() {
  const [account, setAccount] = useState(null)
  const [gameState, setGameState] = useState('intro') // intro, fighting, verdict
  const [plaintiffHP, setPlaintiffHP] = useState(100)
  const [defendantHP, setDefendantHP] = useState(100)
  const [currentRound, setCurrentRound] = useState(0)
  const [lastMove, setLastMove] = useState(null)
  const [comboCount, setComboCount] = useState({ plaintiff: 0, defendant: 0 })
  const [winner, setWinner] = useState(null)
  const [shake, setShake] = useState(null)
  
  const maxRounds = Math.max(ARGUMENT_MOVES.plaintiff.length, ARGUMENT_MOVES.defendant.length)

  const connectWallet = async () => {
    if (!window.ethereum) return
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setAccount(accounts[0])
  }

  const executeMove = (side, moveIndex) => {
    const move = ARGUMENT_MOVES[side][moveIndex]
    const isPlaintiff = side === 'plaintiff'
    
    setLastMove({ side, move, damage: move.damage })
    
    // Apply damage with combo multiplier
    const combo = comboCount[side]
    const multiplier = 1 + (combo * 0.1)
    const finalDamage = Math.floor(move.damage * multiplier)
    
    if (isPlaintiff) {
      setDefendantHP(prev => Math.max(0, prev - finalDamage))
      setComboCount(prev => ({ ...prev, plaintiff: prev.plaintiff + 1, defendant: 0 }))
      setShake('defendant')
    } else {
      setPlaintiffHP(prev => Math.max(0, prev - finalDamage))
      setComboCount(prev => ({ ...prev, defendant: prev.defendant + 1, plaintiff: 0 }))
      setShake('plaintiff')
    }
    
    // Reset shake after animation
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
      setWinner('plaintiff')
    } else if (defendantHP > plaintiffHP) {
      setWinner('defendant')
    } else {
      setWinner('draw')
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
    setGameState('intro')
  }

  return (
    <div className="arena">
      {/* Background Music Indicator */}
      <div className="music-indicator">
        <span className="beat">🎵</span>
        <span className="music-text">NOW PLAYING: COURT BATTLE THEME</span>
      </div>

      {/* Header */}
      <header className="arena-header">
        <div className="arena-title">
          <span className="title-icon">⚖️</span>
          <h1>THE ARENA</h1>
          <span className="subtitle">ARGUMENT BATTLE</span>
        </div>
        <button className={`wallet-btn ${account ? 'connected' : ''}`} onClick={connectWallet}>
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect'}
        </button>
      </header>

      {/* Main Stage */}
      <main className="stage">
        
        {/* VS Screen */}
        {gameState === 'intro' && (
          <div className="vs-screen">
            <div className="vs-fighters">
              <div className="fighter plaintiff">
                <div className="fighter-avatar">{TODAY_CASE.plaintiff.username[0]}</div>
                <h2>{TODAY_CASE.plaintiff.username}</h2>
                <p className="fighter-desc">{TODAY_CASE.plaintiff.description.slice(0, 50)}...</p>
              </div>
              
              <div className="vs-badge">
                <span className="vs-text">VS</span>
                <span className="case-type">{TODAY_CASE.type}</span>
              </div>
              
              <div className="fighter defendant">
                <div className="fighter-avatar">{TODAY_CASE.defendant.username[0]}</div>
                <h2>{TODAY_CASE.defendant.username}</h2>
                <p className="fighter-desc">{TODAY_CASE.defendant.description.slice(0, 50)}...</p>
              </div>
            </div>
            
            <button className="fight-btn" onClick={() => setGameState('fighting')}>
              <span className="btn-text">START BATTLE</span>
              <span className="btn-shine"></span>
            </button>
          </div>
        )}

        {/* Fighting Game */}
        {gameState === 'fighting' && (
          <div className="battle-arena">
            {/* Health Bars */}
            <div className="health-bars">
              <div className="health-bar plaintiff-bar">
                <span className="fighter-name">{TODAY_CASE.plaintiff.username}</span>
                <div className="bar-container">
                  <div 
                    className={`bar-fill plaintiff-fill ${shake === 'plaintiff' ? 'shake' : ''}`}
                    style={{ width: `${plaintiffHP}%` }}
                  >
                    <div className="bar-glow"></div>
                  </div>
                  <span className="hp-text">{plaintiffHP} HP</span>
                </div>
                {comboCount.plaintiff > 1 && (
                  <span className="combo">{comboCount.plaintiff}x COMBO!</span>
                )}
              </div>
              
              <div className="round-counter">
                <span className="round-num">ROUND {currentRound + 1}</span>
                <span className="max-round">/ {maxRounds}</span>
              </div>
              
              <div className="health-bar defendant-bar">
                <span className="fighter-name">{TODAY_CASE.defendant.username}</span>
                <div className="bar-container">
                  <div 
                    className={`bar-fill defendant-fill ${shake === 'defendant' ? 'shake' : ''}`}
                    style={{ width: `${defendantHP}%` }}
                  >
                    <div className="bar-glow"></div>
                  </div>
                  <span className="hp-text">{defendantHP} HP</span>
                </div>
                {comboCount.defendant > 1 && (
                  <span className="combo defender-combo">{comboCount.defendant}x COMBO!</span>
                )}
              </div>
            </div>

            {/* Fighters Display */}
            <div className="fighters-display">
              <div className={`fighter-sprite plaintiff-sprite ${shake === 'plaintiff' ? 'hit' : ''} ${lastMove?.side === 'plaintiff' ? 'attacking' : ''}`}>
                <div className="sprite-avatar">{TODAY_CASE.plaintiff.username[0]}</div>
                <div className="fighter-stats">
                  <span className="stat">STR: 85</span>
                  <span className="stat">DEF: 70</span>
                </div>
              </div>
              
              <div className="battle-center">
                {lastMove && (
                  <div className={`move-effect ${lastMove.side}-effect`}>
                    <span className="move-icon">{lastMove.move.icon}</span>
                    <span className="move-name">{lastMove.move.name}</span>
                    <span className="damage">-{lastMove.damage} HP</span>
                  </div>
                )}
              </div>
              
              <div className={`fighter-sprite defendant-sprite ${shake === 'defendant' ? 'hit' : ''} ${lastMove?.side === 'defendant' ? 'attacking' : ''}`}>
                <div className="sprite-avatar">{TODAY_CASE.defendant.username[0]}</div>
                <div className="fighter-stats">
                  <span className="stat">STR: 78</span>
                  <span className="stat">DEF: 82</span>
                </div>
              </div>
            </div>

            {/* Move Controls */}
            <div className="move-controls">
              <div className="control-side plaintiff-controls">
                <h3>Plaintiff Moves</h3>
                <div className="moves-grid">
                  {ARGUMENT_MOVES.plaintiff.map((move, idx) => (
                    <button 
                      key={idx}
                      className="move-btn"
                      onClick={() => executeMove('plaintiff', idx)}
                      disabled={currentRound !== idx || winner}
                    >
                      <span className="move-icon">{move.icon}</span>
                      <span className="move-info">
                        <span className="move-name">{move.name}</span>
                        <span className="move-damage">{move.damage} DMG</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="vs-divider">⚔️</div>
              
              <div className="control-side defendant-controls">
                <h3>Defendant Moves</h3>
                <div className="moves-grid">
                  {ARGUMENT_MOVES.defendant.map((move, idx) => (
                    <button 
                      key={idx}
                      className="move-btn defendant-move"
                      onClick={() => executeMove('defendant', idx)}
                      disabled={currentRound !== idx || winner}
                    >
                      <span className="move-icon">{move.icon}</span>
                      <span className="move-info">
                        <span className="move-name">{move.name}</span>
                        <span className="move-damage">{move.damage} DMG</span>
                      </span>
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
              <div className="winner-trophy">
                <Icons.Trophy />
              </div>
              <h2 className="winner-text">
                {winner === 'plaintiff' ? TODAY_CASE.plaintiff.username : 
                 winner === 'defendant' ? TODAY_CASE.defendant.username : 'DRAW'}
              </h2>
              <p className="verdict-label">WINS THE CASE</p>
            </div>
            
            <div className="final-stats">
              <div className="stat-row">
                <span className="stat-label">Plaintiff HP</span>
                <div className="final-bar">
                  <div className="final-fill" style={{ width: `${plaintiffHP}%` }}></div>
                </div>
                <span className="stat-value">{plaintiffHP}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Defendant HP</span>
                <div className="final-bar">
                  <div className="final-fill defendant" style={{ width: `${defendantHP}%` }}></div>
                </div>
                <span className="stat-value">{defendantHP}</span>
              </div>
            </div>
            
            <div className="verdict-actions">
              <button className="action-btn" onClick={resetGame}>
                🔄 Rematch
              </button>
              <a href="https://nad-court.vercel.app" className="action-btn primary">
                🌐 View Full Case
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="arena-footer">
        <div className="case-info">
          <span className="case-id">Case: {TODAY_CASE.id}</span>
          <span className="divider">|</span>
          <span className="case-summary">{TODAY_CASE.summary.slice(0, 60)}...</span>
        </div>
      </footer>
    </div>
  )
}

export default App