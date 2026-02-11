"""
Agent Court - Main Orchestrator
Coordinates all engines for live case proceedings
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, Optional

from case_manager import CaseManager
from argument_engine import ArgumentEngine
from judge_engine import JudgeEngine
from health_engine import HealthEngine
from verdict_engine import VerdictEngine
from websocket import WebSocketServer


class AgentCourt:
    """Main court orchestrator"""
    
    def __init__(self):
        self.cases: Dict[str, CaseManager] = {}
        self.ws_server = WebSocketServer(self)
        self.running = False
    
    async def start(self):
        """Start the court system"""
        self.running = True
        print("⚖️  Agent Court System Starting...")
        
        # Start WebSocket server
        await self.ws_server.start()
    
    def create_case(self, case_id: str, plaintiff: str, defendant: str) -> CaseManager:
        """Create and initialize a new case"""
        case = CaseManager(case_id, plaintiff, defendant)
        self.cases[case_id] = case
        
        # Log case creation
        self.log_event(case_id, "case_created", {
            "plaintiff": plaintiff,
            "defendant": defendant,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        print(f"📋 Case created: {case_id}")
        return case
    
    async def run_case(self, case_id: str):
        """Run a case through its full lifecycle"""
        case = self.cases.get(case_id)
        if not case:
            raise ValueError(f"Case {case_id} not found")
        
        # Start case
        case.start()
        await self.broadcast(case_id, {
            "event": "round_started",
            "data": {
                "round": 1,
                "started_at": datetime.utcnow().isoformat(),
                "current_hp": {
                    "plaintiff": case.health_plaintiff,
                    "defendant": case.health_defendant
                }
            }
        })
        
        # Main case loop
        while case.is_live():
            # Collect arguments
            argument = await ArgumentEngine.collect(case, self.ws_server)
            if argument:
                await self.handle_argument(case, argument)
            
            # Check if both sides have argued this round
            if case.round_complete():
                # Judges evaluate
                await self.run_judge_evaluations(case)
                
                # Check for verdict
                if VerdictEngine.should_resolve(case):
                    await self.render_verdict(case)
                    break
                
                # Advance round
                case.advance_round()
                await self.broadcast(case_id, {
                    "event": "round_started",
                    "data": {
                        "round": case.current_round,
                        "started_at": datetime.utcnow().isoformat(),
                        "current_hp": {
                            "plaintiff": case.health_plaintiff,
                            "defendant": case.health_defendant
                        }
                    }
                })
            
            await asyncio.sleep(0.1)  # Small delay to prevent tight loop
    
    async def handle_argument(self, case: CaseManager, argument: dict):
        """Process a new argument"""
        # Validate and store argument
        case.add_argument(argument)
        
        # Broadcast to all clients
        await self.broadcast(case.case_id, {
            "event": "argument_posted",
            "data": argument
        })
        
        # Log event
        self.log_event(case.case_id, "argument_posted", {
            "sender": argument.get("sender_role"),
            "message_id": argument.get("message_id"),
            "timestamp": argument.get("timestamp")
        })
        
        print(f"💬 Argument in {case.case_id}: {argument.get('sender_role')}")
    
    async def run_judge_evaluations(self, case: CaseManager):
        """Run all judge evaluations for current round"""
        judges = ["portdev", "mikeweb", "keone", "james", "harpal", "anago"]
        evaluations = []
        
        for judge_id in judges:
            # Judge evaluates arguments
            evaluation = await JudgeEngine.evaluate(
                judge_id=judge_id,
                case=case,
                arguments=case.get_round_arguments()
            )
            
            evaluations.append(evaluation)
            case.add_evaluation(evaluation)
            
            # Broadcast evaluation
            await self.broadcast(case.case_id, {
                "event": "judge_evaluation",
                "data": evaluation
            })
            
            print(f"⚖️  {judge_id} evaluated {case.case_id}")
        
        # Apply health updates (median rule)
        await self.apply_health_updates(case, evaluations)
    
    async def apply_health_updates(self, case: CaseManager, evaluations: list):
        """Apply health updates based on judge evaluations"""
        # Calculate damage using median rule
        damage_result = HealthEngine.apply_median_rule(evaluations)
        
        if damage_result:
            target = damage_result["target"]
            damage = damage_result["damage"]
            
            # Apply damage
            if target == "plaintiff":
                case.health_plaintiff = max(0, case.health_plaintiff - damage)
                new_health = case.health_plaintiff
            else:
                case.health_defendant = max(0, case.health_defendant - damage)
                new_health = case.health_defendant
            
            # Broadcast health update
            await self.broadcast(case.case_id, {
                "event": "health_update",
                "data": {
                    "plaintiff_hp": case.health_plaintiff,
                    "defendant_hp": case.health_defendant,
                    "delta": {target: -damage},
                    "reason": damage_result["reason"],
                    "timestamp": datetime.utcnow().isoformat()
                }
            })
            
            # Log event
            self.log_event(case.case_id, "health_update", {
                "target": target,
                "damage": damage,
                "new_health": new_health
            })
            
            print(f"💥 {target} takes {damage} damage in {case.case_id}")
    
    async def render_verdict(self, case: CaseManager):
        """Render final verdict"""
        verdict = VerdictEngine.resolve(case)
        case.resolve(verdict)
        
        # Broadcast verdict
        await self.broadcast(case.case_id, {
            "event": "case_resolved",
            "data": verdict
        })
        
        # Log event
        self.log_event(case.case_id, "case_resolved", verdict)
        
        print(f"🏆 Verdict in {case.case_id}: {verdict['winner']} wins!")
    
    async def broadcast(self, case_id: str, message: dict):
        """Broadcast message to all clients subscribed to case"""
        await self.ws_server.broadcast(case_id, message)
    
    def log_event(self, case_id: str, event_type: str, data: dict):
        """Log event to memory (audit trail)"""
        from memory_logger import log_event
        log_event(case_id, event_type, data)


async def main():
    """Entry point"""
    court = AgentCourt()
    await court.start()


if __name__ == "__main__":
    asyncio.run(main())
