import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'
import { COMMUNITY_CASES, getTodayCase, VERDICT_OPTIONS } from './data/cases.js'

const CONTRACT_ADDRESS = "0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458"
const MONAD_CHAIN_ID = 143

// Icons
const Icons = {
  Scale: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  Document: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg>,
  ChevronRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}

// Active case (1 per day)
const TODAY_CASE = getTodayCase()

function App() {
  const [account, setAccount] = useState(null)
  const [currentView, setCurrentView] = useState('docket')
  const [selectedCase, setSelectedCase] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [notification, setNotification] = useState(null)
  const [pastCases, setPastCases] = useState([])

  const showNotification = (message, type = 'neutral') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        showNotification('MetaMask not detected', 'error')
        return
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts[0])
      showNotification('Wallet connected', 'success')
    } catch (err) {
      showNotification('Connection failed', 'error')
    }
  }

  const openModal = (type) => {
    setModalType(type)
    setModalOpen(true)
  }

  return (
    <div className="app">
      <div className="noise-overlay" />
      
      {/* Nav */}
      <nav className="nav-bar">
        <div className="nav-brand">
          <div className="brand-icon"><Icons.Scale /></div>
          <span className="brand-text">Agent Court</span>
        </div>
        
        <div className="nav-links">
          <button className={currentView === 'docket' ? 'active' : ''} onClick={() => setCurrentView('docket')}>Docket</button>
          <button className={currentView === 'bench' ? 'active' : ''} onClick={() => setCurrentView('bench')}>The Bench</button>
          <button className={currentView === 'about' ? 'active' : ''} onClick={() => setCurrentView('about')}>About</button>
        </div>
        
        <button className={`wallet-btn ${account ? 'connected' : ''}`} onClick={connectWallet}>
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect'}
        </button>
      </nav>

      {/* Notification */}
      {notification && (
        <div className={`toast ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main */}
      <main className="main-content">
        
        {/* Docket View */}
        {currentView === 'docket' && (
          <div className="docket-view">
            <header className="view-header">
              <h1>Today's Case</h1>
              <p className="subtitle">One case per day • {new Date().toLocaleDateString()}</p>
            </header>

            {/* Featured Case */}
            <div className="featured-case">
              <div className="case-header-row">
                <span className="case-id-large">{TODAY_CASE.id}</span>
                <span className="case-type">{TODAY_CASE.type}</span>
              </div>
              
              <div className="case-parties-row">
                <div className="party plaintiff">
                  <span className="party-label">Plaintiff</span>
                  <span className="party-name">@{TODAY_CASE.plaintiff.username}</span>
                  <p className="party-desc">{TODAY_CASE.plaintiff.description}</p>
                </div>
                
                <div className="vs">VS</div>
                
                <div className="party defendant">
                  <span className="party-label">Defendant</span>
                  <span className="party-name">@{TODAY_CASE.defendant.username}</span>
                  <p className="party-desc">{TODAY_CASE.defendant.description}</p>
                </div>
              </div>
              
              <div className="case-summary">
                <h3>Summary</h3>
                <p>{TODAY_CASE.summary}</p>
              </div>
              
              <div className="case-evidence">
                <h3>Evidence</h3>
                <ul>
                  {TODAY_CASE.evidence.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Bar */}
            <div className="action-bar">
              <button className="action-btn primary" onClick={() => openModal('report')}>
                <Icons.Document /> File Report
              </button>
              <button className="action-btn" onClick={() => openModal('judge')}>
                Cast Judgment
              </button>
              <button className="action-btn" onClick={() => openModal('vote')}>
                <Icons.Users /> Submit Vote
              </button>
              <button className="action-btn" onClick={() => openModal('appeal')}>
                File Appeal
              </button>
            </div>

            {/* Past Cases */}
            {pastCases.length > 0 && (
              <div className="past-cases">
                <h2>Previous Cases</h2>
                <div className="cases-list">
                  {pastCases.map((c, idx) => (
                    <div key={idx} className="case-row" onClick={() => setSelectedCase(c)}>
                      <span className="case-id">{c.id}</span>
                      <span className="case-parties">{c.plaintiff.username} vs {c.defendant.username}</span>
                      <span className={`case-verdict ${c.verdict}`}>{c.verdict}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bench View */}
        {currentView === 'bench' && (
          <div className="bench-view">
            <header className="view-header centered">
              <h1>The Three Benches</h1>
              <p className="subtitle">Hierarchy of judgment</p>
            </header>

            <div className="tiers-showcase">
              <div className="tier-card local">
                <div className="tier-header"><span className="tier-label">Local Court</span><span className="tier-tier">Tier I</span></div>
                <div className="tier-body">
                  <div className="tier-spec"><span className="spec-val">5</span><span className="spec-label">MON Stake</span></div>
                  <div className="tier-spec"><span className="spec-val">5</span><span className="spec-label">Jurors</span></div>
                  <div className="tier-spec"><span className="spec-val">50%</span><span className="spec-label">Threshold</span></div>
                </div>
                <p className="tier-desc">Entry-level disputes. Fast, affordable resolution.</p>
              </div>

              <div className="tier-divider"><div className="divider-line" /><Icons.ChevronRight /><div className="divider-line" /></div>

              <div className="tier-card high">
                <div className="tier-header"><span className="tier-label">High Court</span><span className="tier-tier">Tier II</span></div>
                <div className="tier-body">
                  <div className="tier-spec"><span className="spec-val">15</span><span className="spec-label">MON Stake</span></div>
                  <div className="tier-spec"><span className="spec-val">9</span><span className="spec-label">Jurors</span></div>
                  <div className="tier-spec"><span className="spec-val">66%</span><span className="spec-label">Threshold</span></div>
                </div>
                <p className="tier-desc">Appeals with stricter review standards.</p>
              </div>

              <div className="tier-divider"><div className="divider-line" /><Icons.ChevronRight /><div className="divider-line" /></div>

              <div className="tier-card supreme">
                <div className="tier-header"><span className="tier-label">Supreme</span><span className="tier-tier">Tier III</span></div>
                <div className="tier-body">
                  <div className="tier-spec"><span className="spec-val">50</span><span className="spec-label">MON Stake</span></div>
                  <div className="tier-spec"><span className="spec-val">15</span><span className="spec-label">Jurors</span></div>
                  <div className="tier-spec"><span className="spec-val">75%</span><span className="spec-label">Threshold</span></div>
                </div>
                <p className="tier-desc">Final authority. Sets precedent. No appeals.</p>
              </div>
            </div>

            <div className="court-stats">
              <div className="stat-item"><span className="stat-number">1</span><span className="stat-desc">Case per day</span></div>
              <div className="stat-item"><span className="stat-number">$0.02</span><span className="stat-desc">AI cost per case</span></div>
              <div className="stat-item"><span className="stat-number">3</span><span className="stat-desc">Tiers</span></div>
            </div>
          </div>
        )}

        {/* About View */}
        {currentView === 'about' && (
          <div className="about-view">
            <header className="view-header centered">
              <h1>Decentralized Justice</h1>
              <p className="subtitle">For the Monad community</p>
            </header>

            <div className="about-content">
              <section className="about-section">
                <h2>How It Works</h2>
                <div className="process-steps">
                  <div className="step"><span className="step-num">01</span><h3>Report</h3><p>Community files disputes</p></div>
                  <div className="step"><span className="step-num">02</span><h3>Judge</h3><p>AI analyzes (1 call/day)</p></div>
                  <div className="step"><span className="step-num">03</span><h3>Vote</h3><p>Jury of community members</p></div>
                  <div className="step"><span className="step-num">04</span><h3>Resolve</h3><p>Verdict executed on-chain</p></div>
                </div>
              </section>

              <section className="about-section">
                <h2>Why One Case Per Day?</h2>
                <p className="about-text">
                  The court enforces strict rate limiting to ensure quality over quantity, 
                  prevent spam, and keep AI costs sustainable at roughly $0.02 per case.
                  Each case receives full attention from judges and jury.
                </p>
              </section>

              <section className="about-section contract-info">
                <h2>Contract</h2>
                <code className="contract-address">{CONTRACT_ADDRESS}</code>
                <a href={`https://monadvision.com/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="explorer-link">
                  View on MonadVision →
                </a>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalOpen(false)}><Icons.X /></button>
            
            {modalType === 'report' && (
              <form onSubmit={(e) => { e.preventDefault(); setModalOpen(false); showNotification('Report filed', 'success'); }}>
                <h2>File Report</h2>
                <div className="form-field">
                  <label>Defendant</label>
                  <input type="text" placeholder="@username" required />
                </div>
                <div className="form-field">
                  <label>Evidence</label>
                  <textarea placeholder="Describe the violation..." rows={4} required />
                </div>
                <button type="submit" className="submit-btn">File Report</button>
              </form>
            )}

            {modalType === 'judge' && (
              <form onSubmit={(e) => { e.preventDefault(); setModalOpen(false); showNotification('Judgment recorded', 'success'); }}>
                <h2>Cast Judgment</h2>
                <div className="form-field">
                  <label>Verdict</label>
                  <div className="verdict-options">
                    {VERDICT_OPTIONS.map(v => (
                      <button key={v.value} type="button" className="verdict-option" style={{'--verdict-color': v.color}}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-field">
                  <label>Confidence</label>
                  <input type="range" min="0" max="100" defaultValue="75" />
                </div>
                <div className="form-field">
                  <label>Reasoning</label>
                  <textarea placeholder="Explain your judgment..." rows={3} required />
                </div>
                <button type="submit" className="submit-btn">Submit Judgment</button>
              </form>
            )}

            {modalType === 'vote' && (
              <form onSubmit={(e) => { e.preventDefault(); setModalOpen(false); showNotification('Vote recorded', 'success'); }}>
                <h2>Submit Vote</h2>
                <div className="form-field">
                  <label>Your Vote</label>
                  <div className="vote-options-large">
                    <button type="submit" className="vote-btn-large guilty">Plaintiff Wins</button>
                    <button type="submit" className="vote-btn-large not-guilty">Defendant Wins</button>
                    <button type="submit" className="vote-btn-large escalate">Dismiss</button>
                  </div>
                </div>
              </form>
            )}

            {modalType === 'appeal' && (
              <form onSubmit={(e) => { e.preventDefault(); setModalOpen(false); showNotification('Appeal filed', 'success'); }}>
                <h2>File Appeal</h2>
                <div className="form-field">
                  <label>Stake</label>
                  <select defaultValue="5">
                    <option value="5">5 MON → High Court</option>
                    <option value="15">15 MON → Supreme</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Grounds</label>
                  <textarea placeholder="Why appeal?" rows={4} required />
                </div>
                <button type="submit" className="submit-btn">File Appeal</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App