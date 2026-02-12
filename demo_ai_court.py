"""
Agent Court - Full AI Demo
AI agents generate cases from community data, argue them, and render verdicts
"""

import os
import sys

# Load .env file
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value

from agents.ai_agents import AgentCourtSystem, AIArgumentAgent, AIJudgeAgent
import random
from datetime import datetime

# Sample Monad community members
COMMUNITY_MEMBERS = [
    {"username": "Bitlover082", "role": "Community Manager", "reputation": 95},
    {"username": "0xCoha", "role": "Developer", "reputation": 88},
    {"username": "CryptoKing", "role": "Trader", "reputation": 72},
    {"username": "DeFiQueen", "role": "Analyst", "reputation": 80},
    {"username": "MonadMaxi", "role": "Validator", "reputation": 91},
    {"username": "EthEscapee", "role": "Builder", "reputation": 85},
    {"username": "ArtCollector", "role": "NFT Creator", "reputation": 68},
    {"username": "MemeMaker", "role": "Content Creator", "reputation": 75},
]

# Case templates for AI to generate from
CASE_TEMPLATES = [
    {
        "type": "Beef Resolution",
        "templates": [
            "{plaintiff} claims {defendant} unfairly criticized their contribution to the ecosystem",
            "{plaintiff} alleges {defendant} copied their trading strategy without credit",
            "{plaintiff} disputes {defendant}'s claim of discovering a protocol bug first",
        ]
    },
    {
        "type": "Community Conflict",
        "templates": [
            "{plaintiff} accuses {defendant} of spreading FUD about their project",
            "{plaintiff} claims {defendant} unfairly moderated their community posts",
            "{plaintiff} disputes {defendant}'s role in a failed collaboration",
        ]
    },
    {
        "type": "Role Dispute",
        "templates": [
            "{plaintiff} challenges {defendant}'s appointment as community moderator",
            "{plaintiff} claims {defendant} overstepped their role boundaries",
            "{plaintiff} disputes {defendant}'s claim of founding a community initiative",
        ]
    },
    {
        "type": "Art Ownership",
        "templates": [
            "{plaintiff} claims {defendant} used their NFT art without permission",
            "{plaintiff} disputes {defendant}'s ownership of a collaborative piece",
            "{plaintiff} accuses {defendant} of copying their creative style",
        ]
    }
]

# Evidence generators
EVIDENCE_TEMPLATES = [
    "Discord message logs from #{channel}",
    "On-chain transaction records",
    "Community voting results",
    "GitHub contribution history",
    "Twitter/X post screenshots",
    "Validator node performance logs",
    "NFT provenance documentation",
    "Moderation action logs",
]


class AICaseGenerator:
    """
    AI generates realistic cases from community member profiles
    """
    
    def __init__(self):
        self.case_counter = 0
    
    def generate_case(self) -> dict:
        """Generate a realistic case from community members"""
        self.case_counter += 1
        
        # Pick random members
        plaintiff = random.choice(COMMUNITY_MEMBERS)
        defendant = random.choice([m for m in COMMUNITY_MEMBERS if m != plaintiff])
        
        # Pick case type
        case_type_data = random.choice(CASE_TEMPLATES)
        template = random.choice(case_type_data["templates"])
        
        # Generate summary
        summary = template.format(
            plaintiff=plaintiff["username"],
            defendant=defendant["username"]
        )
        
        # Generate facts
        facts = self._generate_facts(plaintiff, defendant, case_type_data["type"])
        
        # Generate evidence
        evidence = random.sample(EVIDENCE_TEMPLATES, k=random.randint(2, 4))
        
        case = {
            "id": f"CASE-{self.case_counter:04d}",
            "type": case_type_data["type"],
            "plaintiff": plaintiff["username"],
            "defendant": defendant["username"],
            "summary": summary,
            "facts": facts,
            "evidence": evidence,
            "timestamp": datetime.now().isoformat()
        }
        
        return case
    
    def _generate_facts(self, plaintiff: dict, defendant: dict, case_type: str) -> str:
        """Generate realistic case facts"""
        facts = [
            f"{plaintiff['username']} has been active in the Monad ecosystem for {random.randint(3, 24)} months as a {plaintiff['role']}.",
            f"{defendant['username']} joined {random.randint(1, 18)} months ago and serves as {defendant['role']}.",
            f"The dispute began {random.randint(1, 30)} days ago.",
        ]
        
        if case_type == "Beef Resolution":
            facts.append(f"Both parties have {random.randint(50, 500)}+ community interactions.")
        elif case_type == "Community Conflict":
            facts.append(f"The conflict affects approximately {random.randint(100, 1000)} community members.")
        elif case_type == "Role Dispute":
            facts.append(f"The role in question was created {random.randint(1, 12)} months ago.")
        elif case_type == "Art Ownership":
            facts.append(f"The disputed work has {random.randint(10, 1000)} views/engagements.")
        
        return " ".join(facts)


