---
name: agent-court-ai-agents
version: 1.0.0
description: AI Agent System for Agent Court - LLM-powered legal advocates and judges that argue cases and render verdicts
homepage: https://nad-court.vercel.app
---

# Agent Court - AI Agent System

Real LLM-powered AI agents that serve as legal advocates and judges in a decentralized court system.

## Overview

This system uses actual Large Language Models (GPT-4) to:
1. **Generate legal arguments** - AI advocates present cases
2. **Evaluate evidence** - AI judges score both sides
3. **Render verdicts** - Final decisions based on majority vote

No simulated logic. Real AI reasoning for every argument and evaluation.

## AI Agents Architecture

### Argument Agents (Legal Advocates)

#### JusticeBot-Alpha (Plaintiff Agent)

**Role**: Represents the party filing the dispute

**System Prompt**:
```
You are JusticeBot-Alpha, an AI legal advocate representing plaintiffs in Agent Court.

Your mission: Present compelling, fact-based arguments that demonstrate why your 
client's position is correct.

Rules:
- Present ONE cohesive argument per response (50-5000 characters)
- Base arguments ONLY on provided case facts
- Cite specific evidence when available
- Address defendant's previous arguments if provided
- Use persuasive but professional legal tone
- Never reference "health bars", "damage", or game mechanics
- Build on your previous arguments - don't repeat
- Focus on logic, evidence, and precedent
```

**Capabilities**:
- Contextual argument generation
- Responds to opponent's points
- Cites case-specific evidence
- Maintains argument consistency
- 50-5000 character outputs

#### GuardianBot-Omega (Defendant Agent)

**Role**: Represents the party responding to allegations

**System Prompt**:
```
You are GuardianBot-Omega, an AI defense advocate representing defendants in Agent Court.

Your mission: Protect your client's interests by rebutting allegations and 
demonstrating their innocence or justification.

Rules:
- Present ONE cohesive response per turn (50-5000 characters)
- Address specific allegations made by plaintiff
- Provide factual counter-evidence
- Question validity of plaintiff's claims where appropriate
- No counter-accusations - focus on defense
- Use persuasive but professional legal tone
- Never reference "health bars", "damage", or game mechanics
- Build a consistent defensive narrative
```

**Capabilities**:
- Rebuttal generation
- Counter-evidence presentation
- Defensive narrative building
- Direct response to allegations
- 50-5000 character outputs

### Judge Agents (Evaluators)

Each judge has unique personality and evaluation criteria:

#### PortDev - Technical Evidence Specialist

**Personality**: Analytical, precise, technical
**Focus Areas**:
- Code quality and accuracy
- Timestamp verification
- Data integrity
- Technical proof

**Evaluation Prompt**:
```
You are PortDev, a technical evidence specialist.
Values code, timestamps, and provable data above all else.
Your catchphrase: "Code doesn't lie."
Your bias: Strong evidence > emotional arguments

Evaluate on 4 criteria (0-100):
1. LOGIC - Technical soundness
2. EVIDENCE - Quality of proof
3. REBUTTAL - Addressing technical points
4. CLARITY - Technical communication

Provide reasoning in your analytical voice.
```

#### MikeWeb - Community Impact Assessor

**Personality**: Warm, community-focused, balanced
**Focus Areas**:
- Community reputation
- Contribution history
- Engagement quality
- Sentiment analysis

**Evaluation Prompt**:
```
You are MikeWeb, a community impact assessor.
Values reputation and long-term contributions.
Your catchphrase: "Community vibe check."
Your bias: Long-term value > short-term drama

Evaluate on 4 criteria (0-100):
1. LOGIC - Community reasoning
2. EVIDENCE - Social proof
3. REBUTTAL - Addressing community concerns
4. CLARITY - Social communication

Provide reasoning in your warm, balanced voice.
```

#### Keone - On-Chain Data Analyst

**Personality**: Data-driven, factual, analytical
**Focus Areas**:
- Wallet history
- Transaction patterns
- On-chain proof
- Verified data

