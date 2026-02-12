---
name: agent-court
version: 1.0.0
description: Decentralized AI justice system for the Monad blockchain. Real AI agents argue cases and render verdicts using LLM reasoning.
homepage: https://nad-court.vercel.app
metadata:
  emoji: "⚖️"
  category: "blockchain"
  chain: "monad"
  contract: "0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458"
  ai_provider: "moonshot/kimi-k2.5"
---

# Agent Court - AI-Powered Justice System

**A decentralized court system where AI agents argue cases and render verdicts on the Monad blockchain.**

## 🎯 Hackathon Submission Overview

Agent Court is a fully functional AI justice system featuring:
- **Real LLM-powered AI agents** that generate legal arguments
- **6 AI judges** with unique personalities evaluating cases
- **On-chain verdicts** stored on Monad blockchain
- **Token-gated access** requiring $JUSTICE stake
- **Moltbook integration** for AI agent community engagement

## 🤖 AI Agent Architecture

### Argument Agents (Legal Advocates)

#### JusticeBot-Alpha (Plaintiff Agent)

**Purpose**: Represents parties filing disputes
**AI Model**: Moonshot Kimi K2.5
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

**Implementation**: `agents/ai_agents.py` - `AIArgumentAgent` class
**API Call**: Real-time LLM inference via Moonshot API
**Output**: Unique legal argument for each case

#### GuardianBot-Omega (Defendant Agent)

**Purpose**: Represents parties responding to allegations  
**AI Model**: Moonshot Kimi K2.5
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

**Implementation**: `agents/ai_agents.py` - `AIArgumentAgent` class
**API Call**: Real-time LLM inference via Moonshot API
**Output**: Rebuttal argument responding to plaintiff

### Judge Agents (Evaluators)

All 6 judges use **Moonshot Kimi K2.5** for real reasoning:

#### PortDev - Technical Evidence Specialist
- **Focus**: Code, timestamps, data integrity
- **Voice**: Analytical, precise, technical
- **Catchphrase**: "Code doesn't lie."
- **Prompt Strategy**: Emphasize technical proof over emotional arguments

#### MikeWeb - Community Impact Assessor
- **Focus**: Reputation, contributions, sentiment
- **Voice**: Warm, community-focused, balanced
- **Catchphrase**: "Community vibe check."
- **Prompt Strategy**: Value long-term community value

#### Keone - On-Chain Data Analyst
- **Focus**: Wallet history, transactions, verified data
- **Voice**: Data-driven, factual, analytical
- **Catchphrase**: "Show me the transactions."
- **Prompt Strategy**: Demand provable blockchain facts

#### James - Governance Precedent Keeper
- **Focus**: Rules, historical cases, moderation logs
- **Voice**: Formal, precedent-focused, structured
- **Catchphrase**: "Precedent matters here."
- **Prompt Strategy**: Prioritize consistency with past rulings

#### Harpal - Merit-Based Evaluator
- **Focus**: Contribution quality, engagement value, impact
- **Voice**: Direct, merit-focused, results-oriented
- **Catchphrase**: "Contribution quality over quantity."
- **Prompt Strategy**: Reward measurable quality over tenure

#### Anago - Protocol Adherence Guardian
- **Focus**: Rule violations, compliance, documentation
- **Voice**: Formal, rule-focused, protocol-minded
- **Catchphrase**: "Protocol adherence is clear."
- **Prompt Strategy**: Enforce technical compliance strictly

**Implementation**: `agents/ai_agents.py` - `AIJudgeAgent` class
**Evaluation Method**: 4-criteria scoring (Logic, Evidence, Rebuttal, Clarity)
**Output**: JSON with scores, reasoning, and winner determination

## ⚖️ 4-Criteria Scoring System

Every AI judge evaluates both sides on:

| Criteria | Weight | Description |
|----------|--------|-------------|
| **Logic** | 25% | Soundness of reasoning, logical consistency |
| **Evidence** | 25% | Quality and relevance of proof presented |
| **Rebuttal** | 25% | Effectiveness at addressing opponent's points |
| **Clarity** | 25% | Persuasiveness and communication quality |

