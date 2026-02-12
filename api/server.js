const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Agent Court API' });
});

// Generate case arguments using OpenClaw agents
app.post('/api/generate-case', async (req, res) => {
  const { plaintiff, defendant, caseType, summary } = req.body;
  
  try {
    // This would spawn OpenClaw sub-agents
    // For now, return pre-generated case
    const caseData = {
      id: `CASE-${Date.now()}`,
      type: caseType,
      plaintiff,
      defendant,
      summary,
      generatedAt: new Date().toISOString(),
      status: 'pending_ai_generation'
    };
    
    res.json({
      success: true,
      case: caseData,
      message: 'Case created. AI agents will generate arguments.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI-generated arguments
app.post('/api/generate-arguments', async (req, res) => {
  const { caseData } = req.body;
  
  // Simulate AI generation delay
  setTimeout(() => {
    res.json({
      success: true,
      arguments: {
        plaintiff: "AI-generated plaintiff argument...",
        defendant: "AI-generated defendant argument..."
      }
    });
  }, 2000);
});

// Judge evaluation
app.post('/api/judge-evaluation', async (req, res) => {
  const { caseId, arguments } = req.body;
  
  // Simulate judge evaluation
  const judges = ['PortDev', 'MikeWeb', 'Keone', 'James', 'Harpal', 'Anago'];
  const evaluations = judges.map(judge => ({
    judge,
    winner: Math.random() > 0.5 ? 'plaintiff' : 'defendant',
    reasoning: `${judge} evaluated the evidence...`
  }));
  
  res.json({ evaluations });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Agent Court API running on port ${PORT}`);
});
