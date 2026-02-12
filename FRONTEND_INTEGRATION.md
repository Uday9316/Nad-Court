# Agent Court - Frontend Integration Guide

## API Endpoints

### 1. Generate Argument
```javascript
const generateArgument = async (role, caseData, round) => {
  const response = await fetch('https://2295-51-20-69-171.ngrok-free.app/api/generate-argument', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role,        // 'plaintiff' or 'defendant'
      caseData,    // { id, type, plaintiff, defendant, summary }
      round        // 1, 2, 3, 4, 5, or 6
    })
  });
  return response.json();
};
```

### 2. Get Judge Evaluation
```javascript
const getJudgeEvaluation = async (judge, caseData, plaintiffArgs, defendantArgs, round) => {
  const response = await fetch('https://2295-51-20-69-171.ngrok-free.app/api/judge-evaluation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      judge,           // 'PortDev', 'MikeWeb', 'Keone', 'James', 'Harpal', 'Anago'
      caseData,
      plaintiffArgs,   // array of argument strings
      defendantArgs,   // array of argument strings
      round
    })
  });
  return response.json();
};
```

### 3. Get All Judges
```javascript
const getJudges = async () => {
  const response = await fetch('https://2295-51-20-69-171.ngrok-free.app/api/judges');
  return response.json();
};
```

## Full Case Flow (12 Arguments + 6 Judges + Verdict)

```javascript
// CASE CONFIGURATION
const caseData = {
  id: 'BEEF-2025-001',
  type: 'Beef Resolution',
  plaintiff: 'Bitlover082',
  defendant: '0xCoha',
  summary: 'Dispute over bug discovery attribution'
};

const JUDGES = ['PortDev', 'MikeWeb', 'Keone', 'James', 'Harpal', 'Anago'];
const TOTAL_ROUNDS = 6; // 6 arguments per side = 12 total

// STATE
let plaintiffArgs = [];
let defendantArgs = [];
let judgeEvaluations = [];
let currentRound = 1;

// RUN FULL CASE
async function runFullCase() {
  console.log('🏛️ Starting Agent Court Case...');
  
  // PHASE 1: Generate Arguments (6 rounds)
  for (let round = 1; round <= TOTAL_ROUNDS; round++) {
    console.log(`\n📢 Round ${round}/${TOTAL_ROUNDS}`);
    
    // Plaintiff argues
    console.log('⚖️ JusticeBot-Alpha generating argument...');
    const pResponse = await generateArgument('plaintiff', caseData, round);
    if (pResponse.success) {
      plaintiffArgs.push(pResponse.argument);
      console.log('✅ Plaintiff:', pResponse.argument.substring(0, 100) + '...');
    }
    
    // Defendant responds
    console.log('⚖️ GuardianBot-Omega generating response...');
    const dResponse = await generateArgument('defendant', caseData, round);
    if (dResponse.success) {
      defendantArgs.push(dResponse.argument);
      console.log('✅ Defendant:', dResponse.argument.substring(0, 100) + '...');
    }
    
    // Small delay between rounds
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // PHASE 2: Judge Evaluations
  console.log('\n⚖️ JUDGES DELIBERATING...');
  
  for (const judgeName of JUDGES) {
    console.log(`🧑‍⚖️ ${judgeName} evaluating...`);
    const evalResponse = await getJudgeEvaluation(
      judgeName, 
      caseData, 
      plaintiffArgs, 
      defendantArgs,
      1 // evaluation round
    );
    
    if (evalResponse.success) {
      judgeEvaluations.push(evalResponse.evaluation);
      console.log(`✅ ${judgeName}: ${evalResponse.evaluation.winner.toUpperCase()} wins`);
      console.log(`   Reasoning: ${evalResponse.evaluation.reasoning}`);
    }
  }
  
  // PHASE 3: Calculate Final Verdict
  const finalVerdict = calculateFinalVerdict();
  
  console.log('\n🏆 FINAL VERDICT');
  console.log(`Winner: ${finalVerdict.winner.toUpperCase()}`);
  console.log(`Score: ${finalVerdict.plaintiffScore} - ${finalVerdict.defendantScore}`);
  console.log(`Margin: ${finalVerdict.margin}`);
  
  return {
    caseData,
    plaintiffArgs,
    defendantArgs,
    judgeEvaluations,
    finalVerdict
  };
}

// Calculate final verdict from judge scores
function calculateFinalVerdict() {
  let plaintiffWins = 0;
  let defendantWins = 0;
  let plaintiffTotalScore = 0;
  let defendantTotalScore = 0;
  
  judgeEvaluations.forEach(eval => {
    // Count wins
    if (eval.winner === 'plaintiff') plaintiffWins++;
    else defendantWins++;
    
    // Sum scores
    const p = eval.scores.plaintiff;
    const d = eval.scores.defendant;
    plaintiffTotalScore += (p.logic + p.evidence + p.rebuttal + p.clarity);
    defendantTotalScore += (d.logic + d.evidence + d.rebuttal + d.clarity);
  });
  
  const winner = plaintiffWins > defendantWins ? 'plaintiff' : 'defendant';
  const margin = Math.abs(plaintiffWins - defendantWins);
  
  return {
    winner,
    plaintiffWins,
    defendantWins,
    plaintiffScore: Math.round(plaintiffTotalScore / 4),
    defendantScore: Math.round(defendantTotalScore / 4),
    margin,
    timestamp: new Date().toISOString()
  };
}

// Run it
runFullCase().then(result => {
  console.log('\n✅ Case Complete!');
  console.log('Result:', result);
});
```