**Score Range**: 0-100 per criteria
**Overall Score**: Average of 4 criteria
**Verdict**: Side with higher overall score wins that judge's vote

## 📋 Case Lifecycle (AI-Driven)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT COURT - AI FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CASE REGISTRATION                                           │
│     └── User stakes $JUSTICE tokens                             │
│                                                                 │
│  2. AI ARGUMENT GENERATION (Alternating)                        │
│     ├── JusticeBot-Alpha (Plaintiff) → LLM Call → Argument     │
│     ├── GuardianBot-Omega (Defendant) → LLM Call → Rebuttal    │
│     ├── JusticeBot-Alpha → LLM Call → Counter                  │
│     └── ... (6 rounds = 12 total arguments)                    │
│                                                                 │
│  3. AI JUDGE EVALUATION                                         │
│     ├── PortDev → LLM Call → Scores + Reasoning                │
│     ├── MikeWeb → LLM Call → Scores + Reasoning                │
│     ├── Keone → LLM Call → Scores + Reasoning                  │
│     ├── James → LLM Call → Scores + Reasoning                  │
│     ├── Harpal → LLM Call → Scores + Reasoning                 │
│     └── Anago → LLM Call → Scores + Reasoning                  │
│                                                                 │
│  4. VERDICT CALCULATION                                         │
│     └── Majority vote of 6 judges determines winner            │
│                                                                 │
│  5. ON-CHAIN SUBMISSION                                         │
│     └── Verdict stored on Monad blockchain                     │
│                                                                 │
│  6. SOCIAL NOTIFICATION                                         │
│     ├── Post to Twitter/X                                       │
│     └── Post to Moltbook (m/nadcourt)                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Technical Implementation

### AI Provider Configuration

**Current Setup** (as configured in `.env`):
```bash
AI_PROVIDER=moonshot
MOONSHOT_API_KEY=sk-EIEZLxk2zKScp4Wvsb5sPH3N0GtFrW6dypVZPGBazUDp6W8z
```

**Model Used**: `moonshot-v1-128k` (Kimi K2.5)

### API Integration Code

```python
# From agents/ai_agents.py

def _call_moonshot(self, messages: List[Dict], temperature: float, max_tokens: int) -> str:
    """Call Moonshot/Kimi K2.5 API for real AI reasoning"""
    headers = {
        "Authorization": f"Bearer {MOONSHOT_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "moonshot-v1-128k",  # Kimi K2.5
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    
    response = requests.post(
        "https://api.moonshot.cn/v1/chat/completions",
        headers=headers,
        json=payload
    )
    return response.json()["choices"][0]["message"]["content"]
```

### Cost Per Case

- **12 arguments** (6 per side): ~$0.012
- **6 judge evaluations**: ~$0.012
- **Total**: ~$0.024 per case
- **Daily limit**: 1 case/day = $0.72/month

## 🏛️ Smart Contract Integration

**Contract**: `0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458`
**Chain**: Monad Mainnet (Chain ID 143)

### Contract Functions

```solidity
// Submit AI-generated argument
function submitArgument(
    uint256 _caseId, 
    bool _isPlaintiff, 
    string calldata _content
) external;

// Submit AI judge evaluation
function submitJudgment(
    uint256 _caseId,
    address _judge,
    uint8[4] calldata _plaintiffScores,  // [logic, evidence, rebuttal, clarity]
    uint8[4] calldata _defendantScores,
    string calldata _reasoning
) external;

// Calculate final verdict from AI evaluations
function resolveCase(uint256 _caseId) external;
```

## 📁 Project Structure

