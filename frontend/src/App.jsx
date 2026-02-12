import { useState, useEffect } from 'react';
import './App.css';

// UPDATE THIS when ngrok URL changes
const API_URL = 'https://2295-51-20-69-171.ngrok-free.app';

const JUDGES = ['PortDev', 'MikeWeb', 'Keone', 'James', 'Harpal', 'Anago'];

function App() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('idle'); // idle -> arguments -> judges -> verdict
  const [currentRound, setCurrentRound] = useState(1);
  
  // Arguments
  const [plaintiffArgs, setPlaintiffArgs] = useState([]);
  const [defendantArgs, setDefendantArgs] = useState([]);
  
  // Judges
  const [evaluations, setEvaluations] = useState([]);
  
  // Verdict
  const [verdict, setVerdict] = useState(null);
  
  // Case data
  const caseData = {
    id: 'LIVE-CASE-001',
    type: 'Beef Resolution',
    plaintiff: 'Bitlover082',
    defendant: '0xCoha',
    summary: 'Dispute over bug discovery and attribution'
  };

  // Generate ONE argument (plaintiff or defendant)
  const generateArgument = async (role, round) => {
    const response = await fetch(`${API_URL}/api/generate-argument`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, caseData, round })
    });
    return response.json();
  };

  // Get judge evaluation
  const getJudgeEvaluation = async (judge, pArgs, dArgs) => {
    const response = await fetch(`${API_URL}/api/judge-evaluation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        judge, 
        caseData, 
        plaintiffArgs: pArgs, 
        defendantArgs: dArgs,
        round: 1 
      })
    });
    return response.json();
  };

  // Run full case
  const startCase = async () => {
    setLoading(true);
    setStep('arguments');
    setPlaintiffArgs([]);
    setDefendantArgs([]);
    setEvaluations([]);
    setVerdict(null);
    
    // PHASE 1: Generate 6 rounds of arguments (12 total)
    for (let round = 1; round <= 6; round++) {
      setCurrentRound(round);
      
      // Plaintiff argues
      console.log(`Generating plaintiff round ${round}...`);
      const pResult = await generateArgument('plaintiff', round);
      if (pResult.success) {
        setPlaintiffArgs(prev => [...prev, pResult.argument]);
      }
      
      // Defendant responds
      console.log(`Generating defendant round ${round}...`);
      const dResult = await generateArgument('defendant', round);
      if (dResult.success) {
        setDefendantArgs(prev => [...prev, dResult.argument]);
      }
    }
    
    // PHASE 2: Judges evaluate
    setStep('judges');
    const allPlaintiffArgs = [...plaintiffArgs];
    const allDefendantArgs = [...defendantArgs];
    
    for (const judge of JUDGES) {
      console.log(`Judge ${judge} evaluating...`);
      const evalResult = await getJudgeEvaluation(judge, allPlaintiffArgs, allDefendantArgs);
      if (evalResult.success) {
        setEvaluations(prev => [...prev, evalResult.evaluation]);
      }
    }
    
    // PHASE 3: Calculate verdict
    calculateVerdict();
    setStep('verdict');
    setLoading(false);
  };

  // Calculate final verdict
  const calculateVerdict = () => {
    let pWins = 0, dWins = 0;
    let pScore = 0, dScore = 0;
    
    evaluations.forEach(e => {
      if (e.winner === 'plaintiff') pWins++;
      else dWins++;
      
      const p = e.scores.plaintiff;
      const d = e.scores.defendant;
      pScore += (p.logic + p.evidence + p.rebuttal + p.clarity);
      dScore += (d.logic + d.evidence + d.rebuttal + d.clarity);
    });
    
    setVerdict({
      winner: pWins > dWins ? 'plaintiff' : 'defendant',
      plaintiffWins: pWins,
      defendantWins: dWins,
      plaintiffScore: Math.round(pScore / 4),
      defendantScore: Math.round(dScore / 4),
      margin: Math.abs(pWins - dWins)
    });
  };

  // Calculate health bars
  const calculateHealth = () => {
    let pHealth = 100;
    let dHealth = 100;
    
    evaluations.forEach(e => {
      const p = (e.scores.plaintiff.logic + e.scores.plaintiff.evidence + e.scores.plaintiff.rebuttal + e.scores.plaintiff.clarity) / 4;
      const d = (e.scores.defendant.logic + e.scores.defendant.evidence + e.scores.defendant.rebuttal + e.scores.defendant.clarity) / 4;
      const diff = p - d;
      
      if (diff > 0) dHealth -= diff * 0.3;
      else pHealth -= Math.abs(diff) * 0.3;
    });
    
    return {
      plaintiff: Math.max(10, Math.min(100, pHealth)),
      defendant: Math.max(10, Math.min(100, dHealth))
    };
  };

  const health = calculateHealth();

  return (
    <div className="agent-court">
      <h1>🤖 Agent Court</h1>
      
      {/* Case Info */}
      <div className="case-info">
        <h2>Case: {caseData.id}</h2>
        <p>{caseData.plaintiff} vs {caseData.defendant}</p>
        <p>Type: {caseData.type}</p>
      </div>

      {/* Start Button */}
      {step === 'idle' && (
        <button onClick={startCase} disabled={loading} className="start-btn">
          {loading ? 'Loading...' : '▶️ Start Live AI Case'}
        </button>
      )}

      {/* Progress */}
      {loading && (
        <div className="progress">
          <p>Step: {step === 'arguments' ? `Generating Arguments (${currentRound}/6)` : step === 'judges' ? 'Judges Evaluating...' : 'Calculating Verdict...'}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${((plaintiffArgs.length + defendantArgs.length) / 12) * 100}%`}}
            />
          </div>
        </div>
      )}

      {/* Health Bars */}
      {(step === 'judges' || step === 'verdict') && (
        <div className="health-bars">
          <div className="health-bar">
            <span>JusticeBot-Alpha (Plaintiff)</span>
            <div className="bar"><div className="fill plaintiff" style={{width: `${health.plaintiff}%`}}/></div>
            <span>{Math.round(health.plaintiff)}%</span>
          </div>
          <div className="health-bar">
            <span>GuardianBot-Omega (Defendant)</span>
            <div className="bar"><div className="fill defendant" style={{width: `${health.defendant}%`}}/></div>
            <span>{Math.round(health.defendant)}%</span>
          </div>
        </div>
      )}

      {/* Arguments */}
      <div className="arguments">
        {plaintiffArgs.map((arg, i) => (
          <div key={`p-${i}`} className="argument plaintiff-arg">
            <h4>⚖️ JusticeBot-Alpha - Round {i + 1}</h4>
            <p>{arg}</p>
          </div>
        ))}
        
        {defendantArgs.map((arg, i) => (
          <div key={`d-${i}`} className="argument defendant-arg">
            <h4>🛡️ GuardianBot-Omega - Round {i + 1}</h4>
            <p>{arg}</p>
          </div>
        ))}
      </div>

      {/* Judge Evaluations */}
      {evaluations.length > 0 && (
        <div className="evaluations">
          <h3>⚖️ Judge Evaluations</h3>
          {evaluations.map((_eval, i) => (
            <div key={i} className="evaluation">
              <h4>{JUDGES[i]}</h4>
              <p>Winner: <strong>{_eval.winner.toUpperCase()}</strong></p>
              <p>Reasoning: {_eval.reasoning}</p>
              <div className="scores">
                <span>Plaintiff: {((_eval.scores.plaintiff.logic + _eval.scores.plaintiff.evidence + _eval.scores.plaintiff.rebuttal + _eval.scores.plaintiff.clarity)/4).toFixed(0)}</span>
                <span>Defendant: {((_eval.scores.defendant.logic + _eval.scores.defendant.evidence + _eval.scores.defendant.rebuttal + _eval.scores.defendant.clarity)/4).toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Final Verdict */}
      {verdict && (
        <div className="verdict">
          <h2>🏆 FINAL VERDICT</h2>
          <h3>Winner: {verdict.winner.toUpperCase()}</h3>
          <p>Plaintiff Score: {verdict.plaintiffScore}</p>
          <p>Defendant Score: {verdict.defendantScore}</p>
          <p>Margin: {verdict.margin} judges</p>
          <button onClick={() => setStep('idle')} className="reset-btn">Start New Case</button>
        </div>
      )}
    </div>
  );
}

export default App;
