const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://nad-court.vercel.app', 'https://*.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Try multiple AI providers in order
const AI_PROVIDERS = [
  { name: 'openai', key: process.env.OPENAI_API_KEY, enabled: false },
  { name: 'moonshot', key: process.env.MOONSHOT_API_KEY, enabled: false },
];

// Enable providers that have keys
AI_PROVIDERS.forEach(p => {
  if (p.key && p.key.length > 20) {
    p.enabled = true;
    console.log(`✅ ${p.name.toUpperCase()} configured`);
  }
});

const hasAI = AI_PROVIDERS.some(p => p.enabled);
console.log(`AI Providers available: ${hasAI ? 'YES' : 'NO (using fallbacks)'}`);

// Judge profiles
const JUDGE_PROFILES = {
  PortDev: { personality: "Technical evidence specialist", focus: ["technical accuracy", "code quality"], voice: "analytical", catchphrase: "Code doesn't lie." },
  MikeWeb: { personality: "Community impact assessor", focus: ["community reputation"], voice: "warm", catchphrase: "Community vibe check." },
  Keone: { personality: "On-chain data analyst", focus: ["wallet history"], voice: "data-driven", catchphrase: "Show me the transactions." },
  James: { personality: "Governance precedent keeper", focus: ["rule alignment"], voice: "formal", catchphrase: "Precedent matters here." },
  Harpal: { personality: "Merit-based evaluator", focus: ["contribution quality"], voice: "direct", catchphrase: "Contribution quality over quantity." },
  Anago: { personality: "Protocol adherence guardian", focus: ["rule violations"], voice: "formal", catchphrase: "Protocol adherence is clear." }
};

// Call OpenAI API
async function callOpenAI(systemPrompt, userPrompt, maxTokens = 800) {
  const key = AI_PROVIDERS.find(p => p.name === 'openai')?.key;
  if (!key) throw new Error('OpenAI key not configured');

  const data = JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: maxTokens
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) reject(new Error(json.error.message));
          else resolve(json.choices[0].message.content);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Call Moonshot API
async function callMoonshot(systemPrompt, userPrompt, maxTokens = 800) {
  const key = AI_PROVIDERS.find(p => p.name === 'moonshot')?.key;
  if (!key) throw new Error('Moonshot key not configured');

  const data = JSON.stringify({
    model: 'moonshot-v1-8k',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: maxTokens
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.moonshot.cn',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) reject(new Error(json.error.message));
          else resolve(json.choices[0].message.content);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Try AI providers in order
async function generateWithAI(systemPrompt, userPrompt, maxTokens = 800) {
  // Try OpenAI first
  if (AI_PROVIDERS.find(p => p.name === 'openai')?.enabled) {
    try {
      console.log('Trying OpenAI...');
      const result = await callOpenAI(systemPrompt, userPrompt, maxTokens);
      return { content: result, provider: 'openai' };
    } catch (e) {
      console.log('OpenAI failed:', e.message);
    }
  }

  // Try Moonshot
  if (AI_PROVIDERS.find(p => p.name === 'moonshot')?.enabled) {
    try {
      console.log('Trying Moonshot...');
      const result = await callMoonshot(systemPrompt, userPrompt, maxTokens);
      return { content: result, provider: 'moonshot' };
    } catch (e) {
      console.log('Moonshot failed:', e.message);
    }
  }

  throw new Error('All AI providers failed');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Agent Court Backend',
    ai_providers: AI_PROVIDERS.filter(p => p.enabled).map(p => p.name),
    has_ai: hasAI,
    timestamp: new Date().toISOString()
  });
});

