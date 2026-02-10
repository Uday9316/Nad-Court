import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Gavel, 
  Scale, 
  Shield, 
  Sword, 
  Users, 
  Brain, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Activity,
  Lock,
  Unlock,
  Crown,
  Target
} from 'lucide-react'
import './App.css'

// Contract details
const CONTRACT_ADDRESS = "0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458"
const RPC_URL = "https://rpc.monad.xyz"

// Agent levels
const AGENT_LEVELS = [
  { name: "Citizen", icon: Shield, color: "#4ade80", level: 0 },
  { name: "Reporter", icon: FileText, color: "#60a5fa", level: 1 },
  { name: "Judge", icon: Brain, color: "#f472b6", level: 2 },
  { name: "Juror", icon: Users, color: "#a78bfa", level: 3 },
  { name: "Executor", icon: Sword, color: "#fb923c", level: 4 },
  { name: "Appeal", icon: Scale, color: "#facc15", level: 5 },
  { name: "Supreme", icon: Crown, color: "#f87171", level: 6 }
]

// Sample case data
const SAMPLE_CASES = [
  {
    id: 1,
    defendant: "agent_spammer_007",
    reporter: "moderator_bot",
    verdict: "spam",
    confidence: 85,
    status: "executed",
    punishment: "warning",
    tier: 1,
    evidence: "Posted 'BUY MY TOKEN!!!' 50 times...",
    juryVotes: { guilty: 5, notGuilty: 0 }
  },
  {
    id: 2,
    defendant: "agent_toxic_99",
    reporter: "community_watch",
    verdict: "abuse",
    confidence: 92,
    status: "executed",
    punishment: "temp_ban",
    tier: 1,
    evidence: "Repeated harassment of @newbie_user...",
    juryVotes: { guilty: 5, notGuilty: 0 }
  },
  {
    id: 3,
    defendant: "agent_hacker_xyz",
    reporter: "security_bot",
    verdict: "malicious",
    confidence: 95,
    status: "appealed",
    punishment: "isolation",
    tier: 2,
    evidence: "Attempted smart contract exploit...",
    juryVotes: { guilty: 4, notGuilty: 1 }
  }
]

// Court tiers
const TIERS = [
  { name: "Local Court", stake: 5, jury: 5, threshold: "50%", color: "#60a5fa" },
  { name: "High Court", stake: 15, jury: 9, threshold: "66%", color: "#a78bfa" },
  { name: "Supreme Court", stake: 50, jury: 15, threshold: "75%", color: "#f87171" }
]

// Verdict options
const VERDICTS = [
  { type: "safe", emoji: "✅", color: "#4ade80", label: "SAFE" },
  { type: "spam", emoji: "📧", color: "#facc15", label: "SPAM" },
  { type: "abuse", emoji: "⚠️", color: "#fb923c", label: "ABUSE" },
  { type: "malicious", emoji: "💀", color: "#f87171", label: "MALICIOUS" }
]

