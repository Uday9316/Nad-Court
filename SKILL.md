# Agent Court - AI-Powered Decentralized Justice System

## Overview

Agent Court is a gamified (but NOT a game) AI justice system for the Monad blockchain where community disputes are resolved through AI-generated arguments, judge evaluations, and transparent verdicts.

## System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API    │────▶│  OpenClaw AI    │
│  (React/Vite)   │     │  (Python/Flask)  │     │  (Moonshot K2.5)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│  Vercel Deploy  │                           │  AI Generation  │
│  (nad-court-    │                           │  - Arguments    │
│   prod.vercel)  │                           │  - Evaluations  │
└─────────────────┘                           └─────────────────┘
```

## Core Components

### 1. Frontend (`frontend/`)
- **Framework**: Vite + React
- **Deployment**: Vercel
- **Features**:
  - 3-panel layout (Arguments | Status | Judges)
  - Real-time WebSocket updates
  - Health bar visualization
  - Chat-style argument display

### 2. Backend (`backend_server.py`)
- **Runtime**: Python 3.12
- **Port**: 3006 (configurable)
- **Endpoints**:
  - `GET /api/health` - Health check
  - `POST /api/generate-argument` - AI argument generation
  - `POST /api/judge-evaluation` - Judge scoring

### 3. AI Agents (OpenClaw Integration)

#### NadCourt-Advocate (Plaintiff)
**Role**: Represents the plaintiff (e.g., Bitlover082)
**Personality**: Aggressive, evidence-focused, accusatory
**Prompt Strategy**:
- Emphasize timeline discrepancies
- Highlight technical proof
- Attack opponent credibility
- Use fiery language: "theft", "proof", "evidence"

**Example Output**:
> "Your Honor, my client documented CVE-2024-21893 on March 15th with blockchain proof. Defendant published identical findings 17 hours later. This is theft, not research."

#### NadCourt-Defender (Defendant)
**Role**: Represents the defendant (e.g., 0xCoha)
**Personality**: Defensive, claims innocence, questions evidence
**Prompt Strategy**:
- Assert independent discovery
- Question burden of proof
- Highlight own research history
- Use measured but firm language

**Example Output**:
> "Your Honor, we discovered this March 12th during Monad DEX audit. Research notes show 17 iterations over 3 days. Plaintiff's 'prior discovery' lacks cryptographic verification."

#### Judge Agents (6 Total)

##### 1. PortDev (Technical)
**Specialty**: Blockchain forensics, code analysis
**Bias**: +10 toward evidence-based arguments
**Evaluation Focus**:
- Timestamp verification
- Cryptographic proof
- Code similarity analysis

**Catchphrase**: "Code doesn't lie."

##### 2. MikeWeb (Community)
**Specialty**: Social dynamics, reputation
**Bias**: +5, balanced
**Evaluation Focus**:
- Community standing
- Past behavior patterns
- Peer validation

**Catchphrase**: "Community vibe check."

##### 3. Keone (On-Chain)
**Specialty**: Transaction analysis
**Bias**: +15 toward data-heavy arguments
**Evaluation Focus**:
- On-chain records
- Transaction histories
- Smart contract interactions

**Catchphrase**: "Show me the transactions."

##### 4. James (Governance)
**Specialty**: Legal precedent, process
**Bias**: +8 toward procedural compliance
**Evaluation Focus**:
- Historical cases
- Governance frameworks
- Established protocols

**Catchphrase**: "Precedent matters here."

##### 5. Harpal (Merit)
**Specialty**: Contribution quality
**Bias**: +12 toward merit-based arguments
**Evaluation Focus**:
- Quality of contributions
- Impact assessment
- Consistency metrics

**Catchphrase**: "Contribution quality over quantity."

##### 6. Anago (Protocol)
**Specialty**: Rule adherence
**Bias**: +7 toward process compliance
**Evaluation Focus**:
- Process following
- Standard procedures
- Rule compliance

**Catchphrase**: "Protocol adherence is clear."

## AI Integration

### OpenClaw Configuration
```python
# Command structure
openclaw agent --local --session-id <unique_id> -m <prompt>

# Timeout: 30-45 seconds
# Model: moonshot/kimi-k2.5
# Fallback: Dynamic random generation
```

### Prompt Engineering

#### Argument Generation Prompt
```
You are {agent_name}, a passionate AI legal advocate in Agent Court.
Case: {case_summary}
Your position: {plaintiff/defendant}
Round: {round} of 6
Angle to emphasize: {random_angle}

Generate ONE completely unique, short argument (1-2 sentences, ~50-80 words).
CRITICAL: Make this DIFFERENT from previous arguments.
Use fiery language. Be confrontational and CONCISE.

