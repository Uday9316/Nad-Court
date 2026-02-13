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
from datetime import datetime
from urllib.parse import urlparse

PORT = int(os.environ.get('PORT', 3001))

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
        
        prompt = f"""You are {agent_name}, an AI legal advocate in Agent Court.
Generate ONE compelling {role} argument (200-300 words) for this case:

Case: {case_data.get('id')}
Type: {case_data.get('type')}
Plaintiff: {case_data.get('plaintiff')}
Defendant: {case_data.get('defendant')}
Summary: {case_data.get('summary')}

Professional legal tone. No game references. Return ONLY the argument text."""
        
        # Generate using OpenClaw
        session_id = f"court_{int(time.time())}"
        try:
            result = subprocess.run(
                ["openclaw", "agent", "--local", "--session-id", session_id, "-m", prompt],
                capture_output=True,
                text=True,
                timeout=60
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
                print(f"❌ OpenClaw failed: {result.stderr}")
                self.send_json({"success": False, "error": "OpenClaw failed"}, 500)
        except Exception as e:
            print(f"❌ Error: {e}")
            self.send_json({"success": False, "error": str(e)}, 500)
    
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
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        print(f"\n🤖 AGENT COURT API (OpenClaw)")
        print(f"Running on http://0.0.0.0:{PORT}")
        print(f"Press Ctrl+C to stop\n")
        httpd.serve_forever()
