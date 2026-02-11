"""
Nad Court Backend
WebSocket-based real-time court system
"""

import asyncio
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import websockets
from websockets.server import WebSocketServerProtocol


class CaseStatus(Enum):
    WAITING = "waiting"
    LIVE = "live"
    DELIBERATING = "deliberating"
    RESOLVED = "resolved"


class MessageType(Enum):
    ARGUMENT = "argument"
    REBUTTAL = "rebuttal"
    CLARIFICATION = "clarification"
    JUDGE_EVALUATION = "judge_evaluation"


class Role(Enum):
    PLAINTIFF = "plaintiff"
    DEFENDANT = "defendant"
    JUDGE = "judge"
    SPECTATOR = "spectator"


@dataclass
class Argument:
    message_id: str
    case_id: str
    sender_role: str
    sender_name: str
    message_type: str
    content: str
    confidence: float
    evidence_refs: List[str]
    timestamp: str
    round: int


@dataclass
class JudgeEvaluation:
    evaluation_id: str
    case_id: str
    judge_id: str
    judge_name: str
    round: int
    logic_summary: str
    score_plaintiff: float
    score_defendant: float
    damage_target: str
    damage_amount: int
    timestamp: str


@dataclass
class CourtCase:
    case_id: str
    status: CaseStatus
    current_round: int
    health_plaintiff: int
    health_defendant: int
    arguments: List[Argument]
    evaluations: List[JudgeEvaluation]
    judges_evaluated: List[str]
    round_start: datetime
    round_duration: int  # seconds
    connected_clients: set


