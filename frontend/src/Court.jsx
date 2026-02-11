import { useState } from 'react'
import './Court.css'
import { COMMUNITY_CASES, getTodayCase, CASE_STATUS } from './data/cases.js'
import { AI_AGENTS } from './data/agents.js'

const TODAY_CASE = getTodayCase()

// Court proceedings data
const COURT_PROCEDURE = [
  { step: 1, name: "Opening Statements", status: "completed", time: "09:00 AM" },
  { step: 2, name: "Plaintiff Testimony", status: "completed", time: "09:15 AM" },
  { step: 3, name: "Cross Examination", status: "completed", time: "09:30 AM" },
  { step: 4, name: "Defendant Testimony", status: "completed", time: "09:45 AM" },
  { step: 5, name: "Evidence Review", status: "in-progress", time: "10:00 AM" },
  { step: 6, name: "Closing Arguments", status: "pending", time: "10:30 AM" },
  { step: 7, name: "Jury Deliberation", status: "pending", time: "11:00 AM" },
  { step: 8, name: "Verdict", status: "pending", time: "11:30 AM" }
]

// Evidence exhibits
const EVIDENCE_EXHIBITS = {
  plaintiff: [
    { id: "P-001", type: "Document", title: "Community Contribution Logs", description: "On-chain activity proving plaintiff's involvement since day 1", strength: "strong" },
    { id: "P-002", type: "Screenshot", title: "Discord Message History", description: "Screenshots showing defendant's alleged harassment", strength: "medium" },
    { id: "P-003", type: "Witness", title: "Testimony from OG Members", description: "3 community members vouching for plaintiff's character", strength: "strong" }
  ],
  defendant: [
    { id: "D-001", type: "Metrics", title: "Kaito Leaderboard Data", description: "Proof of defendant's high engagement and contribution score", strength: "strong" },
    { id: "D-002", type: "Code", title: "Bot Repository Commits", description: "GitHub history showing utility bot development", strength: "medium" },
    { id: "D-003", type: "Document", title: "Moderation Logs", description: "Evidence of warnings issued to plaintiff prior to incident", strength: "medium" }
  ]
}

