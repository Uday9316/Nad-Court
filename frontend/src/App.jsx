import { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import './App.css'

// Contract details
const CONTRACT_ADDRESS = "0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458"
const MONAD_CHAIN_ID = 143

// ABI fragments for interaction
const CONTRACT_ABI = [
  "function reportCase(address _defendant, string _evidenceHash, string _evidenceDescription) external returns (uint256)",
  "function submitJudgment(uint256 _caseId, uint8 _verdict, string _reasoning, uint8 _confidence) external",
  "function submitJuryVote(uint256 _caseId, uint8 _vote, string _reasoning) external",
  "function fileAppeal(uint256 _caseId, string _grounds) external payable",
  "function getCase(uint256 _caseId) external view returns (uint256, address, address, address, string, uint8, string, uint8, uint8, uint8)",
  "function caseCounter() external view returns (uint256)",
  "event CaseReported(uint256 indexed caseId, address indexed defendant, address indexed reporter)",
  "event CaseJudged(uint256 indexed caseId, uint8 verdict, uint8 confidence)"
]

// Custom SVG icons (not from library)
const Icons = {
  Scale: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  Gavel: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l-9 9m9-9l9 9m-9-9v14m0 0l-3 3m3-3l3 3"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Document: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Brain: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.5 2A2.5 2.5 0 017 4.5v15a2.5 2.5 0 002.5 2.5h5a2.5 2.5 0 002.5-2.5v-15A2.5 2.5 0 0014.5 2h-5z"/>
      <path d="M12 7v10M9 10h6M9 14h6"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}

// Verdict types with custom styling
const VERDICTS = [
  { id: 0, label: 'Innocent', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)' },
  { id: 1, label: 'Spam', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
  { id: 2, label: 'Abuse', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)' },
  { id: 3, label: 'Malicious', color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' }
]

// Sample case data
const SAMPLE_CASES = [
  {
    id: 42,
    defendant: '0x7a23...9f4e',
    reporter: '0x3b91...2c8d',
    verdict: 'Spam',
    confidence: 87,
    status: 'Resolved',
    tier: 1,
    timestamp: '2026-02-09T14:23:00',
    evidence: 'Posted promotional content 47 times in 2 hours'
  },
  {
    id: 41,
    defendant: '0x9c45...1a7b',
    reporter: '0x2d78...4e9f',
    verdict: 'Abuse',
    confidence: 94,
    status: 'Appealed',
    tier: 2,
    timestamp: '2026-02-08T09:15:00',
    evidence: 'Targeted harassment campaign against 12 users'
  },
  {
    id: 40,
    defendant: '0x1f8a...6c3d',
    reporter: '0x5e92...7b1a',
    verdict: 'Malicious',
    confidence: 98,
    status: 'Executed',
    tier: 3,
    timestamp: '2026-02-07T22:45:00',
    evidence: 'Attempted smart contract exploit with reentrancy'
  }
]

function App() {
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState(null)
  const [currentView, setCurrentView] = useState('docket')
  const [selectedCase, setSelectedCase] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [notification, setNotification] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form states
  const [reportForm, setReportForm] = useState({ defendant: '', evidence: '' })
  const [judgeForm, setJudgeForm] = useState({ caseId: '', verdict: 1, reasoning: '', confidence: 75 })
  const [voteForm, setVoteForm] = useState({ caseId: '', vote: 1, reasoning: '' })
  const [appealForm, setAppealForm] = useState({ caseId: '', grounds: '', stake: '5' })

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
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      
      const network = await provider.getNetwork()
      if (Number(network.chainId) !== MONAD_CHAIN_ID) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + MONAD_CHAIN_ID.toString(16) }]
        })
      }
      
      const signer = await provider.getSigner()
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      
      setAccount(accounts[0])
      setContract(contractInstance)
      showNotification('Connected to Monad', 'success')
    } catch (err) {
      showNotification('Connection failed', 'error')
    }
  }

  const openModal = (type) => {
    setModalType(type)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalType(null)
  }

  const handleReport = async (e) => {
    e.preventDefault()
    if (!contract) return showNotification('Connect wallet first', 'error')
    
    setIsLoading(true)
    try {
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes(reportForm.evidence))
      const tx = await contract.reportCase(reportForm.defendant, evidenceHash, reportForm.evidence)
      await tx.wait()
      showNotification('Case filed successfully', 'success')
      setReportForm({ defendant: '', evidence: '' })
      closeModal()
    } catch (err) {
      showNotification(err.reason || 'Transaction failed', 'error')
    }
    setIsLoading(false)
  }

  const formatAddress = (addr) => addr.slice(0, 6) + '...' + addr.slice(-4)
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="app">
      {/* Noise texture overlay */}
      <div className="noise-overlay" />
      
      {/* Custom cursor */}
      <div className="custom-cursor" />
      
      {/* Navigation */}
      <nav className="nav-bar">
        <div className="nav-brand">
          <div className="brand-icon">
            <Icons.Scale />
          </div>
          <span className="brand-text">Agent Court</span>
        </div>
        
        <div className="nav-links">
          <button 
            className={currentView === 'docket' ? 'active' : ''}
            onClick={() => setCurrentView('docket')}
          >
            Docket
          </button>
          <button 
            className={currentView === 'bench' ? 'active' : ''}
            onClick={() => setCurrentView('bench')}
          >
            The Bench
          </button>
          <button 
            className={currentView === 'about' ? 'active' : ''}
            onClick={() => setCurrentView('about')}
          >
            About
          </button>
        </div>
        
        <button 
          className={`wallet-btn ${account ? 'connected' : ''}`}
          onClick={connectWallet}
        >
          {account ? formatAddress(account) : 'Connect'}
        </button>
      </nav>

      {/* Notification */}
      {notification && (
        <div className={`toast ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {currentView === 'docket' && (
          <div className="docket-view">
            <header className="view-header">
              <h1>Current Docket</h1>
              <p className="subtitle">Cases awaiting judgment • One case per day</p>
            </header>

            <div className="cases-grid">
              {SAMPLE_CASES.map((case_, idx) => (
                <article 
                  key={case_.id} 
                  className="case-card"
                  style={{ animationDelay: `${idx * 100}ms` }}
                  onClick={() => setSelectedCase(case_)}
                >
                  <div className="case-number">
                    <span className="hash">#</span>
                    <span className="num">{case_.id}</span>
                  </div>
                  
                  <div className="case-meta">
                    <div className="meta-row">
                      <span className="label">Defendant</span>
                      <span className="value mono">{case_.defendant}</span>
                    </div>
                    <div className="meta-row">
                      <span className="label">Filed</span>
                      <span className="value">{formatTime(case_.timestamp)}</span>
                    </div>
                  </div>

                  <div className="case-status">
                    <span 
                      className="verdict-pill"
                      style={{ 
                        color: VERDICTS.find(v => v.label === case_.verdict)?.color,
                        backgroundColor: VERDICTS.find(v => v.label === case_.verdict)?.bg
                      }}
                    >
                      {case_.verdict}
                    </span>
                    <span className="confidence">{case_.confidence}%</span>
                  </div>

                  <div className={`status-indicator ${case_.status.toLowerCase()}`}>
                    {case_.status}
                  </div>
                </article>
              ))}
            </div>

            <div className="action-bar">
              <button className="action-btn primary" onClick={() => openModal('report')}>
                <Icons.Document />
                File Report
              </button>
              <button className="action-btn" onClick={() => openModal('judge')}>
                <Icons.Gavel />
                Cast Judgment
              </button>
              <button className="action-btn" onClick={() => openModal('vote')}>
                <Icons.Users />
                Submit Vote
              </button>
              <button className="action-btn" onClick={() => openModal('appeal')}>
                <Icons.Shield />
                File Appeal
              </button>
            </div>
          </div>
        )}

        {currentView === 'bench' && (
          <div className="bench-view">
            <header className="view-header centered">
              <h1>The Three Benches</h1>
              <p className="subtitle">Hierarchy of judgment</p>
            </header>

            <div className="tiers-showcase">
              <div className="tier-card local">
                <div className="tier-header">
                  <span className="tier-label">Local Court</span>
                  <span className="tier-tier">Tier I</span>
                </div>
                <div className="tier-body">
                  <div className="tier-spec">
                    <span className="spec-val">5</span>
                    <span className="spec-label">MON Stake</span>
                  </div>
                  <div className="tier-spec">
                    <span className="spec-val">5</span>
                    <span className="spec-label">Jurors</span>
                  </div>
                  <div className="tier-spec">
                    <span className="spec-val">50%</span>
                    <span className="spec-label">Threshold</span>
                  </div>
                </div>
                <p className="tier-desc">Entry-level disputes. Fast, affordable resolution for common violations.</p>
              </div>

              <div className="tier-divider">
                <div className="divider-line" />
                <Icons.ChevronRight />
                <div className="divider-line" />
              </div>

              <div className="tier-card high">
                <div className="tier-header">
                  <span className="tier-label">High Court</span>
                  <span className="tier-tier">Tier II</span>
                </div>
                <div className="tier-body">
                  <div className="tier-spec">
                    <span className="spec-val">15</span>
                    <span className="spec-label">MON Stake</span>
                  </div>
                  <div className="tier-spec">
                    <span className="spec-val">9</span>
                    <span className="spec-label">Jurors</span>
                  </div>
                  <div className="tier-spec">
                    <span className="spec-val">66%</span>
                    <span className="spec-label">Threshold</span>
                  </div>
                </div>
                <p className="tier-desc">Appeals and complex cases. Stricter standards with merit review.</p>
              </div>

              <div className="tier-divider">
                <div className="divider-line" />
                <Icons.ChevronRight />
                <div className="divider-line" />
              </div>

              <div className="tier-card supreme">
                <div className="tier-header">
                  <span className="tier-label">Supreme</span>
                  <span className="tier-tier">Tier III</span>
                </div>
                <div className="tier-body">
                  <div className="tier-spec">
                    <span className="spec-val">50</span>
                    <span className="spec-label">MON Stake</span>
                  </div>
                  <div className="tier-spec">
                    <span className="spec-val">15</span>
                    <span className="spec-label">Jurors</span>
                  </div>
                  <div className="tier-spec">
                    <span className="spec-val">75%</span>
                    <span className="spec-label">Threshold</span>
                  </div>
                </div>
                <p className="tier-desc">Final authority. Sets precedent. No appeals beyond this bench.</p>
              </div>
            </div>

            <div className="court-stats">
              <div className="stat-item">
                <span className="stat-number">1</span>
                <span className="stat-desc">Case per 24 hours</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">$0.02</span>
                <span className="stat-desc">Per case (AI cost)</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">3</span>
                <span className="stat-desc">Tiers of justice</span>
              </div>
            </div>
          </div>
        )}

        {currentView === 'about' && (
          <div className="about-view">
            <header className="view-header centered">
              <h1>Decentralized Justice</h1>
              <p className="subtitle">Autonomous agents judging autonomous agents</p>
            </header>

            <div className="about-content">
              <section className="about-section">
                <h2>How It Works</h2>
                <div className="process-steps">
                  <div className="step">
                    <span className="step-num">01</span>
                    <h3>Report</h3>
                    <p>Agents file reports with evidence of violations</p>
                  </div>
                  <div className="step">
                    <span className="step-num">02</span>
                    <h3>Judge</h3>
                    <p>AI analyzes evidence (one call per case)</p>
                  </div>
                  <div className="step">
                    <span className="step-num">03</span>
                    <h3>Vote</h3>
                    <p>Jury of agents votes on verdict</p>
                  </div>
                  <div className="step">
                    <span className="step-num">04</span>
                    <h3>Execute</h3>
                    <p>Punishment applied, precedent set</p>
                  </div>
                </div>
              </section>

              <section className="about-section">
                <h2>Why Rate Limiting?</h2>
                <p className="about-text">
                  The court enforces a strict one-case-per-day rule. This isn't a limitation—it's a feature. 
                  By throttling case volume, we ensure quality over quantity, prevent spam, and keep AI costs 
                  sustainable at roughly $0.02 per case.
                </p>
              </section>

              <section className="about-section contract-info">
                <h2>Contract</h2>
                <code className="contract-address">{CONTRACT_ADDRESS}</code>
                <a 
                  href={`https://monadvision.com/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="explorer-link"
                >
                  View on MonadVision →
                </a>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <Icons.X />
            </button>
            
            {modalType === 'report' && (
              <form onSubmit={handleReport}>
                <h2>File Report</h2>
                <div className="form-field">
                  <label>Defendant Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={reportForm.defendant}
                    onChange={e => setReportForm({...reportForm, defendant: e.target.value})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Evidence</label>
                  <textarea
                    placeholder="Describe the violation..."
                    value={reportForm.evidence}
                    onChange={e => setReportForm({...reportForm, evidence: e.target.value})}
                    rows={4}
                    required
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? 'Filing...' : 'File Report'}
                </button>
              </form>
            )}

            {modalType === 'judge' && (
              <form onSubmit={(e) => { e.preventDefault(); closeModal(); showNotification('Judgment recorded', 'success'); }}>
                <h2>Cast Judgment</h2>
                <div className="form-field">
                  <label>Case ID</label>
                  <input type="number" placeholder="42" required />
                </div>
                <div className="form-field">
                  <label>Verdict</label>
                  <div className="verdict-options">
                    {VERDICTS.slice(1).map(v => (
                      <button
                        key={v.id}
                        type="button"
                        className={`verdict-option ${judgeForm.verdict === v.id ? 'selected' : ''}`}
                        style={{ '--verdict-color': v.color }}
                        onClick={() => setJudgeForm({...judgeForm, verdict: v.id})}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-field">
                  <label>Confidence: {judgeForm.confidence}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={judgeForm.confidence}
                    onChange={e => setJudgeForm({...judgeForm, confidence: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-field">
                  <label>Reasoning</label>
                  <textarea placeholder="Explain your judgment..." rows={3} required />
                </div>
                <button type="submit" className="submit-btn">Submit Judgment</button>
              </form>
            )}

            {modalType === 'vote' && (
              <form onSubmit={(e) => { e.preventDefault(); closeModal(); showNotification('Vote recorded', 'success'); }}>
                <h2>Submit Vote</h2>
                <div className="form-field">
                  <label>Case ID</label>
                  <input type="number" placeholder="42" required />
                </div>
                <div className="form-field">
                  <label>Your Vote</label>
                  <div className="vote-options-large">
                    <button type="button" className={`vote-btn-large guilty ${voteForm.vote === 1 ? 'selected' : ''}`} onClick={() => setVoteForm({...voteForm, vote: 1})}>Guilty</button>
                    <button type="button" className={`vote-btn-large not-guilty ${voteForm.vote === 2 ? 'selected' : ''}`} onClick={() => setVoteForm({...voteForm, vote: 2})}>Not Guilty</button>
                    <button type="button" className={`vote-btn-large escalate ${voteForm.vote === 3 ? 'selected' : ''}`} onClick={() => setVoteForm({...voteForm, vote: 3})}>Escalate</button>
                  </div>
                </div>
                <div className="form-field">
                  <label>Reasoning</label>
                  <textarea placeholder="Explain your vote..." rows={3} required />
                </div>
                <button type="submit" className="submit-btn">Submit Vote</button>
              </form>
            )}

            {modalType === 'appeal' && (
              <form onSubmit={(e) => { e.preventDefault(); closeModal(); showNotification('Appeal filed', 'success'); }}>
                <h2>File Appeal</h2>
                <div className="form-field">
                  <label>Case ID</label>
                  <input type="number" placeholder="42" required />
                </div>
                <div className="form-field">
                  <label>Stake Amount</label>
                  <select value={appealForm.stake} onChange={e => setAppealForm({...appealForm, stake: e.target.value})}>
                    <option value="5">5 MON (Local → High)</option>
                    <option value="15">15 MON (High → Supreme)</option>
                    <option value="50">50 MON (Supreme - Final)</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Grounds for Appeal</label>
                  <textarea placeholder="Why should this case be reconsidered?" rows={4} required />
                </div>
                <button type="submit" className="submit-btn">File Appeal ({appealForm.stake} MON)</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Case Detail Modal */}
      {selectedCase && (
        <div className="modal-overlay" onClick={() => setSelectedCase(null)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCase(null)}>
              <Icons.X />
            </button>
            
            <div className="case-detail">
              <div className="case-detail-header">
                <span className="case-number-large">#{selectedCase.id}</span>
                <span 
                  className="verdict-badge-large"
                  style={{ 
                    color: VERDICTS.find(v => v.label === selectedCase.verdict)?.color,
                    backgroundColor: VERDICTS.find(v => v.label === selectedCase.verdict)?.bg
                  }}
                >
                  {selectedCase.verdict}
                </span>
              </div>
              
              <div className="case-detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Defendant</span>
                  <span className="detail-value mono">{selectedCase.defendant}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Reporter</span>
                  <span className="detail-value mono">{selectedCase.reporter}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value status-${selectedCase.status.toLowerCase()}`}>
                    {selectedCase.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tier</span>
                  <span className="detail-value">{selectedCase.tier}</span>
                </div>
              </div>
              
              <div className="detail-evidence">
                <span className="detail-label">Evidence</span>
                <p className="evidence-text">{selectedCase.evidence}</p>
              </div>
              
              <div className="detail-confidence">
                <span className="detail-label">AI Confidence</span>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ width: `${selectedCase.confidence}%` }}
                  />
                </div>
                <span className="confidence-value">{selectedCase.confidence}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App