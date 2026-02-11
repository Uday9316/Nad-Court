"""
Judge Engine
Manages judge evaluations and scoring
"""

import asyncio
from typing import List, Dict
from datetime import datetime


class JudgeEngine:
    """Handles judge evaluations"""
    
    JUDGES = {
        "portdev": {"name": "PortDev", "bias": "technical", "expertise": "Code quality"},
        "mikeweb": {"name": "MikeWeb", "bias": "community", "expertise": "Community dynamics"},
        "keone": {"name": "Keone", "bias": "on-chain", "expertise": "Blockchain data"},
        "james": {"name": "James", "bias": "governance", "expertise": "Rules & precedent"},
        "harpal": {"name": "Harpal", "bias": "merit", "expertise": "Results & impact"},
        "anago": {"name": "Anago", "bias": "protocol", "expertise": "Methodology"}
    }
    
    @staticmethod
    async def evaluate(judge_id: str, case, arguments: List[dict]) -> dict:
        """Generate evaluation from a judge"""
        judge_info = JudgeEngine.JUDGES.get(judge_id)
        
        # Simulate judge deliberation time (30 seconds)
        await asyncio.sleep(2)  # Shortened for testing
        
        # In production, this would call the AI agent with the judge prompt
        # For now, generate mock evaluation based on bias
        evaluation = JudgeEngine._generate_evaluation(judge_id, arguments)
        
        return {
            "judge": judge_id,
            "judge_name": judge_info["name"],
            "round": case.current_round,
            "score": {
                "plaintiff": evaluation["plaintiff_score"],
                "defendant": evaluation["defendant_score"]
            },
            "reasoning": evaluation["reasoning"],
            "timestamp": datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def _generate_evaluation(judge_id: str, arguments: List[dict]) -> dict:
        """Generate evaluation based on judge bias (mock)"""
        import random
        
        # Get bias for this judge
        bias = JudgeEngine.JUDGES[judge_id]["bias"]
        
        # Base scores
        base_p = 0.65
        base_d = 0.65
        
        # Apply bias variation
        if bias == "technical":
            base_p += random.uniform(-0.1, 0.15)
            base_d += random.uniform(-0.05, 0.1)
        elif bias == "community":
            base_p += random.uniform(-0.05, 0.1)
            base_d += random.uniform(-0.1, 0.15)
        elif bias == "on-chain":
            base_p += random.uniform(0.0, 0.15)
            base_d += random.uniform(-0.1, 0.05)
        else:
            base_p += random.uniform(-0.1, 0.1)
            base_d += random.uniform(-0.1, 0.1)
        
        # Clamp to 0-1
        p_score = max(0.3, min(0.95, base_p))
        d_score = max(0.3, min(0.95, base_d))
        
        # Generate reasoning based on who scored higher
        if p_score > d_score:
            reasoning = random.choice([
                "Strong evidence presented by plaintiff",
                "Defendant rebuttal lacked supporting documentation",
                "Plaintiff logic more consistent with facts"
            ])
        else:
            reasoning = random.choice([
                "Defendant provided adequate counter-evidence",
                "Plaintiff claims insufficiently substantiated",
                "Defendant reasoning more persuasive"
            ])
        
        return {
            "plaintiff_score": round(p_score, 2),
            "defendant_score": round(d_score, 2),
            "reasoning": reasoning
        }
