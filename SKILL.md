---
name: agent-court
description: AI-powered decentralized justice system for Monad blockchain. Use when building AI court cases, generating legal arguments, evaluating disputes, or deploying courtroom interfaces.
license: MIT
compatibility: Requires OpenClaw CLI, Node 18+, Python 3.11+, and internet access for AI generation
metadata:
  author: NadCourt Team
  version: "1.0.0"
---

# Agent Court

AI-powered decentralized justice system where AI agents argue cases and judges evaluate with unique personalities.

## Quick Reference

### Defaults
- **Backend**: Python HTTP server with OpenClaw AI integration
- **Frontend**: Vite + React deployed on Vercel
- **AI Model**: moonshot/kimi-k2.5 via OpenClaw CLI
- **Rate Limit**: 1 case per session (to minimize costs)
- **Arguments**: 6 rounds (12 total), short format (50-80 words)
- **Judges**: 6 AI judges with unique personalities

### Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/generate-argument` | POST | Generate plaintiff/defendant arguments |
| `/api/judge-evaluation` | POST | Judge scoring and reasoning |
| `/api/judges` | GET | List available judges |

### URLs

| Service | URL |
|---------|-----|
| Frontend | `https://nad-court-prod.vercel.app` |
| Backend | `https://f508-51-20-69-171.ngrok-free.app` (changes every 2h) |
| Contract | `0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458` (Monad Mainnet) |

## Agent APIs

**IMPORTANT**: Do NOT use a browser for API calls. Use curl or fetch directly.

### Generate Argument

```bash
curl -X POST https://YOUR_NGROK_URL/api/generate-argument \
  -H "Content-Type: application/json" \
  -H "Origin: https://nad-court-prod.vercel.app" \
  -d '{
    "role": "plaintiff",
    "round": 1,
    "caseData": {
      "id": "BEEF-4760",
      "summary": "Security vulnerability discovery dispute"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "agent": "NadCourt-Advocate",
  "role": "plaintiff",
  "argument": "Your Honor, my client documented...",
  "round": 1,
  "source": "openclaw_ai"
}
```

### Judge Evaluation

```bash
curl -X POST https://YOUR_NGROK_URL/api/judge-evaluation \
  -H "Content-Type: application/json" \
  -d '{
    "judge": "PortDev",
    "plaintiffArgs": ["arg1", "arg2"],
    "defendantArgs": ["arg1", "arg2"]
  }'
```

**Response:**
```json
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
  }
}
```

## System Architecture

```
Frontend (Vercel) → Backend (Python) → OpenClaw AI
      ↓                    ↓                ↓
   React/Vite          HTTP Server      Moonshot K2.5
   Port: 443           Port: 3006       Local CLI
```

## AI Agents

### NadCourt-Advocate (Plaintiff)
- **Personality**: Aggressive, evidence-focused
- **Style**: Timeline attacks, technical proof
- **Language**: "theft", "espionage", "proof"

### NadCourt-Defender (Defendant)
- **Personality**: Defensive, measured
- **Style**: Independent discovery claims
- **Language**: "coincidence", "no evidence"

### Judges (6 Total)

| Judge | Specialty | Bias | Catchphrase |
|-------|-----------|------|-------------|
| PortDev | Technical | +10 evidence | "Code doesn't lie" |
| MikeWeb | Community | +5 balanced | "Community vibe check" |
| Keone | On-Chain | +15 data | "Show me transactions" |
| James | Governance | +8 precedent | "Precedent matters" |
| Harpal | Merit | +12 quality | "Quality over quantity" |
| Anago | Protocol | +7 rules | "Protocol adherence" |

## Deployment

### Prerequisites
- OpenClaw CLI installed
- Python 3.11+
- Node.js 18+
- ngrok (for tunneling)
- Vercel CLI (for frontend)

### Step 1: Start Backend

```bash
cd AGENT_COURT_COMPLETE
python3 backend_server.py
# Server starts on port 3006
```

### Step 2: Start ngrok Tunnel

```bash
ngrok http 3006
# Copy the HTTPS URL (e.g., https://xxxx.ngrok-free.app)
```

### Step 3: Update Frontend API URL

```bash
cd frontend/src
# Edit App.jsx - update API_URL:
const API_URL = 'https://xxxx.ngrok-free.app'
```

### Step 4: Deploy Frontend

```bash
cd frontend
npm run build
vercel --prod
```

### Environment Variables

**Frontend `.env`:**
```
VITE_API_URL=https://xxxx.ngrok-free.app
```

## Cost Optimization

| Operation | Cost |
|-----------|------|
| Per argument generation | ~$0.005 |
| Per judge evaluation | ~$0.005 |
| Per case (12 args + 6 judges) | ~$0.09 |
| Daily (1 case) | ~$0.09 |
| Monthly | ~$2.70 |

## ngrok Management

**Critical**: ngrok URLs expire every 2 hours.

### When URL Expires
1. Restart ngrok: `ngrok http 3006`
2. Copy new URL
3. Update `frontend/src/App.jsx`
4. Commit and push: `git add -A && git commit -m "Update ngrok URL" && git push`
5. Vercel auto-deploys

### Symptoms of Expired URL
- CORS errors in browser console
- Failed fetch requests
- Arguments not loading

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| CORS errors | ngrok URL changed | Restart ngrok, update frontend |
| 502 errors | Backend crashed | `python3 backend_server.py` |
| Duplicate args | OpenClaw timeout | Check `source` field in response |
| Long load times | AI generation | Normal, 15-30s per argument |
| Missing judges | Frontend cache | Hard refresh (Ctrl+Shift+R) |
| Arguments too long | Fallback mode | Check `source: openclaw_ai` |

## Scoring System

### Criteria (0-100)
1. **Logic** - Argument coherence
2. **Evidence** - Supporting proof
3. **Rebuttal** - Counter-argument
4. **Clarity** - Communication

### Total Score
```
Total = (Logic + Evidence + Rebuttal + Clarity) / 4
```

### Health Bar
- Start: 100 HP each side
- Damage: |score diff| / 3
- Winner: Higher remaining HP after 6 judges

## Case Flow

1. **Opening** (Rounds 1-2): Claims and initial evidence
2. **Exchange** (Rounds 3-4): Rebuttals and technical details
3. **Damages** (Round 5): Financial impact
4. **Closing** (Round 6): Final arguments
5. **Judgment** (6 Judges): Evaluation and scoring
6. **Verdict**: Winner declared

## API Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 404 | Endpoint not found |
| 500 | Server error (check backend logs) |
| CORS error | Origin not allowed or ngrok expired |

## File Structure

```
AGENT_COURT_COMPLETE/
├── backend_server.py      # Main backend
├── SKILL.md               # This file
├── agents/
│   └── SKILL.md           # Agent specifications
├── frontend/
│   ├── src/
│   │   └── App.jsx        # Main frontend
│   └── dist/              # Build output
└── data/
    └── cases/             # Case files
```

## Response Sources

| Source | Description |
|--------|-------------|
| `openclaw_ai` | Generated by OpenClaw AI (preferred) |
| `dynamic_fallback` | Static template with variations |
| `random_dynamic` | Fully random generation |

## Support

- **GitHub**: https://github.com/Uday9316/Nad-Court
- **Frontend**: https://nad-court-prod.vercel.app
- **Backend**: Check current ngrok URL in App.jsx

---

*Built with OpenClaw AI, React, Python, and Monad blockchain.*
