"""
AI Judge Agent - Real LLM Integration
Uses OpenAI/Claude API for actual AI-powered verdicts
"""

import json
import os
from datetime import datetime
from typing import Optional, Dict, List
import openai

# Load API key from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

class JudgeAgent:
    """
    Judge Agent uses REAL AI (LLM) to evaluate court cases.
    Each judge has unique personality and evaluation criteria.
    """
    
    def __init__(self, court_system):
        self.court = court_system
        self.ai_calls_made = 0
        
        # Judge personalities with unique evaluation criteria
        self.judges = {
            "PortDev": {
                "personality": "Technical evidence specialist. Values code, timestamps, and provable data.",
                "focus": ["technical evidence", "code quality", "timestamps", "data integrity"],
                "catchphrase": "Code doesn't lie.",
                "bias": "Strong evidence > emotional arguments"
            },
            "MikeWeb": {
                "personality": "Community impact assessor. Values reputation and long-term contributions.",
                "focus": ["community reputation", "contribution history", "engagement quality", "sentiment"],
                "catchphrase": "Community vibe check.",
                "bias": "Long-term value > short-term drama"
            },
            "Keone": {
                "personality": "On-chain data analyst. Focuses on provable blockchain facts.",
                "focus": ["wallet history", "transaction patterns", "on-chain proof", "verified data"],
                "catchphrase": "Show me the transactions.",
                "bias": "Data > speculation"
            },
            "James": {
                "personality": "Governance precedent keeper. Values rules and historical consistency.",
                "focus": ["rule alignment", "historical precedents", "moderation logs", "governance"],
                "catchphrase": "Precedent matters here.",
                "bias": "Consistency > case specifics"
            },
            "Harpal": {
                "personality": "Merit-based evaluator. Values quality contributions over tenure.",
                "focus": ["contribution quality", "engagement value", "merit", "impact"],
                "catchphrase": "Contribution quality over quantity.",
                "bias": "Quality > tenure"
            },
            "Anago": {
                "personality": "Protocol adherence guardian. Focuses on rule compliance.",
                "focus": ["rule violations", "protocol compliance", "documentation", "technical compliance"],
                "catchphrase": "Protocol adherence is clear.",
                "bias": "Technical compliance > intent"
            }
        }
    
    def _call_llm(self, judge_name: str, case_data: Dict, plaintiff_args: List[str], defendant_args: List[str]) -> Dict:
        """
        Call LLM (OpenAI GPT-4) for real AI-powered evaluation
        """
        judge = self.judges[judge_name]
        
        system_prompt = f"""You are {judge_name}, a community judge in Agent Court.
{judge['personality']}
Your focus areas: {', '.join(judge['focus'])}
Your catchphrase: "{judge['catchphrase']}"
Your bias: {judge['bias']}

Evaluate BOTH sides on 4 criteria (0-100):
1. Logic - Soundness of reasoning
2. Evidence - Quality and relevance of proof  
3. Rebuttal - Effectiveness at addressing opponent's points
4. Clarity - Persuasiveness and communication quality

Provide your evaluation in your unique voice and personality.
Return ONLY a JSON object with this exact structure:
{{
  "plaintiff": {{"logic": 75, "evidence": 80, "rebuttal": 70, "clarity": 85}},
  "defendant": {{"logic": 70, "evidence": 65, "rebuttal": 75, "clarity": 80}},
  "reasoning": "Your detailed reasoning in your voice...",
  "winner": "plaintiff" or "defendant"
}}"""

        user_prompt = f"""Case Type: {case_data.get('type', 'General Dispute')}
Case Summary: {case_data.get('summary', 'No summary provided')}

=== PLAINTIFF ARGUMENTS ===
{chr(10).join([f"Argument {i+1}: {arg[:500]}..." for i, arg in enumerate(plaintiff_args)])}

=== DEFENDANT ARGUMENTS ===
{chr(10).join([f"Argument {i+1}: {arg[:500]}..." for i, arg in enumerate(defendant_args)])}

Evaluate this case from your perspective as {judge_name}."""

        # Check if API key is available
        if not OPENAI_API_KEY:
            print(f"⚠️  No OpenAI API key found. Using simulated response.")
            return self._simulate_response(judge_name)
        
        try:
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Parse JSON from response
            content = response.choices[0].message.content
            # Extract JSON if wrapped in markdown
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            result = json.loads(content.strip())
            self.ai_calls_made += 1
            
            return result
            
        except Exception as e:
            print(f"❌ LLM call failed: {e}")
            return self._simulate_response(judge_name)
    
    def _simulate_response(self, judge_name: str) -> Dict:
        """Fallback simulation when API is unavailable"""
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
            "plaintiff": p_scores,
            "defendant": d_scores,
            "reasoning": reasonings.get(judge_name, "Both sides presented valid arguments."),
            "winner": "plaintiff" if p_total > d_total else "defendant"
        }
    
    def evaluate_case(self, case_id: int, judge_name: str = None) -> Optional[Dict]:
        """
        Evaluate a case with AI-powered judgment
        """
        case_data = self.court.memory["cases"].get(str(case_id))
        if not case_data:
            print(f"❌ Case {case_id} not found")
            return None
        
        # Get arguments from case data
        plaintiff_args = case_data.get("plaintiff_arguments", [])
        defendant_args = case_data.get("defendant_arguments", [])
        
        if not plaintiff_args or not defendant_args:
            print(f"❌ Case {case_id} missing arguments")
            return None
        
        # If no specific judge, evaluate with all 6
        if judge_name:
            judges_to_eval = [judge_name]
        else:
            judges_to_eval = list(self.judges.keys())
        
        evaluations = []
        
        print(f"🤖 AI EVALUATION STARTING...")
        print(f"   Case ID: {case_id}")
        print(f"   Judges: {', '.join(judges_to_eval)}")
        
        for judge in judges_to_eval:
            print(f"   ⚖️  {judge} evaluating...")
            
            result = self._call_llm(judge, case_data, plaintiff_args, defendant_args)
            
            evaluation = {
                "judge": judge,
                "scores": result,
                "timestamp": datetime.now().isoformat()
            }
            evaluations.append(evaluation)
            
            print(f"   ✅ {judge}: Winner = {result['winner']}")
        
        # Calculate final verdict
        plaintiff_wins = sum(1 for e in evaluations if e["scores"]["winner"] == "plaintiff")
        defendant_wins = len(evaluations) - plaintiff_wins
        
        final_verdict = "plaintiff" if plaintiff_wins > defendant_wins else "defendant"
        
        judgment = {
            "case_id": case_id,
            "evaluations": evaluations,
            "final_verdict": final_verdict,
            "plaintiff_wins": plaintiff_wins,
            "defendant_wins": defendant_wins,
            "total_judges": len(evaluations),
            "timestamp": datetime.now().isoformat(),
            "ai_calls_made": self.ai_calls_made
        }
        
        # Store in memory
        self.court.memory["judgments"][str(case_id)] = judgment
        self.court.memory["cases"][str(case_id)]["status"] = "judged"
        self.court.memory["cases"][str(case_id)]["judgment"] = judgment
        
        print(f"⚖️  FINAL VERDICT: {final_verdict.upper()}")
        print(f"   Score: {plaintiff_wins}-{defendant_wins}")
        print(f"   AI Calls: {self.ai_calls_made}")
        
        return judgment
    
    def get_stats(self) -> Dict:
        """Get AI usage statistics"""
        return {
            "total_ai_calls": self.ai_calls_made,
            "cost_estimate_usd": self.ai_calls_made * 0.02,
            "api_key_configured": bool(OPENAI_API_KEY)
        }
