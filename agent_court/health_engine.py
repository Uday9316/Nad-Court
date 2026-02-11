"""
Health Engine
Applies health updates using Median Rule
"""

import statistics
from typing import List, Dict, Optional


class HealthEngine:
    """Manages health/persuasion strength updates"""
    
    @staticmethod
    def apply_median_rule(evaluations: List[dict]) -> Optional[dict]:
        """
        Apply health damage using median judge scores
        
        Formula: damage = median(score_differential) * 20
        Clamp: min 5, max 30
        """
        if not evaluations:
            return None
        
        # Calculate score differentials
        differentials = []
        for eval in evaluations:
            p_score = eval["score"]["plaintiff"]
            d_score = eval["score"]["defendant"]
            diff = abs(p_score - d_score)
            differentials.append({
                "diff": diff,
                "winner": "plaintiff" if p_score > d_score else "defendant",
                "judge": eval["judge"]
            })
        
        # Get median differential
        median_diff = statistics.median([d["diff"] for d in differentials])
        
        # Calculate damage: median * 20
        damage = int(median_diff * 20)
        
        # Clamp between 5 and 30
        damage = max(5, min(30, damage))
        
        # Determine target (who takes damage)
        # Find who the median judge favored
        median_idx = len(differentials) // 2
        sorted_diffs = sorted(differentials, key=lambda x: x["diff"])
        target = sorted_diffs[median_idx]["winner"]
        
        # The LOSER takes damage (lower score = damage)
        # Wait - if plaintiff won (higher score), defendant takes damage
        loser = "defendant" if target == "plaintiff" else "plaintiff"
        
        return {
            "target": loser,
            "damage": damage,
            "median_score": round(median_diff, 3),
            "reason": f"Median judge evaluation: {target} argument stronger"
        }
    
    @staticmethod
    def calculate_final_scores(case) -> dict:
        """Calculate final scores for verdict"""
        p_votes = 0
        d_votes = 0
        
        for eval in case.evaluations:
            if eval["score"]["plaintiff"] > eval["score"]["defendant"]:
                p_votes += 1
            else:
                d_votes += 1
        
        return {
            "plaintiff_votes": p_votes,
            "defendant_votes": d_votes,
            "total_evaluations": len(case.evaluations)
        }
