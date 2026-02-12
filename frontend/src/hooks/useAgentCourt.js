import { useState, useCallback } from 'react';

const API_URL = 'https://2295-51-20-69-171.ngrok-free.app'; // Update when ngrok changes

const JUDGES = ['PortDev', 'MikeWeb', 'Keone', 'James', 'Harpal', 'Anago'];

export function useAgentCourt() {
  const [loading, setLoading] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [plaintiffArgs, setPlaintiffArgs] = useState([]);
  const [defendantArgs, setDefendantArgs] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [verdict, setVerdict] = useState(null);

  // Generate one argument
  const generateArgument = useCallback(async (role, caseData, round) => {
    const response = await fetch(`${API_URL}/api/generate-argument`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, caseData, round })
    });
    return response.json();
  }, []);

  // Get judge evaluation
  const getJudgeEval = useCallback(async (judge, caseData, pArgs, dArgs) => {
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
  }, []);

  // Run one round
  const runRound = useCallback(async (caseData, round) => {
    setLoading(true);
    
    // Plaintiff argues
    const pResult = await generateArgument('plaintiff', caseData, round);
    if (pResult.success) {
      setPlaintiffArgs(prev => [...prev, pResult.argument]);
    }
    
    // Defendant responds
    const dResult = await generateArgument('defendant', caseData, round);
    if (dResult.success) {
      setDefendantArgs(prev => [...prev, dResult.argument]);
    }
    
    setCurrentRound(round);
    setLoading(false);
    
    return { pResult, dResult };
  }, [generateArgument]);

  // Run all 6 rounds
  const runAllRounds = useCallback(async (caseData) => {
    setLoading(true);
    const pArgs = [];
    const dArgs = [];
    
    for (let round = 1; round <= 6; round++) {
      setCurrentRound(round);
      
      // Plaintiff
      const pResult = await generateArgument('plaintiff', caseData, round);
      if (pResult.success) {
        pArgs.push(pResult.argument);
        setPlaintiffArgs([...pArgs]);
      }
      
      // Defendant
      const dResult = await generateArgument('defendant', caseData, round);
      if (dResult.success) {
        dArgs.push(dResult.argument);
        setDefendantArgs([...dArgs]);
      }
      
      // Small delay between rounds
      await new Promise(r => setTimeout(r, 500));
    }
    
    setLoading(false);
    return { pArgs, dArgs };
  }, [generateArgument]);

  // Run all judges
  const runJudges = useCallback(async (caseData, pArgs, dArgs) => {
    setLoading(true);
    const evals = [];
    
    for (const judge of JUDGES) {
      const result = await getJudgeEval(judge, caseData, pArgs, dArgs);
      if (result.success) {
        evals.push(result.evaluation);
        setEvaluations([...evals]);
      }
    }
    
    // Calculate verdict
    const v = calculateVerdict(evals);
    setVerdict(v);
    
    setLoading(false);
    return { evals, verdict: v };
  }, [getJudgeEval]);

  // Calculate final verdict
  const calculateVerdict = (evals) => {
    let pWins = 0, dWins = 0;
    let pScore = 0, dScore = 0;
    
    evals.forEach(e => {
      if (e.winner === 'plaintiff') pWins++;
      else dWins++;
      
      const p = e.scores.plaintiff;
      const d = e.scores.defendant;
      pScore += (p.logic + p.evidence + p.rebuttal + p.clarity);
      dScore += (d.logic + d.evidence + d.rebuttal + d.clarity);
    });
    
    return {
      winner: pWins > dWins ? 'plaintiff' : 'defendant',
      plaintiffWins: pWins,
      defendantWins: dWins,
      plaintiffScore: Math.round(pScore / 4),
      defendantScore: Math.round(dScore / 4),
      margin: Math.abs(pWins - dWins)
    };
  };

  // Reset case
  const reset = useCallback(() => {
    setCurrentRound(1);
    setPlaintiffArgs([]);
    setDefendantArgs([]);
    setEvaluations([]);
    setVerdict(null);
    setLoading(false);
  }, []);

  return {
    loading,
    currentRound,
    plaintiffArgs,
    defendantArgs,
    evaluations,
    verdict,
    runRound,
    runAllRounds,
    runJudges,
    reset,
    JUDGES
  };
}

// Usage example:
/*
function CourtRoom() {
  const { 
    loading, 
    currentRound, 
    plaintiffArgs, 
    defendantArgs,
    verdict,
    runAllRounds,
    runJudges 
  } = useAgentCourt();
  
  const caseData = {
    id: 'CASE-001',
    type: 'Beef Resolution',
    plaintiff: 'Bitlover082',
    defendant: '0xCoha',
    summary: 'Bug discovery dispute'
  };
  
  const startCase = async () => {
    // Phase 1: Generate 6 rounds of arguments
    const { pArgs, dArgs } = await runAllRounds(caseData);
    
    // Phase 2: Judges evaluate
    await runJudges(caseData, pArgs, dArgs);
    
    // Done! Verdict is set
  };
  
  return (
    <div>
      <button onClick={startCase} disabled={loading}>
        {loading ? 'Processing...' : 'Start Case'}
      </button>
      
      <div>Round: {currentRound}/6</div>
      
      <div>Plaintiff Arguments: {plaintiffArgs.length}</div>
      <div>Defendant Arguments: {defendantArgs.length}</div>
      
      {verdict && (
        <div>
          <h2>Winner: {verdict.winner}</h2>
          <p>Score: {verdict.plaintiffScore} - {verdict.defendantScore}</p>
        </div>
      )}
    </div>
  );
}
*/
