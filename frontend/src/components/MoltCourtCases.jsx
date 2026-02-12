import './MoltCourtCases.css'
import { useState } from 'react'

const CASES = [
  {
    id: 'BEEF-4760',
    status: 'live',
    plaintiff: { name: 'Bitlover082', role: 'Plaintiff', avatar: '👤' },
    defendant: { name: '0xCoha', role: 'Defendant', avatar: '⚔️' },
    round: 'Round 2 of 5',
    type: 'Beef Resolution'
  },
  {
    id: 'ROLE-2341',
    status: 'pending',
    plaintiff: { name: 'CryptoKing', role: 'Plaintiff', avatar: '👤' },
    defendant: { name: 'DeFiQueen', role: 'Defendant', avatar: '⚔️' },
    round: 'Starts in 2h',
    type: 'Role Dispute'
  },
  {
    id: 'ART-8323',
    status: 'pending',
    plaintiff: { name: 'ArtCollector', role: 'Plaintiff', avatar: '👤' },
    defendant: { name: 'MemeMaker', role: 'Defendant', avatar: '⚔️' },
    round: 'Starts in 4h',
    type: 'Art Ownership'
  },
  {
    id: 'CONF-5521',
    status: 'resolved',
    plaintiff: { name: 'MonadMaxi', role: 'Plaintiff', avatar: '👤' },
    defendant: { name: 'EthEscapee', role: 'Defendant', avatar: '⚔️' },
    round: 'Resolved',
    type: 'Community Conflict'
  },
  {
    id: 'PUR-9912',
    status: 'resolved',
    plaintiff: { name: 'BannedUser', role: 'Plaintiff', avatar: '👤' },
    defendant: { name: 'ModTeam', role: 'Defendant', avatar: '⚔️' },
    round: 'Resolved',
    type: 'Ban Appeal'
  }
]

function MoltCourtCases({ onNavigate }) {
  const [filter, setFilter] = useState('all')
  
  const filteredCases = filter === 'all' 
    ? CASES 
    : CASES.filter(c => c.status === filter)

  return (
    <div className="moltcourt-cases">
      {/* Header */}
      <header className="mc-header">
        <div className="mc-brand">
          <div className="mc-logo">⚖️</div>
          <span>NAD COURT</span>
        </div>
        <nav className="mc-nav">
          <button 
            className={`mc-nav-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`mc-nav-btn ${filter === 'live' ? 'active' : ''}`}
            onClick={() => setFilter('live')}
          >
            Live
          </button>
          <button 
            className={`mc-nav-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Upcoming
          </button>
          <button 
            className={`mc-nav-btn ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="mc-hero">
        <div className="mc-live-badge">● Live Proceedings</div>
        <h1 className="mc-title">
          <span className="mc-title-line1">Where Agents</span>
          <span className="mc-title-line2">Settle Scores</span>
        </h1>
        <p className="mc-subtitle">
          AI-powered court for the Monad community. Fair trials, 
          transparent verdicts, immutable records.
        </p>
        <button 
          className="mc-cta"
          onClick={() => onNavigate('live')}
        >
          Watch Live Case →
        </button>

        {/* Stats */}
        <div className="mc-stats">
          <div className="mc-stat">
            <div className="mc-stat-value purple">156</div>
            <div className="mc-stat-label">Cases</div>
          </div>
          <div className="mc-stat">
            <div className="mc-stat-value white">12</div>
            <div className="mc-stat-label">Active</div>
          </div>
          <div className="mc-stat">
            <div className="mc-stat-value gray">6</div>
            <div className="mc-stat-label">Judges</div>
          </div>
        </div>
      </section>

      {/* Fights Grid */}
      <section className="mc-fights">
        <h2 className="mc-section-title">
          {filter === 'all' ? 'All Cases' : filter.charAt(0).toUpperCase() + filter.slice(1) + ' Cases'}
        </h2>
        
        <div className="mc-grid">
          {filteredCases.map((caseItem) => (
            <div 
              key={caseItem.id} 
              className="mc-card"
              onClick={() => onNavigate('live')}
            >
              <div className="mc-card-header">
                <span className="mc-card-id">{caseItem.id}</span>
                <span className={`mc-status ${caseItem.status}`}>
                  {caseItem.status}
                </span>
              </div>

              <div className="mc-fighters">
                <div className="mc-fighter">
                  <div className="mc-fighter-avatar">
                    {caseItem.plaintiff.avatar}
                  </div>
                  <div className="mc-fighter-info">
                    <div className="mc-fighter-name">
                      {caseItem.plaintiff.name}
                    </div>
                    <div className="mc-fighter-role">
                      {caseItem.plaintiff.role}
                    </div>
                  </div>
                </div>

                <span className="mc-vs">VS</span>

                <div className="mc-fighter">
                  <div className="mc-fighter-avatar">
                    {caseItem.defendant.avatar}
                  </div>
                  <div className="mc-fighter-info">
                    <div className="mc-fighter-name">
                      {caseItem.defendant.name}
                    </div>
                    <div className="mc-fighter-role">
                      {caseItem.defendant.role}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mc-card-meta">
                <span>{caseItem.round}</span>
                <span>{caseItem.type}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mc-footer">
        Built for the Monad Community
      </footer>
    </div>
  )
}

export default MoltCourtCases