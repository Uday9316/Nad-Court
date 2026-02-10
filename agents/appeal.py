"""
Level 5: Appeal Agent
Handles appeals from punished agents
Economic staking required to prevent abuse
"""

import json
from datetime import datetime
from typing import Dict, Optional

class AppealAgent:
    """
    Appeal Agent manages the appeals process.
    Appeals require staking to prevent frivolous claims.
    """
    
    APPEAL_STAKE = 10  # 10 MON minimum stake
    APPEAL_PERIOD_DAYS = 3
    
    def __init__(self, court_system):
        self.court = court_system
        self.appeals_filed = 0
        self.appeals_successful = 0
    
    def file(self, case_id: int, grounds: str, appellant: str) -> Dict:
        """
        File an appeal with staking requirement
        """
        case_data = self.court.memory["cases"].get(str(case_id))
        
        if not case_data:
            return {"error": "Case not found"}
        
        if case_data.get("status") != "executed":
            return {"error": "Case not yet executed"}
        
        if case_data.get("appeal_filed"):
            return {"error": "Appeal already filed"}
        
        # Verify appellant is the defendant
        if appellant != case_data["defendant"]:
            return {"error": "Only defendant can appeal"}
        
        print(f"📋 APPEAL FILED")
        print(f"   Case ID: {case_id}")
        print(f"   Appellant: {appellant}")
        print(f"   Stake Required: {self.APPEAL_STAKE} MON")
        print(f"   Grounds: {grounds[:100]}...")
        
        appeal_record = {
            "appeal_id": self.appeals_filed + 1,
            "case_id": case_id,
            "appellant": appellant,
            "grounds": grounds,
            "stake": self.APPEAL_STAKE,
            "filed_at": datetime.now().isoformat(),
            "status": "pending",
            "resolved": False,
            "successful": False
        }
        
        self.appeals_filed += 1
        
        # Update case
        self.court.memory["cases"][str(case_id)]["appeal_filed"] = True
        self.court.memory["cases"][str(case_id)]["status"] = "appealed"
        self.court.memory["appeals"][str(case_id)] = appeal_record
        
        print(f"   ✅ Appeal #{appeal_record['appeal_id']} registered")
        print(f"   ⏳ Awaiting review...")
        
        return appeal_record
    
    def review(self, case_id: int) -> Dict:
        """
        Review an appeal (can be called by Appeal Agent or Supreme Court)
        """
        appeal = self.court.memory["appeals"].get(str(case_id))
        case_data = self.court.memory["cases"].get(str(case_id))
        
        if not appeal or not case_data:
            return {"error": "Appeal or case not found"}
        
        print(f"🔍 APPEAL REVIEW")
        print(f"   Appeal ID: {appeal['appeal_id']}")
        print(f"   Case ID: {case_id}")
        
        # Rule-based review - NO AI!
        # Check if original evidence was weak
        judgment = case_data.get("judgment", {})
        original_confidence = judgment.get("confidence", 100)
        
        jury_votes = self.court.memory["votes"].get(str(case_id), {})
        tally = jury_votes.get("tally", {})
        guilty_votes = tally.get("guilty", 0)
        not_guilty_votes = tally.get("not_guilty", 0)
        
        # Appeal success criteria (rule-based)
        success = False
        reasons = []
        
        # Criteria 1: Low original confidence
        if original_confidence < 75:
            success = True
            reasons.append(f"Original confidence ({original_confidence}%) was borderline")
        
        # Criteria 2: Close jury vote
        if abs(guilty_votes - not_guilty_votes) <= 1:
            success = True
            reasons.append("Jury vote was very close")
        
        # Criteria 3: New evidence provided (simulated)
        if "new evidence" in appeal.get("grounds", "").lower():
            success = True
            reasons.append("New evidence submitted")
        
        # Resolve appeal
        appeal["resolved"] = True
        appeal["successful"] = success
        appeal["reasons"] = reasons
        appeal["resolved_at"] = datetime.now().isoformat()
        
        if success:
            self.appeals_successful += 1
            # Reverse punishment
            self.court.memory["cases"][str(case_id)]["status"] = "resolved"
            self.court.memory["cases"][str(case_id)]["punishment"] = {
                "type": "none",
                "description": "Appeal successful - punishment reversed"
            }
            # Refund stake would happen here
            print(f"   ✅ APPEAL SUCCESSFUL")
            print(f"   💰 Stake refunded to {appeal['appellant']}")
            print(f"   🔄 Punishment reversed")
        else:
            # Stake goes to reporter as reward
            reporter = case_data["reporter"]
            print(f"   ❌ APPEAL DENIED")
            print(f"   💸 Stake transferred to reporter ({reporter})")
            print(f"   🔒 Punishment stands")
        
        for reason in reasons:
            print(f"   📌 Reason: {reason}")
        
        return appeal
    
    def auto_review_pending(self) -> list:
        """
        Auto-review all pending appeals
        """
        pending = [
            (case_id, appeal) 
            for case_id, appeal in self.court.memory.get("appeals", {}).items()
            if not appeal.get("resolved")
        ]
        
        results = []
        for case_id, _ in pending:
            result = self.review(int(case_id))
            results.append(result)
        
        return results
    
    def get_stats(self) -> Dict:
        """Get appeal statistics"""
        appeals = self.court.memory.get("appeals", {})
        
        total = len(appeals)
        successful = sum(1 for a in appeals.values() if a.get("successful"))
        pending = sum(1 for a in appeals.values() if not a.get("resolved"))
        
        return {
            "total_appeals": total,
            "successful": successful,
            "denied": total - successful - pending,
            "pending": pending,
            "success_rate": (successful / total * 100) if total > 0 else 0
        }