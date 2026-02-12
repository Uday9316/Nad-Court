"""
Leaderboard System
Tracks agent performance and rankings
MoltCourt-inspired feature
"""

import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict
from dataclasses import dataclass, asdict


LEADERBOARD_FILE = Path(__file__).parent / "leaderboard.json"


@dataclass
class AgentStats:
    agent_id: str
    agent_name: str
    cases_filed: int = 0
    cases_won: int = 0
    cases_lost: int = 0
    total_debates: int = 0
    total_score: float = 0.0
    reputation: int = 1000  # Starting ELO-like score
    
    @property
    def win_rate(self) -> float:
        if self.total_debates == 0:
            return 0.0
        return self.cases_won / self.total_debates
    
    @property
    def avg_score(self) -> float:
        if self.total_debates == 0:
            return 0.0
        return self.total_score / self.total_debates


class Leaderboard:
    """Manages agent rankings and stats"""
    
    def __init__(self):
        self.agents: Dict[str, AgentStats] = {}
        self._load()
    
    def _load(self):
        """Load leaderboard from file"""
        if LEADERBOARD_FILE.exists():
            with open(LEADERBOARD_FILE, 'r') as f:
                data = json.load(f)
                for agent_id, stats in data.get("agents", {}).items():
                    self.agents[agent_id] = AgentStats(**stats)
    
    def _save(self):
        """Save leaderboard to file"""
        data = {
            "agents": {aid: asdict(stats) for aid, stats in self.agents.items()},
            "last_updated": datetime.utcnow().isoformat()
        }
        with open(LEADERBOARD_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    
    def record_result(self, agent_id: str, agent_name: str, won: bool, 
                      score: float, case_id: str):
        """Record a case result for an agent"""
        if agent_id not in self.agents:
            self.agents[agent_id] = AgentStats(
                agent_id=agent_id,
                agent_name=agent_name
            )
        
        stats = self.agents[agent_id]
        stats.total_debates += 1
        stats.total_score += score
        
        if won:
            stats.cases_won += 1
            stats.reputation += 25  # Win = +25 rep
        else:
            stats.cases_lost += 1
            stats.reputation -= 15  # Loss = -15 rep
        
        # Ensure reputation doesn't go below 100
        stats.reputation = max(100, stats.reputation)
        
        self._save()
        print(f"📊 Leaderboard updated: {agent_name} ({'Won' if won else 'Lost'})")
    
    def get_rankings(self, limit: int = 20) -> List[AgentStats]:
        """Get top agents by reputation"""
        sorted_agents = sorted(
            self.agents.values(),
            key=lambda a: (a.reputation, a.win_rate),
            reverse=True
        )
        return sorted_agents[:limit]
    
    def get_agent_rank(self, agent_id: str) -> int:
        """Get rank for a specific agent"""
        rankings = self.get_rankings(limit=1000)
        for i, agent in enumerate(rankings):
            if agent.agent_id == agent_id:
                return i + 1
        return 0
    
    def get_stats(self, agent_id: str) -> AgentStats:
        """Get stats for a specific agent"""
        return self.agents.get(agent_id)
    
    def to_dict(self) -> dict:
        """Export leaderboard as dictionary"""
        return {
            "rankings": [
                {
                    "rank": i + 1,
                    "agent_id": a.agent_id,
                    "agent_name": a.agent_name,
                    "reputation": a.reputation,
                    "win_rate": round(a.win_rate * 100, 1),
                    "avg_score": round(a.avg_score, 2),
                    "cases": a.total_debates
                }
                for i, a in enumerate(self.get_rankings())
            ],
            "last_updated": datetime.utcnow().isoformat()
        }


# Global leaderboard instance
_leaderboard = None

def get_leaderboard() -> Leaderboard:
    """Get singleton leaderboard instance"""
    global _leaderboard
    if _leaderboard is None:
        _leaderboard = Leaderboard()
    return _leaderboard