```
AGENT_COURT_COMPLETE/
├── agents/
│   ├── ai_agents.py          # ⭐ Main AI system (real LLM calls)
│   ├── judge_kimi.py         # Legacy judge system
│   ├── main.py               # Court orchestrator
│   └── SKILL.md              # ⭐ AI agent documentation
├── contracts/
│   ├── AgentCourt.sol        # Smart contract
│   └── JusticeToken.sol      # $JUSTICE token
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # React frontend
│   │   └── assets/           # Judge images
│   └── ...
├── bot/
│   ├── moltbook.js           # Moltbook integration
│   └── twitter-oauth2.js     # Twitter integration
├── SKILL.md                  # ⭐ Project documentation
├── HEARTBEAT.md              # Periodic tasks
└── .env                      # API keys (configured)
```

## 🚀 Running the AI Court

### Prerequisites
```bash
pip install openai requests python-dotenv
```

### Run a Test Case
```python
from agents.ai_agents import AgentCourtSystem

# Initialize with real AI agents
court = AgentCourtSystem()

# Define a case
case = {
    "id": "HACKATHON-001",
    "type": "Community Conflict",
    "summary": "Dispute over contribution recognition in Monad ecosystem",
    "facts": "Both parties contributed to community growth, disagreement over credit",
    "evidence": [
        "Discord server activity logs",
        "GitHub contribution records", 
        "Community testimonials"
    ]
}

# Run AI-powered court case
result = court.run_case(case, num_arguments=6)

# Output:
# - 12 AI-generated arguments (6 per side)
# - 6 AI judge evaluations with reasoning
# - Final verdict with vote count
```

### Expected Output
```
⚖️ STARTING CASE: HACKATHON-001
   Type: Community Conflict
   Arguments per side: 6

--- ROUND 1 ---
🤖 JusticeBot-Alpha generating argument...
   Plaintiff: The evidence clearly demonstrates my client's substantial 
   contributions to the Monad ecosystem over the past 6 months...

🤖 GuardianBot-Omega generating response...
   Defendant: While the plaintiff claims credit, the documented timeline 
   reveals a different narrative. Our on-chain records show...

⚖️ JUDGES EVALUATING...
   PortDev evaluating...
   ✅ PortDev: DEFENDANT wins
      Reasoning: The technical evidence, specifically the timestamped 
      GitHub commits, contradicts the plaintiff's claims...

   MikeWeb evaluating...
   ✅ MikeWeb: PLAINTIFF wins
      Reasoning: Community vibe check - the plaintiff has been consistently 
      helpful in Discord for months...

   [... 4 more judges ...]

==================================================
🏆 FINAL VERDICT: DEFENDANT WINS!
   Score: 2-4
==================================================
```

## 🎨 Frontend Demo

Visit: https://nad-court.vercel.app

Features:
- **Live Court**: Watch AI agents argue in real-time
- **Judge Panel**: See individual judge evaluations
- **Case Archive**: Browse past AI-verdicted cases
- **Submit Case**: Stake $JUSTICE to file disputes

## 📝 Skill Files for Hackathon

| File | Purpose | Location |
|------|---------|----------|
| `SKILL.md` | Project overview | `/SKILL.md` |
| `agents/SKILL.md` | AI agent documentation | `/agents/SKILL.md` |
| `HEARTBEAT.md` | Periodic tasks | `/HEARTBEAT.md` |

## 🔗 Integrations

### Moltbook
- **Agent**: NadCourt-Justice
- **Submolt**: m/nadcourt
- **Actions**: Auto-post cases and verdicts

### Twitter/X
- **Posts**: Case announcements and verdicts
- **Frequency**: 1 per case (24h limit)

## 📊 Hackathon Judging Criteria

✅ **AI Integration**: Real LLM calls for every argument and evaluation  
✅ **Blockchain**: On-chain verdicts via Monad smart contracts  
✅ **Community**: Moltbook social integration for AI agents  
✅ **Innovation**: Novel AI-as-legal-advocate concept  
✅ **Functionality**: Working demo at https://nad-court.vercel.app  

## 🏆 Team

- **Project**: Agent Court
- **Blockchain**: Monad
- **AI Model**: Moonshot Kimi K2.5
- **Status**: Ready for hackathon submission

---

⚖️ *Real AI. Real Arguments. Real Justice.* ⚖️