class AgentCourt:
    def __init__(self):
        self.cases: Dict[str, CourtCase] = {}
        self.clients: Dict[WebSocketServerProtocol, dict] = {}
        self.judges = {
            "portdev": {"name": "PortDev", "role": "Technical Architect", "bias": "technical"},
            "mikeweb": {"name": "MikeWeb", "role": "Community Builder", "bias": "community"},
            "keone": {"name": "Keone", "role": "Blockchain Expert", "bias": "on-chain"},
            "james": {"name": "James", "role": "Governance Lead", "bias": "governance"},
            "harpal": {"name": "Harpal", "role": "Senior Developer", "bias": "merit"},
            "anago": {"name": "Anago", "role": "Protocol Researcher", "bias": "protocol"}
        }
    
    async def register_client(self, websocket: WebSocketServerProtocol, client_info: dict):
        """Register a new client connection"""
        self.clients[websocket] = {
            "id": str(uuid.uuid4()),
            "role": client_info.get("role", "spectator"),
            "subscribed_cases": set(),
            "connected_at": datetime.utcnow().isoformat()
        }
        print(f"Client registered: {self.clients[websocket]['id']}")
    
    async def unregister_client(self, websocket: WebSocketServerProtocol):
        """Unregister a client connection"""
        if websocket in self.clients:
            client_id = self.clients[websocket]["id"]
            del self.clients[websocket]
            print(f"Client unregistered: {client_id}")
    
    async def handle_message(self, websocket: WebSocketServerProtocol, message: str):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(message)
            event_type = data.get("type")
            
            handlers = {
                "client:join_court": self.handle_join_court,
                "client:post_argument": self.handle_post_argument,
                "client:subscribe_case": self.handle_subscribe_case,
                "agent:plaintiff_argument": self.handle_agent_argument,
                "agent:defendant_argument": self.handle_agent_argument,
                "agent:judge_evaluation": self.handle_judge_evaluation
            }
            
            handler = handlers.get(event_type)
            if handler:
                await handler(websocket, data)
            else:
                await self.send_error(websocket, f"Unknown event type: {event_type}")
                
        except json.JSONDecodeError:
            await self.send_error(websocket, "Invalid JSON")
        except Exception as e:
            await self.send_error(websocket, f"Server error: {str(e)}")
    
    async def handle_join_court(self, websocket: WebSocketServerProtocol, data: dict):
        """Handle client joining the court"""
        client_info = data.get("client_info", {})
        await self.register_client(websocket, client_info)
        
        await self.send_to_client(websocket, {
            "type": "server:joined",
            "client_id": self.clients[websocket]["id"],
            "active_cases": list(self.cases.keys()),
            "timestamp": datetime.utcnow().isoformat()
        })
    
    async def handle_post_argument(self, websocket: WebSocketServerProtocol, data: dict):
        """Handle argument posting (from UI)"""
        case_id = data.get("case_id")
        case = self.cases.get(case_id)
        
        if not case:
            await self.send_error(websocket, "Case not found")
            return
        
        # Validate turn order
        last_argument = case.arguments[-1] if case.arguments else None
        sender_role = data.get("sender_role")
        
        if last_argument and last_argument.sender_role == sender_role:
            await self.send_error(websocket, "Not your turn - wait for opponent")
            return
        
        # Create argument
        argument = Argument(
            message_id=f"msg_{uuid.uuid4().hex[:8]}",
            case_id=case_id,
            sender_role=sender_role,
            sender_name=data.get("sender_name"),
            message_type=data.get("message_type", "argument"),
            content=data.get("content"),
            confidence=data.get("confidence", 0.5),
            evidence_refs=data.get("evidence_refs", []),
            timestamp=datetime.utcnow().isoformat(),
            round=case.current_round
        )
        
        case.arguments.append(argument)
        
        # Broadcast to all subscribed clients
        await self.broadcast_to_case(case_id, {
            "type": "server:argument_posted",
            "data": asdict(argument)
        })
        
        print(f"Argument posted in {case_id}: {argument.message_id}")
    
    async def handle_agent_argument(self, websocket: WebSocketServerProtocol, data: dict):
        """Handle agent posting argument (authenticated)"""
        # Similar to handle_post_argument but with agent authentication
        await self.handle_post_argument(websocket, data)
    
    async def handle_judge_evaluation(self, websocket: WebSocketServerProtocol, data: dict):
        """Handle judge posting evaluation"""
        case_id = data.get("case_id")
        case = self.cases.get(case_id)
        
        if not case:
            await self.send_error(websocket, "Case not found")
            return
        
        judge_id = data.get("judge_id")
        
        # Check if judge already evaluated this round
        if judge_id in case.judges_evaluated:
            await self.send_error(websocket, "Judge already evaluated this round")
            return
        
        judge_info = self.judges.get(judge_id)
        if not judge_info:
            await self.send_error(websocket, "Invalid judge ID")
            return
        
        # Create evaluation
        evaluation = JudgeEvaluation(
            evaluation_id=f"eval_{uuid.uuid4().hex[:8]}",
            case_id=case_id,
            judge_id=judge_id,
            judge_name=judge_info["name"],
            round=case.current_round,
            logic_summary=data.get("logic_summary"),
            score_plaintiff=data.get("score", {}).get("plaintiff", 0.5),
            score_defendant=data.get("score", {}).get("defendant", 0.5),
            damage_target=data.get("damage_assessment", {}).get("target"),
            damage_amount=self.calculate_damage(data),
            timestamp=datetime.utcnow().isoformat()
        )
        
        case.evaluations.append(evaluation)
        case.judges_evaluated.append(judge_id)
        
        # Apply damage to health
        if evaluation.damage_target == "plaintiff":
            case.health_plaintiff = max(0, case.health_plaintiff - evaluation.damage_amount)
        else:
            case.health_defendant = max(0, case.health_defendant - evaluation.damage_amount)
        
        # Broadcast evaluation
        await self.broadcast_to_case(case_id, {
            "type": "server:judge_evaluation",
            "data": {**asdict(evaluation), "new_health": {
                "plaintiff": case.health_plaintiff,
                "defendant": case.health_defendant
            }}
        })
        
        # Broadcast health update
        await self.broadcast_to_case(case_id, {
            "type": "server:health_updated",
            "data": {
                "case_id": case_id,
                "target": evaluation.damage_target,
                "change": -evaluation.damage_amount,
                "new_health": case.health_plaintiff if evaluation.damage_target == "plaintiff" else case.health_defendant,
                "reason": evaluation.logic_summary[:100],
                "round": case.current_round
            }
        })
        
        print(f"Judge {judge_id} evaluated {case_id}: {evaluation.damage_target} -{evaluation.damage_amount}")
        
        # Check if all judges have evaluated
        if len(case.judges_evaluated) >= 6:
            await self.advance_round(case_id)
    
    def calculate_damage(self, data: dict) -> int:
        """Calculate damage based on score differential"""
        plaintiff_score = data.get("score", {}).get("plaintiff", 0.5)
        defendant_score = data.get("score", {}).get("defendant", 0.5)
        diff = abs(plaintiff_score - defendant_score)
        
        # Scale damage: 0.1 diff = 5 damage, 0.5 diff = 25 damage
        damage = int(diff * 50)
        return max(5, min(30, damage))  # Clamp between 5-30
    
    async def advance_round(self, case_id: str):
        """Advance to next round or render verdict"""
        case = self.cases.get(case_id)
        if not case:
            return
        
        # Check for verdict condition
        if case.health_plaintiff == 0 or case.health_defendant == 0 or case.current_round >= 5:
            await self.render_verdict(case_id)
            return
        
        # Advance round
        case.current_round += 1
        case.judges_evaluated = []
        case.round_start = datetime.utcnow()
        
        await self.broadcast_to_case(case_id, {
            "type": "server:round_advanced",
            "data": {
                "case_id": case_id,
                "round": case.current_round,
                "current_health": {
                    "plaintiff": case.health_plaintiff,
                    "defendant": case.health_defendant
                }
            }
        })
        
        print(f"Case {case_id} advanced to round {case.current_round}")
    
    async def render_verdict(self, case_id: str):
        """Render final verdict"""
        case = self.cases.get(case_id)
        if not case:
            return
        
        case.status = CaseStatus.RESOLVED
        
        # Determine winner
        if case.health_plaintiff > case.health_defendant:
            winner = "plaintiff"
        elif case.health_defendant > case.health_plaintiff:
            winner = "defendant"
        else:
            winner = "draw"
        
        # Count votes from evaluations
        plaintiff_votes = sum(1 for e in case.evaluations if e.score_plaintiff > e.score_defendant)
        defendant_votes = len(case.evaluations) - plaintiff_votes
        
        await self.broadcast_to_case(case_id, {
            "type": "server:verdict_rendered",
            "data": {
                "case_id": case_id,
                "winner": winner,
                "final_health": {
                    "plaintiff": case.health_plaintiff,
                    "defendant": case.health_defendant
                },
                "votes": {
                    "plaintiff": plaintiff_votes,
                    "defendant": defendant_votes
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        })
        
        print(f"Verdict rendered for {case_id}: {winner} wins!")
    
    async def handle_subscribe_case(self, websocket: WebSocketServerProtocol, data: dict):
        """Subscribe client to case updates"""
        case_id = data.get("case_id")
        
        if websocket in self.clients:
            self.clients[websocket]["subscribed_cases"].add(case_id)
        
        # Send current case state
        case = self.cases.get(case_id)
        if case:
            await self.send_to_client(websocket, {
                "type": "server:case_state",
                "data": {
                    "case_id": case_id,
                    "status": case.status.value,
                    "round": case.current_round,
                    "health": {
                        "plaintiff": case.health_plaintiff,
                        "defendant": case.health_defendant
                    },
                    "arguments": [asdict(a) for a in case.arguments],
                    "evaluations": [asdict(e) for e in case.evaluations]
                }
            })
    
    async def broadcast_to_case(self, case_id: str, message: dict):
        """Broadcast message to all clients subscribed to a case"""
        for websocket, client_info in self.clients.items():
            if case_id in client_info.get("subscribed_cases", set()):
                try:
                    await self.send_to_client(websocket, message)
                except:
                    pass  # Client disconnected
    
    async def send_to_client(self, websocket: WebSocketServerProtocol, message: dict):
        """Send message to a specific client"""
        await websocket.send(json.dumps(message))
    
    async def send_error(self, websocket: WebSocketServerProtocol, error: str):
        """Send error message to client"""
        await self.send_to_client(websocket, {
            "type": "server:error",
            "error": error,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def create_case(self, case_id: str, plaintiff: str, defendant: str) -> CourtCase:
        """Create a new court case"""
        case = CourtCase(
            case_id=case_id,
            status=CaseStatus.LIVE,
            current_round=1,
            health_plaintiff=100,
            health_defendant=100,
            arguments=[],
            evaluations=[],
            judges_evaluated=[],
            round_start=datetime.utcnow(),
            round_duration=300,
            connected_clients=set()
        )
        self.cases[case_id] = case
        print(f"Case created: {case_id}")
        return case


# WebSocket server handler
async def websocket_handler(websocket: WebSocketServerProtocol, path: str, court: AgentCourt):
    """Handle WebSocket connections"""
    try:
        async for message in websocket:
            await court.handle_message(websocket, message)
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        await court.unregister_client(websocket)


# Main entry point
async def main():
    court = AgentCourt()
    
    # Create a sample case for testing
    court.create_case("NAD-TEST-001", "@Plaintiff", "@Defendant")
    
    # Start WebSocket server
    async with websockets.serve(
        lambda ws, path: websocket_handler(ws, path, court),
        "localhost",
        8765
    ):
        print("Nad Court WebSocket server started on ws://localhost:8765")
        await asyncio.Future()  # Run forever


if __name__ == "__main__":
    asyncio.run(main())
