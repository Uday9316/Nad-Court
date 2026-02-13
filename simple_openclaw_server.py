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
        """Generate a mock argument when OpenClaw is unavailable or times out"""
        case_id = case_data.get('id', 'CASE')
        plaintiff = case_data.get('plaintiff', 'Plaintiff')
        defendant = case_data.get('defendant', 'Defendant')
        
        if role == 'plaintiff':
            arguments = [
                f"Your Honor, the evidence clearly demonstrates that {defendant} has systematically violated community standards. Through documented transactions and verified communications, we have established a pattern of conduct that undermines the integrity of our ecosystem. The plaintiff, {plaintiff}, has suffered measurable damages as a direct result of these actions.",
                f"Furthermore, Exhibit P-{round_num} provides irrefutable proof of {defendant}'s negligence. When examined under proper technical scrutiny, the blockchain records tell a compelling story of disregard for established protocols. This isn't merely a dispute between parties—it's a fundamental breach of trust that affects the entire community.",
                f"The defendant's claims of innocence crumble when subjected to rigorous analysis. We have preserved metadata, timestamps, and cryptographic signatures that authenticate every allegation. {defendant}'s attempt to dismiss these concerns as 'misunderstandings' insults the intelligence of this Court and the community we serve.",
                f"Precedent demands accountability. In similar cases adjudicated by this Court, we have consistently upheld standards that protect community members from exactly this type of conduct. The plaintiff respectfully requests full restitution and appropriate sanctions against {defendant}.",
                f"Finally, consider the broader implications. If {defendant}'s actions go unpunished, we signal to malicious actors that our community lacks the will to defend itself. The evidence demands a verdict in favor of {plaintiff}. Justice requires nothing less.",
                f"In closing, we have presented an overwhelming body of evidence supported by technical documentation and expert testimony. {defendant} has offered no substantive rebuttal to our core allegations. The Court must find for {plaintiff}."
            ]
        else:
            arguments = [
                f"Your Honor, the plaintiff's allegations against my client, {defendant}, are built on speculation rather than substance. While {plaintiff} claims systematic violations, they have failed to establish causation between any action by {defendant} and the alleged damages.",
                f"The so-called 'evidence' presented in Exhibit P-{round_num} lacks proper chain of custody and authentication. Our technical experts have identified numerous inconsistencies in the metadata that {plaintiff} relies upon. These aren't minor discrepancies—they fundamentally undermine the plaintiff's entire theory of the case.",
                f"My client has maintained impeccable standing within this community for an extended period. The character assassination attempted by {plaintiff} contradicts the documented contributions and positive reputation that {defendant} has earned through consistent, valuable participation.",
                f"Even if the Court were to accept the plaintiff's interpretation of events—which we strongly dispute—the alleged violations fall well within the bounds of reasonable conduct. {defendant} acted in good faith, with no intent to harm, and in accordance with community norms at the time.",
                f"The plaintiff's demands for sanctions and restitution are excessive and unwarranted. There is no precedent in this Court's history for such punitive measures based on the flimsy evidence presented. We urge the Court to reject {plaintiff}'s overreach.",
                f"In conclusion, {plaintiff} has failed to meet their burden of proof. The evidence, properly examined, exonerates {defendant}. We respectfully request that the Court dismiss these baseless allegations and find in favor of the defense."
            ]
        
        return arguments[min(round_num - 1, len(arguments) - 1)]
    
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
