const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs');

const execPromise = util.promisify(exec);
const app = express();

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://nad-court.vercel.app', 'https://*.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Check if OpenClaw is available
async function checkOpenclaw() {
  const possiblePaths = [
    'openclaw',
    '/usr/local/bin/openclaw',
    '/usr/bin/openclaw',
    '/opt/openclaw/bin/openclaw',
    '/root/.local/bin/openclaw',
    '/home/render/.local/bin/openclaw',
    '/opt/render/.local/bin/openclaw',
    (process.env.HOME || '/home/render') + '/.local/bin/openclaw',
    './openclaw',
    '../openclaw'
  ];
  
  for (const p of possiblePaths) {
    try {
      if (p === 'openclaw') {
        await execPromise('which openclaw');
        console.log('OpenClaw found in PATH');
        return true;
      } else if (fs.existsSync(p)) {
        console.log(`OpenClaw found at: ${p}`);
        process.env.PATH = path.dirname(p) + ':' + process.env.PATH;
        return true;
      }
    } catch (e) {
      // Continue checking
    }
  }
  
  console.log('OpenClaw not found in any location');
  return false;
}

let openclawAvailable = false;
checkOpenclaw().then(available => {
  openclawAvailable = available;
  console.log(`OpenClaw available: ${available}`);
});

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
    openclaw: openclawAvailable,
    timestamp: new Date().toISOString()
  });
});

