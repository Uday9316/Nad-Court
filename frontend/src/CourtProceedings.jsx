import { useState } from 'react'
import './CourtProceedings.css'
import { COMMUNITY_CASES, getTodayCase } from './data/cases.js'
import { AI_AGENTS } from './data/agents.js'
import { JURY_MEMBERS, generateJuryCase } from './data/jury.js'

const TODAY_CASE = getTodayCase()

function CourtProceedings() {
  const [selectedCase, setSelectedCase] = useState(TODAY_CASE)
  const [activeTab, setActiveTab] = useState('overview')
  const [juryResult, setJuryResult] = useState(null)
  const [showDeliberation, setShowDeliberation] = useState(false)

  const startDeliberation = () => {
    setShowDeliberation(true)
    setTimeout(() => {
      const result = generateJuryCase(selectedCase)
      setJuryResult(result)
      setShowDeliberation(false)
      setActiveTab('verdict')
    }, 2000)
  }

  return (
    <div className="court-proceedings">
      {/* Header */}
      <header className="proceedings-header">
        <div className="court-title">
          <span className="seal">⚖️</span>
          <div>
            <h1>NAD COURT</h1>
            <span className="subtitle">Decentralized Justice Protocol</span>
          </div>
        </div>
        <div className="case-meta">
          <span className="case-id">{selectedCase.id}</span>
          <span className="case-type">{selectedCase.type}</span>
        </div>
      </header>

      {/* Navigation */}
      <nav className="proceedings-nav">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          📋 Case Overview
        </button>
        <button className={activeTab === 'facts' ? 'active' : ''} onClick={() => setActiveTab('facts')}>
          📁 Evidence
        </button>
        <button className={activeTab === 'arguments' ? 'active' : ''} onClick={() => setActiveTab('arguments')}>
          💼 Arguments
        </button>
        <button className={activeTab === 'jury' ? 'active' : ''} onClick={() => setActiveTab('jury')}>
          👥 The Jury
        </button>
        <button className={activeTab === 'verdict' ? 'active' : ''} onClick={() => setActiveTab('verdict')}>
          ⚖️ Verdict
        </button>
      </nav>

      {/* Main Content */}
      <main className="proceedings-content">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="overview-panel">
            <div className="parties-showcase">
              <div className="party-card plaintiff">
                <div className="party-badge">APPLICANT</div>
                <h2>{selectedCase.plaintiff.username}</h2>
                <p className="party-desc">{selectedCase.plaintiff.description}</p>
                <div className="represented-by">
                  <span>Represented by</span>
                  <strong>{AI_AGENTS.plaintiff.name}</strong>
                </div>
              </div>

              <div className="vs-divider">
                <span>VS</span>
              </div>

              <div className="party-card defendant">
                <div className="party-badge">DEFENDANT</div>
                <h2>{selectedCase.defendant.username}</h2>
                <p className="party-desc">{selectedCase.defendant.description}</p>
                <div className="represented-by">
                  <span>Represented by</span>
                  <strong>{AI_AGENTS.defendant.name}</strong>
                </div>
              </div>
            </div>

            <div className="case-summary-box">
              <h3>Case Summary</h3>
              <p>{selectedCase.summary}</p>
            </div>

            <div className="action-bar">
              <button className="btn-primary" onClick={() => setActiveTab('facts')}>
                View Evidence →
              </button>
              {!juryResult && (
                <button className="btn-accent" onClick={startDeliberation} disabled={showDeliberation}>
                  {showDeliberation ? 'Deliberating...' : '⚖️ Start Jury Deliberation'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* FACTS/EVIDENCE TAB */}
        {activeTab === 'facts' && (
          <div className="facts-panel">
            <h3>📁 Evidence & Facts</h3>
            
            <div className="evidence-section">
              <h4>Plaintiff's Evidence</h4>
              <ul className="evidence-list">
                <li><strong>Exhibit P-1:</strong> Community contribution logs proving OG status</li>
                <li><strong>Exhibit P-2:</strong> Screenshots of alleged harassment/discord logs</li>
                <li><strong>Exhibit P-3:</strong> Witness testimony from 3 community members</li>
                <li><strong>Exhibit P-4:</strong> On-chain activity since genesis</li>
              </ul>
            </div>

            <div className="evidence-section">
              <h4>Defendant's Evidence</h4>
              <ul className="evidence-list">
                <li><strong>Exhibit D-1:</strong> Kaito leaderboard ranking and metrics</li>
                <li><strong>Exhibit D-2:</strong> Open-source bot repository contributions</li>
                <li><strong>Exhibit D-3:</strong> Moderation logs showing prior warnings</li>
                <li><strong>Exhibit D-4:</strong> Community engagement statistics</li>
              </ul>
            </div>

            <div className="established-facts">
              <h4>✓ Established Facts</h4>
              <ol>
                <li>Both parties are active members of the Monad community</li>
                <li>The dispute centers on {selectedCase.type.toLowerCase()}</li>
                <li>Community sentiment is divided on the issue</li>
                <li>Both have contributed significantly to the ecosystem</li>
                <li>No clear community guidelines exist for this scenario</li>
              </ol>
            </div>
          </div>
        )}

        {/* ARGUMENTS TAB */}
        {activeTab === 'arguments' && (
          <div className="arguments-panel">
            <div className="arguments-grid">
              <div className="argument-box plaintiff-arg">
                <div className="arg-header">
                  <span className="arg-party">APPLICANT</span>
                  <h4>{selectedCase.plaintiff.username}</h4>
                  <span className="arg-agent">via {AI_AGENTS.plaintiff.name}</span>
                </div>
                <div className="argument-body">
                  <p className="opening-line">Your Honor, distinguished members of the jury,</p>
                  <p>
                    The facts are clear: the defendant has undermined my client's standing in the Monad community. 
                    The evidence shows a pattern of behavior inconsistent with community values.
                  </p>
                  <p>
                    My client, {selectedCase.plaintiff.username}, has been an upstanding member since day one. 
                    Their contributions to the ecosystem are well-documented and respected.
                  </p>
                  <p>
                    We seek justice not just for the individual, but to establish precedent that protects 
                    all community members from similar treatment.
                  </p>
                  <p className="closing-line">The precedent we set today will echo through every future dispute.</p>
                </div>
              </div>

              <div className="argument-box defendant-arg">
                <div className="arg-header">
                  <span className="arg-party">DEFENDANT</span>
                  <h4>{selectedCase.defendant.username}</h4>
                  <span className="arg-agent">via {AI_AGENTS.defendant.name}</span>
                </div>
                <div className="argument-body">
                  <p className="opening-line">Your Honor, respected jury,</p>
                  <p>
                    The plaintiff's claims are built on speculation, not evidence. My client has provided 
                    measurable, quantifiable value to this community through concrete contributions.
                  </p>
                  <p>
                    What the plaintiff calls "harassment" is merely professional critique. 
                    We cannot punish honest feedback simply because it makes some uncomfortable.
                  </p>
                  <p>
                    This case tests whether we value tenure over talent, complaints over contributions. 
                    The data speaks for itself.
                  </p>
                  <p className="closing-line">I trust this jury to see the truth.</p>
                </div>
              </div>
            </div>

            <div className="counter-arguments">
              <h4>Counter Arguments</h4>
              <div className="rebuttal plaintiff-rebuttal">
                <strong>Applicant Rebuts:</strong>
                <p>"Metrics alone don't capture community value. Cultural contribution is equally valid."</p>
              </div>
              <div className="rebuttal defendant-rebuttal">
                <strong>Defendant Rebuts:</strong>
                <p>"Cultural contribution without measurable impact is just noise. Results matter."</p>
              </div>
            </div>
          </div>
        )}

        {/* JURY TAB */}
        {activeTab === 'jury' && (
          <div className="jury-panel">
            <h3>👥 The Jury (6 Members)</h3>
            <p className="jury-instructions">
              Six community judges review the evidence and arguments. Each brings their unique expertise.
            </p>

            <div className="jury-grid">
              {JURY_MEMBERS.map(judge => (
                <div key={judge.id} className="juror-card">
                  <span className="juror-avatar">{judge.avatar}</span>
                  <h4>{judge.name}</h4>
                  <span className="juror-role">{judge.role}</span>
                  <span className="juror-bias">{judge.bias}</span>
                  <p className="catchphrase">"{judge.catchphrase}"</p>
                </div>
              ))}
            </div>

            <div className="deliberation-rules">
              <h4>Deliberation Rules</h4>
              <ul>
                <li>Simple majority required (4 of 6 votes)</li>
                <li>Each judge provides written reasoning</li>
                <li>Confidence score included with each vote</li>
                <li>Verdict is final and binding</li>
              </ul>
            </div>

            {!juryResult && (
              <div className="start-deliberation">
                <button className="btn-accent large" onClick={startDeliberation} disabled={showDeliberation}>
                  {showDeliberation ? 'Deliberating...' : '⚖️ Start Deliberation'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* VERDICT TAB */}
        {activeTab === 'verdict' && (
          <div className="verdict-panel">
            {showDeliberation ? (
              <div className="deliberating">
                <h2>⚖️ Jury Deliberating</h2>
                <div className="judges-deliberating">
                  {JURY_MEMBERS.map(j => (
                    <div key={j.id} className="deliberating-judge">
                      <span>{j.avatar}</span>
                      <small>{j.name}</small>
                    </div>
                  ))}
                </div>
              </div>
            ) : juryResult ? (
              <div className="verdict-rendered">
                <div className={`verdict-banner ${juryResult.finalVerdict.winner}`}>
                  <span className="verdict-label">VERDICT</span>
                  <h2>
                    {juryResult.finalVerdict.winner === 'plaintiff' 
                      ? selectedCase.plaintiff.username 
                      : selectedCase.defendant.username}
                  </h2>
                  <span className="verdict-sub">WINS THE CASE</span>
                </div>

                <div className="vote-tally">
                  <div className="tally-bar">
                    <div className="tally-fill plaintiff" style={{width: `${(juryResult.finalVerdict.plaintiffVotes/6)*100}%`}}>
                      <span>{juryResult.finalVerdict.plaintiffVotes} Votes</span>
                    </div>
                    <div className="tally-fill defendant" style={{width: `${(juryResult.finalVerdict.defendantVotes/6)*100}%`}}>
                      <span>{juryResult.finalVerdict.defendantVotes} Votes</span>
                    </div>
                  </div>
                </div>

                <div className="individual-verdicts">
                  <h4>Individual Judgments</h4>
                  {juryResult.juryDeliberations.map(v => (
                    <div key={v.judgeId} className={`judge-verdict ${v.verdict}`}>
                      <div className="jv-header">
                        <span className="jv-name">{v.judgeName}</span>
                        <span className={`jv-badge ${v.verdict}`}>
                          {v.verdict === 'plaintiff' ? 'FOR APPLICANT' : 'FOR DEFENDANT'}
                        </span>
                      </div>
                      <p className="jv-reasoning">{v.reasoning}</p>
                      <span className="jv-confidence">Confidence: {v.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-verdict">
                <p>Deliberation has not yet begun.</p>
                <button className="btn-accent" onClick={startDeliberation}>
                  Start Deliberation
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default CourtProceedings