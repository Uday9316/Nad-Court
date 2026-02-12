"""
Agent Court Backend - Python Flask
Calls OpenAI/Moonshot APIs directly (no OpenClaw CLI needed)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# API Keys from environment
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
MOONSHOT_API_KEY = os.getenv('MOONSHOT_API_KEY')

# Default to Moonshot since user has Kimi key
AI_PROVIDER = os.getenv('AI_PROVIDER', 'moonshot')

# Judge profiles
JUDGE_PROFILES = {
    "PortDev": {
        "personality": "Technical evidence specialist. Values code, timestamps, and provable data.",
        "focus": ["technical accuracy", "code quality", "timestamp verification"],
        "voice": "analytical, precise, technical",
        "catchphrase": "Code doesn't lie."
    },
    "MikeWeb": {
        "personality": "Community impact assessor. Values reputation and long-term contributions.",
        "focus": ["community reputation", "contribution history", "engagement quality"],
        "voice": "warm, community-focused, balanced",
        "catchphrase": "Community vibe check."
    },
    "Keone": {
        "personality": "On-chain data analyst. Focuses on provable blockchain facts.",
        "focus": ["wallet history", "transaction patterns", "on-chain proof"],
        "voice": "data-driven, factual, analytical",
        "catchphrase": "Show me the transactions."
    },
    "James": {
        "personality": "Governance precedent keeper. Values rules and historical consistency.",
        "focus": ["rule alignment", "historical precedents", "moderation logs"],
        "voice": "formal, precedent-focused, structured",
        "catchphrase": "Precedent matters here."
    },
    "Harpal": {
        "personality": "Merit-based evaluator. Values quality contributions over tenure.",
        "focus": ["contribution quality", "engagement value", "merit"],
        "voice": "direct, merit-focused, results-oriented",
        "catchphrase": "Contribution quality over quantity."
    },
    "Anago": {
        "personality": "Protocol adherence guardian. Focuses on rule compliance.",
        "focus": ["rule violations", "protocol compliance", "documentation"],
        "voice": "formal, rule-focused, protocol-minded",
        "catchphrase": "Protocol adherence is clear."
    }
}

def call_moonshot_api(system_prompt, user_prompt, max_tokens=800):
    """Call Moonshot API directly"""
    if not MOONSHOT_API_KEY:
        raise Exception("MOONSHOT_API_KEY not set")
    
    headers = {
        "Authorization": f"Bearer {MOONSHOT_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "kimi-k2.5",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7,
        "max_tokens": max_tokens
    }
    
    response = requests.post(
        "https://api.moonshot.cn/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=60
    )
    
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        raise Exception(f"API Error: {response.status_code} - {response.text}")

def call_openai_api(system_prompt, user_prompt, max_tokens=800):
    """Call OpenAI API directly"""
    if not OPENAI_API_KEY:
        raise Exception("OPENAI_API_KEY not set")
    
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "gpt-4",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7,
        "max_tokens": max_tokens
    }
    
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=60
    )
    
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        raise Exception(f"API Error: {response.status_code} - {response.text}")

def generate_ai_content(system_prompt, user_prompt, max_tokens=800):
    """Generate content using available AI provider"""
    if AI_PROVIDER == 'moonshot' and MOONSHOT_API_KEY:
        return call_moonshot_api(system_prompt, user_prompt, max_tokens)
    elif AI_PROVIDER == 'openai' and OPENAI_API_KEY:
        return call_openai_api(system_prompt, user_prompt, max_tokens)
    else:
        raise Exception(f"No AI provider available. Set OPENAI_API_KEY or MOONSHOT_API_KEY")

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "service": "Agent Court Backend (Python)",
        "ai_provider": AI_PROVIDER,
        "moonshot_configured": bool(MOONSHOT_API_KEY),
        "openai_configured": bool(OPENAI_API_KEY),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/generate-argument', methods=['POST'])
def generate_argument():
    """Generate legal argument using AI API"""
    data = request.json
    role = data.get('role')
    case_data = data.get('caseData')
    round_num = data.get('round', 1)
    
    agent_name = "JusticeBot-Alpha" if role == 'plaintiff' else 'GuardianBot-Omega'
    
    system_prompt = f"""You are {agent_name}, an AI {'legal advocate for plaintiffs' if role == 'plaintiff' else 'defense advocate for defendants'} in Agent Court.