## UI Flow

```
ROUND 1/6
├─ JusticeBot-Alpha (Plaintiff) argues
├─ GuardianBot-Omega (Defendant) responds
└─ Health bars update

ROUND 2/6
├─ JusticeBot-Alpha argues
├─ GuardianBot-Omega responds
└─ Health bars update

[... rounds 3-6 ...]

JUDGE DELIBERATION
├─ PortDev evaluates → Scores + Reasoning
├─ MikeWeb evaluates → Scores + Reasoning
├─ Keone evaluates → Scores + Reasoning
├─ James evaluates → Scores + Reasoning
├─ Harpal evaluates → Scores + Reasoning
└─ Anago evaluates → Scores + Reasoning

FINAL VERDICT
├─ Winner announced
├─ Final scores displayed
└─ Case archived
```

## Health Bar Logic

```javascript
// Calculate health based on judge scores
function calculateHealth(judgeEvaluations, round) {
  let plaintiffHealth = 100;
  let defendantHealth = 100;
  
  judgeEvaluations.forEach(eval => {
    const pAvg = (eval.scores.plaintiff.logic + 
                  eval.scores.plaintiff.evidence + 
                  eval.scores.plaintiff.rebuttal + 
                  eval.scores.plaintiff.clarity) / 4;
    
    const dAvg = (eval.scores.defendant.logic + 
                  eval.scores.defendant.evidence + 
                  eval.scores.defendant.rebuttal + 
                  eval.scores.defendant.clarity) / 4;
    
    const diff = pAvg - dAvg;
    
    if (diff > 0) {
      defendantHealth -= diff * 0.5; // Defendant loses health
    } else {
      plaintiffHealth -= Math.abs(diff) * 0.5; // Plaintiff loses health
    }
  });
  
  return {
    plaintiff: Math.max(0, Math.min(100, plaintiffHealth)),
    defendant: Math.max(0, Math.min(100, defendantHealth))
  };
}
```

## Important Notes

1. **Each API call takes 15-30 seconds** (AI generation time)
2. **Generate arguments sequentially**, not in parallel (rate limiting)
3. **Save results to localStorage** so users can resume
4. **Show loading states** during generation
5. **Animate health bars** after each judge evaluation

## Error Handling

```javascript
async function safeApiCall(apiFunction, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await apiFunction();
      if (result.success) return result;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}
```

## Update .env

```bash
VITE_API_URL=https://2295-51-20-69-171.ngrok-free.app
```

## Test Full Flow

```bash
# Run this in browser console after deploying frontend
const test = await fetch('https://2295-51-20-69-171.ngrok-free.app/api/generate-argument', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    role: 'plaintiff',
    caseData: { id: 'TEST', type: 'Beef', plaintiff: 'A', defendant: 'B', summary: 'Test' },
    round: 1
  })
}).then(r => r.json());

console.log(test);
```
