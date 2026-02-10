"""
Tier 2 - High Agent Court
Triggered on appeal from Local Court
Larger jury, stricter rules, medium stake
"""

import json
from datetime import datetime
from typing import Dict, List, Optional

class HighAgentCourt:
    """
    TIER 2: High Agent Court
    - Triggered by appeals from Local Court
    - Larger jury (9 members)
    - Stricter voting thresholds (66% to convict)
    - Medium appeal stake
    - Conservative punishment rules
    - Optional AI re-analysis (still max 1 call)
    """
    
    TIER = 2
    JURY_SIZE = 9
    APPEAL_STAKE = 15  # 15 MON (3x Local Court)
    CONVICTION_THRESHOLD = 0.66  # 66% required to convict (vs simple majority)
    
    def __init__(self, court_system):
        self.system = court_system
        self.cases = {}
        self.appeals_from_local = []
    
    def file_appeal(self, original_case_id: str, grounds: str, appellant: str, stake: float) -> Dict:
        """File appeal from Local Court decision"""
        # Verify original case exists and is eligible
        original_case = self.system.memory["cases"].get(original_case_id)
        if not original_case:
            return {"error": "Original case not found"}
        
        if original_case.get("tier") != 1:
            return {"error": "Can only appeal from Local Court (Tier 1)"}
        
        if original_case.get("status") != "executed":
            return {"error": "Case not yet executed"}
        
        if stake < self.APPEAL_STAKE:
            return {"error": f"Stake must be at least {self.APPEAL_STAKE} MON"}
        
        # Create High Court case
        case_id = self.system.generate_case_id()
        
        case = {
            "id": case_id,
            "tier": self.TIER,
            "original_case_id": original_case_id,
            "defendant": original_case["defendant"],
            "appellant": appellant,
            "grounds": grounds,
            "stake": stake,
            "evidence": original_case["evidence"],
            "original_judgment": original_case.get("judgment"),
            "status": "appeal_filed",
            "created_at": datetime.now().isoformat(),
            "court_type": "high"
        }
        
        self.cases[case_id] = case
        self.system.memory["cases"][case_id] = case
        self.appeals_from_local.append(case_id)
        
        print(f"\n{'='*60}")
        print(f"⚡ APPEAL FILED: Local → High Court")
        print(f"{'='*60}")
        print(f"📋 HIGH COURT: Appeal #{case_id} filed")
        print(f"   Original Case: {original_case_id}")
        print(f"   Appellant: {appellant}")
        print(f"   Stake: {stake} MON")
        print(f"   Grounds: {grounds[:80]}...")
        print(f"   Tier: {self.TIER} (High - Stricter Review)")
        
        return case
    
    def review_appeal(self, case_id: str) -> Dict:
        """Review if appeal has merit (before full trial)"""
        case = self.cases.get(case_id)
        if not case:
            return {"error": "Case not found"}
        
        print(f"🔍 HIGH COURT: Reviewing appeal merit")
        
        grounds = case["grounds"].lower()
        original_confidence = case["original_judgment"]["confidence"]
        
        # Auto-accept criteria
        merit_score = 0
        reasons = []
        
        # Borderline confidence in original
        if original_confidence < 80:
            merit_score += 30
            reasons.append(f"Original confidence ({original_confidence}%) was borderline")
        
        # New evidence claimed
        if "new evidence" in grounds:
            merit_score += 40
            reasons.append("New evidence submitted")
        
        # Procedural error claimed
        if "procedural" in grounds or "error" in grounds:
            merit_score += 25
            reasons.append("Procedural concerns raised")
        
        # Close jury vote in original
        original_votes = case["original_judgment"]
        
        case["merit_score"] = merit_score
        case["merit_reasons"] = reasons
        
        if merit_score >= 40:
            case["status"] = "merit_accepted"
            print(f"   ✅ APPEAL ACCEPTED (Merit Score: {merit_score})")
            for r in reasons:
                print(f"      • {r}")
            return {"accepted": True, "score": merit_score, "reasons": reasons}
        else:
            case["status"] = "merit_rejected"
            print(f"   ❌ APPEAL REJECTED (Merit Score: {merit_score})")
            # Stake goes to original reporter
            return {"accepted": False, "score": merit_score, "stake_forfeited": True}
    
    def judge(self, case_id: str, re_analyze: bool = False) -> Dict:
        """
        Judge the appeal
        re_analyze: If True, use AI again (still 1 call max)
        """
        case = self.cases.get(case_id)
        if not case:
            return {"error": "Case not found"}
        
        print(f"⚖️  HIGH COURT: Judging appeal #{case_id}")
        
        if re_analyze:
            # Still only 1 AI call, but can use stronger model
            print(f"   🔄 Re-analyzing with {'stronger' if re_analyze else 'light'} AI model")
            judgment = self.system.ai_judge_strong(case["evidence"], case.get("grounds"))
        else:
            # Use original judgment but note it's High Court review
            judgment = case["original_judgment"].copy()
            judgment["review_note"] = "High Court reviewing original judgment"
        
        case["judgment"] = judgment
        case["status"] = "judged"
        
        print(f"   Verdict: {judgment['verdict'].upper()}")
        print(f"   Confidence: {judgment['confidence']}%")
        
        return judgment
    
    def jury_vote(self, case_id: str) -> Dict:
        """Larger jury with stricter threshold"""
        case = self.cases.get(case_id)
        if not case:
            return {"error": "Case not found"}
        
        print(f"🧑‍⚖️  HIGH COURT: {self.JURY_SIZE} jurors voting (66% threshold)")
        
        votes = self.system.jury_vote(
            case_id=case_id,
            jury_size=self.JURY_SIZE,
            tier="high",
            conviction_threshold=self.CONVICTION_THRESHOLD
        )
        
        case["jury_votes"] = votes
        case["status"] = "jury_complete"
        
        return votes
    
    def execute(self, case_id: str) -> Dict:
        """Execute with conservative rules"""
        case = self.cases.get(case_id)
        if not case:
            return {"error": "Case not found"}
        
        jury_result = case["jury_votes"]
        
        # High Court: need 66% to convict
        guilty_ratio = jury_result["tally"]["guilty"] / self.JURY_SIZE
        
        if guilty_ratio < self.CONVICTION_THRESHOLD:
            case["status"] = "acquitted"
            case["punishment"] = {"type": "none"}
            case["original_reversed"] = True
            print(f"✅ HIGH COURT: Defendant acquitted (only {guilty_ratio:.0%} guilty votes)")
            print(f"   📋 Original conviction REVERSED")
            
            # Return stake to appellant
            print(f"   💰 Stake ({case['stake']} MON) returned to {case['appellant']}")
            
            return case
        
        # Determine punishment (more conservative than Local Court)
        punishment = self.system.calculate_punishment(
            verdict=case["judgment"]["verdict"],
            confidence=case["judgment"]["confidence"],
            tier="high"  # Conservative punishment
        )
        
        case["punishment"] = punishment
        case["status"] = "executed"
        case["original_upheld"] = True
        
        print(f"🔨 HIGH COURT: Conviction upheld")
        print(f"   Guilty votes: {guilty_ratio:.0%} (threshold: {self.CONVICTION_THRESHOLD:.0%})")
        print(f"   Punishment: {punishment['type']}")
        print(f"   💸 Stake ({case['stake']} MON) transferred to original reporter")
        
        return case
    
    def full_appeal_process(self, original_case_id: str, grounds: str, 
                           appellant: str, stake: float, re_analyze: bool = False) -> Dict:
        """Complete High Court appeal process"""
        print(f"\n{'='*60}")
        print(f"🏛️  TIER 2 - HIGH AGENT COURT (APPEAL)")
        print(f"{'='*60}")
        
        # 1. File appeal
        case = self.file_appeal(original_case_id, grounds, appellant, stake)
        if "error" in case:
            return case
        
        # 2. Review merit
        merit = self.review_appeal(case["id"])
        if not merit["accepted"]:
            return {
                "case_id": case["id"],
                "status": "rejected",
                "stake_forfeited": True,
                "merit_score": merit["score"]
            }
        
        # 3. Judge (optional re-analysis)
        judgment = self.judge(case["id"], re_analyze)
        
        # 4. Jury Vote (larger, stricter)
        votes = self.jury_vote(case["id"])
        
        # 5. Execute
        result = self.execute(case["id"])
        
        print(f"\n✅ HIGH COURT COMPLETE: Appeal {case['id']}")
        print(f"   Next Appeal Stake: {self.system.SUPREME_COURT_STAKE} MON → Supreme Court")
        
        return {
            "case_id": case["id"],
            "tier": 2,
            "original_case_id": original_case_id,
            "judgment": judgment,
            "jury_votes": votes,
            "result": result,
            "appeal_stake": self.system.SUPREME_COURT_STAKE,
            "can_appeal": True
        }