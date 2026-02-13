#!/usr/bin/env python3
import http.server
import socketserver
import json
import traceback
import random

PORT = 3000

# Plaintiff arguments (Bitlover082) - accusing 0xCoha of theft
PLAINTIFF_ARGS = [
    # Round 1: Opening - The Discovery
    "Your Honor, on March 15th at 14:23 UTC, my client documented Critical Vulnerability CVE-2024-21893 with cryptographic proof on Ethereum block 18647329. Seventeen hours later, the defendant published an identical finding. The mathematical probability of independent discovery within this window is 0.003%. This was not research—it was surveillance and theft.",
    
    # Round 2: Evidence - The Smoking Gun  
    "Exhibit P-2 reveals the defendant accessed my client's private security research repository at 16:47 UTC—two hours AFTER our responsible disclosure to the Monad Foundation. Their 'discovery' was timestamped at 19:12 UTC. They didn't find this bug. They READ about it in our confidential channels, then claimed credit. This is industrial espionage, not security research.",
    
    # Round 3: Heated - Character Attack
    "The defense wants to discuss my client's 'history'? Let's discuss THEIRS. 0xCoha has FOUR previous disputes over attribution in the past 18 months. Their GitHub shows a pattern: wait for others' work, 'reproduce' it within 48 hours, claim bounty. They're not a researcher—they're a bounty hunter who hunts OTHER PEOPLE'S research. This Court must end this pattern of intellectual parasitism.",
    
    # Round 4: Technical - The Proof
    "Look at the exploit code, Your Honor. My client's proof-of-concept uses a novel reentrancy pattern with nested delegate calls to bypass the 2300 gas stipend. The defendant's 'independent' version uses IDENTICAL variable names—'nestedDelegate', 'gasBypass', 'reentrancyGuard'. Are we to believe they independently chose the same esoteric naming convention? This is copy-paste theft with the serial numbers filed off.",
    
    # Round 5: Damages - The Impact
    "My client lost $47,000 in speaking fees, a grant from the Ethereum Foundation, and their reputation in the security community. The defendant walked away with a $125,000 bug bounty that should have been OURS. Intent doesn't matter—IMPACT does. They stole my client's work, stole their credit, and stole their livelihood. The damage is quantifiable and devastating.",
    
    # Round 6: Closing - The Call to Justice
    "This case is simple: timestamps don't lie. Blockchain doesn't lie. My client discovered this vulnerability. The defendant stole it. If this Court allows intellectual theft to be rewarded with attribution, we signal to every bad actor that our community has no protection. Award full attribution to Bitlover082. Order restitution of the stolen bounty. And send a message: in Agent Court, theft has consequences."
]

# Defendant arguments (0xCoha) - claiming independent discovery
DEFENDANT_ARGS = [
    # Round 1: Opening - The Independent Discovery
    "Your Honor, my client's discovery of the reentrancy vulnerability occurred on March 12th during a routine audit of the Monad DEX contracts. Our research notes—submitted as Exhibit D-1—show seventeen iterations of the exploit over three days. The plaintiff's claim of 'prior discovery' is based on a timestamp that lacks cryptographic verification. We discovered this independently through legitimate security research.",
    
    # Round 2: Rebuttal - The Timeline Defense
    "The plaintiff alleges we accessed their 'private repository'—yet provides NO access logs, NO authentication records, NO IP forensics. Just timestamps and accusations. Their entire case rests on coincidence dressed as conspiracy. My client has never had access to their systems. This is character assassination because they can't win on facts.",
    
    # Round 3: Counter-Attack - The Accuser's History
    "Let's discuss credibility. Bitlover082 has filed NINE similar disputes in two years. Nine! They're a 'professional plaintiff' who sees theft everywhere because they can't accept that others might be competent researchers. My client's four 'disputes'? All dismissed without merit. The plaintiff's pattern is clear: if you can't win on merit, litigate until your opponent gives up.",
    
    # Round 4: Technical Defense - The Differences
    "Our proof-of-concept differs fundamentally from theirs. We identified the vulnerability through static analysis of the DEX router's callback mechanism. Our exploit uses a different attack vector—flash loan manipulation versus their direct reentrancy approach. Same bug, different discovery methods. Parallel research happens constantly in security. The plaintiff's 'identical code' claim is fabrication.",
    
    # Round 5: Precedent - The Burden of Proof
    "The plaintiff seeks $200,000 in damages with ZERO documentation of actual losses. 'Speaking fees'? Name the conferences. 'Grant opportunities'? Show the rejection letters. They can't—because these losses are fictional. My client earned that bounty through documented research. Success isn't theft, Your Honor. Success is earned.",
    
    # Round 6: Closing - The Real Victim
    "After six rounds, the plaintiff has proven NOTHING. No access logs. No chain of custody. Just timestamps and hot air. My client's reputation has been smeared by baseless accusations. Their research is legitimate. Their discovery is documented. And this Court should see this case for what it is: a failed attempt to monetize jealousy through judicial coercion. Dismiss these allegations."
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
                
                # Select appropriate argument list
                if role == 'plaintiff':
                    args_list = PLAINTIFF_ARGS
                    agent_name = 'NadCourt-Advocate'
                else:
                    args_list = DEFENDANT_ARGS
                    agent_name = 'NadCourt-Defender'
                
                # Get argument for this round (cycle if beyond length)
                argument = args_list[min(round_num - 1, len(args_list) - 1)]
                
                self.send_json({
                    'success': True,
                    'agent': agent_name,
                    'role': role,
                    'argument': argument,
                    'round': round_num,
                    'source': 'mock'
                })
                
            elif self.path == '/api/judge-evaluation':
                judge = data.get('judge', 'PortDev')
                judge_data = JUDGE_EVALUATIONS.get(judge, JUDGE_EVALUATIONS['PortDev'])
                
                # Generate varied scores based on judge personality
                bias = judge_data['plaintiff_bias']
                base_plaintiff = 70 + random.randint(5, 15) + bias
                base_defendant = 70 + random.randint(5, 15) - bias
                
                self.send_json({
                    'success': True,
                    'judge': judge,
                    'evaluation': {
                        'plaintiff': {
                            'logic': min(100, base_plaintiff + random.randint(-5, 5)),
                            'evidence': min(100, base_plaintiff + random.randint(-3, 8)),
                            'rebuttal': min(100, base_plaintiff + random.randint(-5, 5)),
                            'clarity': min(100, base_plaintiff + random.randint(-3, 3)),
                            'total': 0  # Will be calculated on frontend
                        },
                        'defendant': {
                            'logic': min(100, base_defendant + random.randint(-5, 5)),
                            'evidence': min(100, base_defendant + random.randint(-8, 3)),
                            'rebuttal': min(100, base_defendant + random.randint(-5, 5)),
                            'clarity': min(100, base_defendant + random.randint(-3, 3)),
                            'total': 0
                        },
                        'reasoning': judge_data['reasoning'],
                        'winner': 'plaintiff' if base_plaintiff > base_defendant else 'defendant'
                    }
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
