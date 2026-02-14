import { useState, useEffect } from 'react'
import './Jury.css'
import { JURY_MEMBERS, generateJuryCase } from '../data/jury.js'
import { AI_AGENTS } from '../data/agents.js'

function Jury({ caseData }) {
  const [juryCase, setJuryCase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedJudge, setSelectedJudge] = useState(null)
  const [viewMode, setViewMode] = useState('overview') // overview, arguments, verdicts

  useEffect(() => {
    if (caseData) {
      // Simulate jury deliberation
      setLoading(true)
      setTimeout(() => {
        const result = generateJuryCase(caseData)
        setJuryCase(result)
        setLoading(false)
      }, 1500)
    }
  }, [caseData])

  if (loading) {
    return (
      <div className="jury-deliberation">
        <div className="deliberation-animation">
          <div className="jury-chamber">
            <h2>⚖️ JURY DELIBERATION IN PROGRESS</h2>
            <div className="judges-panel">
              {JURY_MEMBERS.map((judge, idx) => (
                <div key={judge.id} className="judge-avatar-animate" style={{animationDelay: `${idx * 0.2}s`}}>
                  {judge.image ? (
                    <img src={judge.image} alt={judge.name} className="j-avatar j-avatar-img" />
                  ) : (
                    <span className="j-avatar">{judge.avatar}</span>
                  )}
                  <span className="j-name">{judge.name}</span>
                  <span className="j-thinking">Analyzing...</span>
                </div>
              ))}
            </div>
            <div className="deliberation-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <p>Reviewing evidence and arguments...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!juryCase) return null

  const { facts, plaintiffArgument, defendantArgument, juryDeliberations, finalVerdict } = juryCase

  return (
    <div className="jury-system">
      {/* Header */}
      <header className="jury-header">
        <div className="court-seal">⚖️</div>
        <div>
          <h1>JURY DELIBERATION</h1>
          <p className="case-ref">Case {caseData.id} • {caseData.type}</p>
        </div>
        {finalVerdict.winner !== 'split' && (
          <div className={`final-verdict-banner ${finalVerdict.winner}`}>
            <span className="verdict-label">VERDICT</span>
            <span className="verdict-winner">
              {finalVerdict.winner === 'plaintiff' ? caseData.plaintiff.username : caseData.defendant.username}
            </span>
            <span className="verdict-sub">WINS</span>
          </div>
        )}
      </header>

      {/* Navigation */}
      <nav className="jury-nav">
        <button className={viewMode === 'overview' ? 'active' : ''} onClick={() => setViewMode('overview')}>
          📊 Overview
        </button>
        <button className={viewMode === 'arguments' ? 'active' : ''} onClick={() => setViewMode('arguments')}>
          💼 Arguments
        </button>
        <button className={viewMode === 'verdicts' ? 'active' : ''} onClick={() => setViewMode('verdicts')}>
          🗳️ Jury Votes ({finalVerdict.plaintiffVotes}-{finalVerdict.defendantVotes})
        </button>
      </nav>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="jury-overview">
          {/* Case Facts */}
          <section className="facts-section">
            <h3>📋 ESTABLISHED FACTS</h3>
            <ul className="facts-list">
              {facts.map((fact, idx) => (
                <li key={idx} className="fact-item">
                  <span className="fact-num">{idx + 1}</span>
                  <span className="fact-text">{fact}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Quick Arguments Preview */}
          <section className="arguments-preview">
            <div className="arg-preview-card plaintiff">
              <div className="preview-header plaintiff-header">
                <span className="agent-icon">{AI_AGENTS.plaintiff.avatar}</span>
                <div>
                  <span className="preview-role">APPLICANT</span>
                  <h4>{caseData.plaintiff.username}</h4>
                </div>
              </div>
              <p className="preview-text">{plaintiffArgument.substring(0, 200)}...</p>
              <button className="read-more" onClick={() => setViewMode('arguments')}>
                Read Full Argument →
              </button>
            </div>

            <div className="arg-preview-card defendant">
              <div className="preview-header defendant-header">
                <span className="agent-icon">{AI_AGENTS.defendant.avatar}</span>
                <div>
                  <span className="preview-role">DEFENDANT</span>
                  <h4>{caseData.defendant.username}</h4>
                </div>
              </div>
              <p className="preview-text">{defendantArgument.substring(0, 200)}...</p>
              <button className="read-more" onClick={() => setViewMode('arguments')}>
                Read Full Argument →
              </button>
            </div>
          </section>

          {/* Jury Panel Preview */}
          <section className="jury-panel-preview">
            <h3>👥 THE JURY (6 Members)</h3>
            <div className="jury-grid">
              {JURY_MEMBERS.map(judge => {
                const verdict = juryDeliberations.find(v => v.judgeId === judge.id)
                return (
                  <div 
                    key={judge.id} 
                    className={`jury-member ${verdict?.verdict}`}
                    onClick={() => {setSelectedJudge(judge); setViewMode('verdicts')}}
                  >
                    {judge.image ? (
                      <img src={judge.image} alt={judge.name} className="j-avatar j-avatar-img" />
                    ) : (
                      <span className="j-avatar">{judge.avatar}</span>
                    )}
                    <span className="j-name">{judge.name}</span>
                    <span className="j-role">{judge.role}</span>
                    <span className={`j-vote ${verdict?.verdict}`}>
                      {verdict?.verdict === 'plaintiff' ? '✓ P' : '✓ D'}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Vote Summary */}
          <section className="vote-summary">
            <h3>📊 VOTE TALLY</h3>
            <div className="tally-bars">
              <div className="tally-bar plaintiff-bar">
                <span className="tally-label">{caseData.plaintiff.username}</span>
                <div className="bar-container">
                  <div className="bar-fill plaintiff" style={{width: `${(finalVerdict.plaintiffVotes / 6) * 100}%`}}>
                    <span className="vote-count">{finalVerdict.plaintiffVotes}</span>
                  </div>
                </div>
              </div>
              <div className="tally-bar defendant-bar">
                <span className="tally-label">{caseData.defendant.username}</span>
                <div className="bar-container">
                  <div className="bar-fill defendant" style={{width: `${(finalVerdict.defendantVotes / 6) * 100}%`}}>
                    <span className="vote-count">{finalVerdict.defendantVotes}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="tally-meta">
              <span>Confidence: {finalVerdict.confidence}%</span>
              <span className={finalVerdict.isUnanimous ? 'unanimous' : ''}>
                {finalVerdict.isUnanimous ? '🎯 Unanimous' : '⚖️ Majority'}
              </span>
            </div>
          </section>
        </div>
      )}

      {/* Arguments Mode */}
      {viewMode === 'arguments' && (
        <div className="arguments-full">
          <div className="arg-full-card plaintiff-full">
            <div className="arg-full-header plaintiff-full-header">
              <span className="agent-avatar-large">{AI_AGENTS.plaintiff.avatar}</span>
              <div>
                <span className="full-role">APPLICANT AGENT</span>
                <h3>{AI_AGENTS.plaintiff.name}</h3>
                <span className="representing">Representing: {caseData.plaintiff.username}</span>
              </div>
            </div>
            <div className="argument-body">
              {plaintiffArgument.split('\n\n').map((para, idx) => (
                <p key={idx} className="arg-paragraph">{para}</p>
              ))}
            </div>
          </div>

          <div className="arg-full-card defendant-full">
            <div className="arg-full-header defendant-full-header">
              <span className="agent-avatar-large">{AI_AGENTS.defendant.avatar}</span>
              <div>
                <span className="full-role">DEFENDANT AGENT</span>
                <h3>{AI_AGENTS.defendant.name}</h3>
                <span className="representing">Representing: {caseData.defendant.username}</span>
              </div>
            </div>
            <div className="argument-body">
              {defendantArgument.split('\n\n').map((para, idx) => (
                <p key={idx} className="arg-paragraph">{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Verdicts Mode */}
      {viewMode === 'verdicts' && (
        <div className="verdicts-full">
          <div className="verdicts-grid">
            {juryDeliberations.map((verdict, idx) => {
              const judge = JURY_MEMBERS.find(j => j.id === verdict.judgeId)
              return (
                <div key={verdict.judgeId} className={`verdict-card ${verdict.verdict}`}>
                  <div className="verdict-judge-header">
                    {judge.image ? (
                      <img src={judge.image} alt={judge.name} className="v-avatar v-avatar-img" />
                    ) : (
                      <span className="v-avatar">{judge.avatar}</span>
                    )}
                    <div>
                      <h4>{judge.name}</h4>
                      <span className="v-role">{judge.role}</span>
                    </div>
                    <span className={`v-badge ${verdict.verdict}`}>
                      {verdict.verdict === 'plaintiff' ? 'FOR P' : 'FOR D'}
                    </span>
                  </div>
                  <div className="confidence-meter">
                    <span className="conf-label">Confidence</span>
                    <div className="conf-bar">
                      <div className="conf-fill" style={{width: `${verdict.confidence}%`}}></div>
                    </div>
                    <span className="conf-value">{verdict.confidence}%</span>
                  </div>
                  <div className="reasoning-box">
                    <h5>Reasoning:</h5>
                    <p>{verdict.reasoning}</p>
                  </div>
                  <div className="judge-meta">
                    <span className="bias-tag">{judge.bias}</span>
                    <span className="style-tag">{judge.style}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Judge Detail Modal */}
      {selectedJudge && (
        <div className="judge-modal" onClick={() => setSelectedJudge(null)}>
          <div className="judge-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedJudge(null)}>×</button>
            <div className="judge-profile">
              {selectedJudge.image ? (
                <img src={selectedJudge.image} alt={selectedJudge.name} className="profile-avatar profile-avatar-img" />
              ) : (
                <span className="profile-avatar">{selectedJudge.avatar}</span>
              )}
              <h3>{selectedJudge.name}</h3>
              <span className="profile-role">{selectedJudge.role}</span>
              <p className="catchphrase">"{selectedJudge.catchphrase}"</p>
              <div className="profile-stats">
                <div className="p-stat">
                  <span className="p-label">Bias</span>
                  <span className="p-value">{selectedJudge.bias}</span>
                </div>
                <div className="p-stat">
                  <span className="p-label">Style</span>
                  <span className="p-value">{selectedJudge.style}</span>
                </div>
                <div className="p-stat">
                  <span className="p-label">Weight</span>
                  <span className="p-value">{selectedJudge.weight}x</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Jury