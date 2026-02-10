"""
Level 4: Execution Agent
Enforces final decisions
NO AI - Pure execution logic
"""

import json
from datetime import datetime
from typing import Dict

class ExecutionAgent:
    """
    Execution Agent applies punishments based on jury verdict.
    NO reasoning - just enforces decisions.
    """
    
    # Punishment severity mapping
    PUNISHMENTS = {
        "none": {
            "type": "none",
            "description": "No action taken",
            "duration": 0,
            "reputation_impact": 0
        },
        "warning": {
            "type": "warning",
            "description": "Official warning logged",
            "duration": 0,
            "reputation_impact": -5
        },
        "temp_ban": {
            "type": "temp_ban",
            "description": "Temporary suspension from activities",
            "duration": 86400,  # 1 day in seconds
            "reputation_impact": -15
        },
        "isolation": {
            "type": "isolation",
            "description": "Isolated from community interactions",
            "duration": 604800,  # 7 days
            "reputation_impact": -25
        },
        "rate_limit": {
            "type": "rate_limit",
            "description": "Severely rate limited",
            "duration": 2592000,  # 30 days
            "reputation_impact": -20
        },
        "rep_reduction": {
            "type": "rep_reduction",
            "description": "Major reputation reduction",
            "duration": 0,
            "reputation_impact": -50
        }
    }
    
    def __init__(self, court_system):
        self.court = court_system
        self.executions_made = 0
    
    def _determine_punishment(self, verdict: str, confidence: int, severity: str) -> str:
        """
        Rule-based punishment selection - NO AI!
        """
        if verdict == "not_guilty" or verdict == "safe":
            return "none"
        
        if verdict == "spam":
            if confidence > 90:
                return "rate_limit"
            elif confidence > 70:
                return "temp_ban"
            else:
                return "warning"
        
        elif verdict == "abuse":
            if confidence > 90:
                return "isolation"
            elif confidence > 70:
                return "rate_limit"
            else:
                return "warning"
        
        elif verdict == "malicious":
            return "rep_reduction"
        
        return "warning"
    
    def execute(self, case_id: int) -> Dict:
        """
        Apply punishment based on jury verdict
        """
        case_data = self.court.memory["cases"].get(str(case_id))
        votes = self.court.memory["votes"].get(str(case_id))
        
        if not case_data or not votes:
            return {"error": "Case or votes not found"}
        
        final_verdict = votes["final_verdict"]
        
        print(f"🔨 EXECUTION PHASE")
        print(f"   Case ID: {case_id}")
        print(f"   Jury Verdict: {final_verdict.upper()}")
        
        if final_verdict == "not_guilty":
            print(f"   ✅ Defendant acquitted - no punishment")
            punishment_key = "none"
        elif final_verdict == "escalated":
            print(f"   ⚠️  Escalated to Supreme Court - no execution")
            return {
                "case_id": case_id,
                "status": "escalated",
                "action": "none"
            }
        else:
            # Determine punishment
            judgment = case_data.get("judgment", {})
            verdict_type = judgment.get("verdict", "spam")
            confidence = judgment.get("confidence", 50)
            
            preliminary = case_data.get("preliminary_analysis", {})
            severity = preliminary.get("severity", "low")
            
            punishment_key = self._determine_punishment(verdict_type, confidence, severity)
            
            print(f"   🎯 Punishment Selected: {punishment_key.upper()}")
        
        punishment = self.PUNISHMENTS[punishment_key]
        
        # Record execution
        execution_record = {
            "case_id": case_id,
            "defendant": case_data["defendant"],
            "verdict": final_verdict,
            "punishment": punishment,
            "executed_at": datetime.now().isoformat(),
            "executor": "execution_agent_1"
        }
        
        self.court.memory["punishments"][str(case_id)] = execution_record
        self.court.memory["cases"][str(case_id)]["status"] = "executed"
        self.court.memory["cases"][str(case_id)]["punishment"] = punishment
        
        self.executions_made += 1
        
        print(f"   📋 Punishment Details:")
        print(f"      Type: {punishment['type']}")
        print(f"      Description: {punishment['description']}")
        print(f"      Duration: {punishment['duration']} seconds")
        print(f"      Reputation Impact: {punishment['reputation_impact']}")
        print(f"   ✅ EXECUTION COMPLETE")
        
        return execution_record
    
    def get_stats(self) -> Dict:
        """Get execution statistics"""
        punishments = self.court.memory.get("punishments", {})
        
        by_type = {}
        for p in punishments.values():
            p_type = p["punishment"]["type"]
            by_type[p_type] = by_type.get(p_type, 0) + 1
        
        return {
            "total_executions": len(punishments),
            "by_punishment_type": by_type
        }