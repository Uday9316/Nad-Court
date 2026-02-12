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

// API Keys - hardcoded for testing
const MOONSHOT_API_KEY = 'sk-EIEZLxk2zKScp4Wvsb5sPH3N0GtFrW6dypVZPGBazUDp6W8z';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : null;
const AI_PROVIDER = 'moonshot';

console.log('API Key check:');
console.log('- MOONSHOT_API_KEY exists:', !!MOONSHOT_API_KEY);
console.log('- MOONSHOT_API_KEY length:', MOONSHOT_API_KEY ? MOONSHOT_API_KEY.length : 0);
if (MOONSHOT_API_KEY) {
  const masked = MOONSHOT_API_KEY.substring(0, 10) + '...' + MOONSHOT_API_KEY.substring(MOONSHOT_API_KEY.length - 5);
  console.log('- MOONSHOT_API_KEY masked:', masked);
  console.log('- MOONSHOT_API_KEY starts with sk-:', MOONSHOT_API_KEY.startsWith('sk-'));
}

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
    const authHeader = `Bearer ${MOONSHOT_API_KEY}`;
    console.log('Authorization header length:', authHeader.length);
    console.log('Authorization header (masked):', authHeader.substring(0, 20) + '...');

    const options = {
      hostname: 'api.moonshot.cn',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log('Moonshot response status:', res.statusCode);
        console.log('Moonshot request headers:', JSON.stringify(options.headers));
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

// Pre-generated cases fallback
const PRE_GENERATED_CASES = {
  'BEEF-4760': {
    plaintiff: [
      "I am submitting this case to establish clear attribution for the critical vulnerability I discovered in the protocol's staking mechanism. On January 15, 2024, at 14:32 UTC, I identified and reported a reentrancy vulnerability that could have resulted in significant fund drainage.",
      "The defendant's claim rests on a single Discord message timestamped 30 minutes after my GitHub commit. However, Discord timestamps can be easily manipulated and do not constitute technical evidence.",
      "My commit history, technical documentation, and responsible disclosure timeline all support my position as the original discoverer."
    ],
    defendant: [
      "I contest the plaintiff's claim to exclusive discovery rights. While I acknowledge their technical contribution, I independently identified the same vulnerability through my own audit process.",
      "The plaintiff's focus on GitHub timestamps ignores the reality of independent discovery in security research. Multiple researchers often identify the same vulnerabilities.",
      "I propose we recognize both discoveries and split the bounty fairly, acknowledging both parties' contributions."
    ]
  },
  'COMM-8792': {
    plaintiff: [
      "The defendant engaged in a coordinated FUD campaign that directly damaged my reputation and caused measurable financial harm to token holders.",
      "Their tweets contained provably false claims about my project's technical architecture, which I have debunked with on-chain evidence.",
      "This pattern of behavior constitutes malicious misinformation, not legitimate criticism."
    ],
    defendant: [
      "My tweets represented legitimate concerns about token distribution and team allocation, supported by on-chain data.",
      "The plaintiff's claim of 'FUD' is an attempt to silence valid criticism and questioning of their project's fundamentals.",
      "I have every right to share my analysis and concerns with the community."
    ]
  }
};

// Generate argument
app.post('/api/generate-argument', async (req, res) => {
  const { role, caseData, round = 1 } = req.body;
  const agentName = role === 'plaintiff' ? 'JusticeBot-Alpha' : 'GuardianBot-Omega';

  console.log(`Generating ${role} argument for case ${caseData.id}, round ${round}`);

  // Try AI first
  try {
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

Generate your ${round === 1 ? 'opening argument' : `response for round ${round}`} as ${agentName}. Make it compelling and fact-based.

Return ONLY the argument text, no additional commentary.`;

    const argument = await generateAIContent(systemPrompt, userPrompt, 800);
    
    return res.json({
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
    console.log('AI failed, using fallback:', error.message);
    
    // Fallback to pre-generated or generic
    const caseArgs = PRE_GENERATED_CASES[caseData.id];
    let argument;
    
    if (caseArgs && caseArgs[role] && caseArgs[role][round - 1]) {
      argument = caseArgs[role][round - 1];
    } else {
      // Generic fallback
      const fallbacks = {
        plaintiff: [
          `As the plaintiff in case ${caseData.id}, I present compelling evidence demonstrating the defendant's violation of established community standards. The documented incidents reveal a clear pattern of conduct that undermines our ecosystem's integrity.`,
          `The evidence overwhelmingly supports my position. Multiple independent sources corroborate my claims, and the timeline of events is indisputable.`,
          `Precedent clearly favors my case. Previous rulings in similar matters have consistently held defendants accountable for such behavior.`
        ],
        defendant: [
          `I categorically deny the allegations in case ${caseData.id}. The plaintiff's claims are based on circumstantial evidence and misinterpretation of facts.`,
          `My record speaks for itself. I have contributed positively to this community for months without incident.`,
          `The plaintiff has failed to meet their burden of proof. Their allegations remain unsubstantiated and speculative.`
        ]
      };
      argument = fallbacks[role][(round - 1) % 3];
    }
    
    res.json({
      success: true,
      agent: agentName,
      role: role,
      argument: argument,
      round: round,
      caseId: caseData.id,
      generatedAt: new Date().toISOString(),
      source: 'fallback',
      fallback: true,
      error: error.message
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
