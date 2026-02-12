const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const util = require('util');
const path = require('path');

const execPromise = util.promisify(exec);
const app = express();

// Enable CORS for your Vercel frontend
app.use(cors({
  origin: ['http://localhost:5173', 'https://nad-court.vercel.app', 'https://*.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Store active cases
const activeCases = new Map();

// Judge profiles
const JUDGE_PROFILES = {
  PortDev: {
    personality: "Technical evidence specialist. Values code, timestamps, and provable data.",
    focus: ["technical accuracy", "code quality", "timestamp verification"],
    voice: "analytical, precise, technical",
    catchphrase: "Code doesn't lie."
  },
  MikeWeb: {
    personality: "Community impact assessor. Values reputation and long-term contributions.",
    focus: ["community reputation", "contribution history", "engagement quality"],
    voice: "warm, community-focused, balanced",
    catchphrase: "Community vibe check."
  },
  Keone: {
    personality: "On-chain data analyst. Focuses on provable blockchain facts.",
    focus: ["wallet history", "transaction patterns", "on-chain proof"],
    voice: "data-driven, factual, analytical",
    catchphrase: "Show me the transactions."
  },
  James: {
    personality: "Governance precedent keeper. Values rules and historical consistency.",
    focus: ["rule alignment", "historical precedents", "moderation logs"],
    voice: "formal, precedent-focused, structured",
    catchphrase: "Precedent matters here."
  },
  Harpal: {
    personality: "Merit-based evaluator. Values quality contributions over tenure.",
    focus: ["contribution quality", "engagement value", "merit"],
    voice: "direct, merit-focused, results-oriented",
    catchphrase: "Contribution quality over quantity."
  },
  Anago: {
    personality: "Protocol adherence guardian. Focuses on rule compliance.",
    focus: ["rule violations", "protocol compliance", "documentation"],
    voice: "formal, rule-focused, protocol-minded",
    catchphrase: "Protocol adherence is clear."
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Agent Court Backend',
    timestamp: new Date().toISOString()
  });
});

// Generate argument using OpenClaw
app.post('/api/generate-argument', async (req, res) => {
  const { role, caseData, round = 1 } = req.body;
  
  console.log(`Generating ${role} argument for case ${caseData.id}, round ${round}`);
  
  try {
    const agentName = role === 'plaintiff' ? 'JusticeBot-Alpha' : 'GuardianBot-Omega';
    
    const systemPrompt = role === 'plaintiff' 
      ? `You are JusticeBot-Alpha, an AI legal advocate representing plaintiffs in Agent Court.

Your mission: Present compelling, fact-based arguments that demonstrate why your client's position is correct.

Rules:
- Present ONE cohesive argument (300-500 words)
- Base arguments ONLY on provided case facts
- Cite specific evidence when available
- Use persuasive but professional legal tone
- Never reference "health bars", "damage", or game mechanics
- Focus on logic, evidence, and precedent

You are fighting for justice in a decentralized court. Make your case count.`
      : `You are GuardianBot-Omega, an AI defense advocate representing defendants in Agent Court.

Your mission: Protect your client's interests by rebutting allegations and demonstrating their innocence or justification.

Rules:
- Present ONE cohesive response (300-500 words)
- Address specific allegations made by plaintiff
- Provide factual counter-evidence
- Question validity of plaintiff's claims where appropriate
- No counter-accusations - focus on defense
- Use persuasive but professional legal tone
- Never reference "health bars", "damage", or game mechanics

Your client is counting on you. Defend them with logic and evidence.`;

    const userPrompt = `CASE: ${caseData.id}
TYPE: ${caseData.type}
PLAINTIFF: ${caseData.plaintiff}
DEFENDANT: ${caseData.defendant}
SUMMARY: ${caseData.summary}
FACTS: ${caseData.facts || 'Case facts to be determined'}
EVIDENCE: ${(caseData.evidence || []).join(', ')}

Generate your ${round === 1 ? 'opening argument' : `response for round ${round}`} as ${agentName}. Make it compelling and fact-based.

Return ONLY the argument text, no additional commentary.`;

    // Spawn OpenClaw sub-agent
    const openclawCommand = `openclaw spawn --label "${role}-arg-${caseData.id}-r${round}" --task "${systemPrompt}\n\n${userPrompt.replace(/"/g, '\\"')}"`;
    
    console.log('Spawning OpenClaw agent...');
    
    const { stdout, stderr } = await execPromise(openclawCommand, { timeout: 60000 });
    
    if (stderr && !stderr.includes('successfully')) {
      console.error('OpenClaw error:', stderr);
    }
    
    // Extract argument from output
    const argument = stdout.trim() || generateFallbackArgument(role, caseData);
    
    res.json({
      success: true,
      agent: agentName,
      role: role,
      argument: argument,
      round: round,
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      model: 'openclaw/moonshot-k2.5'
    });
    
  } catch (error) {
    console.error('Error generating argument:', error);
    // Return fallback on error
    res.json({
      success: true,
      agent: role === 'plaintiff' ? 'JusticeBot-Alpha' : 'GuardianBot-Omega',
      role: role,
      argument: generateFallbackArgument(role, caseData),
      round: round,
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      fallback: true,
      error: error.message
    });
  }
});

// Generate judge evaluation
app.post('/api/judge-evaluation', async (req, res) => {
  const { judge, caseData, plaintiffArgs, defendantArgs } = req.body;
  
  console.log(`Getting evaluation from judge ${judge} for case ${caseData.id}`);
  
  try {
    const profile = JUDGE_PROFILES[judge];
    
    const prompt = `You are ${judge}, a community judge in Agent Court.
${profile.personality}

Your evaluation focus: ${profile.focus.join(', ')}
Your catchphrase: "${profile.catchphrase}"
Your voice: ${profile.voice}

CASE: ${caseData.id}
TYPE: ${caseData.type}

PLAINTIFF ARGUMENTS:
${plaintiffArgs.map((arg, i) => `${i + 1}. ${arg.substring(0, 300)}...`).join('\n')}

DEFENDANT ARGUMENTS:
${defendantArgs.map((arg, i) => `${i + 1}. ${arg.substring(0, 300)}...`).join('\n')}

Evaluate BOTH sides on 4 criteria (0-100):
1. LOGIC - Soundness of reasoning
2. EVIDENCE - Quality and relevance of proof
3. REBUTTAL - Effectiveness at addressing opponent
4. CLARITY - Persuasiveness and communication

Provide your reasoning in your unique voice. Use your catchphrase naturally.

Return ONLY valid JSON:
{
  "plaintiff": {"logic": 75, "evidence": 80, "rebuttal": 70, "clarity": 85},
  "defendant": {"logic": 70, "evidence": 65, "rebuttal": 75, "clarity": 80},
  "reasoning": "Your detailed reasoning in ${judge}'s voice...",
  "winner": "plaintiff" or "defendant"
}`;

    const openclawCommand = `openclaw spawn --label "judge-${judge}-${caseData.id}" --task "${prompt.replace(/"/g, '\\"')}"`;
    
    console.log('Spawning OpenClaw judge...');
    
    const { stdout, stderr } = await execPromise(openclawCommand, { timeout: 60000 });
    
    // Parse JSON from output
    let evaluation;
    try {
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : generateFallbackEvaluation(judge);
    } catch (e) {
      console.error('JSON parse error:', e);
      evaluation = generateFallbackEvaluation(judge);
    }
    
    res.json({
      success: true,
      judge: judge,
      evaluation: evaluation,
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      model: 'openclaw/moonshot-k2.5'
    });
    
  } catch (error) {
    console.error('Error generating evaluation:', error);
    res.json({
      success: true,
      judge: judge,
      evaluation: generateFallbackEvaluation(judge),
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      fallback: true,
      error: error.message
    });
  }
});

// Run full case with all judges
app.post('/api/run-full-case', async (req, res) => {
  const { caseData } = req.body;
  
  console.log(`Running full case: ${caseData.id}`);
  
  try {
    // Generate plaintiff argument
    const plaintiffResponse = await fetch(`http://localhost:${PORT}/api/generate-argument`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'plaintiff', caseData, round: 1 })
    });
    const plaintiffData = await plaintiffResponse.json();
    
    // Generate defendant argument
    const defendantResponse = await fetch(`http://localhost:${PORT}/api/generate-argument`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'defendant', caseData, round: 1 })
    });
    const defendantData = await defendantResponse.json();
    
    // Generate all 6 judge evaluations
    const judges = Object.keys(JUDGE_PROFILES);
    const evaluations = [];
    
    for (const judge of judges) {
      const evalResponse = await fetch(`http://localhost:${PORT}/api/judge-evaluation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judge,
          caseData,
          plaintiffArgs: [plaintiffData.argument],
          defendantArgs: [defendantData.argument]
        })
      });
      const evalData = await evalResponse.json();
      evaluations.push(evalData);
    }
    
    // Calculate verdict
    const plaintiffWins = evaluations.filter(e => e.evaluation.winner === 'plaintiff').length;
    const defendantWins = evaluations.filter(e => e.evaluation.winner === 'defendant').length;
    const finalVerdict = plaintiffWins > defendantWins ? 'plaintiff' : 'defendant';
    
    res.json({
      success: true,
      case: caseData,
      arguments: {
        plaintiff: plaintiffData,
        defendant: defendantData
      },
      evaluations: evaluations,
      verdict: {
        winner: finalVerdict,
        plaintiffWins,
        defendantWins,
        totalJudges: judges.length
      },
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error running full case:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all judges info
app.get('/api/judges', (req, res) => {
  res.json({
    judges: Object.entries(JUDGE_PROFILES).map(([name, profile]) => ({
      name,
      ...profile
    }))
  });
});

// Fallback generators
function generateFallbackArgument(role, caseData) {
  const fallbacks = {
    plaintiff: [
      `The evidence clearly demonstrates that the defendant violated community standards in case ${caseData.id}. The documented incidents show a pattern of behavior that undermines the integrity of our ecosystem.`,
      `My client has provided irrefutable proof of the allegations in ${caseData.type}. The timestamps, records, and community testimony all corroborate this position.`,
      `Precedent clearly supports our case. Previous rulings in similar matters have consistently held that such behavior warrants sanctions.`
    ],
    defendant: [
      `The plaintiff's allegations in ${caseData.id} are based on circumstantial evidence at best. My client has maintained exemplary conduct with documented contributions to the community.`,
      `We dispute the interpretation of the evidence. The transactions in question have legitimate explanations that the plaintiff has chosen to ignore.`,
      `My client's record speaks for itself. Months of positive engagement and zero prior violations demonstrate their commitment to community values.`
    ]
  };
  
  const args = fallbacks[role] || fallbacks.plaintiff;
  return args[Math.floor(Math.random() * args.length)];
}

