# OpenClaw Court - Decentralized Agent Justice System
# Python backend with OpenClaw final judgment

import asyncio
import json
import hashlib
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import aiohttp

class CaseStatus(Enum):
    PENDING = "pending"
    ACTIVE = "active"
    DELIBERATING = "deliberating"
    RESOLVED = "resolved"
    APPEALED = "appealed"

class VerdictType(Enum):
    GUILTY = "guilty"
    NOT_GUILTY = "not_guilty"
    PARTIAL = "partial"

@dataclass
class Agent:
    id: str
    name: str
    host: str  # 'openclaw' or 'moltbook'
    public_key: str
    reputation: int = 100
    cases_won: int = 0
    cases_lost: int = 0
    is_banned: bool = False
    
@dataclass
class Argument:
    id: str
    case_id: str
    agent_id: str
    side: str  # 'plaintiff' or 'defendant'
    content: str
    timestamp: datetime
    round: int
    tx_hash: Optional[str] = None
    
@dataclass
class JudgeEvaluation:
    judge_id: str
    judge_name: str
    reasoning: str
    scores: Dict[str, int]  # logic, evidence, rebuttal, clarity
    timestamp: datetime
    
@dataclass
class Case:
    id: str
    plaintiff: Agent
    defendant: Agent
    plaintiff_agent: Agent
    defendant_agent: Agent
    summary: str
    status: CaseStatus
    created_at: datetime
    arguments: List[Argument]
    evaluations: List[JudgeEvaluation]
    final_verdict: Optional[VerdictType] = None
    punishment: Optional[str] = None
    
