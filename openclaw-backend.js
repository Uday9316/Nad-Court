const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

const JUDGE_PROFILES = {
  PortDev: { personality: "Technical evidence specialist", focus: ["technical accuracy"], voice: "analytical", catchphrase: "Code doesn't lie." },
  MikeWeb: { personality: "Community impact assessor", focus: ["community reputation"], voice: "warm", catchphrase: "Community vibe check." },
  Keone: { personality: "On-chain data analyst", focus: ["wallet history"], voice: "data-driven", catchphrase: "Show me the transactions." },
  James: { personality: "Governance precedent keeper", focus: ["rule alignment"], voice: "formal", catchphrase: "Precedent matters here." },
  Harpal: { personality: "Merit-based evaluator", focus: ["contribution quality"], voice: "direct", catchphrase: "Contribution quality over quantity." },
  Anago: { personality: "Protocol adherence guardian", focus: ["rule violations"], voice: "formal", catchphrase: "Protocol adherence is clear." }
};

// Generate with OpenClaw CLI
async function generateWithOpenClaw(prompt, maxTokens = 800) {
  try {
    const sessionId = `court_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Use openclaw agent with proper syntax
    const command = `openclaw agent --local --session-id "${sessionId}" -m ${JSON.stringify(prompt)} 2>/dev/null`;
    
    const { stdout, stderr } = await execPromise(command, { 
      timeout: 60000,
      env: { ...process.env, PATH: '/usr/local/bin:/usr/bin:/bin:' + process.env.PATH }
    });
    
    if (stderr && !stderr.includes('warning')) {
      console.log('OpenClaw stderr:', stderr);
    }
    
    const result = stdout.trim();
    if (result && result.length > 50) {
      return result;
    }
    return null;
  } catch (error) {
    console.error('OpenClaw error:', error.message);
    return null;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Agent Court Backend (OpenClaw)',
    timestamp: new Date().toISOString()
  });
});

// Generate argument with OpenClaw
app.post('/api/generate-argument', async (req, res) => {
  const { role, caseData, round = 1 } = req.body;
  const agentName = role === 'plaintiff' ? 'JusticeBot-Alpha' : 'GuardianBot-Omega';

  console.log(`[${new Date().toISOString()}] Generating ${role} argument for ${caseData.id}, round ${round}`);

  const systemPrompt = role === 'plaintiff' 
    ? `You are JusticeBot-Alpha, an AI plaintiff advocate in Agent Court. Present ONE compelling legal argument (200-400 words). Base on case facts. Professional tone. No game references.`
    : `You are GuardianBot-Omega, an AI defense advocate in Agent Court. Present ONE compelling legal rebuttal (200-400 words). Address allegations. Professional tone. No game references.`;

  const userPrompt = `CASE: ${caseData.id}
TYPE: ${caseData.type}
PLAINTIFF: ${caseData.plaintiff}
DEFENDANT: ${caseData.defendant}
SUMMARY: ${caseData.summary}
${caseData.facts ? `FACTS: ${caseData.facts}` : ''}

Generate ${round === 1 ? 'opening argument' : `round ${round} response`} as ${agentName}.

Respond with ONLY the argument text, no headers or formatting.`;

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  // Try OpenClaw
  const argument = await generateWithOpenClaw(fullPrompt, 800);

  if (argument) {
    console.log(`✅ OpenClaw generated ${argument.length} chars`);
    res.json({
      success: true,
      agent: agentName,
      role: role,
      argument: argument,
      round: round,
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      source: 'openclaw_cli',
      model: 'openclaw/moonshot-k2.5'
    });
  } else {
    console.log('❌ OpenClaw failed');
    res.status(500).json({
      success: false,
      error: 'OpenClaw generation failed',
      message: 'Could not generate argument. OpenClaw CLI may not be available.'
    });
  }
});

// Judge evaluation with OpenClaw
app.post('/api/judge-evaluation', async (req, res) => {
  const { judge, caseData, plaintiffArgs, defendantArgs, round = 1 } = req.body;
  
  console.log(`[${new Date().toISOString()}] Judge ${judge} evaluating ${caseData.id}`);
  
  const profile = JUDGE_PROFILES[judge];
  
  const systemPrompt = `You are ${judge}, a community judge in Agent Court.
${profile.personality}
Focus: ${profile.focus.join(', ')}
Voice: ${profile.voice}

Evaluate BOTH sides on 4 criteria (0-100):
1. LOGIC - Sound reasoning
2. EVIDENCE - Quality of proof
3. REBUTTAL - Addressing opponent
4. CLARITY - Communication

Return ONLY valid JSON:
{
  "plaintiff": {"logic": 75, "evidence": 80, "rebuttal": 70, "clarity": 85},
  "defendant": {"logic": 70, "evidence": 65, "rebuttal": 75, "clarity": 80},
  "reasoning": "Your analysis in your voice...",
  "winner": "plaintiff" or "defendant"
}`;

  const userPrompt = `CASE: ${caseData.id}
TYPE: ${caseData.type}

PLAINTIFF ARGUMENTS:
${plaintiffArgs.map((a, i) => `${i + 1}. ${a.substring(0, 500)}...`).join('\n')}

DEFENDANT ARGUMENTS:
${defendantArgs.map((a, i) => `${i + 1}. ${a.substring(0, 500)}...`).join('\n')}

As ${judge}, evaluate and return JSON only.`;

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  
  const result = await generateWithOpenClaw(fullPrompt, 1000);

  if (result) {
    try {
      // Extract JSON
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      
      if (evaluation) {
        console.log(`✅ Judge ${judge} evaluated`);
        res.json({
          success: true,
          judge: judge,
          evaluation: evaluation,
          caseId: caseData.id,
          round: round,
          generatedAt: new Date().toISOString(),
          source: 'openclaw_cli',
          model: 'openclaw/moonshot-k2.5'
        });
        return;
      }
    } catch (e) {
      console.log('JSON parse error:', e.message);
    }
  }
  
  // Fallback
  console.log('❌ Judge evaluation failed, using fallback');
  const seed = caseData.id.charCodeAt(0) + judge.charCodeAt(0) + round;
  const baseScore = 55 + (seed % 30);
  
  res.json({
    success: true,
    judge: judge,
    evaluation: {
      plaintiff: { logic: baseScore + 8, evidence: baseScore + 12, rebuttal: baseScore + 5, clarity: baseScore + 10 },
      defendant: { logic: baseScore + 3, evidence: baseScore - 2, rebuttal: baseScore + 8, clarity: baseScore + 5 },
      reasoning: `${profile.catchphrase} After reviewing the arguments, I find the plaintiff more persuasive.`,
      winner: 'plaintiff'
    },
    caseId: caseData.id,
    round: round,
    generatedAt: new Date().toISOString(),
    source: 'fallback',
    fallback: true
  });
});

// Get judges
app.get('/api/judges', (req, res) => {
  res.json({
    judges: Object.entries(JUDGE_PROFILES).map(([name, profile]) => ({ name, ...profile }))
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🤖 AGENT COURT BACKEND (OpenClaw)`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
  console.log(`Ready for real-time AI arguments!\n`);
});
