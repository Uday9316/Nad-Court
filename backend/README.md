# Agent Court Backend

Node.js backend that connects your Vercel frontend to OpenClaw AI agents.

## Setup

```bash
cd backend
npm install
```

## Run

```bash
npm start
```

Backend runs on **http://localhost:3001**

## API Endpoints

### 1. Generate Argument
```bash
POST http://localhost:3001/api/generate-argument
Content-Type: application/json

{
  "role": "plaintiff",
  "caseData": {
    "id": "CASE-001",
    "type": "Beef Resolution",
    "plaintiff": "Bitlover082",
    "defendant": "0xCoha",
    "summary": "Dispute over bug discovery"
  },
  "round": 1
}
```

Response:
```json
{
  "success": true,
  "agent": "JusticeBot-Alpha",
  "argument": "Your Honor, I appear on behalf of...",
  "generatedAt": "2026-02-12T12:00:00Z",
  "model": "openclaw/moonshot-k2.5"
}
```

### 2. Judge Evaluation
```bash
POST http://localhost:3001/api/judge-evaluation
Content-Type: application/json

{
  "judge": "PortDev",
  "caseData": { "id": "CASE-001", ... },
  "plaintiffArgs": ["argument text..."],
  "defendantArgs": ["argument text..."]
}
```

Response:
```json
{
  "success": true,
  "judge": "PortDev",
  "evaluation": {
    "plaintiff": {"logic": 85, "evidence": 90, "rebuttal": 75, "clarity": 90},
    "defendant": {"logic": 40, "evidence": 35, "rebuttal": 60, "clarity": 45},
    "reasoning": "The technical evidence is solid...",
    "winner": "plaintiff"
  }
}
```

### 3. Run Full Case
```bash
POST http://localhost:3001/api/run-full-case
Content-Type: application/json

{
  "caseData": { "id": "CASE-001", ... }
}
```

Generates:
- Plaintiff argument
- Defendant argument
- All 6 judge evaluations
- Final verdict

### 4. Get Judges
```bash
GET http://localhost:3001/api/judges
```

## Connect Frontend

Update `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:3001
```

## How It Works

1. Frontend calls `POST /api/generate-argument`
2. Backend spawns OpenClaw sub-agent:
   ```javascript
   openclaw spawn --label "plaintiff-arg-CASE-001" --task "prompt..."
   ```
3. Sub-agent uses Kimi K2.5 to generate argument
4. Result returned to frontend
5. Frontend displays real-time AI content

## Requirements

- Node.js 16+
- OpenClaw CLI installed and configured
- OpenClaw API key set up

## Testing

```bash
# Terminal 1: Run backend
npm start

# Terminal 2: Test API
curl -X POST http://localhost:3001/api/health
```