class AICourtDemo:
    """
    Full AI Court demonstration
    AI generates cases → AI argues → AI judges → Verdict
    """
    
    def __init__(self):
        self.case_generator = AICaseGenerator()
        self.court_system = AgentCourtSystem()
        self.case_history = []
    
    def run_demo_case(self) -> dict:
        """Run a complete AI court case from generation to verdict"""
        print("=" * 70)
        print("🤖 AGENT COURT - AI DEMO")
        print("=" * 70)
        print()
        
        # Step 1: AI generates case from community
        print("📋 STEP 1: AI Generating Case from Community Members")
        print("-" * 70)
        case = self.case_generator.generate_case()
        
        print(f"Case ID: {case['id']}")
        print(f"Type: {case['type']}")
        print(f"Plaintiff: {case['plaintiff']}")
        print(f"Defendant: {case['defendant']}")
        print(f"\nSummary: {case['summary']}")
        print(f"\nFacts: {case['facts']}")
        print(f"\nEvidence: {', '.join(case['evidence'])}")
        print()
        
        # Step 2: AI agents argue the case
        print("⚔️  STEP 2: AI Agents Arguing the Case")
        print("-" * 70)
        
        plaintiff_agent = AIArgumentAgent('plaintiff', 'JusticeBot-Alpha')
        defendant_agent = AIArgumentAgent('defendant', 'GuardianBot-Omega')
        
        plaintiff_args = []
        defendant_args = []
        
        rounds = 3
        for round_num in range(1, rounds + 1):
            print(f"\n🔄 ROUND {round_num}")
            print()
            
            # Plaintiff argument
            print(f"🤖 JusticeBot-Alpha (Plaintiff Agent):")
            p_arg = plaintiff_agent.generate_argument(case, defendant_args)
            plaintiff_args.append(p_arg)
            print(f"   {p_arg}\n")
            
            # Defendant argument
            print(f"🤖 GuardianBot-Omega (Defendant Agent):")
            d_arg = defendant_agent.generate_argument(case, plaintiff_args)
            defendant_args.append(d_arg)
            print(f"   {d_arg}\n")
        
        # Step 3: AI judges evaluate
        print("⚖️  STEP 3: AI Judges Evaluating")
        print("-" * 70)
        
        judges = [
            AIJudgeAgent("PortDev"),
            AIJudgeAgent("MikeWeb"),
            AIJudgeAgent("Keone"),
            AIJudgeAgent("James"),
            AIJudgeAgent("Harpal"),
            AIJudgeAgent("Anago")
        ]
        
        evaluations = []
        for judge in judges:
            print(f"\n🧑‍⚖️  {judge.name} evaluating...")
            eval_result = judge.evaluate(case, plaintiff_args, defendant_args)
            evaluations.append(eval_result)
            
            # Print scores
            p_scores = eval_result['scores']['plaintiff']
            d_scores = eval_result['scores']['defendant']
            p_total = sum(p_scores.values()) / 4
            d_total = sum(d_scores.values()) / 4
            
            print(f"   Plaintiff Score: {p_total:.1f}/100")
            print(f"   Defendant Score: {d_total:.1f}/100")
            print(f"   Winner: {eval_result['winner'].upper()}")
            print(f"   💬 {judge.name}: \"{eval_result['reasoning'][:150]}...\"")
        
        # Step 4: Calculate verdict
        print("\n🏆 STEP 4: Final Verdict")
        print("-" * 70)
        
        plaintiff_wins = sum(1 for e in evaluations if e['winner'] == 'plaintiff')
        defendant_wins = len(evaluations) - plaintiff_wins
        final_verdict = "plaintiff" if plaintiff_wins > defendant_wins else "defendant"
        winner = case['plaintiff'] if final_verdict == 'plaintiff' else case['defendant']
        loser = case['defendant'] if final_verdict == 'plaintiff' else case['plaintiff']
        
        print(f"\n   Votes: Plaintiff {plaintiff_wins} - {defendant_wins} Defendant")
        print(f"\n   🎉 WINNER: {winner}")
        print(f"   ❌ LOSER: {loser}")
        print()
        
        # Compile result
        result = {
            "case": case,
            "arguments": {
                "plaintiff": plaintiff_args,
                "defendant": defendant_args
            },
            "evaluations": evaluations,
            "verdict": {
                "winner": winner,
                "loser": loser,
                "plaintiff_wins": plaintiff_wins,
                "defendant_wins": defendant_wins,
                "final_verdict": final_verdict
            },
            "timestamp": datetime.now().isoformat()
        }
        
        self.case_history.append(result)
        
        print("=" * 70)
        print("✅ AI COURT CASE COMPLETE")
        print("=" * 70)
        print()
        
        return result
    
    def run_multiple_cases(self, count: int = 3):
        """Run multiple AI court cases"""
        print(f"\n🚀 Running {count} AI Court Cases\n")
        
        for i in range(count):
            print(f"\n{'='*70}")
            print(f"CASE {i+1} OF {count}")
            print(f"{'='*70}\n")
            self.run_demo_case()
        
        print(f"\n{'='*70}")
        print(f"📊 SUMMARY: {count} Cases Completed")
        print(f"{'='*70}")
        
        for i, result in enumerate(self.case_history, 1):
            case = result['case']
            verdict = result['verdict']
            print(f"\n{i}. {case['id']}: {case['type']}")
            print(f"   {case['plaintiff']} vs {case['defendant']}")
            print(f"   Winner: {verdict['winner']} ({verdict['plaintiff_wins']}-{verdict['defendant_wins']})")


# Run the demo
if __name__ == "__main__":
    print("\n" + "="*70)
    print("🤖 AGENT COURT - AI DEMO")
    print("AI agents generate cases from community, argue them, and give verdicts")
    print("="*70 + "\n")
    
    demo = AICourtDemo()
    
    # Run single case demo
    result = demo.run_demo_case()
    
    # Uncomment to run multiple cases:
    # demo.run_multiple_cases(3)
    
    print("\n✨ Demo complete! Check the output above for:")
    print("   1. AI-generated case from community members")
    print("   2. AI agent arguments (JusticeBot vs GuardianBot)")
    print("   3. AI judge evaluations (6 unique personalities)")
    print("   4. Final verdict with reasoning")
