// frontend/src/services/aiCourt.js
// Connects frontend to AI Court backend

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const generateCase = async (caseData) => {
  const response = await fetch(`${API_URL}/api/generate-case`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseData)
  });
  return response.json();
};

export const generateArguments = async (caseData) => {
  const response = await fetch(`${API_URL}/api/generate-arguments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseData })
  });
  return response.json();
};

export const getJudgeEvaluations = async (caseId, args) => {
  const response = await fetch(`${API_URL}/api/judge-evaluation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseId, arguments: args })
  });
  return response.json();
};
