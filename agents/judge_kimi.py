"""
Level 2: Judge Agent
Uses AI ONCE per case to analyze evidence
This is the ONLY AI call in the entire system!
"""

import json
import os
from datetime import datetime
from typing import Optional, Dict

class JudgeAgent:
    """
    Judge Agent uses AI ONCE per case to analyze evidence.
    NO execution authority - just produces verdict and reasoning.
    """
    
    def __init__(self, court_system):
        self.court = court_system
        self.ai_calls_made = 0  # Track for cost monitoring
    
    def _call_ai(self, evidence: str) -> Dict:
        """
        Call AI (Kimi) ONCE per case
        This is the ONLY AI call in the entire Agent Court system!
        """
        # Simulated AI response for demo
        # In production, this would call the actual AI API
        
        evidence_lower = evidence.lower()
        
        # Simple heuristic for demo (production: actual AI call)
        if "spam" in evidence_lower or "posted" in evidence_lower and "times" in evidence_lower:
            return {
                "verdict": "spam",
                "reasoning": "Evidence shows repetitive unsolicited messaging, excessive posting frequency, and promotional content patterns consistent with spam behavior.",
                "confidence": 85
            }
        elif "harassment" in evidence_lower or "threatening" in evidence_lower or "doxxing" in evidence_lower:
            return {
                "verdict": "abuse",
                "reasoning": "Evidence demonstrates targeted harassment, threatening language, and potential doxxing attempts. Severity warrants immediate attention.",
                "confidence": 92
            }
        elif "exploit" in evidence_lower or "steal" in evidence_lower or "rug pull" in evidence_lower:
            return {
                "verdict": "malicious",
                "reasoning": "Evidence indicates malicious intent with potential financial harm, exploitation attempts, or fraudulent behavior.",
                "confidence": 95
            }
        else:
            return {
                "verdict": "safe",
                "reasoning": "Evidence does not clearly indicate policy violations. Behavior appears within acceptable bounds.",
                "confidence": 70
            }
    
    def analyze(self, case_id: int) -> Optional[Dict]:
        """
        Analyze evidence using AI ONCE
        """
        case_data = self.court.memory["cases"].get(str(case_id))
        if not case_data:
            print(f"❌ Case {case_id} not found")
            return None
        
        evidence = case_data["evidence"]["content"]
        
        print(f"🤖 AI ANALYSIS STARTING...")
        print(f"   Case ID: {case_id}")
        print(f"   Defendant: {case_data['defendant']}")
        print(f"   Evidence preview: {evidence[:100]}...")
        
        # THE ONLY AI CALL! ⚡
        ai_result = self._call_ai(evidence)
        self.ai_calls_made += 1
        
        # Format judgment
        judgment = {
            "case_id": case_id,
            "verdict": ai_result["verdict"],
            "reasoning": ai_result["reasoning"],
            "confidence": ai_result["confidence"],
            "timestamp": datetime.now().isoformat(),
            "ai_call_number": self.ai_calls_made
        }
        
        # Store in memory
        self.court.memory["judgments"][str(case_id)] = judgment
        
        # Update case status
        self.court.memory["cases"][str(case_id)]["status"] = "judged"
        self.court.memory["cases"][str(case_id)]["judgment"] = judgment
        
        # Log judgment
        print(f"⚖️  JUDGMENT DELIVERED")
        print(f"   Verdict: {ai_result['verdict'].upper()}")
        print(f"   Confidence: {ai_result['confidence']}%")
        print(f"   AI Calls Made: {self.ai_calls_made} (Total system: {self.ai_calls_made})")
        print(f"   Reasoning: {ai_result['reasoning'][:150]}...")
        
        # Check for escalation (malicious + high confidence)
        if ai_result["verdict"] == "malicious" and ai_result["confidence"] > 90:
            print(f"⚠️  ESCALATED TO SUPREME COURT!")
            self.court.memory["cases"][str(case_id)]["status"] = "escalated"
            judgment["verdict"] = "escalated"
        
        return judgment
    
    def get_stats(self) -> Dict:
        """Get AI usage statistics"""
        return {
            "total_ai_calls": self.ai_calls_made,
            "cost_estimate_usd": self.ai_calls_made * 0.02,  # ~$0.02 per call
            "avg_confidence": self._calculate_avg_confidence()
        }
    
    def _calculate_avg_confidence(self) -> float:
        """Calculate average confidence of all judgments"""
        judgments = self.court.memory.get("judgments", {})
        if not judgments:
            return 0.0
        
        total_confidence = sum(j.get("confidence", 0) for j in judgments.values())
        return total_confidence / len(judgments)