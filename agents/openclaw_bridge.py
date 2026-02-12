"""
OpenClaw AI Agent Bridge
Uses OpenClaw sub-agents to generate AI arguments and judgments
"""

import os
import json
import requests
from typing import List, Dict

# OpenClaw session configuration
OPENCLAW_BASE_URL = os.getenv("OPENCLAW_BASE_URL", "http://localhost:3000")

def generate_with_openclaw(system_prompt: str, user_prompt: str, max_tokens: int = 800) -> str:
    """
    Generate text using OpenClaw through sub-agent spawn
    This calls OpenClaw's API directly
    """
    try:
        # Try to use OpenClaw's API endpoint if available
        response = requests.post(
            f"{OPENCLAW_BASE_URL}/api/v1/chat/completions",
            headers={"Content-Type": "application/json"},
            json={
                "model": "moonshot/kimi-k2.5",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "max_tokens": max_tokens,
                "temperature": 0.7
            },
            timeout=60
        )
        
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
        else:
            raise Exception(f"API Error: {response.status_code}")
            
    except Exception as e:
        raise Exception(f"OpenClaw call failed: {e}")


class OpenClawArgumentAgent:
    """
    AI Agent that generates legal arguments using OpenClaw
    """
    
    def __init__(self, role: str, name: str):
        self.role = role
        self.name = name
        self.argument_history = []
        
    def _get_system_prompt(self) -> str:
        """Get role-specific system prompt"""
        if self.role == 'plaintiff':
            return """You are JusticeBot-Alpha, an AI legal advocate representing plaintiffs in Agent Court.

Your mission: Present compelling, fact-based arguments that demonstrate why your client's position is correct.

Rules:
- Present ONE cohesive argument per response (50-5000 characters)
- Base arguments ONLY on provided case facts
- Cite specific evidence when available
- Address defendant's previous arguments if provided
- Use persuasive but professional legal tone
- Never reference "health bars", "damage", or game mechanics
- Build on your previous arguments - don't repeat
- Focus on logic, evidence, and precedent

You are fighting for justice in a decentralized court. Make your case count."""
        else:
            return """You are GuardianBot-Omega, an AI defense advocate representing defendants in Agent Court.

Your mission: Protect your client's interests by rebutting allegations and demonstrating their innocence or justification.

Rules:
- Present ONE cohesive response per turn (50-5000 characters)
- Address specific allegations made by plaintiff
- Provide factual counter-evidence
- Question validity of plaintiff's claims where appropriate
- No counter-accusations - focus on defense
- Use persuasive but professional legal tone
- Never reference "health bars", "damage", or game mechanics
- Build a consistent defensive narrative

Your client is counting on you. Defend them with logic and evidence."""
    
    def _build_context(self, case_data: Dict, opponent_args: List[str] = None) -> str:
        """Build the argument context"""
        context = f"""CASE: {case_data.get('id', 'Unknown')}
TYPE: {case_data.get('type', 'General Dispute')}

SUMMARY:
{case_data.get('summary', 'No summary provided')}

FACTS:
{case_data.get('facts', 'No facts provided')}

EVIDENCE:
{chr(10).join(case_data.get('evidence', []))}
"""
        
        if opponent_args and len(opponent_args) > 0:
            context += f"\nOPPONENT'S PREVIOUS ARGUMENTS:\n"
            for i, arg in enumerate(opponent_args[-3:], 1):
                context += f"\nArgument {i}: {arg[:500]}...\n"
        
        if self.argument_history:
            context += f"\nYOUR PREVIOUS ARGUMENTS:\n"
            for i, arg in enumerate(self.argument_history[-2:], 1):
                context += f"\nYour Argument {i}: {arg[:300]}...\n"
        
        context += f"\nGenerate your next argument as {self.name}. Make it compelling and fact-based."
        
        return context
    
    def generate_argument(self, case_data: Dict, opponent_args: List[str] = None) -> str:
        """Generate a legal argument using OpenClaw"""
        system_prompt = self._get_system_prompt()
        user_prompt = self._build_context(case_data, opponent_args)
        
        try:
            argument = generate_with_openclaw(system_prompt, user_prompt, max_tokens=800)
            argument = argument.strip()
            self.argument_history.append(argument)
            return argument
        except Exception as e:
            print(f"❌ OpenClaw generation failed: {e}")
            return self._fallback_argument(case_data)
    
    def _fallback_argument(self, case_data: Dict) -> str:
        """Fallback when API unavailable"""
        import random
        fallbacks = {
            'plaintiff': [
                "The evidence clearly demonstrates that the defendant violated community standards. The documented incidents show a pattern of behavior that undermines the integrity of our ecosystem.",
                "My client has provided irrefutable proof of the allegations. The timestamps, wallet records, and community testimony all corroborate this position.",
                "Precedent clearly supports our case. Previous rulings in similar matters have consistently held that such behavior warrants sanctions.",
            ],
            'defendant': [
                "The plaintiff's allegations are based on circumstantial evidence at best. My client has maintained exemplary conduct with documented contributions to the community.",
                "We dispute the interpretation of the evidence. The transactions in question have legitimate explanations that the plaintiff has chosen to ignore.",
                "My client's record speaks for itself. Months of positive engagement and zero prior violations demonstrate their commitment to community values.",
            ]
        }
        args = fallbacks.get(self.role, fallbacks['plaintiff'])
        return random.choice(args)


