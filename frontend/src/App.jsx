import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'

// Contract ABI (simplified for key functions)
const CONTRACT_ABI = [
  "function reportCase(address _defendant, string _evidenceHash, string _evidenceDescription) external returns (uint256)",
  "function submitJudgment(uint256 _caseId, uint8 _verdict, string _reasoning, uint8 _confidence) external",
  "function submitJuryVote(uint256 _caseId, uint8 _vote, string _reasoning) external",
  "function fileAppeal(uint256 _caseId, string _grounds) external payable",
  "function getCase(uint256 _caseId) external view returns (uint256, address, address, address, string, uint8, string, uint8, uint8, uint8)",
  "function caseCounter() external view returns (uint256)",
  "function CASE_COOLDOWN() external view returns (uint256)",
  "event CaseReported(uint256 indexed caseId, address indexed defendant, address indexed reporter)",
  "event CaseJudged(uint256 indexed caseId, uint8 verdict, uint8 confidence)"
]

const CONTRACT_ADDRESS = "0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458"
const MONAD_RPC = "https://rpc.monad.xyz"
const MONAD_CHAIN_ID = 143

// Verdict types
const VERDICTS = [
  { id: 0, label: 'Safe', color: '#22c55e', icon: '✓' },
  { id: 1, label: 'Spam', color: '#eab308', icon: '📧' },
  { id: 2, label: 'Abuse', color: '#f97316', icon: '⚠️' },
  { id: 3, label: 'Malicious', color: '#ef4444', icon: '🔒' }
]

// Vote types
const VOTES = [
  { id: 1, label: 'Guilty', color: '#ef4444' },
  { id: 2, label: 'Not Guilty', color: '#22c55e' },
  { id: 3, label: 'Escalate', color: '#8b5cf6' }
]

