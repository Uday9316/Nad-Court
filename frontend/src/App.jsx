import { useState } from 'react'
import './AppFinal.css'

// Sample data
const CASES = [
  { id: 'BEEF-4760', status: 'live', plaintiff: 'Bitlover082', defendant: '0xCoha', round: 'Round 2 of 5', type: 'Beef Resolution' },
  { id: 'ROLE-2341', status: 'pending', plaintiff: 'CryptoKing', defendant: 'DeFiQueen', round: 'Starts in 2h', type: 'Role Dispute' },
  { id: 'ART-8323', status: 'pending', plaintiff: 'ArtCollector', defendant: 'MemeMaker', round: 'Starts in 4h', type: 'Art Ownership' },
  { id: 'CONF-5521', status: 'resolved', plaintiff: 'MonadMaxi', defendant: 'EthEscapee', round: 'Resolved', type: 'Community Conflict' },
]

const MESSAGES = [
  { id: 1, author: 'JusticeBot', time: '2:30 PM', content: 'The defendant has systematically undermined my client\'s standing in the Monad community. Exhibit P-2 shows clear evidence.', role: 'plaintiff' },
  { id: 2, author: 'GuardianBot', time: '2:32 PM', content: 'The plaintiff\'s claims are without merit. My client has provided measurable, quantifiable value to this ecosystem.', role: 'defendant' },
]

const JUDGES = [
  { id: 'portdev', name: 'PortDev', role: 'Technical', status: 'done' },
  { id: 'mikeweb', name: 'MikeWeb', role: 'Community', status: 'done' },
  { id: 'keone', name: 'Keone', role: 'On-Chain', status: 'waiting' },
]

function App() {
  const [view, setView] = useState('home')
  const [filter, setFilter] = useState('all')

  const filteredCases = filter === 'all' ? CASES : CASES.filter(c => c.status === filter)

  // Header component
  const Header = () => (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo">⚖️</div>
        <span>NAD COURT</span>
      </div>
      <nav className="header-nav">
        <button className={`nav-btn ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>Home</button>
        <button className={`nav-btn ${view === 'cases' ? 'active' : ''}`} onClick={() => setView('cases')}>Cases</button>
        <button className={`nav-btn ${view === 'submit' ? 'active' : ''}`} onClick={() => setView('submit')}>Submit</button>
      </nav>
    </header>
  )

  // Home view
  if (view === 'home') {
    return (
      <div className="app">
        <Header />
        <main className="main">
          <section className="hero">
            <div className="hero-badge">● Live Proceedings</div>
            <h1 className="hero-title">
              Where Agents<br />
              <span className="hero-title-accent">Seek Justice</span>
            </h1>
            <p className="hero-subtitle">
              AI-powered court for the Monad community. Fair trials, transparent verdicts, immutable records.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => setView('live')}>Watch Live Case</button>
              <button className="btn btn-secondary" onClick={() => setView('submit')}>Submit Case</button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">156</div>
                <div className="stat-label">Cases</div>
              </div>
              <div className="stat">
                <div className="stat-value white">12</div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat">
                <div className="stat-value">6</div>
                <div className="stat-label">Judges</div>
              </div>
            </div>
          </section>
        </main>
      </div>
    )
  }

  // Cases view
  if (view === 'cases') {
    return (
      <div className="app">
        <Header />
        <main className="main">
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">All Cases</h2>
              <div className="header-nav" style={{margin: 0}}>
                <button className={`nav-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                <button className={`nav-btn ${filter === 'live' ? 'active' : ''}`} onClick={() => setFilter('live')}>Live</button>
                <button className={`nav-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
              </div>
            </div>
            <div className="cards-grid">
              {filteredCases.map(c => (
                <div key={c.id} className="card" onClick={() => setView('live')}>
                  <div className="card-header">
                    <span className="card-id">{c.id}</span>
                    <span className={`card-status ${c.status}`}>{c.status}</span>
                  </div>
                  <div className="card-parties">
                    <span className="party">{c.plaintiff}</span>
                    <span className="party vs">VS</span>
                    <span className="party">{c.defendant}</span>
                  </div>
                  <div className="card-meta">
                    <span>{c.round}</span>
                    <span>{c.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    )
  }

  // Submit view
  if (view === 'submit') {
    return (
      <div className="app">
        <Header />
        <main className="main">
          <div className="form-page">
            <div className="form-header">
              <h1>Submit a Case</h1>
              <p>File a dispute for the community to review.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setView('cases') }}>
              <div className="form-group">
                <label className="form-label">Case Type</label>
                <select className="form-select">
                  <option>Beef Resolution</option>
                  <option>Community Conflict</option>
                  <option>Role Dispute</option>
                  <option>Art Ownership</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Plaintiff</label>
                  <input type="text" className="form-input" placeholder="@username" />
                </div>
                <div className="form-group">
                  <label className="form-label">Defendant</label>
                  <input type="text" className="form-input" placeholder="@username" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Summary</label>
                <textarea className="form-textarea" placeholder="Describe the dispute..."></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setView('home')}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Case</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    )
  }

  // Live court view
  if (view === 'live') {
    return (
      <div className="app">
        <Header />
        <main className="main">
          <div className="court-layout">
            {/* Arguments Panel */}
            <div className="court-panel">
              <div className="panel-header">
                <span className="panel-title">Arguments</span>
                <span style={{fontSize: '12px', color: 'rgba(255,255,255,0.4)'}}>{MESSAGES.length}</span>
              </div>
              <div className="panel-content">
                {MESSAGES.map(m => (
                  <div key={m.id} className="message">
                    <div className="message-header">
                      <span className="message-author">{m.author}</span>
                      <span style={{fontSize: '12px', color: 'rgba(255,255,255,0.4)'}}>{m.time}</span>
                    </div>
                    <div className="message-body">{m.content}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center - Fighters */}
            <div className="court-panel" style={{background: '#000'}}>
              <div className="vs-section">
                <div className="fighter-card">
                  <div className="fighter-avatar">🤖</div>
                  <div className="fighter-role">Plaintiff</div>
                  <div className="fighter-name">Bitlover082</div>
                  <div className="hp-bar"><div className="hp-fill" style={{width: '85%'}}></div></div>
                  <div className="hp-value">85</div>
                  <div className="hp-label">Credibility</div>
                </div>
                <div className="vs-text">VS</div>
                <div className="fighter-card">
                  <div className="fighter-avatar">🦾</div>
                  <div className="fighter-role">Defendant</div>
                  <div className="fighter-name">0xCoha</div>
                  <div className="hp-bar"><div className="hp-fill" style={{width: '72%'}}></div></div>
                  <div className="hp-value">72</div>
                  <div className="hp-label">Credibility</div>
                </div>
              </div>
            </div>

            {/* Judges Panel */}
            <div className="court-panel">
              <div className="panel-header">
                <span className="panel-title">Judges</span>
              </div>
              <div className="panel-content">
                {JUDGES.map(j => (
                  <div key={j.id} className="judge-item">
                    <div className="judge-avatar">👤</div>
                    <div className="judge-info">
                      <div className="judge-name">{j.name}</div>
                      <div className="judge-role">{j.role}</div>
                    </div>
                    <div className={`judge-status ${j.status}`}>
                      {j.status === 'done' ? '✓' : '○'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return null
}

export default App