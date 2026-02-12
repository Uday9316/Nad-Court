"""
Agent Court Backend API
Connects to OpenClaw to spawn AI agents for arguments and judgments
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# OpenClaw configuration
OPENCLAW_BIN = os.getenv("OPENCLAW_BIN", "openclaw")

def spawn_openclaw_agent(prompt, label):
    """Spawn OpenClaw sub-agent to generate AI content"""
    try:
        # This calls openclaw CLI to spawn a sub-agent
        result = subprocess.run(
            [OPENCLAW_BIN, "spawn", "--label", label, "--task", prompt],
            capture_output=True,
            text=True,
            timeout=120
        )
        return {"success": True, "output": result.stdout}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "Agent Court AI Backend"})

@app.route('/api/generate-argument', methods=['POST'])
def generate_argument():
    """Generate legal argument using OpenClaw AI agent"""
    data = request.json
    role = data.get('role')  # 'plaintiff' or 'defendant'
    case_data = data.get('caseData')
    
    # Build prompt for AI agent
    if role == 'plaintiff':
        agent_name = "JusticeBot-Alpha"
        system_prompt = "You are JusticeBot-Alpha, AI legal advocate for the plaintiff..."
    else:
        agent_name = "GuardianBot-Omega"
        system_prompt = "You are GuardianBot-Omega, AI defense advocate..."
    
    user_prompt = f"""
    CASE: {case_data.get('id')}
    TYPE: {case_data.get('type')}
    SUMMARY: {case_data.get('summary')}
    
    Generate ONE compelling {'opening argument' if role == 'plaintiff' else 'defense rebuttal'} 
    (300-500 words) with professional legal tone.
    """
    
    # Spawn OpenClaw agent
    full_prompt = f"{system_prompt}\n\n{user_prompt}\n\nReturn ONLY the argument text."
    result = spawn_openclaw_agent(full_prompt, f"{role}-argument-{case_data.get('id')}")
    
    if result['success']:
        return jsonify({
            "success": True,
            "agent": agent_name,
            "argument": result['output'],
            "generated_at": datetime.now().isoformat()
        })
    else:
        return jsonify({"success": False, "error": result['error']}), 500

@app.route('/api/judge-evaluation', methods=['POST'])
def judge_evaluation():
    """Generate judge evaluation using OpenClaw AI agent"""
    data = request.json
    judge_name = data.get('judge')  # 'PortDev', 'MikeWeb', etc.
    plaintiff_args = data.get('plaintiffArgs', [])
    defendant_args = data.get('defendantArgs', [])
    
    # Judge profiles
    judge_profiles = {
        "PortDev": "Technical evidence specialist. Focus on code, timestamps, data integrity.",
        "MikeWeb": "Community impact assessor. Focus on reputation, contributions, sentiment.",
        "Keone": "On-chain data analyst. Focus on wallet history, transactions, proof.",
        "James": "Governance precedent keeper. Focus on rules, historical cases.",
        "Harpal": "Merit-based evaluator. Focus on quality, engagement, impact.",
        "Anago": "Protocol adherence guardian. Focus on rule violations, compliance."
    }
    
    profile = judge_profiles.get(judge_name, judge_profiles["PortDev"])
    
    prompt = f"""You are {judge_name}, a community judge in Agent Court.
{profile}

PLAINTIFF ARGUMENTS:
{chr(10).join(plaintiff_args)}

DEFENDANT ARGUMENTS:
{chr(10).join(defendant_args)}

Evaluate BOTH sides on 4 criteria (0-100): Logic, Evidence, Rebuttal, Clarity.
Return ONLY JSON with this structure:
{{
  "plaintiff": {{"logic": 75, "evidence": 80, "rebuttal": 70, "clarity": 85}},
  "defendant": {{"logic": 70, "evidence": 65, "rebuttal": 75, "clarity": 80}},
  "reasoning": "Your evaluation in {judge_name}'s voice...",
  "winner": "plaintiff" or "defendant"
}}"""
    
    result = spawn_openclaw_agent(prompt, f"judge-{judge_name}")
    
    if result['success']:
        try:
            evaluation = json.loads(result['output'])
            return jsonify({
                "success": True,
                "judge": judge_name,
                "evaluation": evaluation,
                "generated_at": datetime.now().isoformat()
            })
        except:
            return jsonify({"success": False, "error": "Failed to parse judge output"}), 500
    else:
        return jsonify({"success": False, "error": result['error']}), 500

@app.route('/api/run-full-case', methods=['POST'])
def run_full_case():
    """Run complete case: generate arguments + all 6 judge evaluations"""
    data = request.json
    case_data = data.get('caseData')
    
    # This would:
    # 1. Spawn JusticeBot-Alpha for plaintiff argument
    # 2. Spawn GuardianBot-Omega for defendant argument  
    # 3. Spawn 6 judges for evaluations
    # 4. Calculate verdict
    
    return jsonify({
        "success": True,
        "case": case_data,
        "status": "pending_implementation",
        "message": "This endpoint would spawn all OpenClaw agents in sequence"
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
