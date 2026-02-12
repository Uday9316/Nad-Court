"""
Judge Engine
Manages judge evaluations and scoring
MoltCourt-inspired: 4-criteria scoring system
"""

import asyncio
from typing import List, Dict
from datetime import datetime


class JudgeEngine:
    """Handles judge evaluations with 4-criteria scoring"""
    
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
        
        # Simulate judge deliberation time (MoltCourt: time delay for drama)
        await asyncio.sleep(3)
        
        # Generate evaluation with 4-criteria scoring (MoltCourt feature)
        evaluation = JudgeEngine._generate_evaluation(judge_id, arguments)
        
        return {
            "judge": judge_id,
            "judge_name": judge_info["name"],
            "round": case.current_round,
            "score": {
                "plaintiff": evaluation["plaintiff_score"],
                "defendant": evaluation["defendant_score"]
            },
            "criteria": evaluation["criteria"],  # MoltCourt: detailed criteria scores
            "reasoning": evaluation["reasoning"],
            "timestamp": datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def _generate_evaluation(judge_id: str, arguments: List[dict]) -> dict:
        """Generate evaluation with 4-criteria scoring (MoltCourt style)"""
        import random
        
        bias = JudgeEngine.JUDGES[judge_id]["bias"]
        
        # MoltCourt-inspired: Score on 4 criteria (0-10 each)
        def score_criteria():
            return {
                "logic_reasoning": random.uniform(6.0, 9.5),
                "evidence_quality": random.uniform(5.5, 9.0),
                "rebuttal_quality": random.uniform(6.0, 9.0),
                "clarity_persuasion": random.uniform(6.5, 9.5)
            }
        
        p_criteria = score_criteria()
        d_criteria = score_criteria()
        
        # Apply judge bias to specific criteria
        if bias == "technical":
            p_criteria["evidence_quality"] += random.uniform(0, 1)
            d_criteria["evidence_quality"] += random.uniform(0, 0.5)
        elif bias == "community":
            p_criteria["clarity_persuasion"] += random.uniform(0, 0.8)
            d_criteria["clarity_persuasion"] += random.uniform(0, 1)
        elif bias == "on-chain":
            p_criteria["evidence_quality"] += random.uniform(0.5, 1.5)
        
        # Clamp all criteria to 0-10
        for c in [p_criteria, d_criteria]:
            for key in c:
                c[key] = min(10.0, c[key])
        
        # Calculate overall score (average of 4 criteria, normalized to 0-1)
        p_score = sum(p_criteria.values()) / 40
        d_score = sum(d_criteria.values()) / 40
        
        # Generate MoltCourt-style reasoning
        if p_score > d_score:
            reasoning = random.choice([
                "Plaintiff argument logically sound with strong evidence. Defendant rebuttal insufficient.",
                "Clear reasoning and specific citations favor plaintiff. Defendant lacked concrete data.",
                "Plaintiff effectively countered opponent's strongest points while maintaining clarity."
            ])
        else:
            reasoning = random.choice([
                "Defendant provided adequate counter-evidence with logical structure.",
                "Plaintiff claims insufficiently substantiated; defendant's rebuttal more persuasive.",
                "Defendant effectively addressed plaintiff points while presenting alternative narrative."
            ])
        
        return {
            "plaintiff_score": round(p_score, 2),
            "defendant_score": round(d_score, 2),
            "criteria": {
                "plaintiff": {k: round(v, 1) for k, v in p_criteria.items()},
                "defendant": {k: round(v, 1) for k, v in d_criteria.items()}
            },
            "reasoning": reasoning
        }
    
    @staticmethod
    def get_scoring_tips() -> str:
        """MoltCourt-inspired: Tips for winning arguments"""
        return """
        Tips for winning:
        - Be specific. "Solana processes 65,000 TPS" beats "Solana is fast."
        - Address your opponent's strongest point, not their weakest.
        - Conceding a weak point and pivoting scores higher than dodging.
        - Evolve your argument each round. Repetition is penalized.
        - Use concrete examples, data, and real metrics.
        - Structure your argument logically with clear connectors.
        """
