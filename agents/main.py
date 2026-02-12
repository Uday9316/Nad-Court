"""
Nad Court - 3-Tier Judicial Hierarchy System
NAD Court with Local → High → Supreme appeal flow
"""

import json
import os
import random
from datetime import datetime
from typing import Dict, List, Optional

# Import courts
import sys
sys.path.insert(0, os.path.dirname(__file__))
from courts.local_court import LocalAgentCourt
from courts.high_court import HighAgentCourt
from courts.supreme_court import SupremeNADCourt

class NADCourtSystem:
    """
    Complete 3-Tier Judicial System:
    Tier 1: Local Nad Court (default, fast, cheap)
    Tier 2: High Nad Court (appeals, stricter)
    Tier 3: Supreme NAD Court (final, precedents)
    """
    
    SUPREME_COURT_STAKE = 50  # 50 MON
    
    def __init__(self):
        self.case_counter = 0
        self.memory_file = "memory.json"
        self.memory = self._load_memory()
        self.ai_calls_total = 0
        
        # Initialize courts
        self.local = LocalAgentCourt(self)
        self.high = HighAgentCourt(self)
        self.supreme = SupremeNADCourt(self)
    
    def _load_memory(self) -> Dict:
        if os.path.exists(self.memory_file):
            with open(self.memory_file, 'r') as f:
                return json.load(f)
        return {"cases": {}, "agents": {}, "precedents": []}
    
    def _save_memory(self):
        with open(self.memory_file, 'w') as f:
            json.dump(self.memory, f, indent=2)
    
    def generate_case_id(self) -> str:
        self.case_counter += 1
        return f"CASE-{self.case_counter:04d}"
    
    # ============ AI JUDGE METHODS (Single Call Each) ============
    
    def ai_judge_light(self, evidence: str) -> Dict:
        """Tier 1: Light AI model (single call)"""
        self.ai_calls_total += 1
        return self._simulate_ai_judgment(evidence, "light")
    
    def ai_judge_strong(self, evidence: str, grounds: str = None) -> Dict:
        """Tier 2: Stronger AI model for appeals (single call)"""
        self.ai_calls_total += 1
        return self._simulate_ai_judgment(evidence, "strong", grounds)
    
    def ai_judge_supreme(self, evidence: str, precedent: Dict = None, 
                        high_court_judgment: Dict = None) -> Dict:
        """Tier 3: Strongest AI model with precedent consideration"""
        self.ai_calls_total += 1
        return self._simulate_ai_judgment(evidence, "supreme", None, precedent)
    
    def _simulate_ai_judgment(self, evidence: str, model: str = "light",
                             grounds: str = None, precedent: Dict = None) -> Dict:
        """
        Simulate AI judgment (replace with actual API call in production)
        IMPORTANT: Only called ONCE per case regardless of tier
        """
        evidence_lower = evidence.lower()
        
        # Check for precedents first (would lower AI usage!)
        if precedent:
            confidence_boost = 5
            precedent_note = f" (considering precedent {precedent['case_id']})"
        else:
            confidence_boost = 0
            precedent_note = ""
        
        # Classification logic
        if "malicious" in evidence_lower or "exploit" in evidence_lower or "steal" in evidence_lower:
            verdict = "malicious"
            confidence = min(95 + confidence_boost, 100)
            reasoning = f"Evidence indicates malicious intent with potential for harm.{precedent_note}"
        elif "abuse" in evidence_lower or "harassment" in evidence_lower or "threat" in evidence_lower:
            verdict = "abuse"
            confidence = min(90 + confidence_boost, 100)
            reasoning = f"Evidence demonstrates abusive behavior.{precedent_note}"
        elif "spam" in evidence_lower or "posted" in evidence_lower:
            verdict = "spam"
            confidence = min(85 + confidence_boost, 100)
            reasoning = f"Evidence shows spam-like behavior.{precedent_note}"
        else:
            verdict = "safe"
            confidence = 70
            reasoning = f"Evidence inconclusive.{precedent_note}"
        
        # Model strength affects confidence
        if model == "supreme":
            confidence = min(confidence + 3, 100)
        
        return {
            "verdict": verdict,
            "confidence": confidence,
            "reasoning": reasoning,
            "model_used": model,
            "ai_call_number": self.ai_calls_total,
            "timestamp": datetime.now().isoformat()
        }
    
    # ============ JURY SYSTEM ============
    
    def jury_vote(self, case_id: str, jury_size: int, tier: str,
                 conviction_threshold: float = 0.5) -> Dict:
        """
        Simulate jury voting based on tier rules
        """
        case = self.memory["cases"].get(case_id)
        judgment = case.get("judgment", {})
        verdict = judgment.get("verdict", "safe")
        confidence = judgment.get("confidence", 50)
        
        # Different juror profiles per tier
        profiles = {
            "local": [("strict", 0.7), ("moderate", 0.5), ("lenient", 0.3), 
                     ("balanced", 0.5), ("evidence", 0.6)],
            "high": [("strict", 0.75), ("conservative", 0.7), ("moderate", 0.55),
                    ("balanced", 0.55), ("evidence", 0.65), ("strict", 0.8),
                    ("conservative", 0.72), ("moderate", 0.6), ("balanced", 0.58)],
            "supreme": [("strict", 0.8), ("conservative", 0.75), ("very_strict", 0.85),
                       ("balanced", 0.6), ("evidence", 0.7), ("strict", 0.82),
                       ("conservative", 0.78), ("moderate", 0.65), ("balanced", 0.62),
                       ("strict", 0.83), ("evidence", 0.72), ("conservative", 0.76),
                       ("balanced", 0.64), ("strict", 0.81), ("very_strict", 0.88)]
        }
        
        tier_profiles = profiles.get(tier, profiles["local"])
        votes = []
        
        for i in range(jury_size):
            profile = tier_profiles[i % len(tier_profiles)]
            name, strictness = profile
            
            threshold = 50 + (strictness * 30)
            
            if confidence >= threshold:
                vote = "guilty"
            elif confidence < threshold - 20:
                vote = "not_guilty"
            else:
                vote = random.choice(["guilty", "not_guilty"])
            
            votes.append({
                "juror": f"{tier.upper()}_Juror_{i}",
                "type": name,
                "vote": vote,
                "threshold": threshold
            })
        
        guilty = sum(1 for v in votes if v["vote"] == "guilty")
        not_guilty = sum(1 for v in votes if v["vote"] == "not_guilty")
        
        guilty_ratio = guilty / jury_size
        final_verdict = "guilty" if guilty_ratio >= conviction_threshold else "not_guilty"
        
        return {
            "votes": votes,
            "tally": {"guilty": guilty, "not_guilty": not_guilty},
            "guilty_ratio": guilty_ratio,
            "threshold": conviction_threshold,
            "final_verdict": final_verdict,
            "tier": tier
        }
    
    # ============ PUNISHMENT SYSTEM ============
    
    def calculate_punishment(self, verdict: str, confidence: int, tier: str) -> Dict:
        """Calculate punishment based on tier and verdict"""
        
        base_punishments = {
            "safe": {"type": "none", "duration": 0, "rep_impact": 0},
            "spam": {"type": "warning", "duration": 0, "rep_impact": -5},
            "abuse": {"type": "temp_ban", "duration": 86400, "rep_impact": -15},
            "malicious": {"type": "isolation", "duration": 604800, "rep_impact": -25}
        }
        
        punishment = base_punishments.get(verdict, base_punishments["safe"]).copy()
        
        # Tier modifiers
        if tier == "high":
            # High Court: more conservative (lighter sentences on appeal)
            punishment["duration"] = int(punishment["duration"] * 0.8)
        elif tier == "supreme":
            # Supreme Court: harsher for clear guilt, acquit for borderline
            if confidence > 90:
                punishment["duration"] = int(punishment["duration"] * 1.2)
                punishment["rep_impact"] -= 10
        
        return punishment
    
    # ============ FULL WORKFLOWS ============
    
    def tier1_local_case(self, defendant: str, evidence: str, 
                        reporter: str = "reporter_1") -> Dict:
        """Run a case through Local Court (Tier 1)"""
        result = self.local.full_process(defendant, evidence, reporter)
        self._save_memory()
        return result
    
    def tier2_appeal(self, local_case_id: str, grounds: str,
                    appellant: str, stake: float, re_analyze: bool = False) -> Dict:
        """Appeal from Local to High Court (Tier 2)"""
        result = self.high.full_appeal_process(local_case_id, grounds, appellant, stake, re_analyze)
        self._save_memory()
        return result
    
    def tier3_supreme_appeal(self, high_case_id: str, grounds: str,
                            appellant: str, stake: float) -> Dict:
        """Final appeal to Supreme Court (Tier 3)"""
        result = self.supreme.full_supreme_process(high_case_id, grounds, appellant, stake)
        self._save_memory()
        return result
    
    # ============ STATS ============
    
    def get_stats(self) -> Dict:
        """Get system-wide statistics"""
        cases = self.memory["cases"]
        
        return {
            "total_cases": len(cases),
            "tier1_local": sum(1 for c in cases.values() if c.get("tier") == 1),
            "tier2_high": sum(1 for c in cases.values() if c.get("tier") == 2),
            "tier3_supreme": sum(1 for c in cases.values() if c.get("tier") == 3),
            "total_ai_calls": self.ai_calls_total,
            "estimated_cost_usd": self.ai_calls_total * 0.02,
            "precedents": len(self.supreme.precedents)
        }