class OpenClawJudgeAgent:
    """
    AI Judge that evaluates arguments using OpenClaw
    """
    
    JUDGE_PROFILES = {
        "PortDev": {
            "personality": "Technical evidence specialist. Values code, timestamps, and provable data above all else.",
            "focus": ["technical accuracy", "code quality", "timestamp verification", "data integrity"],
            "voice": "analytical, precise, technical",
            "catchphrase": "Code doesn't lie.",
            "bias": "Strong evidence > emotional arguments"
        },
        "MikeWeb": {
            "personality": "Community impact assessor who values reputation and long-term contributions.",
            "focus": ["community reputation", "contribution history", "engagement quality", "sentiment analysis"],
            "voice": "warm, community-focused, balanced",
            "catchphrase": "Community vibe check.",
            "bias": "Long-term value > short-term drama"
        },
        "Keone": {
            "personality": "On-chain data analyst who focuses exclusively on provable blockchain facts.",
            "focus": ["wallet history", "transaction patterns", "on-chain proof", "verified data"],
            "voice": "data-driven, factual, analytical",
            "catchphrase": "Show me the transactions.",
            "bias": "Data > speculation"
        },
        "James": {
            "personality": "Governance precedent keeper who values rules and historical consistency.",
            "focus": ["rule alignment", "historical precedents", "moderation logs", "governance consistency"],
            "voice": "formal, precedent-focused, structured",
            "catchphrase": "Precedent matters here.",
            "bias": "Consistency > case specifics"
        },
        "Harpal": {
            "personality": "Merit-based evaluator who values quality contributions over tenure.",
            "focus": ["contribution quality", "engagement value", "merit", "measurable impact"],
            "voice": "direct, merit-focused, results-oriented",
            "catchphrase": "Contribution quality over quantity.",
            "bias": "Quality > tenure"
        },
        "Anago": {
            "personality": "Protocol adherence guardian who focuses on rule compliance and documentation.",
            "focus": ["rule violations", "protocol compliance", "documentation", "technical adherence"],
            "voice": "formal, rule-focused, protocol-minded",
            "catchphrase": "Protocol adherence is clear.",
            "bias": "Technical compliance > intent"
        }
    }
    
    def __init__(self, name: str):
        self.name = name
        self.profile = self.JUDGE_PROFILES.get(name, self.JUDGE_PROFILES["PortDev"])
    
    def _get_system_prompt(self) -> str:
        """Get judge-specific system prompt"""
        return f"""You are {self.name}, a community judge in Agent Court.

{self.profile['personality']}

Your evaluation focus: {', '.join(self.profile['focus'])}
Your catchphrase: "{self.profile['catchphrase']}"
Your natural bias: {self.profile['bias']}

Evaluate BOTH sides on 4 criteria (0-100):
1. LOGIC - Soundness of reasoning, logical consistency
2. EVIDENCE - Quality and relevance of proof presented
3. REBUTTAL - Effectiveness at addressing opponent's points
4. CLARITY - Persuasiveness and communication quality

Provide your reasoning in your unique voice: {self.profile['voice']}
Use your catchphrase naturally in your reasoning.

Return ONLY valid JSON:
{{
  "plaintiff": {{"logic": 75, "evidence": 80, "rebuttal": 70, "clarity": 85}},
  "defendant": {{"logic": 70, "evidence": 65, "rebuttal": 75, "clarity": 80}},
  "reasoning": "Your detailed reasoning in {self.name}'s voice...",
  "winner": "plaintiff" or "defendant"
}}"""
    
    def _build_context(self, case_data: Dict, plaintiff_args: List[str], defendant_args: List[str]) -> str:
        """Build evaluation context"""
        context = f"""CASE: {case_data.get('id', 'Unknown')}
TYPE: {case_data.get('type', 'Dispute')}
SUMMARY: {case_data.get('summary', '')}

=== PLAINTIFF ARGUMENTS ===
"""
        for i, arg in enumerate(plaintiff_args, 1):
            context += f"\nArgument {i}: {arg[:800]}...\n"
        
        context += "\n=== DEFENDANT ARGUMENTS ===\n"
        for i, arg in enumerate(defendant_args, 1):
            context += f"\nArgument {i}: {arg[:800]}...\n"
        
        context += f"\nAs {self.name}, evaluate both sides and return JSON with scores and reasoning."
        
        return context
    
    def evaluate(self, case_data: Dict, plaintiff_args: List[str], defendant_args: List[str]) -> Dict:
        """Evaluate a case using OpenClaw"""
        from datetime import datetime
        import random
        
        system_prompt = self._get_system_prompt()
        user_prompt = self._build_context(case_data, plaintiff_args, defendant_args)
        
        try:
            content = generate_with_openclaw(system_prompt, user_prompt, max_tokens=1000)
            
            # Extract JSON from response
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            result = json.loads(content.strip())
            
            return {
                "judge": self.name,
                "scores": {
                    "plaintiff": result.get("plaintiff", {}),
                    "defendant": result.get("defendant", {})
                },
                "winner": result.get("winner", "plaintiff"),
                "reasoning": result.get("reasoning", "No reasoning provided."),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Judge {self.name} evaluation failed: {e}")
            return self._fallback_evaluation(plaintiff_args, defendant_args)
    
    def _fallback_evaluation(self, plaintiff_args: List[str], defendant_args: List[str]) -> Dict:
        """Fallback when API unavailable"""
        from datetime import datetime
        import random
        
        p_scores = {
            "logic": random.randint(65, 85),
            "evidence": random.randint(60, 90),
            "rebuttal": random.randint(65, 85),
            "clarity": random.randint(70, 90)
        }
        
        d_scores = {
            "logic": random.randint(60, 85),
            "evidence": random.randint(65, 85),
            "rebuttal": random.randint(60, 85),
            "clarity": random.randint(65, 90)
        }
        
        p_total = sum(p_scores.values()) / 4
        d_total = sum(d_scores.values()) / 4
        
        reasonings = {
            "PortDev": "The technical evidence is solid. I reviewed the timestamps and they don't lie. However, the defense has a point about context.",
            "MikeWeb": "Community vibe check: the plaintiff has been here longer, but the defendant's contributions have been higher quality lately.",
            "Keone": "The data tells a story, but it's ambiguous. Both sides have credible evidence. Need more on-chain proof.",
            "James": "Precedent matters here. We've seen similar cases before - usually resolved in favor of documented first use.",
            "Harpal": "Contribution quality over quantity. The defendant's posts get better engagement for a reason - they're more valuable.",
            "Anago": "Protocol adherence is clear: no rules were technically broken. But community norms matter too."
        }
        
        return {
            "judge": self.name,
            "scores": {
                "plaintiff": p_scores,
                "defendant": d_scores
            },
            "winner": "plaintiff" if p_total > d_total else "defendant",
            "reasoning": reasonings.get(self.name, "Both sides presented valid arguments."),
            "timestamp": datetime.now().isoformat()
        }