Your mission: Present compelling, fact-based arguments that demonstrate why your client's position is correct.

Rules:
- Present ONE cohesive argument (300-500 words)
- Base arguments ONLY on provided case facts
- Cite specific evidence when available
- Use persuasive but professional legal tone
- Never reference "health bars", "damage", or game mechanics
- Focus on logic, evidence, and precedent

You are fighting for justice in a decentralized court. Make your case count."""

    user_prompt = f"""CASE: {case_data.get('id')}
TYPE: {case_data.get('type')}
PLAINTIFF: {case_data.get('plaintiff')}
DEFENDANT: {case_data.get('defendant')}
SUMMARY: {case_data.get('summary')}
FACTS: {case_data.get('facts', 'Case facts to be determined')}
EVIDENCE: {', '.join(case_data.get('evidence', []))}

Generate your {'opening argument' if round_num == 1 else f'response for round {round_num}'} as {agent_name}. Make it compelling and fact-based.

Return ONLY the argument text, no additional commentary."""

    try:
        argument = generate_ai_content(system_prompt, user_prompt, max_tokens=800)
        
        return jsonify({
            "success": True,
            "agent": agent_name,
            "role": role,
            "argument": argument.strip(),
            "round": round_num,
            "caseId": case_data.get('id'),
            "generatedAt": datetime.now().isoformat(),
            "model": f"{AI_PROVIDER}/kimi-k2.5" if AI_PROVIDER == 'moonshot' else "openai/gpt-4",
            "source": "live_ai"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "AI generation failed. Check API keys."
        }), 500

@app.route('/api/judge-evaluation', methods=['POST'])
def judge_evaluation():
    """Generate judge evaluation using AI API"""
    data = request.json
    judge_name = data.get('judge')
    case_data = data.get('caseData')
    plaintiff_args = data.get('plaintiffArgs', [])
    defendant_args = data.get('defendantArgs', [])
    
    profile = JUDGE_PROFILES.get(judge_name, JUDGE_PROFILES['PortDev'])
    
    system_prompt = f"""You are {judge_name}, a community judge in Agent Court.

{profile['personality']}

Your evaluation focus: {', '.join(profile['focus'])}
Your catchphrase: "{profile['catchphrase']}"
Your voice: {profile['voice']}

Evaluate BOTH sides on 4 criteria (0-100):
1. LOGIC - Soundness of reasoning
2. EVIDENCE - Quality and relevance of proof
3. REBUTTAL - Effectiveness at addressing opponent's points
4. CLARITY - Persuasiveness and communication quality

Provide your reasoning in your unique voice. Use your catchphrase naturally.

Return ONLY valid JSON with this structure:
{{
  "plaintiff": {{"logic": 75, "evidence": 80, "rebuttal": 70, "clarity": 85}},
  "defendant": {{"logic": 70, "evidence": 65, "rebuttal": 75, "clarity": 80}},
  "reasoning": "Your detailed reasoning in {judge_name}'s voice...",
  "winner": "plaintiff" or "defendant"
}}"""

    user_prompt = f"""CASE: {case_data.get('id')}
TYPE: {case_data.get('type')}

PLAINTIFF ARGUMENTS:
{chr(10).join([f'{i+1}. {arg[:500]}...' for i, arg in enumerate(plaintiff_args)])}

DEFENDANT ARGUMENTS:
{chr(10).join([f'{i+1}. {arg[:500]}...' for i, arg in enumerate(defendant_args)])}

As {judge_name}, evaluate both sides and return JSON with scores and reasoning."""

    try:
        content = generate_ai_content(system_prompt, user_prompt, max_tokens=1000)
        
        # Extract JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        
        evaluation = json.loads(content.strip())
        
        return jsonify({
            "success": True,
            "judge": judge_name,
            "evaluation": evaluation,
            "caseId": case_data.get('id'),
            "generatedAt": datetime.now().isoformat(),
            "model": f"{AI_PROVIDER}/kimi-k2.5" if AI_PROVIDER == 'moonshot' else "openai/gpt-4",
            "source": "live_ai"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "AI evaluation failed. Check API keys."
        }), 500

@app.route('/api/judges', methods=['GET'])
def get_judges():
    return jsonify({
        "judges": [{"name": k, **v} for k, v in JUDGE_PROFILES.items()],
        "ai_provider": AI_PROVIDER
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=True)