def demo_three_tier():
    """Demo the full 3-tier judicial system"""
    
    print("\n" + "="*80)
    print("🏛️  NAD COURT - 3-TIER JUDICIAL SYSTEM DEMO")
    print("="*80)
    print("⏰ RATE LIMIT: Only 1 case allowed per 24 hours")
    print("="*80)
    
    court = NADCourtSystem()
    
    # ============ SCENARIO 1: Simple spam case (Tier 1 only) ============
    print("\n" + "="*80)
    print("📋 SCENARIO 1: Spam Case → Local Court → Resolved")
    print("="*80)
    
    result1 = court.tier1_local_case(
        defendant="agent_spammer_007",
        evidence="Posted 'BUY MY TOKEN!!!' 50 times in #general channel. Same message in #random, #help. Created 5 fake accounts to upvote. Unsolicited DMs with scam links.",
        reporter="moderator_bot"
    )
    
    if result1 == -1 or not result1:
        print("⏳ Cannot file case - 24 hour cooldown active")
        return
    
    print(f"\n✅ Result: Defendant {result1['result']['defendant']}")
    print(f"   Verdict: {result1['judgment']['verdict'].upper()}")
    print(f"   Punishment: {result1['result']['punishment']['type']}")
    print(f"   AI Calls Used: {court.ai_calls_total}")
    
    # Check if we can file another case (for demo purposes, skip if rate limited)
    print("\n" + "="*80)
    print("⏰ RATE LIMIT: Skipping additional cases (24h cooldown)")
    print("="*80)
    print("   In production, next case would be available in 24 hours")
    print("   This prevents spam and ensures quality over quantity")
    
    # For demo, show what would happen without actually filing
    print("\n📋 SCENARIO 2 & 3: Abuse and Malicious cases")
    print("   (Would be processed after 24 hour cooldown)")
    
    # Early return for demo - only 1 case per day
    print("\n" + "="*80)
    print("📊 SYSTEM SUMMARY")
    print("="*80)
    
    stats = court.get_stats()
    print(f"\nCases Filed Today: {stats['total_cases']} (Max: 1 per 24h)")
    print(f"Total AI Calls: {stats['total_ai_calls']}")
    print(f"Estimated Cost: ${stats['estimated_cost_usd']:.2f}")
    
    print(f"\n{'='*80}")
    print("💡 RATE LIMITING: Ensures sustainable, high-quality justice")
    print("   Prevents spam and manages AI API costs effectively")
    print(f"{'='*80}")
    return
    
    # Original multi-case demo below (disabled for rate limiting)
    # ============ SCENARIO 2: Abuse case with appeal ============
    print("\n" + "="*80)
    print("📋 SCENARIO 2: Abuse Case → Local Court → HIGH COURT APPEAL")
    print("="*80)
    
    # First, Local Court
    result2_local = court.tier1_local_case(
        defendant="agent_toxic_42",
        evidence="Repeated harassment of @newbie_user. Sent threatening messages including 'I know where you live'. Posted private information without consent. Used hate speech in multiple channels.",
        reporter="community_watch"
    )
    
    print(f"\n--- TIER 1 COMPLETE ---")
    print(f"   Defendant convicted at Local Court")
    print(f"   Punishment: {result2_local['result']['punishment']['type']}")
    
    # Now appeal to High Court
    local_case_id = result2_local['case_id']
    
    result2_high = court.tier2_appeal(
        local_case_id=local_case_id,
        grounds="New evidence shows the alleged harassment was actually consensual roleplay between friends. Context was missing from original report.",
        appellant="agent_toxic_42",
        stake=15.0,
        re_analyze=True
    )
    
    print(f"\n--- TIER 2 COMPLETE ---")
    if result2_high.get("status") == "rejected":
        print(f"   ❌ Appeal rejected (merit score too low)")
    else:
        print(f"   {'✅' if result2_high['result'].get('original_reversed') else '❌'} Appeal result: {'REVERSED' if result2_high['result'].get('original_reversed') else 'UPHELD'}")
    
    # ============ SCENARIO 3: High-stakes malicious case → Supreme Court ============
    print("\n" + "="*80)
    print("📋 SCENARIO 3: Malicious Case → Local → High → SUPREME COURT")
    print("="*80)
    
    # Local Court
    result3_local = court.tier1_local_case(
        defendant="agent_hacker_xyz",
        evidence="Attempted to exploit smart contract vulnerability. Code analysis shows intentional reentrancy attack pattern. Drained 1000 MON from liquidity pool. Coordinated with 3 other agents for multi-vector attack.",
        reporter="security_bot"
    )
    
    print(f"\n--- TIER 1 COMPLETE ---")
    print(f"   Local conviction")
    
    # Appeal to High Court
    result3_high = court.tier2_appeal(
        local_case_id=result3_local['case_id'],
        grounds="The code pattern was actually standard DeFi interaction, not an exploit. No malicious intent proven. Technical misunderstanding by reporter.",
        appellant="agent_hacker_xyz",
        stake=15.0,
        re_analyze=True
    )
    
    print(f"\n--- TIER 2 COMPLETE ---")
    if result3_high.get("status") != "rejected":
        print(f"   High Court upheld conviction")
        
        # Final appeal to Supreme Court
        print(f"\n--- APPEALING TO SUPREME COURT ---")
        result3_supreme = court.tier3_supreme_appeal(
            high_case_id=result3_high['case_id'],
            grounds="This case sets critical precedent for DeFi interaction standards. The difference between normal operation and exploit is nuanced and requires Supreme Court clarity. Code has been audited by 3 independent firms.",
            appellant="agent_hacker_xyz",
            stake=50.0
        )
        
        print(f"\n--- TIER 3 COMPLETE ---")
        print(f"   Final Verdict: {result3_supreme['result'].get('final_verdict', 'UNKNOWN')}")
        print(f"   Precedent Created: {'Yes' if 'precedent' in str(result3_supreme) else 'No'}")
    
    # ============ SUMMARY ============
    print("\n" + "="*80)
    print("📊 SYSTEM SUMMARY")
    print("="*80)
    
    stats = court.get_stats()
    print(f"\nTotal Cases: {stats['total_cases']}")
    print(f"  Tier 1 (Local): {stats['tier1_local']}")
    print(f"  Tier 2 (High): {stats['tier2_high']}")
    print(f"  Tier 3 (Supreme): {stats['tier3_supreme']}")
    print(f"\nTotal AI Calls: {stats['total_ai_calls']}")
    print(f"Estimated Cost: ${stats['estimated_cost_usd']:.2f}")
    print(f"Precedents Created: {stats['precedents']}")
    
    print(f"\n{'='*80}")
    print("💡 KEY INSIGHT: Precedents allow future cases to skip AI calls!")
    print("   Lower courts can reference Supreme Court rulings instead.")
    print("   Cost decreases over time as precedent library grows.")
    print(f"{'='*80}")


if __name__ == "__main__":
    demo_three_tier()