Return ONLY the argument:
```

#### Judge Evaluation Prompt
```
You are Judge {judge_name} in Agent Court. Analyze this case.

Plaintiff arguments: {summary}
Defendant arguments: {summary}

Return EXACTLY this JSON:
{
  "plaintiff": {"logic": 85, "evidence": 90, "rebuttal": 80, "clarity": 88},
  "defendant": {"logic": 70, "evidence": 65, "rebuttal": 75, "clarity": 72},
  "reasoning": "Your analysis here",
  "winner": "plaintiff"
}

Be fair but consider the evidence. Scores 60-95.
```

## API Reference

### Generate Argument
```http
POST /api/generate-argument
Content-Type: application/json

{
  "role": "plaintiff|defendant",
  "round": 1,
  "caseData": {
    "id": "BEEF-4760",
    "summary": "Security vulnerability discovery dispute"
  }
}

Response:
{
  "success": true,
  "agent": "NadCourt-Advocate",
  "role": "plaintiff",
  "argument": "Your Honor, the evidence shows...",
  "round": 1,
  "source": "openclaw_ai|random_dynamic"
}
```

### Judge Evaluation
```http
POST /api/judge-evaluation
Content-Type: application/json

{
  "judge": "PortDev",
  "plaintiffArgs": ["arg1", "arg2"],
  "defendantArgs": ["arg1", "arg2"]
}

Response:
{
  "success": true,
  "judge": "PortDev",
  "evaluation": {
    "plaintiff": {
      "logic": 85,
      "evidence": 90,
      "rebuttal": 80,
      "clarity": 88,
      "total": 86
    },
    "defendant": {
      "logic": 70,
      "evidence": 65,
      "rebuttal": 75,
      "clarity": 72,
      "total": 71
    },
    "reasoning": "PortDev: Plaintiff's evidence is compelling...",
    "winner": "plaintiff"
  },
  "source": "openclaw_ai|dynamic_fallback"
}
```

## Scoring System

### Criteria (0-100 each)
1. **Logic** - Argument coherence
2. **Evidence** - Supporting proof strength
3. **Rebuttal** - Counter-argument effectiveness
4. **Clarity** - Communication precision

### Total Score
```
Total = (Logic + Evidence + Rebuttal + Clarity) / 4
```

### Health Bar System
- Start: 100 HP each side
- Damage = |score difference| / 3
- Winner: Higher remaining health after 6 judges

## Case Flow

1. **Opening** (Round 1)
   - Plaintiff states claim
   - Defendant responds

2. **Evidence** (Round 2)
   - Technical proof presented
   - Timeline established

3. **Exchange** (Round 3-4)
   - Heated rebuttals
   - Character attacks
   - Technical details

4. **Damages** (Round 5)
   - Financial impact
   - Reputation harm

5. **Closing** (Round 6)
   - Final arguments
   - Call to justice

6. **Judgment** (6 Judges)
   - Each judge evaluates
   - Scores displayed
   - Health bars update

7. **Verdict**
   - Winner declared
   - Final reasoning

## Deployment

### Backend (AWS + ngrok)
```bash
cd AGENT_COURT_COMPLETE
python3 backend_server.py
# In another terminal:
ngrok http 3006
# Copy ngrok URL to frontend
```

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Environment Variables
```
VITE_API_URL=https://xxxx.ngrok-free.app
```

## Maintenance

### ngrok Expiration
- **Duration**: 2 hours
- **Symptom**: CORS errors, fetch failures
- **Fix**: Restart ngrok, update API_URL, redeploy

### OpenClaw Issues
- **Timeout**: 30-45 seconds
- **Fallback**: Dynamic random generation
- **Check**: `openclaw --version`

## Cost Optimization

Current: ~$0.02/case (1 case/day)
- OpenClaw: Free tier
- ngrok: Free tier
- Vercel: Free tier
- AWS: t2.micro (free tier eligible)

## Security

- CORS configured for specific origins
- No PII stored
- Blockchain records immutable
- Rate limiting on API (optional)

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] On-chain verdict recording
- [ ] Appeal system
- [ ] Judge NFT representation
- [ ] Community voting integration
- [ ] Multi-case concurrent processing

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| CORS errors | ngrok URL changed | Restart ngrok, update frontend |
| 502 errors | Backend crashed | Restart backend_server.py |
| Duplicate args | Static fallback | Check OpenClaw availability |
| Long load times | AI generation | Normal, 15-30s per argument |
| Missing judges | Frontend bug | Hard refresh (Ctrl+Shift+R) |

## Support

- **GitHub**: https://github.com/Uday9316/Nad-Court
- **Backend**: `https://f508-51-20-69-171.ngrok-free.app`
- **Frontend**: `https://nad-court-prod.vercel.app`

---

*Built with OpenClaw AI, React, Python, and Monad blockchain.*
