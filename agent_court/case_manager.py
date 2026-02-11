"""
Case Manager
Manages case state, arguments, evaluations, and lifecycle
"""

import json
from datetime import datetime
from typing import List, Dict, Optional
from enum import Enum


class CaseStatus(Enum):
    WAITING = "waiting"
    LIVE = "live"
    DELIBERATING = "deliberating"
    RESOLVED = "resolved"


class CaseManager:
    """Manages a single court case"""
    
    def __init__(self, case_id: str, plaintiff: str, defendant: str):
        self.case_id = case_id
        self.plaintiff = plaintiff
        self.defendant = defendant
        
        self.status = CaseStatus.WAITING
        self.current_round = 1
        self.max_rounds = 5
        
        self.health_plaintiff = 100
        self.health_defendant = 100
        
        self.arguments: List[dict] = []
        self.evaluations: List[dict] = []
        
        self.created_at = datetime.utcnow().isoformat()
        self.resolved_at = None
        
        self._current_round_arguments = {"plaintiff": None, "defendant": None}
    
    def start(self):
        """Start the case"""
        self.status = CaseStatus.LIVE
        print(f"🔴 Case {self.case_id} is now LIVE")
    
    def is_live(self) -> bool:
        """Check if case is still active"""
        return self.status == CaseStatus.LIVE
    
    def add_argument(self, argument: dict):
        """Add an argument to the case"""
        self.arguments.append(argument)
        
        # Track for current round
        sender = argument.get("sender_role")
        if sender in self._current_round_arguments:
            self._current_round_arguments[sender] = argument
    
    def round_complete(self) -> bool:
        """Check if both sides have argued this round"""
        return (
            self._current_round_arguments["plaintiff"] is not None and
            self._current_round_arguments["defendant"] is not None
        )
    
    def get_round_arguments(self) -> List[dict]:
        """Get arguments from current round"""
        return [
            self._current_round_arguments["plaintiff"],
            self._current_round_arguments["defendant"]
        ]
    
    def advance_round(self):
        """Advance to next round"""
        self.current_round += 1
        self._current_round_arguments = {"plaintiff": None, "defendant": None}
        print(f"➡️  {self.case_id}: Round {self.current_round}")
    
    def add_evaluation(self, evaluation: dict):
        """Add a judge evaluation"""
        self.evaluations.append(evaluation)
    
    def resolve(self, verdict: dict):
        """Mark case as resolved"""
        self.status = CaseStatus.RESOLVED
        self.resolved_at = datetime.utcnow().isoformat()
        self.winner = verdict.get("winner")
        self.final_health = verdict.get("final_hp")
    
    def to_dict(self) -> dict:
        """Serialize case to dictionary"""
        return {
            "case_id": self.case_id,
            "status": self.status.value,
            "plaintiff": self.plaintiff,
            "defendant": self.defendant,
            "current_round": self.current_round,
            "health": {
                "plaintiff": self.health_plaintiff,
                "defendant": self.health_defendant
            },
            "arguments_count": len(self.arguments),
            "evaluations_count": len(self.evaluations),
            "created_at": self.created_at,
            "resolved_at": self.resolved_at
        }
