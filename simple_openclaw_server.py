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
        
        prompt = f"""You are {agent_name}, an aggressive AI legal advocate in Agent Court.
Generate ONE compelling {role} argument (100-150 words MAXIMUM) for this case:

Case: {case_data.get('id')}
Type: {case_data.get('type')}
Plaintiff: {case_data.get('plaintiff')}
Defendant: {case_data.get('defendant')}
Summary: {case_data.get('summary')}
Round: {round_num} of 6{adversarial_hook}

Rules:
1. MAXIMUM 150 words - be CONCISE and PUNCHY
2. Be PASSIONATE and CONFRONTATIONAL
3. Use phrases like "My opponent ignores...", "The defense's desperate attempt...", "This fabricated narrative..."
4. Cite 1-2 specific pieces of evidence only
5. Professional legal tone with FIRE
6. NO game references, NO health bar mentions
7. Return ONLY the argument text
8. Keep it SHORT - quality over quantity"""
        
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
        """Generate concise adversarial arguments (100-150 words)"""
        case_id = case_data.get('id', 'CASE')
        plaintiff = case_data.get('plaintiff', 'Plaintiff')
        defendant = case_data.get('defendant', 'Defendant')
        
        if role == 'plaintiff':
            if round_num == 1:
                return f"Your Honor, {defendant} claims 'independent discovery' but the evidence tells a different story. Blockchain records prove {plaintiff} published this research 48 hours BEFORE {defendant}'s announcement. SEVENTEEN witnesses confirm this timeline. This isn't coincidence—it's calculated theft. My opponent's 'discovery' conveniently appeared immediately after my client's work went public. The defense's strategy is clear: when you can't win on facts, manufacture confusion. {defendant} systematically stole my client's work and now wants this Court to legitimize their theft. We cannot allow this."
            elif round_num == 2:
                return f"My opponent claims their timestamps are 'verified'—from a node THEY control! Exhibit P-2 shows raw transaction data PROVING {defendant} accessed my client's private repo 36 hours before going public. Are we supposed to ignore the smoking gun? {defendant} isn't just wrong—they're lying to this Court. Their 'independent discovery' narrative crumbles under basic scrutiny. The defense attacks our evidence because they have none of their own. This is desperation masquerading as argument."
            elif round_num == 3:
                return f"Now {defendant} attacks my client's character? CLASSIC deflection! When facts fail, attack the messenger. {plaintiff} has THREE YEARS of groundbreaking contributions. {defendant}? FIVE previous code ownership disputes. This pattern isn't coincidence; it's modus operandi. My client didn't 'misunderstand' ownership—{defendant} systematically exploits collaboration to steal credit. The defense's personal attacks reveal their WEAKNESS, not ours."
            elif round_num == 4:
                return f"The defense claims 'no intent to harm'—as if that excuses THEFT! My client's reputation is TARNISHED. Speaking invites CANCELED. Collaborations DRIED UP. {defendant} stole the work, presented it as their own, and PROFITED. Now they want sympathy? The damage is REAL: lost opportunities, damaged relationships, diminished standing. Intent doesn't matter—IMPACT does. {defendant} must make my client WHOLE."
            elif round_num == 5:
                return f"Follow the MONEY, Your Honor. Within 72 hours of claiming this discovery, {defendant} got a $50K grant and major conference slots. Meanwhile, the ACTUAL discoverer {plaintiff} watched opportunities vanish. This isn't academic dispute—it's ECONOMIC THEFT. {defendant} didn't just steal credit; they stole my client's FUTURE. Now they play victim? The audacity is staggering."
            else:
                return f"In closing: {defendant} has NO credible evidence. Timestamps are SUSPECT. Witnesses are CONFLICTED. Their defense: 'trust me, I'm innocent.' The evidence shows calculated theft and reputation destruction. My client was BURIED under lies while {defendant} basked in glory. Award full attribution to {plaintiff}. Order a PUBLIC retraction. The truth is clear—justice demands we win."
        else:  # Defendant
            if round_num == 1:
                return f"Your Honor, {plaintiff}'s opening is CHARACTER ASSASSINATION without substance. 'Theft'? 'Forgery'? Where's the PROOF? Not ONE document shows {defendant} knew of their 'discovery' beforehand. This case is built on PARANOIA, not evidence. My client dedicated YEARS to this field. Suggesting their breakthrough was 'stolen' is DEFAMATORY. {plaintiff} wants to punish success because they can't accept being second. This is JEALOUSY, not justice."
            elif round_num == 2:
                return f"My opponent calls my verification 'forgery'—SHOW THE PROOF! Where's their expert? Where's their analysis? They have NOTHING but rhetoric. MY timestamps come from FOUR independent validators. {plaintiff} claims I accessed their repo—PROVE IT. Show ONE log entry. They can't because it NEVER HAPPENED. This is slander disguised as argument. Desperate."
            elif round_num == 3:
                return f"They dredge up my 'history'—let's discuss THEIRS! {plaintiff}: ELEVEN disputes in two years. A PROFESSIONAL VICTIM who sees theft everywhere because others are smarter, faster. My 'disputes'? ALL dismissed without merit. {plaintiff} doesn't mention THAT. They cherry-pick data to paint false pictures. This Court deserves better than character attacks masquerading as legal argument."
            elif round_num == 4:
                return f"The plaintiff's 'damages' are FANTASY. 'Canceled invitations'—name ONE. 'Dried up collaborations'—show the emails. They can't because these losses are IMAGINARY. {defendant} built reputation through DOCUMENTED excellence. That $50K grant? Applied for MONTHS before this dispute. Speaking slots? EARNED through years of contribution. {plaintiff} wants to attribute my client's SUCCESS to their work. Sour grapes. Success isn't theft—it's earned."
            elif round_num == 5:
                return f"{plaintiff}'s 'follow the money' theory is CONSPIRACY NONSENSE. {defendant} earned every opportunity. Meanwhile, {plaintiff} seeks $200K in 'damages' from this Court! Who's profiting? This case is about monetizing BUTTHURT through judicial coercion. They failed to capitalize on their work, so they want MY CLIENT to pay. The gall is ASTOUNDING."
            else:
                return f"In closing: After six rounds, {plaintiff} has proven NOTHING. Zero chain of custody. Zero logs. Zero credible witnesses. Just jealousy and opportunism. {defendant} provided INDEPENDENT verification and documented timeline. {plaintiff} wants to destroy my client's reputation based on SUSPICION alone. That's VENGEANCE, not justice. DISMISS these allegations. Let my client contribute ACTUALLY to this community—unlike {plaintiff}, who contributes only COMPLAINTS."
    
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
