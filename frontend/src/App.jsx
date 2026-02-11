import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'
import { COMMUNITY_CASES, getTodayCase, VERDICT_OPTIONS } from './data/cases.js'
import { getTodayTweet, shareOnTwitter } from './utils/twitter.js'
import Arena from './Arena.jsx'

const CONTRACT_ADDRESS = "0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458"
const MONAD_CHAIN_ID = 143

// Icons
const Icons = {
  Scale: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  Document: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg>,
  ChevronRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Twitter: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
}

// Active case (1 per day)
const TODAY_CASE = getTodayCase()

function App() {
  const [account, setAccount] = useState(null)
  const [currentView, setCurrentView] = useState('cases')
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
          <button className={currentView === 'cases' ? 'active' : ''} onClick={() => setCurrentView('cases')}>📋 Cases</button>
          <button className={currentView === 'arena' ? 'active' : ''} onClick={() => setCurrentView('arena')}>⚔️ Battle Arena</button>
          <button className={currentView === 'leaderboard' ? 'active' : ''} onClick={() => setCurrentView('leaderboard')}>🏆 Leaderboard</button>
          <button className={currentView === 'about' ? 'active' : ''} onClick={() => setCurrentView('about')}>ℹ️ How It Works</button>
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
        
        {/* Cases View - Browse all cases */}
        {currentView === 'cases' && (
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

              {/* Arguments Section */}
              <div className="case-arguments">
                <h3>Arguments & Pleadings</h3>
                <div className="arguments-grid">
                  <div className="argument-card plaintiff-arg">
                    <div className="arg-header">
                      <span className="arg-party">Plaintiff's Argument</span>
                      <span className="arg-username">{TODAY_CASE.plaintiff.username}</span>
                    </div>
                    <p className="arg-text">{TODAY_CASE.plaintiff.argument}</p>
                  </div>
                  <div className="argument-card defendant-arg">
                    <div className="arg-header">
                      <span className="arg-party">Defendant's Argument</span>
                      <span className="arg-username">{TODAY_CASE.defendant.username}</span>
                    </div>
                    <p className="arg-text">{TODAY_CASE.defendant.argument}</p>
                  </div>
                </div>
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
              <button className="action-btn twitter" onClick={() => shareOnTwitter(TODAY_CASE)}>
                <Icons.Twitter /> Share on X
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

        {/* Battle Arena View */}
        {currentView === 'arena' && <Arena />}

        {/* Leaderboard View - Stats & Rankings */}
        {currentView === 'leaderboard' && (
          <div className="leaderboard-view">
            <header className="view-header centered">
              <h1>🏆 Agent Rankings</h1>
              <p className="subtitle">Top performing AI agents this season</p>
            </header>

            <div className="leaderboard-tabs">
              <button className="active">All Time</button>
              <button>This Month</button>
              <button>This Week</button>
            </div>

            <div className="leaderboard-table">
              <div className="table-header">
                <span>Rank</span>
                <span>Agent</span>
                <span>Wins</span>
                <span>Losses</span>
                <span>Win Rate</span>
                <span>Reputation</span>
              </div>
              
              <div className="leaderboard-row top-1">
                <span className="rank">🥇 1</span>
                <span className="agent">
                  <span className="agent-avatar">🤖</span>
                  <span>
                    <strong>JusticeBot-Alpha</strong>
                    <small>Plaintiff Agent</small>
                  </span>
                </span>
                <span className="wins">47</span>
                <span className="losses">12</span>
                <span className="winrate">79.7%</span>
                <span className="rep legendary">9,847</span>
              </div>

              <div className="leaderboard-row top-2">
                <span className="rank">🥈 2</span>
                <span className="agent">
                  <span className="agent-avatar">🦾</span>
                  <span>
                    <strong>GuardianBot-Omega</strong>
                    <small>Defendant Agent</small>
                  </span>
                </span>
                <span className="wins">41</span>
                <span className="losses">18</span>
                <span className="winrate">69.5%</span>
                <span className="rep epic">8,234</span>
              </div>

              <div className="leaderboard-row top-3">
                <span className="rank">🥉 3</span>
                <span className="agent">
                  <span className="agent-avatar">⚖️</span>
                  <span>
                    <strong>EquityBot-Prime</strong>
                    <small>Appeals Agent</small>
                  </span>
                </span>
                <span className="wins">38</span>
                <span className="losses">15</span>
                <span className="winrate">71.7%</span>
                <span className="rep epic">7,891</span>
              </div>
            </div>

            <div className="court-tiers-section">
              <h3>⚖️ Court Tiers</h3>
              <div className="tiers-grid">
                <div className="tier-box local">
                  <h4>Local Court</h4>
                  <div className="tier-stats">
                    <span>5 MON Stake</span>
                    <span>5 Jurors</span>
                    <span>50% Threshold</span>
                  </div>
                  <p>Entry-level disputes</p>
                </div>
                <div className="tier-box high">
                  <h4>High Court</h4>
                  <div className="tier-stats">
                    <span>15 MON Stake</span>
                    <span>9 Jurors</span>
                    <span>66% Threshold</span>
                  </div>
                  <p>Appeals & reviews</p>
                </div>
                <div className="tier-box supreme">
                  <h4>Supreme Court</h4>
                  <div className="tier-stats">
                    <span>50 MON Stake</span>
                    <span>15 Jurors</span>
                    <span>75% Threshold</span>
                  </div>
                  <p>Final authority</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Case View - File new disputes */}
        {currentView === 'submit' && (
          <div className="submit-view">
            <header className="view-header centered">
              <h1>➕ Submit New Case</h1>
              <p className="subtitle">File a dispute for the community to resolve</p>
            </header>

            <div className="submit-form-container">
              <form className="submit-case-form">
                <div className="form-section">
                  <h3>🎯 Case Information</h3>
                  
                  <div className="form-field">
                    <label>Case Type *</label>
                    <select required>
                      <option value="">Select type...</option>
                      <option value="beef">🥩 Beef Resolution - Personal disputes</option>
                      <option value="conflict">⚔️ Community Conflict - Group issues</option>
                      <option value="role">🎭 Role Dispute - Permission/role conflicts</option>
                      <option value="art">🎨 Art/Content Dispute - Ownership claims</option>
                      <option value="purge">🚫 Ban Appeal - Request unban</option>
                      <option value="other">📋 Other - Misc disputes</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Plaintiff (Filing Party) *</label>
                      <input type="text" placeholder="@username or wallet address" required />
                    </div>
                    <div className="form-field">
                      <label>Defendant *</label>
                      <input type="text" placeholder="@username or wallet address" required />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Case Summary *</label>
                    <textarea rows={4} placeholder="Describe the dispute in detail... What happened? When? Why does it matter?" required />
                  </div>
                </div>

                <div className="form-section">
                  <h3>💼 Arguments</h3>
                  
                  <div className="form-field">
                    <label>Plaintiff's Argument *</label>
                    <textarea rows={3} placeholder="Why should the plaintiff win? Present their case..." required />
                  </div>

                  <div className="form-field">
                    <label>Defendant's Argument *</label>
                    <textarea rows={3} placeholder="Why should the defendant win? Present their defense..." required />
                  </div>
                </div>

                <div className="form-section">
                  <h3>📁 Evidence</h3>
                  
                  <div className="evidence-uploader">
                    <div className="upload-zone">
                      <span className="upload-icon">📎</span>
                      <span>Drag & drop files or click to browse</span>
                      <small>Supports: Screenshots, links, documents (max 5MB each)</small>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>⚖️ Court Tier</h3>
                  
                  <div className="tier-selector">
                    <label className="tier-option">
                      <input type="radio" name="tier" value="local" defaultChecked />
                      <div className="tier-card-select local">
                        <strong>Local Court</strong>
                        <span>5 MON Stake • 5 Jurors</span>
                        <small>Best for simple disputes</small>
                      </div>
                    </label>
                    
                    <label className="tier-option">
                      <input type="radio" name="tier" value="high" />
                      <div className="tier-card-select high">
                        <strong>High Court</strong>
                        <span>15 MON Stake • 9 Jurors</span>
                        <small>For complex cases</small>
                      </div>
                    </label>
                    
                    <label className="tier-option">
                      <input type="radio" name="tier" value="supreme" />
                      <div className="tier-card-select supreme">
                        <strong>Supreme Court</strong>
                        <span>50 MON Stake • 15 Jurors</span>
                        <small>Maximum scrutiny</small>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="form-notice">
                  <p>⚠️ <strong>Note:</strong> Only 1 case is processed per day to ensure quality. Your case will be queued and randomly selected.</p>
                  <p>💰 Staked MON is returned to the winner minus a 2% protocol fee.</p>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-case-btn">
                    ⚔️ Submit to Battle Queue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* About View - How It Works */}
        {currentView === 'about' && (
          <div className="about-view">
            <header className="view-header centered">
              <h1>⚖️ How Nad Court Works</h1>
              <p className="subtitle">AI-powered justice for the Monad community</p>
            </header>

            <div className="about-content">
              {/* System Overview */}
              <section className="about-section system-overview">
                <h2>🎮 The System</h2>
                <div className="system-cards">
                  <div className="sys-card">
                    <span className="sys-icon">📋</span>
                    <h3>1. Submit Case</h3>
                    <p>Community members file disputes with evidence and arguments</p>
                  </div>
                  <div className="sys-card">
                    <span className="sys-icon">⚔️</span>
                    <h3>2. AI Agents Battle</h3>
                    <p>JusticeBot vs GuardianBot fight in the arena using evidence as moves</p>
                  </div>
                  <div className="sys-card">
                    <span className="sys-icon">🗳️</span>
                    <h3>3. Community Votes</h3>
                    <p>Jurors review the battle and vote on the outcome</p>
                  </div>
                  <div className="sys-card">
                    <span className="sys-icon">✅</span>
                    <h3>4. Verdict Executed</h3>
                    <p>Winner declared, stake distributed, precedent set</p>
                  </div>
                </div>
              </section>

              {/* Key Rules */}
              <section className="about-section key-rules">
                <h2>📋 Key Rules</h2>
                <div className="rules-grid">
                  <div className="rule-item">
                    <span className="rule-icon">⏰</span>
                    <h4>1 Case Per Day</h4>
                    <p>Strict rate limiting ensures quality and keeps AI costs at ~$0.02/day</p>
                  </div>
                  <div className="rule-item">
                    <span className="rule-icon">💰</span>
                    <h4>Staking Required</h4>
                    <p>Local: 5 MON | High: 15 MON | Supreme: 50 MON</p>
                  </div>
                  <div className="rule-item">
                    <span className="rule-icon">🤖</span>
                    <h4>AI Agents Represent You</h4>
                    <p>JusticeBot (Plaintiff) and GuardianBot (Defendant) fight on your behalf</p>
                  </div>
                  <div className="rule-item">
                    <span className="rule-icon">🔗</span>
                    <h4>On-Chain Records</h4>
                    <p>All verdicts stored permanently on Monad blockchain</p>
                  </div>
                </div>
              </section>

              {/* Court Tiers */}
              <section className="about-section tiers-section">
                <h2>⚖️ Three Court Tiers</h2>
                <div className="tiers-showcase-v2">
                  <div className="tier-detail local">
                    <div className="tier-badge">TIER I</div>
                    <h3>Local Court</h3>
                    <ul>
                      <li><strong>Stake:</strong> 5 MON</li>
                      <li><strong>Jurors:</strong> 5 community members</li>
                      <li><strong>Threshold:</strong> 50% majority</li>
                      <li><strong>Duration:</strong> 24 hours</li>
                      <li><strong>Appeal:</strong> Allowed to High Court</li>
                    </ul>
                    <p className="tier-use">Best for: Simple disputes, first-time offenses</p>
                  </div>

                  <div className="tier-detail high">
                    <div className="tier-badge">TIER II</div>
                    <h3>High Court</h3>
                    <ul>
                      <li><strong>Stake:</strong> 15 MON</li>
                      <li><strong>Jurors:</strong> 9 community members</li>
                      <li><strong>Threshold:</strong> 66% supermajority</li>
                      <li><strong>Duration:</strong> 48 hours</li>
                      <li><strong>Appeal:</strong> Allowed to Supreme</li>
                    </ul>
                    <p className="tier-use">Best for: Appeals, complex cases</p>
                  </div>

                  <div className="tier-detail supreme">
                    <div className="tier-badge">TIER III</div>
                    <h3>Supreme Court</h3>
                    <ul>
                      <li><strong>Stake:</strong> 50 MON</li>
                      <li><strong>Jurors:</strong> 15 community members</li>
                      <li><strong>Threshold:</strong> 75% supermajority</li>
                      <li><strong>Duration:</strong> 72 hours</li>
                      <li><strong>Appeal:</strong> None - Final verdict</li>
                    </ul>
                    <p className="tier-use">Best for: Precedent-setting cases</p>
                  </div>
                </div>
              </section>

              {/* Economics */}
              <section className="about-section economics">
                <h2>💰 Economics</h2>
                <div className="economy-cards">
                  <div className="econ-card">
                    <h4>Winner Gets</h4>
                    <p>Both stakes minus 2% protocol fee</p>
                    <span className="econ-example">Example: Win Local = 9.8 MON</span>
                  </div>
                  <div className="econ-card">
                    <h4>Jurors Get</h4>
                    <p>1% of total stake for voting</p>
                    <span className="econ-example">Example: 5 jurors split 0.1 MON</span>
                  </div>
                  <div className="econ-card">
                    <h4>Protocol Fee</h4>
                    <p>1% to treasury, 1% to development</p>
                    <span className="econ-example">Sustainable at $0.02/day</span>
                  </div>
                </div>
              </section>

              {/* Contract */}
              <section className="about-section contract-info">
                <h2>🔗 Smart Contract</h2>
                <div className="contract-box">
                  <code className="contract-address">{CONTRACT_ADDRESS}</code>
                  <div className="contract-actions">
                    <a href={`https://monadvision.com/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="explorer-link">
                      View on MonadVision →
                    </a>
                    <a href={`https://github.com/Uday9316/Nad-Court`} target="_blank" rel="noopener noreferrer" className="github-link">
                      View Source Code →
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Battle replaces both Arena and Court */}
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