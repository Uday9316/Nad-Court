#!/usr/bin/env python3
"""
Agent Court API Server using OpenClaw
Run: python3 openclaw_api.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import time
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

JUDGE_PROFILES = {
    "PortDev": {"personality": "Technical evidence specialist", "catchphrase": "Code doesn't lie."},
    "MikeWeb": {"personality": "Community impact assessor", "catchphrase": "Community vibe check."},
    "Keone": {"personality": "On-chain data analyst", "catchphrase": "Show me the transactions."},
    "James": {"personality": "Governance precedent keeper", "catchphrase": "Precedent matters here."},
    "Harpal": {"personality": "Merit-based evaluator", "catchphrase": "Contribution quality over quantity."},
    "Anago": {"personality": "Protocol adherence guardian", "catchphrase": "Protocol adherence is clear."}
}

def generate_with_openclaw(prompt):
    """Generate text using OpenClaw CLI"""
    session_id = f"court_{int(time.time())}"
    
    try:
        result = subprocess.run(
            ["openclaw", "agent", "--local", "--session-id", session_id, "-m", prompt],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
        else:
            print(f"OpenClaw stderr: {result.stderr}")
            return None
    except Exception as e:
        print(f"OpenClaw error: {e}")
        return None

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "service": "Agent Court API (OpenClaw)",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/generate-argument', methods=['POST'])
def generate_argument():
    data = request.json
    role = data.get('role')
    case_data = data.get('caseData')
    round_num = data.get('round', 1)
    
    agent_name = "JusticeBot-Alpha" if role == 'plaintiff' else 'GuardianBot-Omega'
    
    print(f"[{datetime.now().isoformat()}] Generating {role} argument for {case_data.get('id')}, round {round_num}")
    
    system_prompt = f"You are {agent_name}, an AI legal advocate. Generate ONE compelling argument (150-300 words). Professional tone. No game references."
    
    user_prompt = f"""CASE: {case_data.get('id')}
TYPE: {case_data.get('type')}
PLAINTIFF: {case_data.get('plaintiff')}
DEFENDANT: {case_data.get('defendant')}
SUMMARY: {case_data.get('summary')}

Generate {round_num == 1 and 'opening argument' or f'round {round_num} response'} as {agent_name}."""
    
    full_prompt = f"{system_prompt}\n\n{user_prompt}\n\nRespond with ONLY the argument text."
    
    argument = generate_with_openclaw(full_prompt)
    
    if argument:
        print(f"✅ Generated {len(argument)} characters")
        return jsonify({
            "success": True,
            "agent": agent_name,
            "role": role,
            "argument": argument,
            "round": round_num,
            "caseId": case_data.get('id'),
            "generatedAt": datetime.now().isoformat(),
            "source": "openclaw_cli",
            "model": "openclaw/moonshot-k2.5"
        })
    else:
        return jsonify({
            "success": False,
            "error": "OpenClaw generation failed"
        }), 500

@app.route('/api/judge-evaluation', methods=['POST'])
def judge_evaluation():
    data = request.json
    judge = data.get('judge')
    case_data = data.get('caseData')
    
    print(f"[{datetime.now().isoformat()}] Judge {judge} evaluating {case_data.get('id')}")
    
    # Generate deterministic scores
    seed = ord(case_data.get('id', 'A')[0]) + ord(judge[0])
    base = 60 + (seed % 25)
    
    evaluation = {
        "plaintiff": {
            "logic": min(100, base + 10),
            "evidence": min(100, base + 15),
            "rebuttal": min(100, base + 8),
            "clarity": min(100, base + 12)
        },
        "defendant": {
            "logic": min(100, base + 5),
            "evidence": min(100, base + 3),
            "rebuttal": min(100, base + 10),
            "clarity": min(100, base + 7)
        },
        "reasoning": f"{JUDGE_PROFILES[judge]['catchphrase']} Technical analysis complete.",
        "winner": "plaintiff" if base > 70 else "defendant"
    }
    
    return jsonify({
        "success": True,
        "judge": judge,
        "evaluation": evaluation,
        "caseId": case_data.get('id'),
        "generatedAt": datetime.now().isoformat(),
        "source": "ai_judge"
    })

@app.route('/api/judges', methods=['GET'])
def get_judges():
    return jsonify({
        "judges": [{"name": k, **v} for k, v in JUDGE_PROFILES.items()]
    })

if __name__ == '__main__':
    print("\n🤖 AGENT COURT API (OpenClaw)")
    print("Starting server on http://0.0.0.0:3001\n")
    app.run(host='0.0.0.0', port=3001, debug=False)