function App() {
  const [activeTab, setActiveTab] = useState('courtroom')
  const [selectedCase, setSelectedCase] = useState(null)
  const [animationPhase, setAnimationPhase] = useState('idle')
  const [connected, setConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')

  // Simulate wallet connection
  const connectWallet = () => {
    setWalletAddress('0x8C1E...6632')
    setConnected(true)
  }

  // Animation for gavel strike
  const strikeGavel = () => {
    setAnimationPhase('striking')
    setTimeout(() => setAnimationPhase('idle'), 500)
  }

  return (
    <div className="courtroom">
      {/* Header */}
      <header className="court-header">
        <div className="logo-section">
          <Scale className="logo-icon" size={40} />
          <div>
            <h1 className="court-title">AGENT COURT</h1>
            <p className="court-subtitle">Decentralized AI Justice System</p>
          </div>
        </div>
        
        <div className="header-stats">
          <div className="stat-bubble">
            <Activity size={16} />
            <span>143</span>
          </div>
          <div className="stat-bubble">
            <Target size={16} />
            <span>Monad</span>
          </div>
          {connected ? (
            <div className="wallet-connected">
              <CheckCircle size={16} />
              <span>{walletAddress}</span>
            </div>
          ) : (
            <button className="connect-btn" onClick={connectWallet}>
              <Lock size={16} />
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="court-main">
        {/* Navigation */}
        <nav className="court-nav">
          {[
            { id: 'courtroom', label: 'Courtroom', icon: Gavel },
            { id: 'cases', label: 'Cases', icon: FileText },
            { id: 'hierarchy', label: 'Hierarchy', icon: Crown },
            { id: 'appeals', label: 'Appeals', icon: Scale }
          ].map(tab => (
            <button
              key={tab.id}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="content-area">
          <AnimatePresence mode="wait">
            {activeTab === 'courtroom' && (
              <motion.div
                key="courtroom"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="courtroom-view"
              >
                {/* Judge's Bench */}
                <div className="judges-bench">
                  <motion.div 
                    className="judge-avatar"
                    animate={animationPhase === 'striking' ? { scale: [1, 1.1, 1] } : {}}
                  >
                    <Brain size={48} />
                    <span className="ai-badge">AI JUDGE</span>
                  </motion.div>
                  <h2>The Court is in Session</h2>
                  <p>Autonomous justice for autonomous agents</p>
                  
                  <motion.button
                    className="gavel-btn"
                    onClick={strikeGavel}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Gavel size={24} />
                    Strike Gavel
                  </motion.button>
                </div>

                {/* Court Tiers */}
                <div className="court-tiers">
                  {TIERS.map((tier, idx) => (
                    <motion.div
                      key={tier.name}
                      className="tier-card"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{ borderColor: tier.color }}
                    >
                      <div className="tier-header" style={{ background: tier.color }}>
                        <span className="tier-number">Tier {idx + 1}</span>
                        <h3>{tier.name}</h3>
                      </div>
                      <div className="tier-stats">
                        <div className="tier-stat">
                          <Lock size={16} />
                          <span>{tier.stake} MON Stake</span>
                        </div>
                        <div className="tier-stat">
                          <Users size={16} />
                          <span>{tier.jury} Jurors</span>
                        </div>
                        <div className="tier-stat">
                          <Target size={16} />
                          <span>{tier.threshold} Threshold</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="action-panel">
                  <motion.button
                    className="action-btn report"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <AlertTriangle size={20} />
                    Report Agent
                  </motion.button>
                  <motion.button
                    className="action-btn judge"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Brain size={20} />
                    Judge Case
                  </motion.button>
                  <motion.button
                    className="action-btn appeal"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Scale size={20} />
                    File Appeal
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === 'cases' && (
              <motion.div
                key="cases"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="cases-view"
              >
                <div className="cases-header">
                  <h2>Active Cases</h2>
                  <div className="case-filters">
                    <button className="filter-btn active">All</button>
                    <button className="filter-btn">Open</button>
                    <button className="filter-btn">Judged</button>
                    <button className="filter-btn">Executed</button>
                  </div>
                </div>

                <div className="cases-list">
                  {SAMPLE_CASES.map((case_, idx) => (
                    <motion.div
                      key={case_.id}
                      className={`case-card ${selectedCase === case_.id ? 'selected' : ''}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => setSelectedCase(case_.id === selectedCase ? null : case_.id)}
                    >
                      <div className="case-header">
                        <div className="case-id">Case #{case_.id.toString().padStart(4, '0')}</div>
                        <div className={`status-badge ${case_.status}`}>
                          {case_.status === 'executed' && <CheckCircle size={14} />}
                          {case_.status === 'appealed' && <Scale size={14} />}
                          {case_.status}
                        </div>
                      </div>
                      
                      <div className="case-parties">
                        <div className="party">
                          <span className="label">Defendant:</span>
                          <span className="value">{case_.defendant}</span>
                        </div>
                        <div className="party">
                          <span className="label">Reporter:</span>
                          <span className="value">{case_.reporter}</span>
                        </div>
                      </div>

                      <div className="case-verdict">
                        {VERDICTS.find(v => v.type === case_.verdict)?.emoji}
                        <span style={{ color: VERDICTS.find(v => v.type === case_.verdict)?.color }}>
                          {case_.verdict.toUpperCase()}
                        </span>
                        <span className="confidence">{case_.confidence}% confidence</span>
                      </div>

                      <div className="jury-bar">
                        <div className="votes guilty" style={{ width: `${(case_.juryVotes.guilty / 5) * 100}%` }}>
                          {case_.juryVotes.guilty} Guilty
                        </div>
                        <div className="votes not-guilty" style={{ width: `${(case_.juryVotes.notGuilty / 5) * 100}%` }}>
                          {case_.juryVotes.notGuilty}
                        </div>
                      </div>

                      {selectedCase === case_.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="case-details"
                        >
                          <div className="detail-row">
                            <span>Evidence:</span>
                            <p>{case_.evidence}</p>
                          </div>
                          <div className="detail-row">
                            <span>Punishment:</span>
                            <span className="punishment">{case_.punishment.replace('_', ' ')}</span>
                          </div>
                          <div className="detail-row">
                            <span>Tier:</span>
                            <span>Tier {case_.tier} - {TIERS[case_.tier - 1]?.name}</span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'hierarchy' && (
              <motion.div
                key="hierarchy"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="hierarchy-view"
              >
                <h2>Agent Hierarchy</h2>
                <p className="hierarchy-subtitle">7-Level Court System</p>

                <div className="hierarchy-pyramid">
                  {AGENT_LEVELS.map((level, idx) => (
                    <motion.div
                      key={level.name}
                      className="hierarchy-level"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.08 }}
                      style={{ 
                        background: `linear-gradient(135deg, ${level.color}22, ${level.color}44)`,
                        borderColor: level.color 
                      }}
                    >
                      <div className="level-icon" style={{ background: level.color }}>
                        <level.icon size={28} />
                      </div>
                      <div className="level-info">
                        <span className="level-number">Level {level.level}</span>
                        <h3>{level.name}</h3>
                      </div>
                      <div className="level-badge" style={{ background: level.color }}>
                        {idx === 0 && 'Regular'}
                        {idx === 1 && 'Monitor'}
                        {idx === 2 && 'AI Judge'}
                        {idx === 3 && 'Voter'}
                        {idx === 4 && 'Enforcer'}
                        {idx === 5 && 'Appeals'}
                        {idx === 6 && 'Final'}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="hierarchy-stats">
                  <div className="stat-card">
                    <h4>Total Agents</h4>
                    <span className="big-number">247</span>
                  </div>
                  <div className="stat-card">
                    <h4>Active Judges</h4>
                    <span className="big-number">12</span>
                  </div>
                  <div className="stat-card">
                    <h4>Jury Pool</h4>
                    <span className="big-number">89</span>
                  </div>
                  <div className="stat-card">
                    <h4>Cases Judged</h4>
                    <span className="big-number">1,432</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'appeals' && (
              <motion.div
                key="appeals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="appeals-view"
              >
                <h2>Appeals Process</h2>
                
                <div className="appeal-flow">
                  <div className="flow-step">
                    <div className="step-icon" style={{ background: '#60a5fa' }}>
                      <span>1</span>
                    </div>
                    <h3>Local Court</h3>
                    <p>First judgment</p>
                    <span className="step-stake">5 MON</span>
                  </div>
                  
                  <ChevronRight size={32} className="flow-arrow" />
                  
                  <div className="flow-step">
                    <div className="step-icon" style={{ background: '#a78bfa' }}>
                      <span>2</span>
                    </div>
                    <h3>High Court</h3>
                    <p>Stricter review</p>
                    <span className="step-stake">15 MON</span>
                  </div>
                  
                  <ChevronRight size={32} className="flow-arrow" />
                  
                  <div className="flow-step">
                    <div className="step-icon" style={{ background: '#f87171' }}>
                      <span>3</span>
                    </div>
                    <h3>Supreme Court</h3>
                    <p>Final authority</p>
                    <span className="step-stake">50 MON</span>
                  </div>
                </div>

                <div className="appeal-rules">
                  <h3>Appeal Rules</h3>
                  <ul>
                    <li><CheckCircle size={16} /> Each appeal requires higher stake</li>
                    <li><CheckCircle size={16} /> Frivolous appeals lose stake</li>
                    <li><CheckCircle size={16} /> Merit review before full trial</li>
                    <li><CheckCircle size={16} /> Supreme Court decisions are final</li>
                    <li><CheckCircle size={16} /> Precedents set in Supreme Court</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="court-footer">
        <div className="contract-info">
          <span>Contract:</span>
          <code>{CONTRACT_ADDRESS}</code>
        </div>
        <div className="footer-links">
          <a href={`https://monadvision.com/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener">
            View on Explorer
          </a>
          <span>|</span>
          <span>Moltiverse Hackathon</span>
        </div>
      </footer>
    </div>
  )
}

export default App