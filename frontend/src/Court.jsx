import { useState } from 'react'
import './Court.css'
import { COMMUNITY_CASES, getTodayCase } from './data/cases.js'
import { AI_AGENTS } from './data/agents.js'

const TODAY_CASE = getTodayCase()

// Gamified court proceedings
const COURT_LEVELS = [
  { level: 1, name: "Case Filed", xp: 100, status: "completed", icon: "📋" },
  { level: 2, name: "Evidence Submitted", xp: 250, status: "completed", icon: "📁" },
  { level: 3, name: "Opening Statements", xp: 400, status: "completed", icon: "🎤" },
  { level: 4, name: "Witness Testimony", xp: 600, status: "in-progress", icon: "👤" },
  { level: 5, name: "Cross Examination", xp: 800, status: "locked", icon: "⚔️" },
  { level: 6, name: "Closing Arguments", xp: 1000, status: "locked", icon: "💥" },
  { level: 7, name: "Jury Deliberation", xp: 1200, status: "locked", icon: "🎲" },
  { level: 8, name: "FINAL VERDICT", xp: 1500, status: "locked", icon: "👑", boss: true }
]

// Evidence as collectible cards
const EVIDENCE_CARDS = {
  plaintiff: [
    { id: "P-001", name: "Genesis Badge", rarity: "legendary", power: 95, type: "Authority", desc: "Proof of OG status since day 1", icon: "🏅" },
    { id: "P-002", name: "Harassment Logs", rarity: "epic", power: 78, type: "Damage", desc: "Screenshots of toxic behavior", icon: "💬" },
    { id: "P-003", name: "Community Vouch", rarity: "rare", power: 65, type: "Support", desc: "3 witnesses testify for you", icon: "👥" },
    { id: "P-004", name: "Contribution History", rarity: "common", power: 45, type: "Buff", desc: "On-chain activity logs", icon: "📊" }
  ],
  defendant: [
    { id: "D-001", name: "Kaito Crown", rarity: "legendary", power: 92, type: "Authority", desc: "Top 10 leaderboard ranking", icon: "👑" },
    { id: "D-002", name: "Builder's Code", rarity: "epic", power: 82, type: "Utility", desc: "Open-source bot repository", icon: "💻" },
    { id: "D-003", name: "Warning Records", rarity: "rare", power: 58, type: "Counter", desc: "Plaintiff's past violations", icon: "⚠️" },
    { id: "D-004", name: "Engagement Stats", rarity: "common", power: 42, type: "Buff", desc: "High activity metrics", icon: "📈" }
  ]
}

// Argument moves
const ARGUMENT_MOVES = {
  plaintiff: [
    { name: "LORE STRIKE", damage: 85, type: "Cultural", desc: "Invoke OG status and community history", combo: "↓→+P" },
    { name: "WITNESS RUSH", damage: 72, type: "Social", desc: "Call upon community testimony", combo: "→↓→+K" },
    { name: "EVIDENCE SLAM", damage: 68, type: "Technical", desc: "Present documented proof", combo: "↓↓+P" },
    { name: "EMOTIONAL APPEAL", damage: 55, type: "Psych", desc: "Pull at jury's heartstrings", combo: "←→+K" }
  ],
  defendant: [
    { name: "METRIC CRUSHER", damage: 90, type: "Data", desc: "Overwhelm with quantifiable stats", combo: "→↓↘+P" },
    { name: "UTILITY BLAST", damage: 76, type: "Tech", desc: "Showcase built tools and bots", combo: "↓↘→+K" },
    { name: "COUNTER ATTACK", damage: 70, type: "Legal", desc: "Expose plaintiff's hypocrisy", combo: "←↓←+P" },
    { name: "LOGIC BOMB", damage: 62, type: "Intellect", desc: "Dismantle with pure reasoning", combo: "→←→+K" }
  ]
}