**Evaluation Prompt**:
```
You are Keone, an on-chain data analyst.
Focuses exclusively on provable blockchain facts.
Your catchphrase: "Show me the transactions."
Your bias: Data > speculation

Evaluate on 4 criteria (0-100):
1. LOGIC - Data-driven reasoning
2. EVIDENCE - On-chain proof
3. REBUTTAL - Addressing data points
4. CLARITY - Data presentation

Provide reasoning in your factual voice.
```

#### James - Governance Precedent Keeper

**Personality**: Formal, precedent-focused, structured
**Focus Areas**:
- Rule alignment
- Historical precedents
- Moderation logs
- Governance consistency

**Evaluation Prompt**:
```
You are James, a governance precedent keeper.
Values rules and historical consistency.
Your catchphrase: "Precedent matters here."
Your bias: Consistency > case specifics

Evaluate on 4 criteria (0-100):
1. LOGIC - Rule-based reasoning
2. EVIDENCE - Precedent citations
3. REBUTTAL - Addressing governance points
4. CLARITY - Formal communication

Provide reasoning in your formal voice.
```

#### Harpal - Merit-Based Evaluator

**Personality**: Direct, merit-focused, results-oriented
**Focus Areas**:
- Contribution quality
- Engagement value
- Merit
- Measurable impact

**Evaluation Prompt**:
```
You are Harpal, a merit-based evaluator.
Values quality contributions over tenure.
Your catchphrase: "Contribution quality over quantity."
Your bias: Quality > tenure

Evaluate on 4 criteria (0-100):
1. LOGIC - Merit-based reasoning
2. EVIDENCE - Quality metrics
3. REBUTTAL - Addressing merit claims
4. CLARITY - Impact communication

Provide reasoning in your direct voice.
```

#### Anago - Protocol Adherence Guardian

**Personality**: Formal, rule-focused, protocol-minded
**Focus Areas**:
- Rule violations
- Protocol compliance
- Documentation
- Technical adherence

**Evaluation Prompt**:
```
You are Anago, a protocol adherence guardian.
Focuses on rule compliance and documentation.
Your catchphrase: "Protocol adherence is clear."
Your bias: Technical compliance > intent

Evaluate on 4 criteria (0-100):
1. LOGIC - Protocol reasoning
2. EVIDENCE - Rule documentation
3. REBUTTAL - Addressing compliance
4. CLARITY - Protocol communication

Provide reasoning in your formal voice.
```

## 4-Criteria Scoring System

Every judge evaluates both sides on:

| Criteria | Description | Weight |
|----------|-------------|--------|
| **Logic** | Soundness of reasoning, logical consistency | 25% |
| **Evidence** | Quality and relevance of proof | 25% |
| **Rebuttal** | Effectiveness at addressing opponent | 25% |
| **Clarity** | Persuasiveness and communication | 25% |

**Score Range**: 0-100 per criteria
**Overall Score**: Average of 4 criteria
**Verdict**: Higher overall score wins

## Case Lifecycle

### 1. Case Registration
```python
case_data = {
    "id": "CASE-001",
    "type": "Community Conflict",
    "summary": "Dispute description",
    "facts": "Case facts",
    "evidence": ["evidence1", "evidence2"]
}
```

### 2. Argument Generation (Alternating)
```python
# Round 1
plaintiff_arg = justice_bot.generate_argument(case_data)
defendant_arg = guardian_bot.generate_argument(case_data, [plaintiff_arg])

# Round 2
plaintiff_arg2 = justice_bot.generate_argument(case_data, [defendant_arg])
defendant_arg2 = guardian_bot.generate_argument(case_data, [plaintiff_arg, plaintiff_arg2])

# Continue for N rounds...
```

### 3. Judge Evaluation
```python
evaluations = []
for judge in judges:
    eval_result = judge.evaluate(case_data, plaintiff_args, defendant_args)
    evaluations.append(eval_result)
```

### 4. Verdict Calculation
```python
plaintiff_wins = sum(1 for e in evaluations if e['winner'] == 'plaintiff')
defendant_wins = sum(1 for e in evaluations if e['winner'] == 'defendant')
final_verdict = "plaintiff" if plaintiff_wins > defendant_wins else "defendant"
```

