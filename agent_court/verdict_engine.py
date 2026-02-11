"""
Verdict Engine
Renders final verdict based on health and judge votes
"""

from datetime import datetime
from typing import Optional


class VerdictEngine:
    """Handles verdict rendering"""
    
    @staticmethod
    def should_resolve(case) -> bool:
        """Check if case should be resolved"""
        # End conditions:
        # 1. Either health reaches 0
        # 2. Max rounds reached (5 rounds)
        # 3. One side has overwhelming lead
        
        if case.health_plaintiff <= 0 or case.health_defendant <= 0:
            return True
        
        if case.current_round >= case.max_rounds:
            return True
        
        # If one side has >80 HP lead
        hp_diff = abs(case.health_plaintiff - case.health_defendant)
        if hp_diff > 80:
            return True
        
        return False
    
    @staticmethod
    def resolve(case) -> dict:
        """Render final verdict"""
        # Determine winner by health
        if case.health_plaintiff > case.health_defendant:
            winner = "plaintiff"
        elif case.health_defendant > case.health_plaintiff:
            winner = "defendant"
        else:
            winner = "draw"
        
        # Count judge votes
        p_votes = 0
        d_votes = 0
        for eval in case.evaluations:
            if eval["score"]["plaintiff"] > eval["score"]["defendant"]:
                p_votes += 1
            else:
                d_votes += 1
        
        # Determine punishment based on case type and severity
        punishment = VerdictEngine._determine_punishment(case, winner)
        
        # Appeal available if close vote or draw
        appeal_allowed = abs(p_votes - d_votes) <= 1 or winner == "draw"
        
        return {
            "case_id": case.case_id,
            "winner": winner,
            "final_hp": {
                "plaintiff": case.health_plaintiff,
                "defendant": case.health_defendant
            },
            "votes": {
                "plaintiff": p_votes,
                "defendant": d_votes
            },
            "punishment": punishment,
            "appeal_allowed": appeal_allowed,
            "resolved_at": datetime.utcnow().isoformat(),
            "total_rounds": case.current_round,
            "total_arguments": len(case.arguments)
        }
    
    @staticmethod
    def _determine_punishment(case, winner: str) -> str:
        """Determine appropriate punishment"""
        loser_health = case.health_defendant if winner == "plaintiff" else case.health_plaintiff
        
        if loser_health == 0:
            # Complete loss - severe punishment
            return random.choice([
                "48h community suspension",
                "Loss of privileged roles",
                "Mandatory mediation"
            ])
        elif loser_health < 30:
            # Significant loss
            return random.choice([
                "24h posting restriction",
                "Warning logged to record",
                "Community service requirement"
            ])
        elif loser_health < 50:
            # Moderate loss
            return random.choice([
                "Formal warning issued",
                "Guidelines review required",
                "No punishment - case dismissed"
            ])
        else:
            # Close case
            return "No punishment - case dismissed"


import random
