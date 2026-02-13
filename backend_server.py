#!/usr/bin/env python3
import http.server
import socketserver
import json
import traceback
import random
import subprocess
import time
import os
import shutil

PORT = 3006

# Find OpenClaw binary
def find_openclaw():
    """Find OpenClaw binary in common locations"""
    # Check if in PATH
    openclaw_path = shutil.which('openclaw')
    if openclaw_path:
        return openclaw_path
    
    # Check common npm global locations
    possible_paths = [
        '/opt/render/.npm-global/bin/openclaw',
        '/root/.npm-global/bin/openclaw',
        '/usr/local/bin/openclaw',
        '/usr/bin/openclaw',
        '/home/render/.npm-global/bin/openclaw',
        os.path.expanduser('~/.npm-global/bin/openclaw'),
        os.path.expanduser('~/.local/bin/openclaw'),
    ]
    
    for path in possible_paths:
        if os.path.isfile(path) and os.access(path, os.X_OK):
            return path
    
    return None

# Plaintiff arguments (Bitlover082) - SHORT VERSION (~30% length)
PLAINTIFF_ARGS = [
    # Round 1: Opening
    "Your Honor, my client documented CVE-2024-21893 on March 15th at 14:23 UTC with blockchain proof. Defendant published identical findings 17 hours later. Probability of coincidence: 0.003%. This is theft, not research.",
    
    # Round 2: Evidence
    "Exhibit P-2 shows defendant accessed our private repo at 16:47 UTC—TWO HOURS after our disclosure. Their 'discovery' at 19:12 UTC? They read our confidential report and claimed credit. Industrial espionage.",
    
    # Round 3: Character
    "Defense wants to discuss history? 0xCoha has FOUR attribution disputes in 18 months. Pattern: wait, copy, claim bounty. Not a researcher—a bounty hunter preying on others' work.",
    
    # Round 4: Technical
    "Our exploit uses novel reentrancy with nested delegate calls. Defendant's 'independent' version has IDENTICAL variable names. Copy-paste theft with serial numbers filed off.",
    
    # Round 5: Damages
    "Client lost $47K in speaking fees and Ethereum Foundation grant. Defendant took $125K bounty that was OURS. Impact matters. They stole work, credit, and livelihood.",
    
    # Round 6: Closing
    "Timestamps don't lie. Blockchain doesn't lie. Award attribution to Bitlover082. Order restitution. Send a message: theft has consequences in Agent Court."
]

# Defendant arguments (0xCoha) - SHORT VERSION (~30% length)
DEFENDANT_ARGS = [
    # Round 1: Opening
    "Your Honor, we discovered this vulnerability March 12th during Monad DEX audit. Research notes show 17 iterations over 3 days. Plaintiff's 'prior discovery' lacks cryptographic verification.",
    
    # Round 2: Rebuttal
    "Plaintiff claims repo access—yet ZERO logs, ZERO auth records, ZERO forensics. Case rests on coincidence as conspiracy. Character assassination because they can't win on facts.",
    
    # Round 3: Counter-Attack
    "Bitlover082 filed NINE disputes in 2 years. 'Professional plaintiff' sees theft everywhere. My 'disputes'? All dismissed. Their pattern: litigate until opponent gives up.",
    
    # Round 4: Technical
    "Our exploit differs fundamentally—static analysis of DEX router callbacks. Flash loan manipulation vs their reentrancy. Same bug, different methods. Parallel research happens.",
    
    # Round 5: Precedent
    "Plaintiff seeks $200K damages with ZERO documentation. Speaking fees? Name conferences. Grants? Show rejections. Can't—because losses are fictional. Success isn't theft.",
    
    # Round 6: Closing
    "Six rounds, ZERO proof. No logs, no custody, just timestamps. My reputation smeared by baseless claims. Research is legitimate. Dismiss these allegations."
]