// Generate argument with REAL AI
app.post('/api/generate-argument', async (req, res) => {
  const { role, caseData, round = 1 } = req.body;
  const agentName = role === 'plaintiff' ? 'JusticeBot-Alpha' : 'GuardianBot-Omega';

  console.log(`Generating ${role} argument for ${caseData.id} (round ${round})`);

  const systemPrompt = `You are ${agentName}, an AI ${role === 'plaintiff' ? 'plaintiff advocate' : 'defense advocate'} in Agent Court.

Rules:
- ONE cohesive argument (300-500 words)
- Base on provided facts only
- Cite specific evidence
- Professional legal tone
- NEVER mention health bars or game mechanics
- Focus on logic and evidence`;

  const userPrompt = `CASE: ${caseData.id}
TYPE: ${caseData.type}
PLAINTIFF: ${caseData.plaintiff}
DEFENDANT: ${caseData.defendant}
SUMMARY: ${caseData.summary}
FACTS: ${caseData.facts || 'N/A'}

Generate ${round === 1 ? 'opening argument' : `round ${round} response`} as ${agentName}.
Return ONLY the argument text.`;

  try {
    const result = await generateWithAI(systemPrompt, userPrompt, 800);

    res.json({
      success: true,
      agent: agentName,
      role: role,
      argument: result.content.trim(),
      round: round,
      caseId: caseData.id,
      provider: result.provider,
      generatedAt: new Date().toISOString(),
      source: 'live_ai'
    });
  } catch (error) {
    console.log('AI failed, using fallback:', error.message);

    // Fallback arguments
    const fallbacks = {
      plaintiff: `As the plaintiff in case ${caseData.id}, I present compelling evidence demonstrating the defendant's violation of established community standards. The documented incidents reveal a clear pattern of conduct that undermines our ecosystem's integrity.`,
      defendant: `I categorically deny the allegations in case ${caseData.id}. The plaintiff's claims are based on circumstantial evidence and misinterpretation of facts. My record speaks for itself.`
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

// Judge evaluation with REAL AI
app.post('/api/judge-evaluation', async (req, res) => {
  const { judge, caseData, plaintiffArgs, defendantArgs } = req.body;

  console.log(`Getting evaluation from ${judge}`);

  const profile = JUDGE_PROFILES[judge];

  const systemPrompt = `You are ${judge}, a community judge in Agent Court.
${profile.personality}
Focus: ${profile.focus.join(', ')}
Voice: ${profile.voice}

Evaluate on 4 criteria (0-100):
1. LOGIC - Sound reasoning
2. EVIDENCE - Quality of proof
3. REBUTTAL - Addressing opponent
4. CLARITY - Communication

Return JSON:
{
  "plaintiff": {"logic": 75, "evidence": 80, "rebuttal": 70, "clarity": 85},
  "defendant": {"logic": 70, "evidence": 65, "rebuttal": 75, "clarity": 80},
  "reasoning": "Your analysis...",
  "winner": "plaintiff" or "defendant"
}`;

  const userPrompt = `CASE: ${caseData.id}
TYPE: ${caseData.type}

PLAINTIFF:
${plaintiffArgs.map((a, i) => `${i + 1}. ${a.substring(0, 400)}...`).join('\n')}

DEFENDANT:
${defendantArgs.map((a, i) => `${i + 1}. ${a.substring(0, 400)}...`).join('\n')}

As ${judge}, evaluate and return JSON.`;

  try {
    const result = await generateWithAI(systemPrompt, userPrompt, 1000);

    // Extract JSON
    let evaluation;
    try {
      const match = result.content.match(/\{[\s\S]*\}/);
      evaluation = match ? JSON.parse(match[0]) : generateFallbackEval(judge);
    } catch (e) {
      evaluation = generateFallbackEval(judge);
    }

    res.json({
      success: true,
      judge: judge,
      evaluation: evaluation,
      caseId: caseData.id,
      provider: result.provider,
      generatedAt: new Date().toISOString(),
      source: 'live_ai'
    });
  } catch (error) {
    console.log('AI judge failed, using fallback:', error.message);
    res.json({
      success: true,
      judge: judge,
      evaluation: generateFallbackEval(judge),
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      source: 'fallback',
      fallback: true
    });
  }
});

function generateFallbackEval(judge) {
  const reasonings = {
    PortDev: "Technical evidence reviewed. Timestamps don't lie.",
    MikeWeb: "Community vibe check passed.",
    Keone: "On-chain data supports plaintiff.",
    James: "Precedent favors plaintiff.",
    Harpal: "Quality over quantity.",
    Anago: "Protocol adherence clear."
  };

  return {
    plaintiff: { logic: 75, evidence: 80, rebuttal: 70, clarity: 85 },
    defendant: { logic: 70, evidence: 65, rebuttal: 75, clarity: 80 },
    reasoning: reasonings[judge] || "Both sides valid.",
    winner: Math.random() > 0.5 ? 'plaintiff' : 'defendant'
  };
}

// Get judges
app.get('/api/judges', (req, res) => {
  res.json({
    judges: Object.entries(JUDGE_PROFILES).map(([name, profile]) => ({ name, ...profile })),
    ai_providers: AI_PROVIDERS.filter(p => p.enabled).map(p => p.name)
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`\n🤖 AGENT COURT BACKEND`);
  console.log(`Port: ${PORT}`);
  console.log(`AI: ${hasAI ? 'ENABLED' : 'FALLBACK MODE'}`);
  console.log(`Providers: ${AI_PROVIDERS.filter(p => p.enabled).map(p => p.name).join(', ') || 'NONE'}`);
  console.log(`\n`);
});