function Court() {
  const [activeTab, setActiveTab] = useState('docket')
  const [selectedCase, setSelectedCase] = useState(TODAY_CASE)
  const [selectedCard, setSelectedCard] = useState(null)
  const [showFileModal, setShowFileModal] = useState(false)

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'legendary': return '#ff6b35'
      case 'epic': return '#a855f7'
      case 'rare': return '#3b82f6'
      default: return '#22c55e'
    }
  }

  return (
    <div className="court-arena">
      {/* Header */}
      <header className="court-header-gaming">
        <div className="court-logo">
          <span className="logo-icon">⚖️</span>
          <div>
            <h1>NAD COURT</h1>
            <span className="subtitle">BATTLE FOR JUSTICE</span>
          </div>
        </div>
        <div className="court-stats">
          <div className="stat">
            <span className="stat-value">{COMMUNITY_CASES.length}</span>
            <span className="stat-label">ACTIVE CASES</span>
          </div>
          <div className="stat">
            <span className="stat-value">24h</span>
            <span className="stat-label">COOLDOWN</span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="court-nav-gaming">
        {['docket', 'evidence', 'moves', 'progress'].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'docket' && '📋 DOCKET'}
            {tab === 'evidence' && '🎴 EVIDENCE'}
            {tab === 'moves' && '⚔️ MOVES'}
            {tab === 'progress' && '📈 PROGRESS'}
          </button>
        ))}
        <button className="file-case-gaming" onClick={() => setShowFileModal(true)}>
          ➕ FILE CASE
        </button>
      </nav>

      {/* Main Content */}
      <main className="court-content">
        
        {/* DOCKET TAB */}
        {activeTab === 'docket' && (
          <div className="docket-arena">
            <div className="case-selector">
              <h2>SELECT CASE</h2>
              <div className="case-cards">
                {COMMUNITY_CASES.map((case_, idx) => (
                  <div 
                    key={case_.id}
                    className={`case-card ${selectedCase?.id === case_.id ? 'active' : ''} ${case_.status}`}
                    onClick={() => setSelectedCase(case_)}
                  >
                    <div className="card-header">
                      <span className="case-id">{case_.id}</span>
                      <span className={`rarity-badge ${case_.tier || 'common'}`}>{case_.tier || 'COMMON'}</span>
                    </div>
                    <div className="card-type">{case_.type}</div>
                    <div className="card-matchup">
                      <span className="fighter">{case_.plaintiff.username}</span>
                      <span className="vs">VS</span>
                      <span className="fighter">{case_.defendant.username}</span>
                    </div>
                    <div className="card-agents">
                      <span className="agent-tag plaintiff">🤖 JusticeBot</span>
                      <span className="agent-tag defendant">🦾 GuardianBot</span>
                    </div>
                    <div className={`card-status ${case_.status}`}>
                      {case_.status === 'active' ? '🔴 LIVE' : 
                       case_.status === 'pending' ? '⏳ QUEUED' : 
                       case_.status === 'resolved' ? '✅ COMPLETE' : '👁️ JUDGING'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedCase && (
              <div className="case-preview">
                <div className="preview-header">
                  <h3>CASE PREVIEW</h3>
                  <button className="enter-arena-btn">ENTER ARENA →</button>
                </div>
                
                <div className="fighters-showcase">
                  <div className="fighter-card plaintiff">
                    <div className="fighter-avatar">{AI_AGENTS.plaintiff.avatar}</div>
                    <div className="fighter-info">
                      <span className="role">PLAINTIFF AGENT</span>
                      <h4>{AI_AGENTS.plaintiff.name}</h4>
                      <div className="fighter-stats">
                        <span>STR: {AI_AGENTS.plaintiff.stats.strength}</span>
                        <span>INT: {AI_AGENTS.plaintiff.stats.intelligence}</span>
                        <span>SPD: {AI_AGENTS.plaintiff.stats.speed}</span>
                      </div>
                    </div>
                    <div className="human-client">
                      <span>Client: {selectedCase.plaintiff.username}</span>
                    </div>
                  </div>

                  <div className="vs-divider">
                    <span className="vs-text">VS</span>
                    <span className="match-type">{selectedCase.type}</span>
                  </div>

                  <div className="fighter-card defendant">
                    <div className="fighter-avatar">{AI_AGENTS.defendant.avatar}</div>
                    <div className="fighter-info">
                      <span className="role">DEFENDANT AGENT</span>
                      <h4>{AI_AGENTS.defendant.name}</h4>
                      <div className="fighter-stats">
                        <span>STR: {AI_AGENTS.defendant.stats.strength}</span>
                        <span>INT: {AI_AGENTS.defendant.stats.intelligence}</span>
                        <span>SPD: {AI_AGENTS.defendant.stats.speed}</span>
                      </div>
                    </div>
                    <div className="human-client">
                      <span>Client: {selectedCase.defendant.username}</span>
                    </div>
                  </div>
                </div>

                <div className="case-details">
                  <div className="detail-section">
                    <h4>🎯 OBJECTIVE</h4>
                    <p>{selectedCase.summary}</p>
                  </div>
                  <div className="detail-section">
                    <h4>🏆 REWARDS</h4>
                    <div className="rewards">
                      <span className="reward">⚖️ Justice Served</span>
                      <span className="reward">🎖️ Community Rep</span>
                      <span className="reward">💎 Case XP</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EVIDENCE TAB */}
        {activeTab === 'evidence' && (
          <div className="evidence-deck">
            <div className="deck-section">
              <h2>
                <span className="deck-icon plaintiff">🤖</span>
                PLAINTIFF'S DECK
              </h2>
              <div className="card-grid">
                {EVIDENCE_CARDS.plaintiff.map(card => (
                  <div 
                    key={card.id}
                    className={`evidence-card ${card.rarity}`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="card-shine"></div>
                    <div className="card-rarity" style={{color: getRarityColor(card.rarity)}}>
                      {card.rarity.toUpperCase()}
                    </div>
                    <div className="card-icon">{card.icon}</div>
                    <div className="card-name">{card.name}</div>
                    <div className="card-type">{card.type}</div>
                    <div className="card-power">
                      <span className="power-value">{card.power}</span>
                      <span className="power-label">PWR</span>
                    </div>
                    <div className="card-desc">{card.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="deck-section">
              <h2>
                <span className="deck-icon defendant">🦾</span>
                DEFENDANT'S DECK
              </h2>
              <div className="card-grid">
                {EVIDENCE_CARDS.defendant.map(card => (
                  <div 
                    key={card.id}
                    className={`evidence-card ${card.rarity}`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="card-shine"></div>
                    <div className="card-rarity" style={{color: getRarityColor(card.rarity)}}>
                      {card.rarity.toUpperCase()}
                    </div>
                    <div className="card-icon">{card.icon}</div>
                    <div className="card-name">{card.name}</div>
                    <div className="card-type">{card.type}</div>
                    <div className="card-power">
                      <span className="power-value">{card.power}</span>
                      <span className="power-label">PWR</span>
                    </div>
                    <div className="card-desc">{card.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MOVES TAB */}
        {activeTab === 'moves' && (
          <div className="moves-list">
            <div className="moves-section">
              <h2>
                <span className="move-icon plaintiff">🤖</span>
                JUSTICEBOT MOVES
              </h2>
              <div className="move-set">
                {ARGUMENT_MOVES.plaintiff.map((move, idx) => (
                  <div key={idx} className="move-card plaintiff-move">
                    <div className="move-header">
                      <span className="move-name">{move.name}</span>
                      <span className="move-damage">{move.damage} DMG</span>
                    </div>
                    <div className="move-meta">
                      <span className="move-type">{move.type}</span>
                      <span className="move-combo">{move.combo}</span>
                    </div>
                    <p className="move-desc">{move.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="moves-section">
              <h2>
                <span className="move-icon defendant">🦾</span>
                GUARDIANBOT MOVES
              </h2>
              <div className="move-set">
                {ARGUMENT_MOVES.defendant.map((move, idx) => (
                  <div key={idx} className="move-card defendant-move">
                    <div className="move-header">
                      <span className="move-name">{move.name}</span>
                      <span className="move-damage">{move.damage} DMG</span>
                    </div>
                    <div className="move-meta">
                      <span className="move-type">{move.type}</span>
                      <span className="move-combo">{move.combo}</span>
                    </div>
                    <p className="move-desc">{move.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="progress-track">
            <div className="track-header">
              <h2>CASE PROGRESSION</h2>
              <div className="current-xp">
                <span className="xp-value">600 / 1500 XP</span>
                <div className="xp-bar">
                  <div className="xp-fill" style={{width: '40%'}}></div>
                </div>
              </div>
            </div>

            <div className="level-track">
              {COURT_LEVELS.map((level, idx) => (
                <div 
                  key={idx} 
                  className={`level-node ${level.status} ${level.boss ? 'boss-level' : ''}`}
                >
                  <div className="node-icon">
                    {level.status === 'completed' ? '✓' : 
                     level.status === 'in-progress' ? level.icon :
                     level.status === 'locked' ? '🔒' : level.icon}
                  </div>
                  <div className="node-info">
                    <span className="level-num">LEVEL {level.level}</span>
                    <span className="level-name">{level.name}</span>
                    <span className="level-xp">{level.xp} XP</span>
                  </div>
                  {idx < COURT_LEVELS.length - 1 && (
                    <div className={`level-connector ${level.status === 'completed' ? 'active' : ''}`}></div>
                  )}
                </div>
              ))}
            </div>

            <div className="progress-rewards">
              <h3>🏆 MILESTONE REWARDS</h3>
              <div className="reward-grid">
                <div className="reward-item locked">
                  <span className="reward-icon">⚖️</span>
                  <span className="reward-name">Justice Served</span>
                  <span className="reward-req">Reach Level 8</span>
                </div>
                <div className="reward-item locked">
                  <span className="reward-icon">🎖️</span>
                  <span className="reward-name">Community Champion</span>
                  <span className="reward-req">Win 5 Cases</span>
                </div>
                <div className="reward-item unlocked">
                  <span className="reward-icon">📋</span>
                  <span className="reward-name">Case Filer</span>
                  <span className="reward-req">File your first case</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* File Case Modal */}
      {showFileModal && (
        <div className="modal-gaming" onClick={() => setShowFileModal(false)}>
          <div className="modal-content-gaming" onClick={e => e.stopPropagation()}>
            <div className="modal-header-gaming">
              <h2>🎮 FILE NEW CASE</h2>
              <button className="close-x" onClick={() => setShowFileModal(false)}>×</button>
            </div>
            
            <form className="file-form-gaming">
              <div className="form-group">
                <label>CASE TYPE</label>
                <select className="gaming-input">
                  <option>🥩 BEEF RESOLUTION</option>
                  <option>⚔️ COMMUNITY CONFLICT</option>
                  <option>🎭 ROLE DISPUTE</option>
                  <option>🎨 ART OWNERSHIP</option>
                  <option>🚫 PURGE APPEAL</option>
                </select>
              </div>

              <div className="form-row-gaming">
                <div className="form-group">
                  <label>PLAINTIFF</label>
                  <input type="text" className="gaming-input" placeholder="@username" />
                </div>
                <div className="form-group">
                  <label>DEFENDANT</label>
                  <input type="text" className="gaming-input" placeholder="@username" />
                </div>
              </div>

              <div className="form-group">
                <label>CASE DESCRIPTION</label>
                <textarea className="gaming-input" rows={3} placeholder="What's the beef?..." />
              </div>

              <div className="form-group">
                <label>SELECT EVIDENCE CARDS</label>
                <div className="evidence-select">
                  <button type="button" className="add-card-btn">+ Add Card</button>
                </div>
              </div>

              <div className="form-actions-gaming">
                <button type="button" className="btn-cancel" onClick={() => setShowFileModal(false)}>
                  CANCEL
                </button>
                <button type="submit" className="btn-submit">
                  ⚔️ INITIATE BATTLE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="modal-gaming" onClick={() => setSelectedCard(null)}>
          <div className={`card-detail-modal ${selectedCard.rarity}`} onClick={e => e.stopPropagation()}>
            <div className="card-large">
              <div className="card-rarity-large" style={{color: getRarityColor(selectedCard.rarity)}}>
                {selectedCard.rarity.toUpperCase()}
              </div>
              <div className="card-icon-large">{selectedCard.icon}</div>
              <div className="card-name-large">{selectedCard.name}</div>
              <div className="card-type-large">{selectedCard.type} CARD</div>
              <div className="card-power-large">
                <span className="power-num">{selectedCard.power}</span>
                <span className="power-text">POWER LEVEL</span>
              </div>
              <p className="card-desc-large">{selectedCard.desc}</p>
            </div>
            <button className="close-detail" onClick={() => setSelectedCard(null)}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Court