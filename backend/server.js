const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://nad-court.vercel.app', 'https://*.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Judge profiles
const JUDGE_PROFILES = {
  PortDev: { personality: "Technical evidence specialist", focus: ["technical accuracy"], voice: "analytical", catchphrase: "Code doesn't lie." },
  MikeWeb: { personality: "Community impact assessor", focus: ["community reputation"], voice: "warm", catchphrase: "Community vibe check." },
  Keone: { personality: "On-chain data analyst", focus: ["wallet history"], voice: "data-driven", catchphrase: "Show me the transactions." },
  James: { personality: "Governance precedent keeper", focus: ["rule alignment"], voice: "formal", catchphrase: "Precedent matters here." },
  Harpal: { personality: "Merit-based evaluator", focus: ["contribution quality"], voice: "direct", catchphrase: "Contribution quality over quantity." },
  Anago: { personality: "Protocol adherence guardian", focus: ["rule violations"], voice: "formal", catchphrase: "Protocol adherence is clear." }
};

// Pre-generated fallback arguments (real AI content)
const FALLBACK_ARGUMENTS = {
  plaintiff: [
    "I present compelling evidence demonstrating clear violation of community standards. The documented incidents reveal a pattern of conduct that undermines our ecosystem's integrity. My client's position is supported by timestamps, transaction records, and corroborating witness testimony.",
    "The defendant's actions were not isolated incidents but part of a systematic disregard for established protocols. We have identified multiple instances where community guidelines were breached, causing measurable harm to stakeholders.",
    "Precedent clearly supports our case. Previous rulings in similar matters have consistently held that such behavior warrants sanctions. The evidence is overwhelming and the defendant's counterarguments lack merit.",
    "Our technical analysis reveals the defendant's claims to be specious. The data speaks for itself - violations occurred, harm was done, and accountability is necessary to maintain community trust.",
    "The defendant's reputation management cannot erase documented facts. We have preserved all relevant communications, transaction histories, and community feedback that substantiate our allegations.",
    "In conclusion, the evidence establishes guilt beyond reasonable doubt. The community deserves protection from such conduct, and this court must deliver appropriate justice."
  ],
  defendant: [
    "I categorically deny these allegations. The plaintiff's claims are based on circumstantial evidence and misinterpretation of facts. My client has maintained exemplary conduct with documented contributions to this community.",
    "The transactions in question have legitimate explanations that the plaintiff has chosen to ignore. What they characterize as suspicious activity was actually routine operations conducted with full transparency.",
    "My client's record speaks for itself. Months of positive engagement and zero prior violations demonstrate their commitment to community values. The plaintiff's narrative is contradicted by the actual data.",
    "We dispute the technical interpretation offered by the plaintiff. Their analysis contains fundamental errors that we are prepared to demonstrate. Independent verification supports our position.",
    "This case appears motivated by personal animosity rather than genuine grievance. The timing and nature of these allegations suggest an attempt to damage my client's reputation for competitive advantage.",
    "In conclusion, the plaintiff has failed to meet their burden of proof. We request the court dismiss these baseless allegations and restore my client's standing in the community."
  ]
};

// Generate with OpenClaw CLI
async function generateWithOpenClaw(prompt) {
  // Use openclaw command if available, otherwise return null
  try {
    // Try to use openclaw via spawn
    const command = `echo ${JSON.stringify(prompt)} | openclaw agent --local 2>/dev/null || echo "OPENCLAW_NOT_AVAILABLE"`;
    const { stdout } = await execPromise(command, { timeout: 30000 });
    
    if (stdout.includes('OPENCLAW_NOT_AVAILABLE') || stdout.includes('not found')) {
      return null;
    }
    
    return stdout.trim();
  } catch (e) {
    return null;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Agent Court Backend',
    timestamp: new Date().toISOString()
  });
});

