// frontend/src/services/aiCourt.js
// Connects frontend to Agent Court Backend

const API_URL = 'https://3df1-51-20-69-171.ngrok-free.app';

// Generate argument from OpenClaw AI agent
export const generateArgument = async (role, caseData, round = 1) => {
  const response = await fetch(`${API_URL}/api/generate-argument`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, caseData, round })
  });
  return response.json();
};

// Generate judge evaluation
export const getJudgeEvaluation = async (judge, caseData, plaintiffArgs, defendantArgs) => {
  const response = await fetch(`${API_URL}/api/judge-evaluation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ judge, caseData, plaintiffArgs, defendantArgs })
  });
  return response.json();
};

// Run full case with all AI agents
export const runFullCase = async (caseData) => {
  const response = await fetch(`${API_URL}/api/run-full-case`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseData })
  });
  return response.json();
};

// Get all judges info
export const getJudges = async () => {
  const response = await fetch(`${API_URL}/api/judges`);
  return response.json();
};

// Health check
export const checkHealth = async () => {
  const response = await fetch(`${API_URL}/api/health`);
  return response.json();
};