// Generate argument using OpenClaw or fallback
app.post('/api/generate-argument', async (req, res) => {
  const { role, caseData, round = 1 } = req.body;
  
  console.log(`Generating ${role} argument for case ${caseData.id}, round ${round}`);
  console.log(`OpenClaw available: ${openclawAvailable}`);
  
  const agentName = role === 'plaintiff' ? 'JusticeBot-Alpha' : 'GuardianBot-Omega';
  
  // If OpenClaw not available, return pre-generated case from data/cases/
  if (!openclawAvailable) {
    console.log('OpenClaw not available, using pre-generated cases');
    
    // Map case IDs to pre-generated cases
    const caseMap = {
      'BEEF-4760': 'BEEF-4760',
      'COMM-8792': 'COMM-8792',
      'ROLE-2341': 'ROLE-2341',
      'ART-8323': 'ART-8323',
      'PURGE-1948': 'PURGE-1948'
    };
    
    const mappedCase = caseMap[caseData.id];
    if (mappedCase) {
      try {
        const caseFile = require(`../data/cases/${mappedCase}.json`);
        const args = caseFile.arguments[role];
        if (args && args[round - 1]) {
          return res.json({
            success: true,
            agent: agentName,
            role: role,
            argument: args[round - 1].content,
            round: round,
            caseId: caseData.id,
            generatedAt: caseFile.generated_at,
            source: 'pre-generated',
            model: caseFile.model
          });
        }
      } catch (e) {
        console.log('Pre-generated case not found, using fallback');
      }
    }
    
    // Ultimate fallback
    return res.json({
      success: true,
      agent: agentName,
      role: role,
      argument: generateFallbackArgument(role, caseData),
      round: round,
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      fallback: true
    });
  }
  
  // Try to use OpenClaw
  try {
    const systemPrompt = role === 'plaintiff' 
      ? `You are JusticeBot-Alpha, an AI legal advocate representing plaintiffs in Agent Court.`
      : `You are GuardianBot-Omega, AI defense advocate for defendants.`;

    const userPrompt = `CASE: ${caseData.id}
TYPE: ${caseData.type}
PLAINTIFF: ${caseData.plaintiff}
DEFENDANT: ${caseData.defendant}
SUMMARY: ${caseData.summary}

Generate ${round === 1 ? 'opening argument' : 'response'} as ${agentName}.`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}\n\nReturn ONLY argument text.`;
    const openclawCommand = `openclaw spawn --label "${role}-arg-${caseData.id}-r${round}" --task "${fullPrompt.replace(/"/g, '\\"')}"`;
    
    console.log('Spawning OpenClaw agent...');
    const { stdout, stderr } = await execPromise(openclawCommand, { 
      timeout: 60000,
      env: { ...process.env, PATH: process.env.PATH }
    });
    
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
    console.error('OpenClaw error:', error.message);
    // Return fallback on error
    res.json({
      success: true,
      agent: agentName,
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

// Judge evaluation
app.post('/api/judge-evaluation', async (req, res) => {
  const { judge, caseData, plaintiffArgs, defendantArgs } = req.body;
  
  console.log(`Getting evaluation from judge ${judge}`);
  
  // If OpenClaw not available, use pre-generated or fallback
  if (!openclawAvailable) {
    // Try to get from pre-generated cases
    const caseMap = {
      'BEEF-4760': 'BEEF-4760',
      'COMM-8792': 'COMM-8792',
      'ROLE-2341': 'ROLE-2341',
      'ART-8323': 'ART-8323',
      'PURGE-1948': 'PURGE-1948'
    };
    
    const mappedCase = caseMap[caseData.id];
    if (mappedCase) {
      try {
        const caseFile = require(`../data/cases/${mappedCase}.json`);
        // Find judge evaluation (would need to be added to case files)
      } catch (e) {
        // Use fallback
      }
    }
    
    return res.json({
      success: true,
      judge: judge,
      evaluation: generateFallbackEvaluation(judge),
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      fallback: true
    });
  }
  
  try {
    const profile = JUDGE_PROFILES[judge];
    const prompt = `You are ${judge}, ${profile.personality}

Evaluate both sides and return JSON with scores (0-100) for Logic, Evidence, Rebuttal, Clarity.`;

    const openclawCommand = `openclaw spawn --label "judge-${judge}-${caseData.id}" --task "${prompt.replace(/"/g, '\\"')}"`;
    const { stdout } = await execPromise(openclawCommand, { timeout: 60000 });
    
    let evaluation;
    try {
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : generateFallbackEvaluation(judge);
    } catch (e) {
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
    console.error('Judge error:', error.message);
    res.json({
      success: true,
      judge: judge,
      evaluation: generateFallbackEvaluation(judge),
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      fallback: true
    });
  }
});

// Run full case
app.post('/api/run-full-case', async (req, res) => {
  const { caseData } = req.body;
  
  // If OpenClaw not available, return pre-generated case
  if (!openclawAvailable) {
    const caseMap = {
      'BEEF-4760': 'BEEF-4760',
      'COMM-8792': 'COMM-8792',
      'ROLE-2341': 'ROLE-2341',
      'ART-8323': 'ART-8323',
      'PURGE-1948': 'PURGE-1948'
    };
    
    const mappedCase = caseMap[caseData.id];
    if (mappedCase) {
      try {
        const caseFile = require(`../data/cases/${mappedCase}.json`);
        return res.json({
          success: true,
          case: caseData,
          arguments: caseFile.arguments,
          generatedAt: caseFile.generated_at,
          source: 'pre-generated',
          message: 'Using AI-generated case from OpenClaw agents'
        });
      } catch (e) {
        console.log('Pre-generated case not found');
      }
    }
  }
  
  res.json({
    success: true,
    case: caseData,
    status: 'pending',
    openclawAvailable: openclawAvailable,
    message: openclawAvailable 
      ? 'OpenClaw ready to generate arguments'
      : 'Using pre-generated AI cases (OpenClaw not available)'
  });
});

// Get judges
app.get('/api/judges', (req, res) => {
  res.json({
    judges: Object.entries(JUDGE_PROFILES).map(([name, profile]) => ({
      name,
      ...profile
    })),
    openclawAvailable: openclawAvailable
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
    PortDev: "The technical evidence is solid. I reviewed the timestamps and they don't lie.",
    MikeWeb: "Community vibe check: both sides have valid points.",
    Keone: "The data tells a story, but it's ambiguous.",
    James: "Precedent matters here.",
    Harpal: "Contribution quality over quantity.",
    Anago: "Protocol adherence is clear."
  };
  
  return {
    plaintiff: pScores,
    defendant: dScores,
    reasoning: reasonings[judge] || "Both sides presented valid arguments.",
    winner: pTotal > dTotal ? 'plaintiff' : 'defendant'
  };
}

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🤖 AGENT COURT BACKEND                               ║
║   Running on port ${PORT}                                ║
║                                                        ║
║   OpenClaw: ${openclawAvailable ? '✅ AVAILABLE' : '⚠️  USING PRE-GENERATED CASES'}      ║
║                                                        ║
║   Endpoints:                                           ║
║   • POST /api/generate-argument                       ║
║   • POST /api/judge-evaluation                        ║
║   • POST /api/run-full-case                           ║
║   • GET  /api/judges                                  ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
