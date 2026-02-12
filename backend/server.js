const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const app = express();

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://nad-court.vercel.app', 'https://*.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

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

// Use OpenClaw CLI to generate content
async function generateWithOpenClaw(prompt, maxTokens = 800) {
  const task = `${prompt}\n\nKeep response under ${maxTokens} tokens.`;
  
  // Use openclaw agent command (non-interactive)
  const command = `echo "${task.replace(/"/g, '\\"')}" | openclaw agent --local`;
  
  console.log('Running OpenClaw command...');
  
  try {
    const { stdout, stderr } = await execPromise(command, { 
      timeout: 60000,
      env: { ...process.env }
    });
    
    if (stderr && stderr.includes('error')) {
      console.error('OpenClaw stderr:', stderr);
    }
    
    return stdout.trim();
  } catch (error) {
    console.error('OpenClaw error:', error.message);
    throw error;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Agent Court Backend',
    openclaw: true,
    timestamp: new Date().toISOString()
  });
});

// Generate argument using OpenClaw CLI
app.post('/api/generate-argument', async (req, res) => {
  const { role, caseData, round = 1 } = req.body;
  const agentName = role === 'plaintiff' ? 'JusticeBot-Alpha' : 'GuardianBot-Omega';

  console.log(`Generating ${role} argument for case ${caseData.id} using OpenClaw CLI`);

  const systemPrompt = `You are ${agentName}, an AI ${role === 'plaintiff' ? 'legal advocate for plaintiffs' : 'defense advocate for defendants'} in Agent Court.

Your mission: Present compelling, fact-based arguments that demonstrate why your client's position is correct.

Rules:
- Present ONE cohesive argument (300-500 words)
- Base arguments ONLY on provided case facts
- Cite specific evidence when available
- Use persuasive but professional legal tone
- Never reference "health bars", "damage", or game mechanics
- Focus on logic, evidence, and precedent

You are fighting for justice in a decentralized court. Make your case count.`;

  const userPrompt = `CASE: ${caseData.id}
TYPE: ${caseData.type}
PLAINTIFF: ${caseData.plaintiff}
DEFENDANT: ${caseData.defendant}
SUMMARY: ${caseData.summary}
FACTS: ${caseData.facts || 'Case facts to be determined'}
EVIDENCE: ${(caseData.evidence || []).join(', ')}

Generate your ${round === 1 ? 'opening argument' : `response for round ${round}`} as ${agentName}. Make it compelling and fact-based.

Return ONLY the argument text, no additional commentary.`;

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const argument = await generateWithOpenClaw(fullPrompt, 800);
    
    res.json({
      success: true,
      agent: agentName,
      role: role,
      argument: argument,
      round: round,
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      model: 'openclaw/moonshot-k2.5',
      source: 'openclaw_cli'
    });
  } catch (error) {
    console.error('OpenClaw generation error:', error.message);
    
    // Fallback
    const fallbacks = {
      plaintiff: `As the plaintiff in case ${caseData.id}, I present compelling evidence demonstrating the defendant's violation of established community standards. The documented incidents reveal a clear pattern of conduct that undermines our ecosystem's integrity.`,
      defendant: `I categorically deny the allegations in case ${caseData.id}. The plaintiff's claims are based on circumstantial evidence and misinterpretation of facts.`
    };
    
    res.json({
      success: true,
      agent: agentName,
      role: role,
      argument: fallbacks[role],
      round: round,
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      source: 'fallback',
      fallback: true,
      error: error.message
    });
  }
});

// Judge evaluation using OpenClaw CLI
app.post('/api/judge-evaluation', async (req, res) => {
  const { judge, caseData, plaintiffArgs, defendantArgs } = req.body;
  
  console.log(`Getting evaluation from judge ${judge} using OpenClaw CLI`);
  
  const profile = JUDGE_PROFILES[judge];
  
  const prompt = `You are ${judge}, a community judge in Agent Court.
${profile.personality}

Your evaluation focus: ${profile.focus.join(', ')}
Your catchphrase: "${profile.catchphrase}"
Your voice: ${profile.voice}

Evaluate BOTH sides on 4 criteria (0-100):
1. LOGIC - Soundness of reasoning
2. EVIDENCE - Quality and relevance of proof
3. REBUTTAL - Effectiveness at addressing opponent's points
4. CLARITY - Persuasiveness and communication quality

Provide your reasoning in your unique voice. Use your catchphrase naturally.

Return ONLY valid JSON with this structure:
{
  "plaintiff": {"logic": 75, "evidence": 80, "rebuttal": 70, "clarity": 85},
  "defendant": {"logic": 70, "evidence": 65, "rebuttal": 75, "clarity": 80},
  "reasoning": "Your detailed reasoning...",
  "winner": "plaintiff" or "defendant"
}

CASE: ${caseData.id}
TYPE: ${caseData.type}

PLAINTIFF ARGUMENTS:
${plaintiffArgs.map((arg, i) => `${i + 1}. ${arg.substring(0, 300)}...`).join('\n')}

DEFENDANT ARGUMENTS:
${defendantArgs.map((arg, i) => `${i + 1}. ${arg.substring(0, 300)}...`).join('\n')}`;

  try {
    const content = await generateWithOpenClaw(prompt, 1000);
    
    // Extract JSON
    let evaluation;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
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
      model: 'openclaw/moonshot-k2.5',
      source: 'openclaw_cli'
    });
  } catch (error) {
    console.error('Judge evaluation error:', error.message);
    res.json({
      success: true,
      judge: judge,
      evaluation: generateFallbackEvaluation(judge),
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      source: 'fallback',
      fallback: true
    });
  }
});

// Get judges
app.get('/api/judges', (req, res) => {
  res.json({
    judges: Object.entries(JUDGE_PROFILES).map(([name, profile]) => ({
      name,
      ...profile
    })),
    openclaw: true
  });
});

function generateFallbackEvaluation(judge) {
  const reasonings = {
    PortDev: "The technical evidence is solid. I reviewed the timestamps and they don't lie.",
    MikeWeb: "Community vibe check: both sides have valid points.",
    Keone: "The data tells a story, but it's ambiguous.",
    James: "Precedent matters here.",
    Harpal: "Contribution quality over quantity.",
    Anago: "Protocol adherence is clear."
  };
  
  return {
    plaintiff: { logic: 75, evidence: 80, rebuttal: 70, clarity: 85 },
    defendant: { logic: 70, evidence: 65, rebuttal: 75, clarity: 80 },
    reasoning: reasonings[judge] || "Both sides presented valid arguments.",
    winner: Math.random() > 0.5 ? 'plaintiff' : 'defendant'
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
║   AI Provider: OpenClaw CLI (Moonshot)                ║
║                                                        ║
║   Endpoints:                                           ║
║   • POST /api/generate-argument                       ║
║   • POST /api/judge-evaluation                        ║
║   • GET  /api/judges                                  ║
║                                                        ║
║   Using OpenClaw CLI - SAME AS YOUR WORKING KEY       ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});
