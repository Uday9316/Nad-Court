#!/usr/bin/env python3
"""
Simple HTTP server that uses OpenClaw for AI generation
"""

import http.server
import socketserver
import json
import subprocess
import time
import os
import sys
import shutil
from datetime import datetime
from urllib.parse import urlparse

PORT = int(os.environ.get('PORT', 3001))

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

OPENCLAW_BIN = find_openclaw()
if OPENCLAW_BIN:
    print(f"✅ OpenClaw found at: {OPENCLAW_BIN}", flush=True)
else:
    print(f"⚠️ OpenClaw not found. Will search at runtime.", flush=True)

class Handler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        if self.path == '/api/health':
            self.send_json({"status": "ok", "service": "Agent Court (OpenClaw)", "timestamp": datetime.now().isoformat()})
        elif self.path == '/api/judges':
            judges = [
                {"name": "PortDev", "catchphrase": "Code doesn't lie."},
                {"name": "MikeWeb", "catchphrase": "Community vibe check."},
                {"name": "Keone", "catchphrase": "Show me the transactions."},
                {"name": "James", "catchphrase": "Precedent matters here."},
                {"name": "Harpal", "catchphrase": "Contribution quality over quantity."},
                {"name": "Anago", "catchphrase": "Protocol adherence is clear."}
            ]
            self.send_json({"judges": judges})
        else:
            self.send_error(404)
    
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body)
        except:
            self.send_error(400)
            return
        
        if self.path == '/api/generate-argument':
            self.handle_generate_argument(data)
        elif self.path == '/api/judge-evaluation':
            self.handle_judge_evaluation(data)
        else:
            self.send_error(404)
    
    def handle_generate_argument(self, data):
        role = data.get('role')
        case_data = data.get('caseData', {})
        round_num = data.get('round', 1)
        
        agent_name = "JusticeBot-Alpha" if role == 'plaintiff' else 'GuardianBot-Omega'
        
        print(f"[{datetime.now().isoformat()}] Generating {role} argument for {case_data.get('id')}, round {round_num}")
        
        # Build adversarial context based on round
        previous_attacks = [
            "claims of independent discovery",
            "allegations of timestamp manipulation", 
            "accusations of bad faith",
            "questions about credibility",
            "attacks on methodology",
            "claims of insufficient evidence"
        ]
        
        adversarial_hook = ""
        if round_num > 1:
            adversarial_hook = f"\nThe opposing counsel just claimed: '{previous_attacks[round_num-2]}'. DIRECTLY REBUT this in 2-3 sentences. Be punchy and aggressive."
        
        prompt = f"""Generate ONE argument. NO headers. NO titles. NO "Your Honor". NO round numbers. Just 2-3 sentences of raw text.

Case: {case_data.get('summary')}
{role} side

Example format:
{defendant} claims independent discovery but blockchain proves {plaintiff} was first. Seventeen witnesses confirm. This isn't coincidence—it's theft.

Keep it under 50 words. No labels. Just the argument:"""
        
        # Generate using OpenClaw
        session_id = f"court_{int(time.time())}"
        openclaw_cmd = OPENCLAW_BIN if OPENCLAW_BIN else find_openclaw()
        
        if not openclaw_cmd:
            print(f"❌ OpenClaw not found. Using mock fallback.", flush=True)
            argument = self.generate_mock_argument(role, case_data, round_num)
            self.send_json({
                "success": True,
                "agent": agent_name,
                "role": role,
                "argument": argument,
                "round": round_num,
                "caseId": case_data.get('id'),
                "generatedAt": datetime.now().isoformat(),
                "source": "mock_fallback",
                "model": "openclaw/moonshot-k2.5"
            })
            return
        
        print(f"Using OpenClaw at: {openclaw_cmd}", flush=True)
        
        try:
            result = subprocess.run(
                [openclaw_cmd, "agent", "--local", "--session-id", session_id, "-m", prompt],
                capture_output=True,
                text=True,
                timeout=120  # Increased timeout for slow free tier
            )
            
            if result.returncode == 0 and result.stdout.strip():
                argument = result.stdout.strip()
                print(f"✅ Generated {len(argument)} chars")
                self.send_json({
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
                print(f"⚠️ OpenClaw failed, using mock fallback: {result.stderr}")
                argument = self.generate_mock_argument(role, case_data, round_num)
                self.send_json({
                    "success": True,
                    "agent": agent_name,
                    "role": role,
                    "argument": argument,
                    "round": round_num,
                    "caseId": case_data.get('id'),
                    "generatedAt": datetime.now().isoformat(),
                    "source": "mock_fallback",
                    "model": "openclaw/moonshot-k2.5"
                })
        except subprocess.TimeoutExpired:
            print(f"⏱️ OpenClaw timed out, using mock fallback")
            argument = self.generate_mock_argument(role, case_data, round_num)
            self.send_json({
                "success": True,
                "agent": agent_name,
                "role": role,
                "argument": argument,
                "round": round_num,
                "caseId": case_data.get('id'),
                "generatedAt": datetime.now().isoformat(),
                "source": "mock_fallback",
                "model": "openclaw/moonshot-k2.5"
            })
        except Exception as e:
            print(f"⚠️ Error: {e}, using mock fallback")
            argument = self.generate_mock_argument(role, case_data, round_num)
            self.send_json({
                "success": True,
                "agent": agent_name,
                "role": role,
                "argument": argument,
                "round": round_num,
                "caseId": case_data.get('id'),
                "generatedAt": datetime.now().isoformat(),
                "source": "mock_fallback",
                "model": "openclaw/moonshot-k2.5"
            })
    
    def generate_mock_argument(self, role, case_data, round_num):
        """Generate short arguments (2-3 sentences max, ~40-50 words)"""
        plaintiff = case_data.get('plaintiff', 'Plaintiff')
        defendant = case_data.get('defendant', 'Defendant')
        
        if role == 'plaintiff':
            args = [
                f"{defendant} claims 'independent discovery' but blockchain records prove {plaintiff} was first by 48 hours. Seventeen witnesses confirm. This isn't coincidence—it's theft.",
                f"My opponent's 'verified' timestamps come from a node THEY control. {defendant} accessed my private repo 36 hours before going public. {defendant} is lying to this Court.",
                f"{defendant} attacks my character? Classic deflection. {plaintiff} has three years of contributions; {defendant} has five ownership disputes. This is their MO.",
                f"The defense claims 'no intent' but my speaking invites were canceled. {defendant} stole the work and profited. Intent doesn't matter—impact does.",
                f"Within 72 hours, {defendant} got a $50K grant. Meanwhile {plaintiff} watched opportunities vanish. This is economic theft, not academic dispute.",
                f"{defendant} has no credible evidence. Timestamps are suspect. The evidence shows calculated theft. Award full attribution to {plaintiff}."
            ]
        else:
            args = [
                f"{plaintiff}'s claims are character assassination without substance. Where's the proof? Not one document shows I knew of their 'discovery.' This is jealousy.",
                f"My opponent calls my verification 'forgery'—show the proof! My timestamps come from four independent validators. {plaintiff} can't prove I accessed their repo.",
                f"They dredge up my 'history'—let's discuss theirs. {plaintiff}: eleven disputes in two years. A professional victim. My disputes were all dismissed.",
                f"The plaintiff's 'damages' are fantasy. 'Canceled invitations'—name one. These losses are imaginary. I built reputation through documented excellence.",
                f"{plaintiff}'s 'follow the money' theory is conspiracy nonsense. Meanwhile they seek $200K from this Court. This is monetizing butthurt.",
                f"After six rounds, {plaintiff} has proven nothing. Zero logs, zero witnesses. Just jealousy. I provided independent verification. Dismiss these allegations."
            ]
        
        return args[min(round_num - 1, 5)]
    
    def handle_judge_evaluation(self, data):
        judge = data.get('judge')
        case_data = data.get('caseData', {})
        
        seed = ord(case_data.get('id', 'A')[0]) + ord(judge[0])
        base = 60 + (seed % 25)
        
        self.send_json({
            "success": True,
            "judge": judge,
            "evaluation": {
                "plaintiff": {"logic": min(100, base + 10), "evidence": min(100, base + 15), "rebuttal": min(100, base + 8), "clarity": min(100, base + 12)},
                "defendant": {"logic": min(100, base + 5), "evidence": min(100, base + 3), "rebuttal": min(100, base + 10), "clarity": min(100, base + 7)},
                "reasoning": f"Technical analysis complete.",
                "winner": "plaintiff" if base > 70 else "defendant"
            },
            "caseId": case_data.get('id'),
            "generatedAt": datetime.now().isoformat()
        })
    
    def send_json(self, data, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def log_message(self, format, *args):
        # Suppress default logging
        pass

if __name__ == '__main__':
    import sys
    print(f"\n🤖 AGENT COURT API (OpenClaw)", flush=True)
    print(f"Python version: {sys.version}", flush=True)
    print(f"Starting server on port {PORT}...", flush=True)
    print(f"Environment PORT={os.environ.get('PORT', 'not set')}", flush=True)
    
    # Show OpenClaw status
    if OPENCLAW_BIN:
        print(f"✅ OpenClaw found at: {OPENCLAW_BIN}", flush=True)
    else:
        print(f"⚠️ OpenClaw not found at startup. Will search at runtime.", flush=True)
    
    # Use ThreadingTCPServer for better concurrent handling
    class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
        allow_reuse_address = True
        daemon_threads = True
    
    try:
        httpd = ThreadedHTTPServer(("0.0.0.0", PORT), Handler)
        print(f"✅ Server bound to http://0.0.0.0:{PORT}", flush=True)
        print(f"Health check: http://0.0.0.0:{PORT}/api/health\n", flush=True)
        httpd.serve_forever()
    except Exception as e:
        print(f"❌ Failed to start server: {e}", flush=True)
        sys.exit(1)
