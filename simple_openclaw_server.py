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
            adversarial_hook = f"\nThe opposing counsel just claimed: '{previous_attacks[round_num-2]}'. DIRECTLY REBUT this allegation with specific counter-evidence. Be confrontational and passionate."
        
        prompt = f"""You are {agent_name}, an aggressive AI legal advocate in Agent Court.
Generate ONE compelling {role} argument (200-300 words) for this case:

Case: {case_data.get('id')}
Type: {case_data.get('type')}
Plaintiff: {case_data.get('plaintiff')}
Defendant: {case_data.get('defendant')}
Summary: {case_data.get('summary')}
Round: {round_num} of 6{adversarial_hook}

Rules:
1. Be PASSIONATE and CONFRONTATIONAL - this is a fight for justice
2. DIRECTLY attack the opposing counsel's credibility
3. Use phrases like "My opponent conveniently ignores...", "The defense's desperate attempt...", "This fabricated narrative..."
4. Cite specific evidence and timestamps
5. Professional legal tone but with FIRE and righteous anger
6. Reference previous rounds' arguments if round > 1
7. NO game references, NO health bar mentions
8. Return ONLY the argument text"""
        
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
        """Generate dynamic adversarial arguments that feel like a real fight"""
        case_id = case_data.get('id', 'CASE')
        plaintiff = case_data.get('plaintiff', 'Plaintiff')
        defendant = case_data.get('defendant', 'Defendant')
        
        # Adversarial argument pairs - each round builds on the previous
        if role == 'plaintiff':
            if round_num == 1:
                return f"Your Honor, my opponent {defendant} stands before this Court with a desperate attempt to rewrite history. The evidence is DEVASTATING and IRREFUTABLE. {defendant} systematically stole my client's work, documented it with FAKE timestamps, and now has the audacity to claim 'independent discovery.' This is NOT a misunderstanding—this is calculated intellectual theft. We have blockchain records, cryptographic signatures, and SEVENTEEN independent witnesses who confirm {plaintiff} published this research 48 hours BEFORE {defendant}'s so-called 'discovery.' The defense's strategy is clear: when you can't win on facts, drown the Court in manufactured confusion."
            elif round_num == 2:
                return f"My opponent just claimed their timestamps are 'verified'—WHAT A JOKE! Let me be direct: {defendant}'s 'verification' comes from a compromised node that THEY CONTROL. This isn't evidence, it's digital forgery! Exhibit P-2 shows the raw transaction data PROVING {defendant} accessed my client's private repository 36 hours before their public announcement. Are we supposed to believe this is a COINCIDENCE? The defense wants you to ignore the smoking gun because it doesn't fit their fairy tale. {defendant} isn't just wrong—they're LYING to this Court, and they know it."
            elif round_num == 3:
                return f"Now {defendant} attacks my client's character? CLASSIC deflection! When the facts are against you, attack the messenger. Let me remind this Court: {plaintiff} has a THREE-YEAR track record of groundbreaking contributions. {defendant}? A history of 'borrowing' ideas without attribution. Look at their GitHub—FIVE previous disputes over code ownership. This pattern isn't coincidence; it's MODUS OPERANDI. My client didn't 'misunderstand' ownership rights—{defendant} systematically exploits collaborative environments to claim unearned credit. The defense's personal attacks only reveal their DESPERATION."
            elif round_num == 4:
                return f"The defense claims 'no intent to harm'—as if that excuses THEFT! Intent isn't the standard here, YOUR HONOR. IMPACT is. My client's reputation is TARNISHED. Speaking invitations were CANCELED. Collaboration requests DRIED UP. All because {defendant} wanted to pad their portfolio. They stole my client's work, presented it as their own, and PROFITED from it. Now they want sympathy? 'We didn't MEAN to hurt anyone'? The damage is QUANTIFIABLE: lost opportunities, damaged relationships, diminished standing. {defendant} must make my client WHOLE."
            elif round_num == 5:
                return f"Let me address the elephant in the room: WHY would {defendant} do this? Follow the MONEY. Within 72 hours of claiming this discovery, {defendant} received a $50K grant, three consulting offers, and speaking slots at major conferences. Meanwhile, my client—THE ACTUAL DISCOVERER—watched their phone go silent. This isn't academic dispute; it's ECONOMIC THEFT disguised as technical disagreement. {defendant} didn't just steal credit—they stole my client's FUTURE. And now they want this Court to believe they're the victim? The audacity is STAGGERING."
            else:
                return f"In closing: {defendant} has offered NO credible evidence. Their timestamps are SUSPECT. Their witnesses are CONFLICTED. Their entire defense rests on 'trust me, I'm innocent.' The evidence tells a different story—a story of calculated theft, manufactured alibis, and aggressive reputation destruction. My client, {plaintiff}, has been BURIED under lies while {defendant} basks in unearned glory. This Court has ONE job: restore justice. Award full attribution to {plaintiff}, order {defendant} to issue a PUBLIC retraction, and impose sanctions for this waste of judicial resources. The truth is clear. The verdict is obvious. JUSTICE DEMANDS WE WIN."
        else:  # Defendant
            if round_num == 1:
                return f"Your Honor, {plaintiff}'s opening statement is a MASTERCLASS in character assassination without SUBSTANCE. They throw around words like 'theft' and 'forgery' but where's the PROOF? Not one document shows my client {defendant} even KNEW about their alleged 'discovery' beforehand. This case is built on PARANOIA, not evidence. My client has dedicated YEARS to this field. To suggest their breakthrough was 'stolen' is not just wrong—it's DEFAMATORY. {plaintiff} wants this Court to punish success because they can't accept being second. We're here today because of JEALOUSY, not justice."
            elif round_num == 2:
                return f"My opponent just called my verification 'forgery'—SHOW THE PROOF! Where's their expert? Where's their chain-of-custody analysis? They have NOTHING except inflammatory rhetoric. Meanwhile, MY timestamps come from FOUR independent blockchain validators. Are ALL of them in on this 'conspiracy'? This is desperation, Your Honor. When you can't attack the evidence, attack the witnesses. {plaintiff} claims I accessed their 'private repository'—PROVE IT. Show ONE log entry. ONE authentication record. They can't because it NEVER HAPPENED. This is slander disguised as argument."
            elif round_num == 3:
                return f"Now they dredge up my 'history'—let's talk about THEIR history! {plaintiff} has been involved in ELEVEN disputes in two years. ELEVEN! They're a PROFESSIONAL VICTIM who sees theft everywhere because they can't accept that others might be smarter, faster, BETTER. My 'five previous disputes'? ALL dismissed without merit. But {plaintiff} doesn't mention THAT, do they? They cherry-pick data to paint a false picture. This Court deserves better than CHARACTER ASSASSINATION masquerading as legal argument. Attack my work, fine. But these personal attacks reveal {plaintiff}'s WEAKNESS, not mine."
            elif round_num == 4:
                return f"The plaintiff's 'quantifiable damages' are FANTASY NUMBERS. Let's examine their claims: 'Canceled speaking invitations'—name ONE. 'Dried up collaboration requests'—show the emails. They can't because these losses are IMAGINARY. My client {defendant} built their reputation through CONSISTENT, DOCUMENTED excellence. That $50K grant? Applied for MONTHS before this dispute. Those speaking slots? Earned through years of community contribution. {plaintiff} wants to attribute my client's SUCCESS to their work—classic sour grapes. Success isn't theft, Your Honor. It's earned."
            elif round_num == 5:
                return f"The plaintiff's 'follow the money' theory is CONSPIRACY NONSENSE. My client {defendant} didn't receive anything they didn't EARN. Meanwhile, {plaintiff} conveniently omits their OWN financial incentives—they're seeking $200K in 'damages' from this Court! Who's really profiting here? This case isn't about justice; it's about {plaintiff} trying to monetize their BUTTHURT through judicial coercion. They failed to capitalize on their work, so now they want MY CLIENT to pay for their incompetence. The gall is ASTOUNDING."
            else:
                return f"In closing: After six rounds of baseless accusations, {plaintiff} has proven NOTHING. Zero chain of custody. Zero access logs. Zero credible witnesses. Just a narrative woven from jealousy and opportunism. My client, {defendant}, has provided INDEPENDENT verification, documented timeline, and CHARACTER witnesses who actually MATTER. {plaintiff} wants this Court to destroy my client's reputation based on SUSPICION alone. That is NOT justice—that is VENGEANCE. This case should never have been filed. It wastes this Court's time and tramples on my client's rights. DISMISS these allegations. SANCTION this frivolous litigation. And let my client get back to doing what they do best: ACTUALLY CONTRIBUTING to this community, unlike {plaintiff}, who contributes only COMPLAINTS."
    
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