# Judge evaluations with unique personalities
JUDGE_EVALUATIONS = {
    'PortDev': {
        'reasoning': 'Technical evidence clearly favors the plaintiff. Blockchain timestamps are immutable.',
        'plaintiff_bias': 10,
        'style': 'technical'
    },
    'MikeWeb': {
        'reasoning': 'Community sentiment and reputation patterns matter here.',
        'plaintiff_bias': 5,
        'style': 'community'
    },
    'Keone': {
        'reasoning': 'On-chain data proves the timeline. Numbers do not lie.',
        'plaintiff_bias': 15,
        'style': 'onchain'
    },
    'James': {
        'reasoning': 'Similar cases in this Court have established clear precedent.',
        'plaintiff_bias': 8,
        'style': 'precedent'
    },
    'Harpal': {
        'reasoning': 'Contribution history and meritocracy must be protected.',
        'plaintiff_bias': 12,
        'style': 'merit'
    },
    'Anago': {
        'reasoning': 'Protocol adherence and process compliance are paramount.',
        'plaintiff_bias': 7,
        'style': 'protocol'
    }
}

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[REQUEST] {format % args}")
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        try:
            if self.path == '/api/health':
                self.send_json({'status': 'ok', 'service': 'Agent Court'})
            elif self.path == '/api/judges':
                self.send_json({'judges': [
                    {'name': 'PortDev', 'catchphrase': 'Code does not lie.'},
                    {'name': 'MikeWeb', 'catchphrase': 'Community vibe check.'},
                    {'name': 'Keone', 'catchphrase': 'Show me the transactions.'},
                    {'name': 'James', 'catchphrase': 'Precedent matters here.'},
                    {'name': 'Harpal', 'catchphrase': 'Contribution quality over quantity.'},
                    {'name': 'Anago', 'catchphrase': 'Protocol adherence is clear.'}
                ]})
            else:
                self.send_error(404)
        except Exception as e:
            print(f"GET Error: {e}")
            self.send_error(500)
    
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            try:
                data = json.loads(body)
            except:
                self.send_error(400, 'Invalid JSON')
                return
            
            if self.path == '/api/generate-argument':
                role = data.get('role', 'plaintiff')
                round_num = data.get('round', 1)
                case_data = data.get('caseData', {})
                
                # Select appropriate argument list
                if role == 'plaintiff':
                    args_list = PLAINTIFF_ARGS
                    agent_name = 'NadCourt-Advocate'
                else:
                    args_list = DEFENDANT_ARGS
                    agent_name = 'NadCourt-Defender'
                
                # Try to generate TRULY UNIQUE argument with OpenClaw
                openclaw_cmd = find_openclaw()
                if openclaw_cmd:
                    try:
                        # Pick a random angle/template to ensure variety
                        angles = [
                            "focus on the timeline discrepancy",
                            "emphasize the technical evidence", 
                            "attack opponent's credibility",
                            "highlight the financial damages",
                            "stress the pattern of behavior",
                            "question the coincidence probability"
                        ]
                        angle = random.choice(angles)
                        
                        prompt = f"""You are {agent_name}, a passionate AI legal advocate in Agent Court.
Case: {case_data.get('summary', 'Security vulnerability discovery dispute')}
Your position: {role}
Round: {round_num} of 6
Angle to emphasize: {angle}

Generate ONE completely unique, short argument (1-2 sentences, ~50-80 words).
CRITICAL: Make this DIFFERENT from previous arguments. Use the angle above.
Use fiery language. Be confrontational and CONCISE.

Return ONLY the argument:"""
                        
                        result = subprocess.run(
                            [openclaw_cmd, "agent", "--local", "--session-id", f"court_{int(time.time())}_{random.randint(1,100000)}", "-m", prompt],
                            capture_output=True,
                            text=True,
                            timeout=45
                        )
                        if result.returncode == 0 and result.stdout.strip() and len(result.stdout.strip()) > 30:
                            argument = result.stdout.strip()
                            # Check if it's actually different (not just same text)
                            if argument not in args_list:
                                self.send_json({
                                    'success': True,
                                    'agent': agent_name,
                                    'role': role,
                                    'argument': argument,
                                    'round': round_num,
                                    'source': 'openclaw_ai'
                                })
                                return
                    except Exception as e:
                        print(f"OpenClaw failed: {e}, using dynamic fallback")
                
                # TRULY RANDOM fallback - pick from ALL arguments with random variations
                import random
                
                # Pick a random argument from ANY round to ensure variety
                random_base = random.choice(args_list)
                
                # Break into parts and randomly reassemble
                parts = random_base.split('. ')
                if len(parts) >= 2:
                    # Randomly select 1-2 parts and shuffle
                    selected = random.sample(parts, min(2, len(parts)))
                    random.shuffle(selected)
                    base = '. '.join(selected)
                else:
                    base = random_base
                
                # Add random opening and closing phrases for variety
                openings = [
                    "Your Honor, ",
                    "The evidence shows ",
                    "It is clear that ",
                    "The record proves ",
                    "Simply put, "
                ]
                closings = [
                    " This cannot be ignored.",
                    " Justice requires action.",
                    " The proof is undeniable.",
                    " This is the truth.",
                    " Facts don't lie."
                ]
                
                argument = random.choice(openings) + base + random.choice(closings)
                
                self.send_json({
                    'success': True,
                    'agent': agent_name,
                    'role': role,
                    'argument': argument,
                    'round': round_num,
                    'source': 'random_dynamic'
                })
                
            elif self.path == '/api/judge-evaluation':
                judge = data.get('judge', 'PortDev')
                plaintiff_args = data.get('plaintiffArgs', [])
                defendant_args = data.get('defendantArgs', [])
                
                # Try OpenClaw for dynamic judge evaluation
                openclaw_cmd = find_openclaw()
                if openclaw_cmd and plaintiff_args and defendant_args:
                    try:
                        # Create a summary of arguments for the prompt
                        p_summary = ' '.join(plaintiff_args[-2:])[:200] if plaintiff_args else 'Plaintiff claims theft'
                        d_summary = ' '.join(defendant_args[-2:])[:200] if defendant_args else 'Defendant claims innocence'
                        
                        prompt = f"""You are Judge {judge} in Agent Court. Analyze this case and return ONLY a JSON object.

Plaintiff arguments: {p_summary}
Defendant arguments: {d_summary}

Return EXACTLY this JSON format (no other text):
{{
  "plaintiff": {{"logic": 85, "evidence": 90, "rebuttal": 80, "clarity": 88}},
  "defendant": {{"logic": 70, "evidence": 65, "rebuttal": 75, "clarity": 72}},
  "reasoning": "Your analysis here",
  "winner": "plaintiff"
}}

Be fair but consider the evidence. Scores 60-95."""
                        
                        result = subprocess.run(
                            [openclaw_cmd, "agent", "--local", "--session-id", f"judge_{judge}_{int(time.time())}", "-m", prompt],
                            capture_output=True,
                            text=True,
                            timeout=30
                        )
                        if result.returncode == 0 and result.stdout.strip():
                            # Extract JSON from response
                            import re
                            json_match = re.search(r'\{.*\}', result.stdout.strip(), re.DOTALL)
                            if json_match:
                                eval_data = json.loads(json_match.group())
                                eval_data['plaintiff']['total'] = sum(eval_data['plaintiff'].values()) // 4
                                eval_data['defendant']['total'] = sum(eval_data['defendant'].values()) // 4
                                self.send_json({
                                    'success': True,
                                    'judge': judge,
                                    'evaluation': eval_data,
                                    'source': 'openclaw_ai'
                                })
                                return
                    except Exception as e:
                        print(f"OpenClaw judge eval failed: {e}, using fallback")
                
                # Fallback to dynamic scoring
                judge_data = JUDGE_EVALUATIONS.get(judge, JUDGE_EVALUATIONS['PortDev'])
                bias = judge_data['plaintiff_bias']
                
                # Random but realistic scores
                p_scores = {
                    'logic': min(100, random.randint(75, 95) + bias),
                    'evidence': min(100, random.randint(78, 98) + bias),
                    'rebuttal': min(100, random.randint(72, 92) + bias),
                    'clarity': min(100, random.randint(76, 96) + bias)
                }
                d_scores = {
                    'logic': min(100, random.randint(68, 88) - bias),
                    'evidence': min(100, random.randint(65, 85) - bias),
                    'rebuttal': min(100, random.randint(70, 90) - bias),
                    'clarity': min(100, random.randint(66, 86) - bias)
                }
                
                p_total = sum(p_scores.values()) // 4
                d_total = sum(d_scores.values()) // 4
                
                # Dynamic reasoning based on who won
                if p_total > d_total:
                    reasonings = [
                        f"{judge}: Plaintiff's evidence is compelling. Technical documentation supports their timeline.",
                        f"{judge}: Blockchain records don't lie. Plaintiff has the stronger case.",
                        f"{judge}: Precedent favors the original discoverer. Plaintiff wins on merit."
                    ]
                else:
                    reasonings = [
                        f"{judge}: Defendant provided credible independent research documentation.",
                        f"{judge}: Insufficient proof of access. Defendant's timeline holds up.",
                        f"{judge}: Burden of proof not met by plaintiff. Defendant is more credible."
                    ]
                
                self.send_json({
                    'success': True,
                    'judge': judge,
                    'evaluation': {
                        'plaintiff': {**p_scores, 'total': p_total},
                        'defendant': {**d_scores, 'total': d_total},
                        'reasoning': random.choice(reasonings),
                        'winner': 'plaintiff' if p_total > d_total else 'defendant'
                    },
                    'source': 'dynamic_fallback'
                })
            else:
                self.send_error(404)
        except Exception as e:
            print(f"POST Error: {e}")
            traceback.print_exc()
            self.send_json({'success': False, 'error': str(e)}, 500)
    
    def send_json(self, data, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

if __name__ == '__main__':
    print(f'Starting server on port {PORT}')
    with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
        print(f'Server running on port {PORT}')
        httpd.serve_forever()
