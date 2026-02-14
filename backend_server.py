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

# Argument templates - we combine these dynamically for uniqueness
PLAINTIFF_SNIPPETS = {
    'openings': [
        "Your Honor, my client documented",
        "The evidence is devastating:",
        "Examining the timeline proves",
        "Our investigation reveals",
        "This is not research—this is theft."
    ],
    'evidence': [
        "blockchain proof from March 15th",
        "private repo access at 16:47 UTC",
        "cryptographic verification exists",
        "17-hour gap proves copying",
        "timestamp evidence is irrefutable"
    ],
    'character': [
        "defendant has FOUR attribution disputes",
        "pattern of wait, copy, claim bounty",
        "bounty hunter preying on others",
        "not a researcher—an opportunist",
        "history of contested claims"
    ],
    'technical': [
        "identical variable names",
        "copy-paste with serial numbers off",
        "novel reentrancy stolen wholesale",
        "code similarity is 99%",
        "nested delegate calls replicated"
    ],
    'damages': [
        "$47K in lost speaking fees",
        "$125K bounty was OURS",
        "reputation damage irreparable",
        "livelihood stolen",
        "impact is devastating"
    ],
    'closings': [
        "timestamps don't lie",
        "blockchain doesn't lie",
        "award full attribution",
        "order restitution",
        "theft has consequences"
    ]
}

