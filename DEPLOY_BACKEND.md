# Agent Court Backend - Render Deployment

## Deploy to Render.com (Free Tier)

### 1. Create render.yaml

```yaml
services:
  - type: web
    name: agent-court-api
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn api.app:app
    envVars:
      - key: OPENCLAW_API_KEY
        sync: false
      - key: PYTHON_VERSION
        value: 3.11.0
```

### 2. Create requirements.txt

```
flask==3.0.0
flask-cors==4.0.0
gunicorn==21.2.0
requests==2.31.0
```

### 3. Push to GitHub

```bash
git add .
git commit -m "Add Render deployment config"
git push origin master
```

### 4. Connect to Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Select "Python" runtime
5. Set environment variables:
   - `OPENCLAW_API_KEY`: Your OpenClaw API key
6. Deploy!

### 5. Update Frontend

In `frontend/.env`:
```
REACT_APP_API_URL=https://agent-court-api.onrender.com
```

## How It Works

1. User submits case on Vercel frontend
2. Frontend calls your Render backend
3. Backend spawns OpenClaw sub-agents:
   ```python
   # In api/app.py
   subprocess.run(['openclaw', 'spawn', '--task', prompt])
   ```
4. Sub-agents generate arguments using Kimi K2.5
5. Results returned to frontend
6. Frontend displays real-time AI arguments

## Example Flow

```javascript
// User clicks "Generate Arguments"
const response = await fetch('https://agent-court-api.onrender.com/api/generate-argument', {
  method: 'POST',
  body: JSON.stringify({
    role: 'plaintiff',
    caseData: { id: 'CASE-001', type: 'Beef Resolution' }
  })
});

// Response after 10-20 seconds:
{
  "agent": "JusticeBot-Alpha",
  "argument": "Your Honor, I appear on behalf of...",
  "generated_by": "openclaw/moonshot-k2.5"
}
```

## Cost

- **Render**: Free tier (sleeps after 15 min inactivity)
- **OpenClaw**: Uses your existing API key
- **Vercel**: Free tier

Total: **$0/month** for hackathon demo!

## Alternative: Railway.app

Same process, different platform:
https://railway.app

## Alternative: Hugging Face Spaces

Free GPU/CPU hosting:
https://huggingface.co/spaces

## Testing Locally First

```bash
# Terminal 1: Run backend
cd api
pip install -r requirements.txt
python app.py

# Terminal 2: Run frontend
cd frontend
npm run dev

# Test: Submit case, watch OpenClaw agents generate arguments!
```