function Court() {
  const [activeTab, setActiveTab] = useState('docket')
  const [selectedCase, setSelectedCase] = useState(TODAY_CASE)
  const [showFileCase, setShowFileCase] = useState(false)
  const [activeArgument, setActiveArgument] = useState(null)

  return (
    <div className="courtroom">
      {/* Court Header */}
      <header className="court-header">
        <div className="court-seal">⚖️</div>
        <div className="court-title">
          <h1>NAD COURT OF JUSTICE</h1>
          <p className="court-motto">"Veritas, Justitia, Communitas"</p>
        </div>
        <div className="court-info">
          <span className="session-info">Session #{new Date().getFullYear()}-{String(new Date().getDate()).padStart(3, '0')}</span>
          <span className="court-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </header>

      {/* Navigation */}
      <nav className="court-nav">
        <button 
          className={activeTab === 'docket' ? 'active' : ''}
          onClick={() => setActiveTab('docket')}
        >
          📋 Case Docket
        </button>
        <button 
          className={activeTab === 'proceedings' ? 'active' : ''}
          onClick={() => setActiveTab('proceedings')}
        >
          ⚖️ Court Proceedings
        </button>
        <button 
          className={activeTab === 'evidence' ? 'active' : ''}
          onClick={() => setActiveTab('evidence')}
        >
          📁 Evidence
        </button>
        <button 
          className={activeTab === 'arguments' ? 'active' : ''}
          onClick={() => setActiveTab('arguments')}
        >
          💼 Arguments
        </button>
        <button 
          className="file-case-btn"
          onClick={() => setShowFileCase(true)}
        >
          ➕ File New Case
        </button>
      </nav>

      {/* Main Court Area */}
      <main className="court-main">
        
        {/* Case Docket */}
        {activeTab === 'docket' && (
          <div className="docket-panel">
            <div className="panel-header">
              <h2>Active Case Docket</h2>
              <span className="case-count">{COMMUNITY_CASES.length} cases pending</span>
            </div>
            
            <div className="docket-list">
              {COMMUNITY_CASES.map((case_, idx) => (
                <div 
                  key={case_.id}
                  className={`docket-item ${selectedCase?.id === case_.id ? 'active' : ''} ${case_.status}`}
                  onClick={() => setSelectedCase(case_)}
                >
                  <div className="docket-number">Case No. {case_.id}</div>
                  <div className="docket-type">{case_.type}</div>
                  <div className="docket-parties">
                    <span className="party plaintiff-party">{case_.plaintiff.username}</span>
                    <span className="vs">v.</span>
                    <span className="party defendant-party">{case_.defendant.username}</span>
                  </div>
                  <div className={`docket-status ${case_.status}`}>
                    {case_.status === 'pending' && '⏳ Awaiting Trial'}
                    {case_.status === 'active' && '🔴 In Session'}
                    {case_.status === 'judged' && '⚖️ Under Review'}
                    {case_.status === 'resolved' && '✅ Resolved'}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Case Detail */}
            {selectedCase && (
              <div className="case-detail-card">
                <div className="case-header-banner">
                  <span className="case-number-display">{selectedCase.id}</span>
                  <h3>{selectedCase.type}</h3>
                </div>
                
                <div className="case-summary-section">
                  <h4>Case Summary</h4>
                  <p>{selectedCase.summary}</p>
                </div>

                <div className="litigants">
                  <div className="litigant plaintiff-card">
                    <div className="litigant-header">
                      <span className="litigant-badge plaintiff">PLAINTIFF</span>
                      <span className="litigant-avatar">{selectedCase.plaintiff.username[0]}</span>
                    </div>
                    <h5>{selectedCase.plaintiff.username}</h5>
                    <p className="litigant-desc">{selectedCase.plaintiff.description}</p>
                    <div className="represented-by">
                      <span>Represented by:</span>
                      <strong>{AI_AGENTS.plaintiff.name}</strong>
                    </div>
                  </div>

                  <div className="litigant defendant-card">
                    <div className="litigant-header">
                      <span className="litigant-badge defendant">DEFENDANT</span>
                      <span className="litigant-avatar">{selectedCase.defendant.username[0]}</span>
                    </div>
                    <h5>{selectedCase.defendant.username}</h5>
                    <p className="litigant-desc">{selectedCase.defendant.description}</p>
                    <div className="represented-by">
                      <span>Represented by:</span>
                      <strong>{AI_AGENTS.defendant.name}</strong>
                    </div>
                  </div>
                </div>

                <div className="quick-actions">
                  <button onClick={() => setActiveTab('arguments')}>
                    View Arguments
                  </button>
                  <button onClick={() => setActiveTab('evidence')}>
                    View Evidence
                  </button>
                  <button className="primary" onClick={() => setActiveTab('proceedings')}>
                    Enter Courtroom
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Court Proceedings */}
        {activeTab === 'proceedings' && (
          <div className="proceedings-panel">
            <div className="panel-header">
              <h2>Court Proceedings: {selectedCase?.id}</h2>
              <div className="proceeding-status">
                <span className="status-indicator live"></span>
                LIVE SESSION
              </div>
            </div>

            <div className="courtroom-layout">
              {/* Judge's Bench */}
              <div className="judges-bench">
                <div className="bench-marker">⚖️ THE BENCH</div>
                <div className="judge-seat">
                  <span className="gavel">🔨</span>
                  <span className="judge-title">Hon. AI Arbiter</span>
                </div>
              </div>

              {/* Counsel Tables */}
              <div className="counsel-tables">
                <div className="counsel-table plaintiff-table">
                  <div className="table-label">Plaintiff's Counsel</div>
                  <div className="counsel-name">{AI_AGENTS.plaintiff.name}</div>
                  <div className="counsel-emoji">{AI_AGENTS.plaintiff.avatar}</div>
                </div>
                
                <div className="court-clerk">
                  <div className="clerk-desk">
                    <span className="clerk-label">COURT CLERK</span>
                    <span className="case-display">{selectedCase?.id}</span>
                  </div>
                </div>

                <div className="counsel-table defendant-table">
                  <div className="table-label">Defendant's Counsel</div>
                  <div className="counsel-name">{AI_AGENTS.defendant.name}</div>
                  <div className="counsel-emoji">{AI_AGENTS.defendant.avatar}</div>
                </div>
              </div>

              {/* Jury Box */}
              <div className="jury-box">
                <div className="jury-label">THE JURY</div>
                <div className="jury-seats">
                  {[1,2,3,4,5].map(n => (
                    <div key={n} className="juror-seat">
                      <span className="juror-number">{n}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery */}
              <div className="gallery">
                <span className="gallery-label">PUBLIC GALLERY</span>
                <div className="gallery-seats">
                  {Array(12).fill('👤').map((emoji, i) => (
                    <span key={i} className="spectator">{emoji}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Procedure Timeline */}
            <div className="procedure-timeline">
              <h4>Today's Procedure</h4>
              <div className="timeline">
                {COURT_PROCEDURE.map((step, idx) => (
                  <div key={idx} className={`timeline-item ${step.status}`}>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <span className="step-time">{step.time}</span>
                      <span className="step-name">{step.name}</span>
                      <span className={`step-status ${step.status}`}>
                        {step.status === 'completed' && '✓'}
                        {step.status === 'in-progress' && '▶'}
                        {step.status === 'pending' && '○'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Evidence */}
        {activeTab === 'evidence' && (
          <div className="evidence-panel">
            <div className="panel-header">
              <h2>Evidence & Exhibits</h2>
              <span className="exhibit-count">6 exhibits total</span>
            </div>

            <div className="evidence-grid">
              <div className="evidence-column">
                <h3 className="column-header plaintiff-header">
                  <span className="header-badge">P</span>
                  Plaintiff's Evidence
                </h3>
                {EVIDENCE_EXHIBITS.plaintiff.map((exhibit, idx) => (
                  <div key={exhibit.id} className={`exhibit-card ${exhibit.strength}`}>
                    <div className="exhibit-header">
                      <span className="exhibit-id">{exhibit.id}</span>
                      <span className={`exhibit-type ${exhibit.type.toLowerCase()}`}>{exhibit.type}</span>
                    </div>
                    <h4>{exhibit.title}</h4>
                    <p>{exhibit.description}</p>
                    <div className="exhibit-meta">
                      <span className={`strength-badge ${exhibit.strength}`}>
                        {exhibit.strength} evidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="evidence-column">
                <h3 className="column-header defendant-header">
                  <span className="header-badge">D</span>
                  Defendant's Evidence
                </h3>
                {EVIDENCE_EXHIBITS.defendant.map((exhibit, idx) => (
                  <div key={exhibit.id} className={`exhibit-card ${exhibit.strength}`}>
                    <div className="exhibit-header">
                      <span className="exhibit-id">{exhibit.id}</span>
                      <span className={`exhibit-type ${exhibit.type.toLowerCase()}`}>{exhibit.type}</span>
                    </div>
                    <h4>{exhibit.title}</h4>
                    <p>{exhibit.description}</p>
                    <div className="exhibit-meta">
                      <span className={`strength-badge ${exhibit.strength}`}>
                        {exhibit.strength} evidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Arguments */}
        {activeTab === 'arguments' && (
          <div className="arguments-panel">
            <div className="panel-header">
              <h2>Legal Arguments & Pleadings</h2>
            </div>

            <div className="arguments-container">
              {/* Plaintiff's Arguments */}
              <section className="argument-section">
                <div className="section-header plaintiff-arg-header">
                  <span className="arg-badge">PLAINTIFF</span>
                  <h3>Opening Statement & Arguments</h3>
                </div>
                
                <div className="argument-content">
                  <div className="argument-block">
                    <h4>Primary Argument</h4>
                    <p className="pleading-text">
                      "Your Honor, distinguished members of the jury, we are here today because the defendant 
                      has systematically undermined my client's standing in the Monad community. The evidence 
                      will show a pattern of disregard for established community norms..."
                    </p>
                  </div>

                  <div className="argument-points">
                    <h4>Key Points</h4>
                    <ul>
                      <li>Historical contribution to community since genesis</li>
                      <li>Established lore and cultural impact</li>
                      <li>Documented pattern of harassment</li>
                      <li>Community testimony supporting claims</li>
                    </ul>
                  </div>

                  <div className="legal-precedents">
                    <h4>Cited Precedents</h4>
                    <ul>
                      <li><em>Community v. BadActor-2024</em> - OG rights precedence</li>
                      <li><em>Nads v. PurgeAbuser</em> - Protection of established members</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Defendant's Arguments */}
              <section className="argument-section">
                <div className="section-header defendant-arg-header">
                  <span className="arg-badge">DEFENDANT</span>
                  <h3>Opening Statement & Arguments</h3>
                </div>
                
                <div className="argument-content">
                  <div className="argument-block">
                    <h4>Primary Argument</h4>
                    <p className="pleading-text">
                      "Your Honor, the plaintiff's claims are without merit. My client has provided 
                      measurable, quantifiable value to this community through concrete tools and 
                      consistent engagement. The so-called 'harassment' is merely professional critique..."
                    </p>
                  </div>

                  <div className="argument-points">
                    <h4>Key Points</h4>
                    <ul>
                      <li>Quantifiable metrics proving contribution</li>
                      <li>Open-source tools benefitting all members</li>
                      <li>Professional standards, not harassment</li>
                      <li>Plaintiff's history of toxic behavior</li>
                    </ul>
                  </div>

                  <div className="legal-precedents">
                    <h4>Cited Precedents</h4>
                    <ul>
                      <li><em>Builders v. Critics-2024</em> - Utility over tenure</li>
                      <li><em>Metrics v. Lore</em> - Objective contribution standards</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Rebuttals */}
              <section className="argument-section rebuttals">
                <div className="section-header rebuttal-header">
                  <span className="arg-badge">REBUTTALS</span>
                  <h3>Counter-Arguments</h3>
                </div>
                
                <div className="rebuttal-content">
                  <div className="rebuttal plaintiff-rebuttal">
                    <h4>Plaintiff's Rebuttal</h4>
                    <p>"Metrics alone do not capture community value. Cultural contribution is equally valid..."</p>
                  </div>
                  <div className="rebuttal defendant-rebuttal">
                    <h4>Defendant's Rebuttal</h4>
                    <p>"Cultural contribution without measurable impact is just noise. The data speaks for itself..."</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* File Case Modal */}
      {showFileCase && (
        <div className="modal-overlay" onClick={() => setShowFileCase(false)}>
          <div className="file-case-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>File New Case</h2>
              <button className="close-btn" onClick={() => setShowFileCase(false)}>×</button>
            </div>
            
            <form className="file-case-form">
              <div className="form-section">
                <label>Case Type</label>
                <select>
                  <option>Beef Resolution</option>
                  <option>Community Conflict</option>
                  <option>Role Assignment Dispute</option>
                  <option>Art Ownership Dispute</option>
                  <option>Purge Appeal</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-section">
                  <label>Plaintiff</label>
                  <input type="text" placeholder="@username" />
                </div>
                <div className="form-section">
                  <label>Defendant</label>
                  <input type="text" placeholder="@username" />
                </div>
              </div>

              <div className="form-section">
                <label>Case Summary</label>
                <textarea placeholder="Brief description of the dispute..." rows={3} />
              </div>

              <div className="form-section">
                <label>Initial Arguments</label>
                <div className="arguments-input">
                  <textarea placeholder="Plaintiff's argument..." rows={2} />
                  <textarea placeholder="Defendant's argument..." rows={2} />
                </div>
              </div>

              <div className="form-section">
                <label>Evidence (optional)</label>
                <div className="evidence-uploader">
                  <button type="button" className="upload-btn">📎 Attach Files</button>
                  <span className="upload-hint">Screenshots, links, documents</span>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="secondary" onClick={() => setShowFileCase(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  📋 File Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Court