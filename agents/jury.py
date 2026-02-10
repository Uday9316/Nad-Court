"""
Level 3: Jury Agents
Multiple rule-based agents vote on verdict
NO AI - Pure Python logic
"""

import json
from datetime import datetime
from typing import Dict, List
import random

class JuryAgent:
    """
    Jury agents vote using rule-based logic.
    NO AI - deterministic voting based on evidence and judgment.
    """
    
    def __init__(self, court_system):
        self.court = court_system
        self.jury_size = 5
    
    def _create_juror_profile(self, juror_id: int) -> Dict:
        """Create a juror with slight bias variations"""
        profiles = [
            {"name": f"Juror_{juror_id}", "strictness": 0.7, "type": "strict"},
            {"name": f"Juror_{juror_id}", "strictness": 0.5, "type": "moderate"},
            {"name": f"Juror_{juror_id}", "strictness": 0.3, "type": "lenient"},
            {"name": f"Juror_{juror_id}", "strictness": 0.6, "type": "evidence_based"},
            {"name": f"Juror_{juror_id}", "strictness": 0.4, "type": "balanced"}
        ]
        return profiles[juror_id % len(profiles)]
    
    def _juror_vote(self, juror: Dict, verdict: str, confidence: int, evidence: str) -> str:
        """
        Rule-based voting logic - NO AI!
        """
        strictness = juror["strictness"]
        
        # Base vote on confidence threshold modified by strictness
        threshold = 50 + (strictness * 30)  # 50-80% depending on strictness
        
        vote = "not_voted"
        reasoning = ""
        
        # Rule 1: High confidence guilty verdicts
        if verdict in ["spam", "abuse", "malicious"] and confidence >= threshold:
            vote = "guilty"
            reasoning = f"Evidence supports {verdict}. Confidence ({confidence}%) meets my threshold ({threshold:.0f}%)."
        
        # Rule 2: Low confidence or "safe" verdicts
        elif verdict == "safe" or confidence < (threshold - 20):
            vote = "not_guilty"
            reasoning = f"Insufficient evidence. Verdict: {verdict}, Confidence: {confidence}%."
        
        # Rule 3: Borderline cases - escalate
        elif abs(confidence - threshold) < 10:
            vote = "escalate"
            reasoning = f"Borderline case. Confidence ({confidence}%) too close to threshold ({threshold:.0f}%)."
        
        # Rule 4: Evidence quality check
        elif len(evidence) < 100:
            vote = "escalate"
            reasoning = "Insufficient evidence documentation. Need more details."
        
        # Default
        else:
            vote = "guilty"
            reasoning = f"Default to guilty based on {verdict} classification."
        
        return {
            "vote": vote,
            "reasoning": reasoning,
            "juror_type": juror["type"],
            "threshold": threshold
        }
    
    def vote(self, case_id: int) -> Dict:
        """
        All jury members vote on the case
        """
        case_data = self.court.memory["cases"].get(str(case_id))
        judgment = self.court.memory["judgments"].get(str(case_id))
        
        if not case_data or not judgment:
            return {"error": "Case or judgment not found"}
        
        verdict = judgment["verdict"]
        confidence = judgment["confidence"]
        evidence = case_data["evidence"]["content"]
        
        print(f"🧑‍⚖️  JURY DELIBERATION")
        print(f"   Jury Size: {self.jury_size}")
        print(f"   Verdict to Review: {verdict.upper()}")
        print(f"   Judge Confidence: {confidence}%")
        
        votes = []
        jury_members = []
        
        for i in range(self.jury_size):
            juror = self._create_juror_profile(i)
            jury_members.append(juror["name"])
            
            vote_result = self._juror_vote(juror, verdict, confidence, evidence)
            
            vote_record = {
                "juror": juror["name"],
                "type": juror["type"],
                "vote": vote_result["vote"],
                "threshold": round(vote_result["threshold"], 1),
                "reasoning": vote_result["reasoning"],
                "timestamp": datetime.now().isoformat()
            }
            
            votes.append(vote_record)
            
            print(f"   🗳️  {juror['name']} ({juror['type']}): {vote_result['vote'].upper()}")
        
        # Tally votes
        guilty_count = sum(1 for v in votes if v["vote"] == "guilty")
        not_guilty_count = sum(1 for v in votes if v["vote"] == "not_guilty")
        escalate_count = sum(1 for v in votes if v["vote"] == "escalate")
        
        # Determine outcome
        if escalate_count >= 3:
            final_verdict = "escalated"
        elif guilty_count > not_guilty_count:
            final_verdict = "guilty"
        else:
            final_verdict = "not_guilty"
        
        # Store results
        vote_results = {
            "case_id": case_id,
            "individual_votes": votes,
            "tally": {
                "guilty": guilty_count,
                "not_guilty": not_guilty_count,
                "escalate": escalate_count
            },
            "final_verdict": final_verdict,
            "timestamp": datetime.now().isoformat()
        }
        
        self.court.memory["votes"][str(case_id)] = vote_results
        self.court.memory["cases"][str(case_id)]["jury_votes"] = vote_results
        self.court.memory["cases"][str(case_id)]["status"] = "jury_complete"
        
        print(f"\n📊 JURY RESULTS")
        print(f"   Guilty: {guilty_count} | Not Guilty: {not_guilty_count} | Escalate: {escalate_count}")
        print(f"   FINAL: {final_verdict.upper()}")
        
        return vote_results
    
    def get_jury_stats(self) -> Dict:
        """Get jury voting statistics"""
        all_votes = self.court.memory.get("votes", {})
        
        total_cases = len(all_votes)
        guilty_cases = sum(1 for v in all_votes.values() if v["final_verdict"] == "guilty")
        not_guilty_cases = sum(1 for v in all_votes.values() if v["final_verdict"] == "not_guilty")
        escalated_cases = sum(1 for v in all_votes.values() if v["final_verdict"] == "escalated")
        
        return {
            "total_cases": total_cases,
            "guilty": guilty_cases,
            "not_guilty": not_guilty_cases,
            "escalated": escalated_cases
        }