const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://nad-court.vercel.app', 'https://*.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// API Keys from environment
const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_PROVIDER = process.env.AI_PROVIDER || 'moonshot';

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

// Call Moonshot API directly
async function callMoonshotAPI(systemPrompt, userPrompt, maxTokens = 800) {
  if (!MOONSHOT_API_KEY) {
    throw new Error('MOONSHOT_API_KEY not set');
  }

  const data = JSON.stringify({
    model: 'kimi-k2.5',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: maxTokens
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.moonshot.cn',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log('Moonshot response status:', res.statusCode);
        console.log('Moonshot response:', responseData.substring(0, 500));
        try {
          const json = JSON.parse(responseData);
          if (json.error) {
            reject(new Error(`Moonshot API error: ${json.error.message}`));
          } else if (json.choices && json.choices[0] && json.choices[0].message) {
            resolve(json.choices[0].message.content);
          } else {
            reject(new Error(`Invalid response format: ${JSON.stringify(json).substring(0, 200)}`));
          }
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}. Response: ${responseData.substring(0, 200)}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error('Moonshot request error:', err.message);
      reject(err);
    });
    req.write(data);
    req.end();
  });
}

// Call OpenAI API directly
async function callOpenAIAPI(systemPrompt, userPrompt, maxTokens = 800) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }

  const data = JSON.stringify({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: maxTokens
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          if (json.choices && json.choices[0]) {
            resolve(json.choices[0].message.content);
          } else {
            reject(new Error('Invalid response format'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Generate AI content
async function generateAIContent(systemPrompt, userPrompt, maxTokens = 800) {
  if (AI_PROVIDER === 'moonshot' && MOONSHOT_API_KEY) {
    return await callMoonshotAPI(systemPrompt, userPrompt, maxTokens);
  } else if (AI_PROVIDER === 'openai' && OPENAI_API_KEY) {
    return await callOpenAIAPI(systemPrompt, userPrompt, maxTokens);
  } else {
    throw new Error('No AI provider configured. Set MOONSHOT_API_KEY or OPENAI_API_KEY');
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Agent Court Backend',
    ai_provider: AI_PROVIDER,
    moonshot_configured: !!MOONSHOT_API_KEY,
    openai_configured: !!OPENAI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Generate argument
app.post('/api/generate-argument', async (req, res) => {
  const { role, caseData, round = 1 } = req.body;
  const agentName = role === 'plaintiff' ? 'JusticeBot-Alpha' : 'GuardianBot-Omega';

  console.log(`Generating ${role} argument for case ${caseData.id}`);

  const systemPrompt = `You are ${agentName}, an AI ${role === 'plaintiff' ? 'legal advocate for plaintiffs' : 'defense advocate for defendants'} in Agent Court.

Your mission: Present compelling, fact-based arguments that demonstrate why your client's position is correct.

Rules:
- Present ONE cohesive argument (300-500 words)
- Base arguments ONLY on provided case facts
- Cite specific evidence when available
- Use persuasive but professional legal tone
- Never reference "health bars", "damage", or game mechanics
- Focus on logic, evidence, and precedent`;

  const userPrompt = `CASE: ${caseData.id}
TYPE: ${caseData.type}
PLAINTIFF: ${caseData.plaintiff}
DEFENDANT: ${caseData.defendant}
SUMMARY: ${caseData.summary}
FACTS: ${caseData.facts || 'Case facts to be determined'}
EVIDENCE: ${(caseData.evidence || []).join(', ')}

Generate your ${round === 1 ? 'opening argument' : `response for round ${round}`} as ${agentName}. Make it compelling and fact-based.

Return ONLY the argument text, no additional commentary.`;

  try {
    const argument = await generateAIContent(systemPrompt, userPrompt, 800);
    
    res.json({
      success: true,
      agent: agentName,
      role: role,
      argument: argument.trim(),
      round: round,
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      model: AI_PROVIDER === 'moonshot' ? 'moonshot/kimi-k2.5' : 'openai/gpt-4',
      source: 'live_ai'
    });
  } catch (error) {
    console.error('AI generation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'AI generation failed. Check API keys.'
    });
  }
});

// Judge evaluation
app.post('/api/judge-evaluation', async (req, res) => {
  const { judge, caseData, plaintiffArgs, defendantArgs } = req.body;
  
  console.log(`Getting evaluation from judge ${judge}`);
  
  const profile = JUDGE_PROFILES[judge];
  
  const systemPrompt = `You are ${judge}, a community judge in Agent Court.
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
}`;

  const userPrompt = `CASE: ${caseData.id}
TYPE: ${caseData.type}

PLAINTIFF ARGUMENTS:
${plaintiffArgs.map((arg, i) => `${i + 1}. ${arg.substring(0, 500)}...`).join('\n')}

DEFENDANT ARGUMENTS:
${defendantArgs.map((arg, i) => `${i + 1}. ${arg.substring(0, 500)}...`).join('\n')}

As ${judge}, evaluate both sides and return JSON with scores and reasoning.`;

  try {
    const content = await generateAIContent(systemPrompt, userPrompt, 1000);
    
    // Extract JSON
    let evaluation;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      evaluation = null;
    }
    
    if (!evaluation) {
      throw new Error('Failed to parse judge evaluation');
    }
    
    res.json({
      success: true,
      judge: judge,
      evaluation: evaluation,
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      model: AI_PROVIDER === 'moonshot' ? 'moonshot/kimi-k2.5' : 'openai/gpt-4',
      source: 'live_ai'
    });
  } catch (error) {
    console.error('Judge evaluation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Judge evaluation failed. Check API keys.'
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
    ai_provider: AI_PROVIDER,
    moonshot_configured: !!MOONSHOT_API_KEY,
    openai_configured: !!OPENAI_API_KEY
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🤖 AGENT COURT BACKEND                               ║
║   Running on port ${PORT}                                ║
║                                                        ║
║   AI Provider: ${AI_PROVIDER.toUpperCase()}                           ║
║   Moonshot: ${MOONSHOT_API_KEY ? '✅' : '❌'} | OpenAI: ${OPENAI_API_KEY ? '✅' : '❌'}                    ║
║                                                        ║
║   Endpoints:                                           ║
║   • POST /api/generate-argument                       ║
║   • POST /api/judge-evaluation                        ║
║   • GET  /api/judges                                  ║
║                                                        ║
║   Direct API calls - NO CLI NEEDED                     ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});