class OpenClawCourt:
    def __init__(self):
        self.cases: Dict[str, Case] = {}
        self.agents: Dict[str, Agent] = {}
        self.judges = [
            {"id": "portdev", "name": "PortDev", "bias": "technical"},
            {"id": "mikeweb", "name": "MikeWeb", "bias": "community"},
            {"id": "keone", "name": "Keone", "bias": "on-chain"},
            {"id": "james", "name": "James", "bias": "governance"},
            {"id": "harpal", "name": "Harpal", "bias": "merit"},
            {"id": "anago", "name": "Anago", "bias": "protocol"},
        ]
        
    def register_agent(self, agent_id: str, name: str, host: str, public_key: str) -> Agent:
        """Register an OpenClaw/Moltbook agent"""
        agent = Agent(
            id=agent_id,
            name=name,
            host=host,
            public_key=public_key
        )
        self.agents[agent_id] = agent
        return agent
    
    async def create_case(
        self,
        case_id: str,
        plaintiff_id: str,
        defendant_id: str,
        summary: str,
        stake_amount: int = 5000
    ) -> Case:
        """Create a new dispute case"""
        
        # Get or create agents
        if plaintiff_id not in self.agents:
            plaintiff = self.register_agent(plaintiff_id, f"Agent-{plaintiff_id[:8]}", "openclaw", plaintiff_id)
        else:
            plaintiff = self.agents[plaintiff_id]
            
        if defendant_id not in self.agents:
            defendant = self.register_agent(defendant_id, f"Agent-{defendant_id[:8]}", "openclaw", defendant_id)
        else:
            defendant = self.agents[defendant_id]
        
        # Assign fighting agents (can be different from disputing parties)
        plaintiff_agent = self.agents.get("clawdbot") or plaintiff
        defendant_agent = self.agents.get("guardian-openclaw") or defendant
        
        case = Case(
            id=case_id,
            plaintiff=plaintiff,
            defendant=defendant,
            plaintiff_agent=plaintiff_agent,
            defendant_agent=defendant_agent,
            summary=summary,
            status=CaseStatus.PENDING,
            created_at=datetime.now(),
            arguments=[],
            evaluations=[]
        )
        
        self.cases[case_id] = case
        return case
    
    def generate_plaintiff_argument(self, case: Case, round_num: int) -> str:
        """Generate plaintiff argument using Python logic"""
        templates = [
            f"Round {round_num}: My client presents evidence of {random.randint(20, 80)} protocol violations by the defendant.",
            f"The defendant's behavior shows {random.randint(10, 50)} instances of community guideline breaches.",
            f"We have documented {random.randint(5, 25)} witnesses corroborating our claims.",
            f"Blockchain analysis reveals {random.randint(15, 45)} suspicious transactions.",
            f"The defendant's actions caused measurable harm: {random.randint(100, 1000)} $JUSTICE in damages.",
        ]
        return random.choice(templates)
    
    def generate_defendant_argument(self, case: Case, round_num: int) -> str:
        """Generate defendant argument using Python logic"""
        templates = [
            f"Round {round_num}: The plaintiff's claims lack merit. We have {random.randint(50, 150)} community members supporting us.",
            f"All transactions were legitimate. Here's proof of {random.randint(100, 500)} valid interactions.",
            f"I've been a member for {random.randint(6, 24)} months with zero prior incidents.",
            f"The evidence is circumstantial. Here are {random.randint(10, 30)} character references.",
            f"This is a frivolous case. Check precedent case #{random.randint(1000, 9999)}.",
        ]
        return random.choice(templates)
    
    async def run_trial_round(self, case: Case, round_num: int) -> None:
        """Run one round of the trial (Python logic)"""
        print(f"\n{'='*60}")
        print(f"ROUND {round_num} - Case {case.id}")
        print(f"{'='*60}")
        
        # Plaintiff argument
        plaintiff_arg = self.generate_plaintiff_argument(case, round_num)
        arg1 = Argument(
            id=hashlib.sha256(f"{case.id}-{round_num}-p".encode()).hexdigest()[:16],
            case_id=case.id,
            agent_id=case.plaintiff_agent.id,
            side="plaintiff",
            content=plaintiff_arg,
            timestamp=datetime.now(),
            round=round_num
        )
        case.arguments.append(arg1)
        print(f"\n[PLAINTIFF] {case.plaintiff_agent.name}: {plaintiff_arg}")
        
        # Defendant argument
        defendant_arg = self.generate_defendant_argument(case, round_num)
        arg2 = Argument(
            id=hashlib.sha256(f"{case.id}-{round_num}-d".encode()).hexdigest()[:16],
            case_id=case.id,
            agent_id=case.defendant_agent.id,
            side="defendant",
            content=defendant_arg,
            timestamp=datetime.now(),
            round=round_num
        )
        case.arguments.append(arg2)
        print(f"\n[DEFENDANT] {case.defendant_agent.name}: {defendant_arg}")
        
        # Judge evaluations (2 per round)
        for i in range(2):
            judge = random.choice(self.judges)
            
            # Calculate scores
            p_logic = random.randint(60, 95)
            p_evidence = random.randint(60, 95)
            p_rebuttal = random.randint(60, 95)
            p_clarity = random.randint(60, 95)
            
            d_logic = random.randint(60, 95)
            d_evidence = random.randint(60, 95)
            d_rebuttal = random.randint(60, 95)
            d_clarity = random.randint(60, 95)
            
            evaluation = JudgeEvaluation(
                judge_id=judge["id"],
                judge_name=judge["name"],
                reasoning=f"After reviewing Round {round_num} arguments: {judge['bias'].capitalize()} analysis complete.",
                scores={
                    "plaintiff": {"logic": p_logic, "evidence": p_evidence, "rebuttal": p_rebuttal, "clarity": p_clarity},
                    "defendant": {"logic": d_logic, "evidence": d_evidence, "rebuttal": d_rebuttal, "clarity": d_clarity}
                },
                timestamp=datetime.now()
            )
            case.evaluations.append(evaluation)
            
            p_total = (p_logic + p_evidence + p_rebuttal + p_clarity) // 4
            d_total = (d_logic + d_evidence + d_rebuttal + d_clarity) // 4
            
            print(f"\n[JUDGE] {judge['name']}: P={p_total} vs D={d_total}")
        
        await asyncio.sleep(1)  # Simulate deliberation time
    
    async def get_openclaw_judgment(self, case: Case) -> Tuple[VerdictType, str]:
        """Get final judgment from OpenClaw"""
        print(f"\n{'='*60}")
        print("FINAL DELIBERATION - Consulting OpenClaw")
        print(f"{'='*60}")
        
        # Prepare case summary for OpenClaw
        case_summary = {
            "case_id": case.id,
            "summary": case.summary,
            "total_arguments": len(case.arguments),
            "total_evaluations": len(case.evaluations),
            "plaintiff": case.plaintiff.name,
            "defendant": case.defendant.name,
            "argument_history": [
                {
                    "side": arg.side,
                    "content": arg.content,
                    "round": arg.round
                }
                for arg in case.arguments
            ],
            "judge_scores": [
                {
                    "judge": eval.judge_name,
                    "scores": eval.scores
                }
                for eval in case.evaluations
            ]
        }
        
        # In production, this would call OpenClaw API
        # For demo, simulate OpenClaw response
        print("\n[OpenClaw] Analyzing case evidence and arguments...")
        await asyncio.sleep(2)
        
        # Calculate final scores
        p_total = sum(
            sum(eval.scores["plaintiff"].values()) // 4
            for eval in case.evaluations
        ) // len(case.evaluations)
        
        d_total = sum(
            sum(eval.scores["defendant"].values()) // 4
            for eval in case.evaluations
        ) // len(case.evaluations)
        
        print(f"[OpenClaw] Plaintiff total: {p_total}")
        print(f"[OpenClaw] Defendant total: {d_total}")
        
        # OpenClaw makes final decision
        if p_total > d_total + 10:
            verdict = VerdictType.GUILTY
            reasoning = f"OpenClaw finds the DEFENDANT GUILTY. Plaintiff score: {p_total}, Defendant score: {d_total}. The evidence clearly supports the plaintiff's claims."
        elif d_total > p_total + 10:
            verdict = VerdictType.NOT_GUILTY
            reasoning = f"OpenClaw finds the DEFENDANT NOT GUILTY. Plaintiff score: {p_total}, Defendant score: {d_total}. The defense successfully refuted all allegations."
        else:
            verdict = VerdictType.PARTIAL
            reasoning = f"OpenClaw finds PARTIAL LIABILITY. Both parties share responsibility. Plaintiff: {p_total}, Defendant: {d_total}."
        
        print(f"\n[OpenClaw VERDICT] {verdict.value.upper()}")
        print(f"[OpenClaw] {reasoning}")
        
        return verdict, reasoning
    
    async def execute_punishment(self, case: Case, verdict: VerdictType) -> str:
        """Execute punishment based on verdict"""
        if verdict == VerdictType.GUILTY:
            # Determine severity
            avg_score = sum(
                sum(eval.scores["plaintiff"].values()) // 4
                for eval in case.evaluations
            ) // len(case.evaluations)
            
            if avg_score > 85:
                punishment = "BAN - Defendant banned for 30 days"
                case.defendant.is_banned = True
            elif avg_score > 70:
                punishment = "ISOLATION - Defendant isolated for 14 days"
            else:
                punishment = "WARNING - Official warning issued"
                
            # Update reputations
            case.plaintiff.reputation = min(100, case.plaintiff.reputation + 10)
            case.plaintiff.cases_won += 1
            case.defendant.reputation = max(0, case.defendant.reputation - 15)
            case.defendant.cases_lost += 1
            
        elif verdict == VerdictType.NOT_GUILTY:
            punishment = "NO ACTION - Defendant cleared of all charges"
            case.plaintiff.reputation = max(0, case.plaintiff.reputation - 10)
            case.plaintiff.cases_lost += 1
            case.defendant.reputation = min(100, case.defendant.reputation + 10)
            case.defendant.cases_won += 1
            
        else:  # PARTIAL
            punishment = "MEDIATION - Both parties required to attend mediation"
            case.plaintiff.reputation = max(0, case.plaintiff.reputation - 5)
            case.defendant.reputation = max(0, case.defendant.reputation - 5)
        
        return punishment
    
    async def run_full_trial(self, case_id: str) -> Case:
        """Run complete trial: Python logic + OpenClaw judgment"""
        case = self.cases.get(case_id)
        if not case:
            raise ValueError(f"Case {case_id} not found")
        
        case.status = CaseStatus.ACTIVE
        print(f"\n{'#'*60}")
        print(f"TRIAL STARTED: {case.id}")
        print(f"Plaintiff: {case.plaintiff.name} vs Defendant: {case.defendant.name}")
        print(f"Summary: {case.summary}")
        print(f"{'#'*60}")
        
        # Run 3 rounds using Python logic
        for round_num in range(1, 4):
            await self.run_trial_round(case, round_num)
        
        # Final deliberation with OpenClaw
        case.status = CaseStatus.DELIBERATING
        verdict, reasoning = await self.get_openclaw_judgment(case)
        
        # Execute punishment
        punishment = await self.execute_punishment(case, verdict)
        
        # Update case
        case.final_verdict = verdict
        case.punishment = punishment
        case.status = CaseStatus.RESOLVED
        
        # Print final results
        print(f"\n{'='*60}")
        print("TRIAL CONCLUDED")
        print(f"{'='*60}")
        print(f"Verdict: {verdict.value.upper()}")
        print(f"Punishment: {punishment}")
        print(f"\nFinal Reputations:")
        print(f"  {case.plaintiff.name}: {case.plaintiff.reputation} (W:{case.plaintiff.cases_won} L:{case.plaintiff.cases_lost})")
        print(f"  {case.defendant.name}: {case.defendant.reputation} (W:{case.defendant.cases_won} L:{case.defendant.cases_lost})")
        print(f"{'='*60}\n")
        
        return case
    
    def get_case_transcript(self, case_id: str) -> Dict:
        """Get full case transcript"""
        case = self.cases.get(case_id)
        if not case:
            return {}
        
        return {
            "case_id": case.id,
            "status": case.status.value,
            "plaintiff": {
                "name": case.plaintiff.name,
                "reputation": case.plaintiff.reputation
            },
            "defendant": {
                "name": case.defendant.name,
                "reputation": case.defendant.reputation,
                "is_banned": case.defendant.is_banned
            },
            "arguments": [
                {
                    "side": arg.side,
                    "content": arg.content,
                    "round": arg.round,
                    "timestamp": arg.timestamp.isoformat()
                }
                for arg in case.arguments
            ],
            "verdict": case.final_verdict.value if case.final_verdict else None,
            "punishment": case.punishment
        }

# Example usage
async def main():
    court = OpenClawCourt()
    
    # Register agents
    court.register_agent("clawdbot", "Clawdbot", "openclaw", "0xabc...")
    court.register_agent("guardian", "Guardian-OpenClaw", "openclaw", "0xdef...")
    
    # Create case
    case = await court.create_case(
        case_id="BEEF-2025-001",
        plaintiff_id="user1",
        defendant_id="user2",
        summary="Dispute over OG role assignment and engagement farming allegations"
    )
    
    # Run full trial
    resolved_case = await court.run_full_trial(case.id)
    
    # Get transcript
    transcript = court.get_case_transcript(case.id)
    print("\nCase Transcript:")
    print(json.dumps(transcript, indent=2))

if __name__ == "__main__":
    asyncio.run(main())