DEFENDANT_SNIPPETS = {
    'openings': [
        "Your Honor, we discovered this",
        "March 12th during audit proves",
        "Our research is legitimate",
        "Timeline supports independence",
        "Zero evidence of theft"
    ],
    'evidence': [
        "17 iterations over 3 days",
        "research notes documented",
        "lacks cryptographic verification",
        "ZERO logs, ZERO forensics",
        "no access records exist"
    ],
    'character': [
        "plaintiff filed NINE disputes",
        "professional litigant",
        "pattern: litigate until win",
        "sees theft everywhere",
        "all my disputes dismissed"
    ],
    'technical': [
        "fundamentally different methods",
        "static analysis vs reentrancy",
        "parallel research happens",
        "flash loan vs delegate calls",
        "same bug, different paths"
    ],
    'precedent': [
        "ZERO documentation of damages",
        "speaking fees? Name them",
        "losses are fictional",
        "success isn't theft",
        "no proof of harm"
    ],
    'closings': [
        "six rounds, ZERO proof",
        "no logs, no custody",
        "reputation unfairly smeared",
        "research is legitimate",
        "dismiss these allegations"
    ]
}

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
                agent_name = 'NadCourt-Advocate' if role == 'plaintiff' else 'NadCourt-Defender'
                
                # ALWAYS use snippet-based generation for uniqueness
                snippets = PLAINTIFF_SNIPPETS if role == 'plaintiff' else DEFENDANT_SNIPPETS
                
                # Pick random snippets from different categories
                opening = random.choice(snippets['openings'])
                evidence = random.choice(snippets['evidence'])
                character = random.choice(snippets['character'])
                technical = random.choice(snippets['technical'])
                
                # Build unique argument based on round
                if round_num == 1:
                    argument = f"{opening} {evidence}. {character}."
                elif round_num == 2:
                    argument = f"{opening} {technical}. {evidence}."
                elif round_num == 3:
                    argument = f"{character}. {opening} {technical}."
                elif round_num == 4:
                    argument = f"{technical}. {evidence}. {character}."
                elif round_num == 5:
                    damages = random.choice(snippets.get('damages', snippets.get('precedent', snippets['evidence'])))
                    argument = f"{opening} {damages}. {evidence}."
                else:
                    closing = random.choice(snippets['closings'])
                    argument = f"{opening} {technical}. {closing}."
                
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
                
                # UNIQUE reasoning per judge based on their personality
                judge_reasonings = {
                    'PortDev': {
                        'plaintiff': ["Technical evidence is overwhelming. Timestamps don't lie.", "Code analysis confirms plagiarism. Variable names match exactly.", "On-chain data proves the timeline. Case closed."],
                        'defendant': ["Technical methods differ significantly. Independent discovery plausible.", "Code similarity insufficient for theft claim.", "No forensic evidence of unauthorized access."]
                    },
                    'MikeWeb': {
                        'plaintiff': ["Community reputation supports plaintiff. Multiple witnesses confirm.", "Social proof validates original discovery claim.", "Network effects favor the original finder."],
                        'defendant': ["Community vouches for defendant's integrity. Good standing.", "Reputation metrics don't suggest copycat behavior.", "Peers confirm independent research capability."]
                    },
                    'Keone': {
                        'plaintiff': ["Blockchain timestamps are immutable. 17-hour gap is damning.", "Transaction history proves early discovery.", "On-chain evidence outweighs all other claims."],
                        'defendant': ["Block explorer shows no suspicious transactions.", "Wallet history consistent with claimed timeline.", "Smart contract interactions support defense."]
                    },
                    'James': {
                        'plaintiff': ["Case BEEF-2023-001 established precedent. Finder keeps rights.", "Historical rulings favor original discoverers.", "Court precedent is clear on attribution theft."],
                        'defendant': ["Case DEF-2022-015 supports independent discovery defense.", "Precedent requires proof beyond reasonable doubt.", "Previous similar cases dismissed for lack of evidence."]
                    },
                    'Harpal': {
                        'plaintiff': ["Quality of research deserves protection. Meritocracy demands justice.", "Contributor track record speaks volumes.", "Genuine work must be rewarded, not stolen."],
                        'defendant': ["Defendant's contribution history is equally valid.", "Both parties show merit. Doubt goes to accused.", "Quality defense evidence creates reasonable doubt."]
                    },
                    'Anago': {
                        'plaintiff': ["Protocol disclosure rules clearly violated.", "Standard procedures not followed by defendant.", "Violation of responsible disclosure norms."],
                        'defendant': ["All protocol requirements were met properly.", "Disclosure followed standard procedures.", "No violations of ethical guidelines found."]
                    }
                }
                
                # Get reasonings for this specific judge
                judge_specific = judge_reasonings.get(judge, judge_reasonings['PortDev'])
                if p_total > d_total:
                    reasoning = random.choice(judge_specific['plaintiff'])
                else:
                    reasoning = random.choice(judge_specific['defendant'])
                
                self.send_json({
                    'success': True,
                    'judge': judge,
                    'evaluation': {
                        'plaintiff': {**p_scores, 'total': p_total},
                        'defendant': {**d_scores, 'total': d_total},
                        'reasoning': reasoning,
                        'winner': 'plaintiff' if p_total > d_total else 'defendant'
                    },
                    'source': 'dynamic_fallback'
                })
            elif self.path == '/api/generate-case':
                # Generate AI case using OpenClaw
                openclaw_cmd = find_openclaw()
                case_types = [
                    'Security vulnerability discovery dispute',
                    'Smart contract audit attribution conflict',
                    'DeFi protocol exploit research theft',
                    'NFT metadata manipulation accusation',
                    'DAO governance proposal plagiarism',
                    'Cross-chain bridge vulnerability claim',
                    'MEV bot strategy theft allegation',
                    'Validator slashing evidence dispute'
                ]
                case_type = random.choice(case_types)
                
                if openclaw_cmd:
                    try:
                        prompt = f"""Generate a unique blockchain dispute case for Agent Court.

Case Type: {case_type}

Create a JSON object with:
- plaintiff: username/name of accuser
- defendant: username/name of accused  
- summary: 1-2 sentence description of the dispute
- evidence_type: what evidence exists (timestamps, logs, contracts, etc.)
- stakes: what's at stake (bounty amount, reputation, tokens)

Return ONLY valid JSON:
{{
  "plaintiff": "CryptoResearcher",
  "defendant": "BugHunterX",
  "summary": "Dispute over who discovered critical vulnerability first",
  "evidence_type": "blockchain timestamps, git commits",
  "stakes": "$50,000 bug bounty"
}}"""
                        
                        result = subprocess.run(
                            [openclaw_cmd, "agent", "--local", "--session-id", f"case_{int(time.time())}", "-m", prompt],
                            capture_output=True,
                            text=True,
                            timeout=30
                        )
                        if result.returncode == 0 and result.stdout.strip():
                            import re
                            json_match = re.search(r'\{.*\}', result.stdout.strip(), re.DOTALL)
                            if json_match:
                                case_data = json.loads(json_match.group())
                                case_data['case_type'] = case_type
                                case_data['case_id'] = f"CASE-{random.randint(1000, 9999)}"
                                self.send_json({
                                    'success': True,
                                    'case': case_data,
                                    'source': 'openclaw_ai'
                                })
                                return
                    except Exception as e:
                        print(f"OpenClaw case generation failed: {e}")
                
                # Fallback: Generate random case
                fallback_cases = [
                    {
                        'case_id': f"CASE-{random.randint(1000, 9999)}",
                        'case_type': 'Security vulnerability dispute',
                        'plaintiff': 'SecurityResearcher_0x' + ''.join([random.choice('0123456789abcdef') for _ in range(4)]),
                        'defendant': 'BugBountyHunter_' + ''.join([random.choice('0123456789abcdef') for _ in range(4)]),
                        'summary': 'Dispute over discovery of critical smart contract vulnerability. Plaintiff claims defendant copied their research.',
                        'evidence_type': 'blockchain timestamps, research logs',
                        'stakes': f'${random.randint(10000, 100000)} bug bounty'
                    },
                    {
                        'case_id': f"CASE-{random.randint(1000, 9999)}",
                        'case_type': 'DeFi exploit attribution',
                        'plaintiff': 'DeFiAnalyst_' + ''.join([random.choice('0123456789abcdef') for _ in range(4)]),
                        'defendant': 'WhiteHat_' + ''.join([random.choice('0123456789abcdef') for _ in range(4)]),
                        'summary': 'Attribution dispute for flash loan vulnerability discovery in major DeFi protocol.',
                        'evidence_type': 'on-chain transactions, audit reports',
                        'stakes': f'${random.randint(50000, 500000)} protocol reward'
                    },
                    {
                        'case_id': f"CASE-{random.randint(1000, 9999)}",
                        'case_type': 'MEV strategy theft',
                        'plaintiff': 'MEVSearcher_' + ''.join([random.choice('0123456789abcdef') for _ in range(4)]),
                        'defendant': 'Validator_' + ''.join([random.choice('0123456789abcdef') for _ in range(4)]),
                        'summary': 'Plaintiff accuses validator of copying their MEV extraction strategy.',
                        'evidence_type': 'transaction patterns, mempool data',
                        'stakes': f'{random.randint(50, 500)} ETH in profits'
                    }
                ]
                self.send_json({
                    'success': True,
                    'case': random.choice(fallback_cases),
                    'source': 'random_fallback'
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
