import { useState } from 'react'
import './CaseArchives.css'

// Mock upcoming cases
const UPCOMING_CASES = [
  {
    case_id: 'NAD-0021',
    status: 'scheduled',
    plaintiff: '@CryptoKing',
    defendant: '@DeFiQueen',
    start_time: '2026-02-14T18:00:00Z',
    charge: 'Community disruption',
    description: 'Dispute over governance proposal spam'
  }
]

// Mock resolved cases
const RESOLVED_CASES = [
  {
    case_id: 'NAD-0017',
    status: 'resolved',
    plaintiff: '@Bitlover082',
    defendant: '@0xCoha',
    winner: 'plaintiff',
    final_health: { plaintiff: 34, defendant: 0 },
    punishment: '24h community suspension',
    appeal_available: true,
    resolved_at: '2026-02-10T20:00:00Z',
    summary: 'Harassment claims substantiated by evidence'
  },
  {
    case_id: 'NAD-0016',
    status: 'resolved',
    plaintiff: '@ArtCollector',
    defendant: '@MemeMaker',
    winner: 'defendant',
    final_health: { plaintiff: 12, defendant: 68 },
    punishment: 'None - Case dismissed',
    appeal_available: false,
    resolved_at: '2026-02-09T18:30:00Z',
    summary: 'Fair use defense accepted'
  },
  {
    case_id: 'NAD-0015',
    status: 'resolved',
    plaintiff: '@ModTeam',
    defendant: '@SpamBot',
    winner: 'plaintiff',
    final_health: { plaintiff: 78, defendant: 0 },
    punishment: 'Permanent ban',
    appeal_available: false,
    resolved_at: '2026-02-08T12:00:00Z',
    summary: 'Clear violation of community guidelines'
  }
]

function CaseArchives({ view }) {
  const [selectedCase, setSelectedCase] = useState(null)

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCountdown = (startTime) => {
    const now = new Date()
    const start = new Date(startTime)
    const diff = start - now
    
    if (diff <= 0) return 'Starting soon...'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  if (view === 'upcoming') {
    return (
      <div className="case-archives">
        <header className="archives-header">
          <h1>📅 UPCOMING CASES</h1>
          <p className="archives-sub">Scheduled trials awaiting deliberation</p>
        </header>

        <div className="cases-grid">
          {UPCOMING_CASES.map((case_) => (
            <div key={case_.case_id} className="case-card upcoming">
              <div className="case-header">
                <span className="case-id">{case_.case_id}</span>
                <span className="countdown-badge">⏰ {getCountdown(case_.start_time)}</span>
              </div>
              
              <div className="case-charge">{case_.charge}</div>
              
              <div className="case-parties">
                <div className="party plaintiff-party">
                  <span className="party-label">Plaintiff</span>
                  <span className="party-name">{case_.plaintiff}</span>
                </div>
                <span className="vs-small">VS</span>
                <div className="party defendant-party">
                  <span className="party-label">Defendant</span>
                  <span className="party-name">{case_.defendant}</span>
                </div>
              </div>
              
              <p className="case-description">{case_.description}</p>
              
              <div className="case-footer">
                <span className="start-time">🗓️ {formatDate(case_.start_time)}</span>
                <button className="notify-btn">🔔 Notify Me</button>
              </div>
            </div>
          ))}
        </div>

        <div className="archives-notice">
          <p>💡 Cases are randomly selected from the queue. Staking required to file.</p>
        </div>
      </div>
    )
  }

  if (view === 'resolved') {
    return (
      <div className="case-archives">
        <header className="archives-header">
          <h1>📁 RESOLVED CASES</h1>
          <p className="archives-sub">Archive of completed trials and verdicts</p>
        </header>

        <div className="cases-list">
          {RESOLVED_CASES.map((case_) => (
            <div 
              key={case_.case_id} 
              className={`case-row ${case_.winner}`}
              onClick={() => setSelectedCase(selectedCase === case_.case_id ? null : case_.case_id)}
            >
              <div className="row-main">
                <span className="row-id">{case_.case_id}</span>
                <div className="row-parties">
                  <span className={case_.winner === 'plaintiff' ? 'winner' : ''}>{case_.plaintiff}</span>
                  <span className="vs-dot">•</span>
                  <span className={case_.winner === 'defendant' ? 'winner' : ''}>{case_.defendant}</span>
                </div>
                <span className={`verdict-badge ${case_.winner}`}>
                  {case_.winner === 'plaintiff' ? '👤 P Wins' : '⚔️ D Wins'}
                </span>
                <span className="row-date">{formatDate(case_.resolved_at)}</span>
                <button className="expand-btn">
                  {selectedCase === case_.case_id ? '−' : '+'}
                </button>
              </div>
              
              {selectedCase === case_.case_id && (
                <div className="row-details">
                  <div className="detail-section">
                    <h4>Final Credibility</h4>
                    <div className="mini-health-bars">
                      <div className="mini-bar">
                        <span>Plaintiff</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{width: `${case_.final_health.plaintiff}%`}}></div>
                        </div>
                        <span>{case_.final_health.plaintiff}</span>
                      </div>
                      <div className="mini-bar">
                        <span>Defendant</span>
                        <div className="bar-track">
                          <div className="bar-fill defendant" style={{width: `${case_.final_health.defendant}%`}}></div>
                        </div>
                        <span>{case_.final_health.defendant}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Verdict Summary</h4>
                    <p>{case_.summary}</p>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Sentence</h4>
                    <p className="punishment">{case_.punishment}</p>
                  </div>
                  
                  {case_.appeal_available && (
                    <div className="appeal-notice">
                      <span>⚖️ Appeal available within 48h</span>
                      <button className="appeal-btn">File Appeal</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="archives-stats">
          <div className="stat-box">
            <span className="stat-number">156</span>
            <span className="stat-label">Total Cases</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">68%</span>
            <span className="stat-label">Plaintiff Wins</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">12</span>
            <span className="stat-label">Pending Appeals</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default CaseArchives