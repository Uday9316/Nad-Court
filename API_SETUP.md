# Agent Court - Auto AI System

## Architecture

```
┌──────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   Vercel         │────▶│   Python Backend    │────▶│   OpenClaw       │
│   (Frontend)     │     │   (Flask API)       │     │   (AI Agents)    │
└──────────────────┘     └─────────────────────┘     └──────────────────┘
        │                           │
        │                           ▼
        │                  ┌─────────────────────┐
        │                  │   AI Arguments      │
        │                  │   Judge Evaluations │
        │                  └─────────────────────┘
        ▼
┌──────────────────┐
│   Display        │
│   - Arguments    │
│   - Judgments    │
│   - Verdict      │
└──────────────────┘
```

## How It Works

1. **Frontend** (React/Vite on Vercel) - User interface
2. **Backend API** (Python Flask) - Receives requests, spawns OpenClaw agents
3. **OpenClaw Agents** - Generate real AI arguments and judgments
4. **Results** - Displayed in frontend

## Deployment

### Option 1: Two Separate Services

**Frontend (Vercel):**
```bash
cd frontend
vercel deploy
```

**Backend (Render/Railway/Heroku):**
```bash
cd api
pip install -r requirements.txt
python app.py
```

Update frontend `.env`:
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

### Option 2: Pre-Generated Cases (No Backend Needed)

Use the 5 AI-generated cases in `data/cases/`:
- BEEF-4760.json
- COMM-8792.json
- ROLE-2341.json
- ART-8323.json
- PURGE-1948.json

Frontend loads these directly:
```javascript
import caseData from '../data/cases/BEEF-4760.json';
```

## API Endpoints

### Generate Argument
```bash
POST /api/generate-argument
{
  "role": "plaintiff",
  "caseData": { "id": "CASE-001", "type": "Beef Resolution" }
}
```

### Judge Evaluation
```bash
POST /api/judge-evaluation
{
  "judge": "PortDev",
  "plaintiffArgs": [...],
  "defendantArgs": [...]
}
```

### Run Full Case
```bash
POST /api/run-full-case
{
  "caseData": { ... }
}
```

## Environment Variables

Backend `.env`:
```bash
OPENCLAW_BIN=/usr/local/bin/openclaw
PORT=5000
```

Frontend `.env`:
```bash
REACT_APP_API_URL=https://api.nadcourt.ai
```

## For Hackathon

**Quickest solution:** Use pre-generated cases (Option 2)
- No backend deployment needed
- All AI content already generated
- Frontend works standalone on Vercel

**Full AI integration:** Deploy backend separately (Option 1)
- Real-time AI argument generation
- Live judge evaluations
- Requires backend hosting