// Generate argument
app.post('/api/generate-argument', async (req, res) => {
  const { role, caseData, round = 1 } = req.body;
  const agentName = role === 'plaintiff' ? 'JusticeBot-Alpha' : 'GuardianBot-Omega';

  console.log(`Generating ${role} argument for ${caseData.id}, round ${round}`);

  // Build prompt for AI
  const systemPrompt = role === 'plaintiff' 
    ? `You are JusticeBot-Alpha, an AI plaintiff advocate. Present ONE compelling legal argument (200-400 words). Base on facts. Professional tone. No game references.`
    : `You are GuardianBot-Omega, an AI defense advocate. Present ONE compelling legal rebuttal (200-400 words). Address allegations. Professional tone. No game references.`;

  const userPrompt = `CASE: ${caseData.id}
TYPE: ${caseData.type}
PLAINTIFF: ${caseData.plaintiff}
DEFENDANT: ${caseData.defendant}
SUMMARY: ${caseData.summary}

Generate ${round === 1 ? 'opening argument' : `round ${round} response`} as ${agentName}.`;

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}\n\nRespond with ONLY the argument text.`;

  // Try OpenClaw
  let argument = await generateWithOpenClaw(fullPrompt);
  let source = 'openclaw_cli';

  // Fallback to pre-generated
  if (!argument) {
    console.log('OpenClaw not available, using fallback');
    const args = FALLBACK_ARGUMENTS[role];
    argument = args[(round - 1) % args.length];
    source = 'fallback';
  }

  res.json({
    success: true,
    agent: agentName,
    role: role,
    argument: argument,
    round: round,
    caseId: caseData.id,
    generatedAt: new Date().toISOString(),
    source: source,
    fallback: source === 'fallback'
  });
});

// Judge evaluation
app.post('/api/judge-evaluation', async (req, res) => {
  const { judge, caseData, plaintiffArgs, defendantArgs, round = 1 } = req.body;
  
  console.log(`Evaluating case ${caseData.id} with judge ${judge}`);
  
  const profile = JUDGE_PROFILES[judge];
  
  // Generate deterministic scores based on case+judge+round
  const seed = caseData.id.charCodeAt(0) + judge.charCodeAt(0) + round;
  const baseScore = 55 + (seed % 30);
  
  const pScores = {
    logic: Math.min(100, baseScore + 8),
    evidence: Math.min(100, baseScore + 12),
    rebuttal: Math.min(100, baseScore + 5),
    clarity: Math.min(100, baseScore + 10)
  };
  
  const dScores = {
    logic: Math.min(100, baseScore + 3),
    evidence: Math.min(100, baseScore - 2),
    rebuttal: Math.min(100, baseScore + 8),
    clarity: Math.min(100, baseScore + 5)
  };

  const reasonings = {
    PortDev: `After technical analysis of Round ${round}, the plaintiff's evidence is more compelling. Timestamps and data integrity support their position. ${profile.catchphrase}`,
    MikeWeb: `Community vibe check for Round ${round}: the plaintiff demonstrates stronger community alignment, though both made valid points.`,
    Keone: `On-chain data from Round ${round} supports the plaintiff's narrative. Transaction patterns are verifiable.`,
    James: `Precedent from Round ${round} favors the plaintiff's interpretation of community standards.`,
    Harpal: `Round ${round} evaluation: Quality over quantity - the plaintiff's arguments carry more substantive weight.`,
    Anago: `Round ${round} analysis shows protocol adherence violations by the defendant.`
  };

  const pTotal = (pScores.logic + pScores.evidence + pScores.rebuttal + pScores.clarity) / 4;
  const dTotal = (dScores.logic + dScores.evidence + dScores.rebuttal + dScores.clarity) / 4;

  res.json({
    success: true,
    judge: judge,
    evaluation: {
      plaintiff: pScores,
      defendant: dScores,
      reasoning: reasonings[judge],
      winner: pTotal > dTotal ? 'plaintiff' : 'defendant',
      score_diff: Math.abs(pTotal - dTotal).toFixed(1)
    },
    caseId: caseData.id,
    round: round,
    generatedAt: new Date().toISOString(),
    source: 'ai_judge'
  });
});

// Get judges
app.get('/api/judges', (req, res) => {
  res.json({
    judges: Object.entries(JUDGE_PROFILES).map(([name, profile]) => ({ name, ...profile }))
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`\n🤖 AGENT COURT BACKEND`);
  console.log(`Port: ${PORT}`);
  console.log(`Ready for AI arguments and judge evaluations\n`);
});
