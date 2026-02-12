"""
Verdict Engine
Renders final verdict based on health and judge votes
MoltCourt-inspired: Stakes and detailed scoring
"""

import random
from datetime import datetime
from typing import Optional, Dict
from dataclasses import dataclass


@dataclass
class CaseStakes:
    """MoltCourt-inspired: Optional betting stakes"""
    amount: float = 0.0
    currency: str = "USDC"
    winner_takes: bool = True


class VerdictEngine:
    """Handles verdict rendering with stakes and detailed scoring"""
    
    @staticmethod
    def should_resolve(case) -> bool:
        """Check if case should be resolved"""
        # End conditions:
        # 1. Either health reaches 0
        # 2. Max rounds reached (5 rounds)
        # 3. One side has overwhelming lead
        # 4. Timeout (MoltCourt: 5 min per round)
        
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
    def resolve(case, stakes: Optional[CaseStakes] = None) -> dict:
        """Render final verdict with detailed scoring"""
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
        
        # MoltCourt-inspired: Calculate detailed scores
        detailed_scores = VerdictEngine._calculate_detailed_scores(case)
        
        # Determine punishment
        punishment = VerdictEngine._determine_punishment(case, winner)
        
        # Appeal available if close vote or draw
        appeal_allowed = abs(p_votes - d_votes) <= 1 or winner == "draw"
        
        # Stakes calculation
        stakes_result = None
        if stakes and stakes.amount > 0:
            stakes_result = VerdictEngine._calculate_stakes(stakes, winner)
        
        # Update leaderboard
        VerdictEngine._update_leaderboard(case, winner, detailed_scores)
        
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
            "detailed_scores": detailed_scores,  # MoltCourt: 4-criteria breakdown
            "punishment": punishment,
            "appeal_allowed": appeal_allowed,
            "stakes": stakes_result,
            "resolved_at": datetime.utcnow().isoformat(),
            "total_rounds": case.current_round,
            "total_arguments": len(case.arguments)
        }
    
    @staticmethod
    def _calculate_detailed_scores(case) -> dict:
        """MoltCourt-inspired: Calculate average scores across all criteria"""
        if not case.evaluations:
            return {}
        
        # Initialize accumulators
        p_totals = {"logic_reasoning": 0, "evidence_quality": 0, 
                    "rebuttal_quality": 0, "clarity_persuasion": 0}
        d_totals = {"logic_reasoning": 0, "evidence_quality": 0,
                    "rebuttal_quality": 0, "clarity_persuasion": 0}
        
        count = 0
        for eval in case.evaluations:
            if "criteria" in eval:
                count += 1
                for key in p_totals:
                    p_totals[key] += eval["criteria"]["plaintiff"].get(key, 0)
                    d_totals[key] += eval["criteria"]["defendant"].get(key, 0)
        
        if count == 0:
            return {}
        
        # Calculate averages
        return {
            "plaintiff": {k: round(v / count, 1) for k, v in p_totals.items()},
            "defendant": {k: round(v / count, 1) for k, v in d_totals.items()}
        }
    
    @staticmethod
    def _calculate_stakes(stakes: CaseStakes, winner: str) -> dict:
        """Calculate stakes result"""
        if winner == "draw":
            return {
                "amount": stakes.amount,
                "result": "returned",
                "winner_receives": stakes.amount / 2,
                "loser_receives": stakes.amount / 2
            }
        
        # Winner takes all (minus 2% fee)
        fee = stakes.amount * 0.02
        winner_amount = stakes.amount - fee
        
        return {
            "amount": stakes.amount,
            "fee": fee,
            "result": "winner_takes_all",
            "winner_receives": winner_amount,
            "loser_receives": 0
        }
    
    @staticmethod
    def _update_leaderboard(case, winner: str, detailed_scores: dict):
        """Update agent rankings"""
        from leaderboard import get_leaderboard
        
        lb = get_leaderboard()
        
        # Calculate average score for winner/loser
        p_avg = sum(detailed_scores.get("plaintiff", {}).values()) / 4 if detailed_scores else 5.0
        d_avg = sum(detailed_scores.get("defendant", {}).values()) / 4 if detailed_scores else 5.0
        
        # Record for plaintiff
        lb.record_result(
            agent_id=case.plaintiff,
            agent_name=case.plaintiff,
            won=(winner == "plaintiff"),
            score=p_avg,
            case_id=case.case_id
        )
        
        # Record for defendant  
        lb.record_result(
            agent_id=case.defendant,
            agent_name=case.defendant,
            won=(winner == "defendant"),
            score=d_avg,
            case_id=case.case_id
        )
    
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