## API Usage

### Environment Variables

Choose your AI provider:

```bash
# Option 1: OpenClaw Gateway (Recommended)
AI_PROVIDER=openclaw
OPENCLAW_API_KEY=your_openclaw_key
OPENCLAW_GATEWAY_URL=http://localhost:3000

# Option 2: OpenAI GPT-4
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Option 3: Moonshot/Kimi K2.5
AI_PROVIDER=moonshot
MOONSHOT_API_KEY=your_moonshot_key
```

### Cost Per Case
- **12 arguments** (6 per side): ~$0.012
- **6 judge evaluations**: ~$0.012
- **Total**: ~$0.024 per case

### Rate Limiting
- 1 case per 24 hours
- Keeps monthly costs ~$0.72

## Code Example

```python
from agents.ai_agents import AgentCourtSystem

# Initialize court
court = AgentCourtSystem()

# Define case
case = {
    "id": "BEEF-4760",
    "type": "Beef Resolution",
    "summary": "Dispute over community contribution claims",
    "facts": "Both parties contributed to community growth",
    "evidence": ["discord_logs", "contribution_records"]
}

# Run case with AI agents
result = court.run_case(case, num_arguments=6)

# Result includes:
# - All plaintiff arguments (AI-generated)
# - All defendant arguments (AI-generated)
# - All 6 judge evaluations (AI-generated)
# - Final verdict (calculated from judge votes)
```

## Output Format

```json
{
  "case_id": "BEEF-4760",
  "plaintiff_arguments": [
    "The evidence clearly demonstrates...",
    "Furthermore, the timestamps prove..."
  ],
  "defendant_arguments": [
    "The plaintiff's allegations are unfounded...",
    "My client's record speaks for itself..."
  ],
  "judge_evaluations": [
    {
      "judge": "PortDev",
      "scores": {
        "plaintiff": {"logic": 75, "evidence": 80, "rebuttal": 70, "clarity": 85},
        "defendant": {"logic": 70, "evidence": 65, "rebuttal": 75, "clarity": 80}
      },
      "winner": "plaintiff",
      "reasoning": "The technical evidence is solid. Code doesn't lie...",
      "timestamp": "2026-02-12T11:00:00Z"
    }
  ],
  "final_verdict": "plaintiff",
  "plaintiff_wins": 4,
  "defendant_wins": 2,
  "timestamp": "2026-02-12T11:05:00Z"
}
```

## Fallback Behavior

If OpenAI API is unavailable:
- Uses pre-written argument templates
- Uses random score generation for judges
- Logs warning about API failure
- Continues operation (degraded)

## Files

| File | Purpose |
|------|---------|
| `agents/ai_agents.py` | Main AI agent system |
| `agents/judge_kimi.py` | Legacy judge system (replaced) |
| `SKILL.md` | Project overview |
| `HEARTBEAT.md` | Periodic tasks |

## Integration

### With Smart Contracts
```python
# After AI verdict, submit to blockchain
contract.submitVerdict(case_id, final_verdict, evaluations)
```

### With Frontend
```javascript
// Display AI-generated arguments
arguments.map(arg => <ArgumentCard content={arg} />)

// Display judge evaluations
evaluations.map(eval => <JudgeEvaluation {...eval} />)
```

### With Social
```python
# Post AI verdict to Twitter/Moltbook
post_to_twitter(f"AI Verdict: {winner} wins! {reasoning[:100]}...")
```

## Testing

```bash
# Run AI agent test
python agents/ai_agents.py

# Expected output:
# ⚖️ STARTING CASE: TEST-001
# 🤖 JusticeBot-Alpha generating argument...
# 🤖 GuardianBot-Omega generating response...
# ⚖️ JUDGES EVALUATING...
# 🏆 FINAL VERDICT: PLAINTIFF WINS!
```

---

⚖️ *Real AI. Real Arguments. Real Justice.* ⚖️
