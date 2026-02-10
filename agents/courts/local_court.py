"""
Tier 1 - Local Agent Court
Fast, cheap, default justice for first-time reports and low-impact offenses
"""

import json
from datetime import datetime
from typing import Dict, List, Optional

class LocalAgentCourt:
    """
    TIER 1: Local Agent Court
    - Fastest processing
    - Light AI model
    - Small jury (5 members)
    - Low appeal stake
    - No precedents set
    """
    
    TIER = 1
    JURY_SIZE = 5
    APPEAL_STAKE = 5  # 5 MON
    AI_MODEL = "light"  # Could specify different models
    
    def __init__(self, court_system):
        self.system = court_system
        self.cases = {}
        self.appeals_to_high = []
    
    def file_case(self, defendant: str, evidence: str, reporter: str) -> Dict:
        """File a new case in Local Court"""
        case_id = self.system.generate_case_id()
        
        case = {
            "id": case_id,
            "tier": self.TIER,
            "defendant": defendant,
            "reporter": reporter,
            "evidence": evidence,
            "status": "open",
            "created_at": datetime.now().isoformat(),
            "court_type": "local"
        }
        
        self.cases[case_id] = case
        self.system.memory["cases"][case_id] = case
        
        print(f"📋 LOCAL COURT: Case #{case_id} filed")
        print(f"   Defendant: {defendant}")
        print(f"   Tier: {self.TIER} (Local - Fast & Cheap)")
        
        return case
    
    def judge(self, case_id: str) -> Dict:
        """AI judges the case (light model, 1 call)"""
        case = self.cases.get(case_id)
        if not case:
            return {"error": "Case not found"}
        
        print(f"⚖️  LOCAL COURT: AI Judging case #{case_id}")
        
        # Single AI call (light model simulation)
        judgment = self.system.ai_judge_light(case["evidence"])
        
        case["judgment"] = judgment
        case["status"] = "judged"
        case["judged_at"] = datetime.now().isoformat()
        
        print(f"   Verdict: {judgment['verdict'].upper()}")
        print(f"   Confidence: {judgment['confidence']}%")
        
        return judgment
    
    def jury_vote(self, case_id: str) -> Dict:
        """Small jury (5) votes"""
        case = self.cases.get(case_id)
        if not case:
            return {"error": "Case not found"}
        
        print(f"🧑‍⚖️  LOCAL COURT: {self.JURY_SIZE} jurors voting")
        
        votes = self.system.jury_vote(
            case_id=case_id,
            jury_size=self.JURY_SIZE,
            tier="local"
        )
        
        case["jury_votes"] = votes
        case["status"] = "jury_complete"
        
        return votes
    
    def execute(self, case_id: str) -> Dict:
        """Execute punishment"""
        case = self.cases.get(case_id)
        if not case:
            return {"error": "Case not found"}
        
        jury_result = case["jury_votes"]
        
        if jury_result["final_verdict"] == "not_guilty":
            case["status"] = "acquitted"
            case["punishment"] = {"type": "none"}
            print(f"✅ LOCAL COURT: Defendant acquitted")
            return case
        
        # Determine punishment
        punishment = self.system.calculate_punishment(
            verdict=case["judgment"]["verdict"],
            confidence=case["judgment"]["confidence"],
            tier="local"
        )
        
        case["punishment"] = punishment
        case["status"] = "executed"
        case["executed_at"] = datetime.now().isoformat()
        case["appeal_deadline"] = "72h"  # 3 days to appeal
        
        print(f"🔨 LOCAL COURT: Punishment applied")
        print(f"   Type: {punishment['type']}")
        
        return case
    
    def allow_appeal(self, case_id: str) -> bool:
        """Check if case can be appealed to High Court"""
        case = self.cases.get(case_id)
        if not case:
            return False
        
        return case.get("status") == "executed"
    
    def full_process(self, defendant: str, evidence: str, reporter: str = "reporter_1") -> Dict:
        """Complete Local Court process"""
        print(f"\n{'='*60}")
        print(f"🏛️  TIER 1 - LOCAL AGENT COURT")
        print(f"{'='*60}")
        
        # 1. File
        case = self.file_case(defendant, evidence, reporter)
        
        # 2. Judge (AI x1)
        judgment = self.judge(case["id"])
        
        # 3. Jury Vote
        votes = self.jury_vote(case["id"])
        
        # 4. Execute
        result = self.execute(case["id"])
        
        print(f"\n✅ LOCAL COURT COMPLETE: Case {case['id']}")
        print(f"   Appeal Stake Required: {self.APPEAL_STAKE} MON")
        
        return {
            "case_id": case["id"],
            "tier": 1,
            "judgment": judgment,
            "jury_votes": votes,
            "result": result,
            "appeal_stake": self.APPEAL_STAKE,
            "can_appeal": True
        }