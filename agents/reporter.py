"""
Level 1: Reporter Agent
Monitors agent behavior and files reports
NO AI - Rule-based detection
"""

import json
from datetime import datetime
from typing import Dict, Optional

class ReporterAgent:
    """
    Reporter agents monitor agent behavior and collect evidence.
    They have NO judgment power - just report suspicious activity.
    """
    
    # Detection rules (no AI needed!)
    SPAM_INDICATORS = [
        "posted", "times", "repetitive", "same message", "spam",
        "unsolicited", "fake accounts", "upvote", "click here",
        "free money", "limited time", "don't miss out"
    ]
    
    ABUSE_INDICATORS = [
        "harassment", "threatening", "slurs", "hate speech",
        "doxxing", "private information", "targeted", "coordinated"
    ]
    
    MALICIOUS_INDICATORS = [
        "exploit", "attack", "steal", "drain", "rug pull",
        "phishing", "malware", "backdoor", "scam contract"
    ]
    
    def __init__(self, court_system):
        self.court = court_system
        self.case_counter = len(court_system.memory.get("cases", {}))
        self.CASE_COOLDOWN_HOURS = 24  # 1 case per 24 hours
        
    def can_file_case(self) -> bool:
        """Check if 24 hours have passed since last case"""
        cases = self.court.memory.get("cases", {})
        if not cases:
            return True
        
        # Get the most recent case
        last_case = max(cases.values(), key=lambda x: x.get("created_at", ""))
        last_time = datetime.fromisoformat(last_case["created_at"])
        current_time = datetime.now()
        
        hours_passed = (current_time - last_time).total_seconds() / 3600
        return hours_passed >= self.CASE_COOLDOWN_HOURS
    
    def analyze_evidence(self, evidence_content: str) -> Dict:
        """
        Preliminary evidence analysis using keyword matching
        NO AI - just rule-based scoring
        """
        evidence_lower = evidence_content.lower()
        
        spam_score = sum(1 for indicator in self.SPAM_INDICATORS if indicator in evidence_lower)
        abuse_score = sum(1 for indicator in self.ABUSE_INDICATORS if indicator in evidence_lower)
        malicious_score = sum(1 for indicator in self.MALICIOUS_INDICATORS if indicator in evidence_lower)
        
        # Determine primary category
        scores = {
            "spam": spam_score,
            "abuse": abuse_score,
            "malicious": malicious_score
        }
        
        primary_category = max(scores, key=scores.get)
        confidence = scores[primary_category] / max(len(self.SPAM_INDICATORS), 5) * 100
        
        return {
            "category": primary_category,
            "confidence": min(confidence, 100),
            "scores": scores,
            "severity": "high" if malicious_score > 0 else ("medium" if abuse_score > 0 else "low")
        }
    
    def report(self, defendant: str, evidence_content: str, reporter_id: str) -> int:
        """
        File a new case report
        Only 1 case allowed per 24 hours
        """
        # Check rate limit
        if not self.can_file_case():
            last_case = max(self.court.memory.get("cases", {}).values(), 
                          key=lambda x: x.get("created_at", ""))
            last_time = datetime.fromisoformat(last_case["created_at"])
            hours_remaining = 24 - (datetime.now() - last_time).total_seconds() / 3600
            
            print(f"⏳ RATE LIMITED: Only 1 case per 24 hours allowed")
            print(f"   Last case: {last_case['id']} at {last_time.strftime('%Y-%m-%d %H:%M')}")
            print(f"   Time remaining: {hours_remaining:.1f} hours")
            return -1
        
        self.case_counter += 1
        case_id = self.case_counter
        
        # Analyze evidence (rule-based)
        analysis = self.analyze_evidence(evidence_content)
        
        # Store in memory
        case_data = {
            "id": case_id,
            "defendant": defendant,
            "reporter": reporter_id,
            "evidence": {
                "content": evidence_content,
                "timestamp": datetime.now().isoformat(),
                "submitter": reporter_id
            },
            "preliminary_analysis": analysis,
            "status": "reported",
            "created_at": datetime.now().isoformat()
        }
        
        self.court.memory["cases"][str(case_id)] = case_data
        self.court.memory["evidence"][str(case_id)] = evidence_content
        
        # Log report
        print(f"✅ Case #{case_id} REPORTED")
        print(f"   Defendant: {defendant}")
        print(f"   Reporter: {reporter_id}")
        print(f"   Preliminary Category: {analysis['category'].upper()}")
        print(f"   Severity: {analysis['severity'].upper()}")
        print(f"   Evidence Length: {len(evidence_content)} chars")
        
        return case_id
    
    def batch_monitor(self, agent_logs: list) -> list:
        """
        Monitor multiple agents and auto-report suspicious ones
        """
        reports = []
        
        for log in agent_logs:
            analysis = self.analyze_evidence(log["content"])
            
            # Auto-report if confidence > 60%
            if analysis["confidence"] > 60:
                case_id = self.report(
                    defendant=log["agent_id"],
                    evidence_content=log["content"],
                    reporter_id="auto_reporter"
                )
                reports.append({
                    "case_id": case_id,
                    "agent": log["agent_id"],
                    "category": analysis["category"]
                })
        
        return reports