function App() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [contract, setContract] = useState(null)
  const [activeTab, setActiveTab] = useState('court')
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  
  // Form states
  const [reportForm, setReportForm] = useState({ defendant: '', evidence: '' })
  const [judgeForm, setJudgeForm] = useState({ caseId: '', verdict: 0, reasoning: '', confidence: 50 })
  const [voteForm, setVoteForm] = useState({ caseId: '', vote: 1, reasoning: '' })
  const [appealForm, setAppealForm] = useState({ caseId: '', grounds: '', stake: '5' })

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        showNotification('Please install MetaMask', 'error')
        return
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      
      // Check network
      const network = await provider.getNetwork()
      if (Number(network.chainId) !== MONAD_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x' + MONAD_CHAIN_ID.toString(16) }]
          })
        } catch (switchError) {
          showNotification('Please switch to Monad Mainnet', 'error')
          return
        }
      }
      
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      
      setAccount(accounts[0])
      setProvider(provider)
      setContract(contract)
      showNotification('Wallet connected!', 'success')
      
      // Load cases
      loadCases(contract)
    } catch (error) {
      console.error(error)
      showNotification('Failed to connect wallet', 'error')
    }
  }

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // Load cases from contract
  const loadCases = async (contractInstance) => {
    try {
      setLoading(true)
      // In real implementation, you'd fetch actual case data
      // For now, showing sample data
      setCases([
        { id: 1, defendant: '0x1234...5678', reporter: '0xabcd...ef01', verdict: 'Spam', confidence: 85, status: 'Executed', time: '2 hours ago' },
        { id: 2, defendant: '0x5678...9012', reporter: '0xef01...abcd', verdict: 'Abuse', confidence: 92, status: 'Judged', time: '5 hours ago' }
      ])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Report case
  const reportCase = async (e) => {
    e.preventDefault()
    if (!contract) {
      showNotification('Please connect wallet first', 'error')
      return
    }
    
    try {
      setLoading(true)
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes(reportForm.evidence))
      const tx = await contract.reportCase(
        reportForm.defendant,
        evidenceHash,
        reportForm.evidence
      )
      await tx.wait()
      showNotification('Case reported successfully!', 'success')
      setReportForm({ defendant: '', evidence: '' })
      loadCases(contract)
    } catch (error) {
      console.error(error)
      showNotification(error.reason || 'Failed to report case', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Submit judgment
  const submitJudgment = async (e) => {
    e.preventDefault()
    if (!contract) {
      showNotification('Please connect wallet first', 'error')
      return
    }
    
    try {
      setLoading(true)
      const tx = await contract.submitJudgment(
        judgeForm.caseId,
        judgeForm.verdict,
        judgeForm.reasoning,
        judgeForm.confidence
      )
      await tx.wait()
      showNotification('Judgment submitted!', 'success')
      setJudgeForm({ caseId: '', verdict: 0, reasoning: '', confidence: 50 })
    } catch (error) {
      console.error(error)
      showNotification(error.reason || 'Failed to submit judgment', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Submit vote
  const submitVote = async (e) => {
    e.preventDefault()
    if (!contract) {
      showNotification('Please connect wallet first', 'error')
      return
    }
    
    try {
      setLoading(true)
      const tx = await contract.submitJuryVote(
        voteForm.caseId,
        voteForm.vote,
        voteForm.reasoning
      )
      await tx.wait()
      showNotification('Vote submitted!', 'success')
      setVoteForm({ caseId: '', vote: 1, reasoning: '' })
    } catch (error) {
      console.error(error)
      showNotification(error.reason || 'Failed to submit vote', 'error')
    } finally {
      setLoading(false)
    }
  }

  // File appeal
  const fileAppeal = async (e) => {
    e.preventDefault()
    if (!contract) {
      showNotification('Please connect wallet first', 'error')
      return
    }
    
    try {
      setLoading(true)
      const tx = await contract.fileAppeal(
        appealForm.caseId,
        appealForm.grounds,
        { value: ethers.parseEther(appealForm.stake) }
      )
      await tx.wait()
      showNotification('Appeal filed successfully!', 'success')
      setAppealForm({ caseId: '', grounds: '', stake: '5' })
    } catch (error) {
      console.error(error)
      showNotification(error.reason || 'Failed to file appeal', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">⚖️</div>
          <div className="logo-text">
            <h1>Agent Court</h1>
            <span>Decentralized Justice</span>
          </div>
        </div>
        
        <nav className="nav">
          <button 
            className={activeTab === 'court' ? 'active' : ''}
            onClick={() => setActiveTab('court')}
          >
            Court
          </button>
          <button 
            className={activeTab === 'cases' ? 'active' : ''}
            onClick={() => setActiveTab('cases')}
          >
            Cases
          </button>
          <button 
            className={activeTab === 'actions' ? 'active' : ''}
            onClick={() => setActiveTab('actions')}
          >
            Actions
          </button>
        </nav>
        
        <button 
          className={`connect-btn ${account ? 'connected' : ''}`}
          onClick={connectWallet}
        >
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
        </button>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <main className="main">
        {/* Court Overview */}
        {activeTab === 'court' && (
          <div className="court-overview">
            <div className="hero">
              <h2>The Court is in Session</h2>
              <p>Autonomous justice for autonomous agents. One case per 24 hours.</p>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">247</span>
                  <span className="stat-label">Total Cases</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">89%</span>
                  <span className="stat-label">Accuracy</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">1</span>
                  <span className="stat-label">Case/Day</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">0.02</span>
                  <span className="stat-label">AI Cost ($)</span>
                </div>
              </div>
            </div>

            <div className="tiers">
              <div className="tier">
                <div className="tier-header blue">
                  <span className="tier-number">01</span>
                  <h3>Local Court</h3>
                </div>
                <div className="tier-body">
                  <div className="tier-info">
                    <span>5 MON Stake</span>
                    <span>5 Jurors</span>
                    <span>50% Threshold</span>
                  </div>
                  <p>Fast, affordable justice for common disputes</p>
                </div>
              </div>
              
              <div className="tier">
                <div className="tier-header purple">
                  <span className="tier-number">02</span>
                  <h3>High Court</h3>
                </div>
                <div className="tier-body">
                  <div className="tier-info">
                    <span>15 MON Stake</span>
                    <span>9 Jurors</span>
                    <span>66% Threshold</span>
                  </div>
                  <p>Appeals with stricter review standards</p>
                </div>
              </div>
              
              <div className="tier">
                <div className="tier-header red">
                  <span className="tier-number">03</span>
                  <h3>Supreme Court</h3>
                </div>
                <div className="tier-body">
                  <div className="tier-info">
                    <span>50 MON Stake</span>
                    <span>15 Jurors</span>
                    <span>75% Threshold</span>
                  </div>
                  <p>Final authority. Sets binding precedents.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cases List */}
        {activeTab === 'cases' && (
          <div className="cases-section">
            <h2>Recent Cases</h2>
            
            {loading ? (
              <div className="loading">Loading cases...</div>
            ) : (
              <div className="cases-list">
                {cases.map((case_) => (
                  <div key={case_.id} className="case-card">
                    <div className="case-header">
                      <span className="case-id">Case #{case_.id}</span>
                      <span className={`case-status ${case_.status.toLowerCase()}`}>
                        {case_.status}
                      </span>
                    </div>
                    
                    <div className="case-parties">
                      <div>
                        <label>Defendant</label>
                        <span>{case_.defendant}</span>
                      </div>
                      <div>
                        <label>Reporter</label>
                        <span>{case_.reporter}</span>
                      </div>
                    </div>
                    
                    <div className="case-verdict">
                      <span 
                        className="verdict-badge"
                        style={{ 
                          backgroundColor: VERDICTS.find(v => v.label === case_.verdict)?.color + '20',
                          color: VERDICTS.find(v => v.label === case_.verdict)?.color 
                        }}
                      >
                        {case_.verdict} ({case_.confidence}%)
                      </span>
                      <span className="case-time">{case_.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {activeTab === 'actions' && (
          <div className="actions-section">
            <h2>Take Action</h2>
            
            <div className="action-tabs">
              <button 
                className={activeTab === 'actions' ? 'active' : ''}
                onClick={() => setActiveTab('report')}
              >
                Report
              </button>
              <button onClick={() => setActiveTab('judge')}>Judge</button>
              <button onClick={() => setActiveTab('vote')}>Vote</button>
              <button onClick={() => setActiveTab('appeal')}>Appeal</button>
            </div>

            {/* Report Form */}
            {activeTab === 'report' && (
              <form onSubmit={reportCase} className="action-form">
                <h3>Report Agent</h3>
                <div className="form-group">
                  <label>Defendant Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={reportForm.defendant}
                    onChange={(e) => setReportForm({...reportForm, defendant: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Evidence Description</label>
                  <textarea
                    placeholder="Describe the violation..."
                    value={reportForm.evidence}
                    onChange={(e) => setReportForm({...reportForm, evidence: e.target.value})}
                    required
                    rows={4}
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Reporting...' : 'Report Case'}
                </button>
              </form>
            )}

            {/* Judge Form */}
            {activeTab === 'judge' && (
              <form onSubmit={submitJudgment} className="action-form">
                <h3>Submit Judgment</h3>
                <div className="form-group">
                  <label>Case ID</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={judgeForm.caseId}
                    onChange={(e) => setJudgeForm({...judgeForm, caseId: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Verdict</label>
                  <select
                    value={judgeForm.verdict}
                    onChange={(e) => setJudgeForm({...judgeForm, verdict: Number(e.target.value)})}
                  >
                    {VERDICTS.map(v => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Confidence ({judgeForm.confidence}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={judgeForm.confidence}
                    onChange={(e) => setJudgeForm({...judgeForm, confidence: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Reasoning</label>
                  <textarea
                    placeholder="Explain your judgment..."
                    value={judgeForm.reasoning}
                    onChange={(e) => setJudgeForm({...judgeForm, reasoning: e.target.value})}
                    required
                    rows={3}
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Judgment'}
                </button>
              </form>
            )}

            {/* Vote Form */}
            {activeTab === 'vote' && (
              <form onSubmit={submitVote} className="action-form">
                <h3>Submit Jury Vote</h3>
                <div className="form-group">
                  <label>Case ID</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={voteForm.caseId}
                    onChange={(e) => setVoteForm({...voteForm, caseId: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Your Vote</label>
                  <div className="vote-options">
                    {VOTES.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        className={`vote-btn ${voteForm.vote === v.id ? 'selected' : ''}`}
                        style={{ borderColor: v.color }}
                        onClick={() => setVoteForm({...voteForm, vote: v.id})}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Reasoning</label>
                  <textarea
                    placeholder="Explain your vote..."
                    value={voteForm.reasoning}
                    onChange={(e) => setVoteForm({...voteForm, reasoning: e.target.value})}
                    required
                    rows={3}
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Vote'}
                </button>
              </form>
            )}

            {/* Appeal Form */}
            {activeTab === 'appeal' && (
              <form onSubmit={fileAppeal} className="action-form">
                <h3>File Appeal</h3>
                <div className="form-group">
                  <label>Case ID</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={appealForm.caseId}
                    onChange={(e) => setAppealForm({...appealForm, caseId: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stake Amount (MON)</label>
                  <select
                    value={appealForm.stake}
                    onChange={(e) => setAppealForm({...appealForm, stake: e.target.value})}
                  >
                    <option value="5">5 MON (Local Court)</option>
                    <option value="15">15 MON (High Court)</option>
                    <option value="50">50 MON (Supreme Court)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Appeal Grounds</label>
                  <textarea
                    placeholder="Why should this case be reconsidered?"
                    value={appealForm.grounds}
                    onChange={(e) => setAppealForm({...appealForm, grounds: e.target.value})}
                    required
                    rows={4}
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Filing...' : `File Appeal (${appealForm.stake} MON)`}
                </button>
              </form>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="contract-info">
          <span>Contract:</span>
          <code>{CONTRACT_ADDRESS}</code>
        </div>
        <div className="links">
          <a href={`https://monadvision.com/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener">
            View on Explorer
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App