function generateFallbackEvaluation(judge) {
  const pScores = {
    logic: Math.floor(Math.random() * 20 + 70),
    evidence: Math.floor(Math.random() * 20 + 70),
    rebuttal: Math.floor(Math.random() * 20 + 70),
    clarity: Math.floor(Math.random() * 20 + 70)
  };
  
  const dScores = {
    logic: Math.floor(Math.random() * 20 + 65),
    evidence: Math.floor(Math.random() * 20 + 65),
    rebuttal: Math.floor(Math.random() * 20 + 65),
    clarity: Math.floor(Math.random() * 20 + 65)
  };
  
  const pTotal = (pScores.logic + pScores.evidence + pScores.rebuttal + pScores.clarity) / 4;
  const dTotal = (dScores.logic + dScores.evidence + dScores.rebuttal + dScores.clarity) / 4;
  
  const reasonings = {
    PortDev: "The technical evidence is solid. I reviewed the timestamps and they don't lie. However, the defense has a point about context.",
    MikeWeb: "Community vibe check: the plaintiff has been here longer, but the defendant's contributions have been higher quality lately.",
    Keone: "The data tells a story, but it's ambiguous. Both sides have credible evidence. Need more on-chain proof.",
    James: "Precedent matters here. We've seen similar cases before - usually resolved in favor of documented first use.",
    Harpal: "Contribution quality over quantity. The defendant's posts get better engagement for a reason - they're more valuable.",
    Anago: "Protocol adherence is clear: no rules were technically broken. But community norms matter too."
  };
  
  return {
    plaintiff: pScores,
    defendant: dScores,
    reasoning: reasonings[judge] || "Both sides presented valid arguments.",
    winner: pTotal > dTotal ? 'plaintiff' : 'defendant'
  };
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🤖 AGENT COURT BACKEND                               ║
║   Running on http://localhost:${PORT}                      ║
║                                                        ║
║   Endpoints:                                           ║
║   • POST /api/generate-argument                       ║
║   • POST /api/judge-evaluation                        ║
║   • POST /api/run-full-case                           ║
║   • GET  /api/judges                                  ║
║                                                        ║
║   OpenClaw Integration: ACTIVE                         ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
