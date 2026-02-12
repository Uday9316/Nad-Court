"""
Argument Engine
Collects and validates arguments from agents
"""

import asyncio
import time
from typing import Optional


class ArgumentEngine:
    """Handles argument collection and validation"""
    
    # MoltCourt-inspired: Extended range for more detailed arguments
    MIN_LENGTH = 50
    MAX_LENGTH = 5000  # Increased from 1000
    ROUND_TIME_LIMIT = 300  # 5 minutes per argument (MoltCourt feature)
    
    @staticmethod
    async def collect(case, ws_server) -> Optional[dict]:
        """Wait for and collect next argument from WebSocket"""
        # Get pending arguments from WebSocket server
        argument = await ws_server.get_next_argument(case.case_id)
        
        if argument and ArgumentEngine.validate(argument, case):
            return argument
        
        return None
    
    @staticmethod
    def validate(argument: dict, case=None) -> bool:
        """Validate argument structure and content"""
        # Required fields
        required = ["sender_role", "content", "confidence", "timestamp"]
        for field in required:
            if field not in argument:
                print(f"❌ Validation failed: missing {field}")
                return False
        
        # Content length (MoltCourt: 50-5000 chars)
        content = argument.get("content", "")
        if len(content) < ArgumentEngine.MIN_LENGTH:
            print(f"❌ Validation failed: content too short (< {ArgumentEngine.MIN_LENGTH} chars)")
            return False
        if len(content) > ArgumentEngine.MAX_LENGTH:
            print(f"❌ Validation failed: content too long (> {ArgumentEngine.MAX_LENGTH} chars)")
            return False
        
        # Confidence range
        confidence = argument.get("confidence", 0)
        if not 0.0 <= confidence <= 1.0:
            print("❌ Validation failed: confidence out of range")
            return False
        
        # Sender role
        if argument.get("sender_role") not in ["plaintiff", "defendant"]:
            print("❌ Validation failed: invalid sender_role")
            return False
        
        # Check for prohibited references
        prohibited = ["health", "hp", "damage", "game", "win", "lose"]
        content_lower = content.lower()
        for word in prohibited:
            if word in content_lower:
                print(f"❌ Validation failed: prohibited word '{word}' in content")
                return False
        
        # MoltCourt-inspired: Check for repetition from previous rounds
        if case and ArgumentEngine.is_repetitive(argument, case):
            print("❌ Validation failed: repetitive argument (similar to previous)")
            return False
        
        return True
    
    @staticmethod
    def is_repetitive(argument: dict, case) -> bool:
        """Check if argument is too similar to previous ones (MoltCourt feature)"""
        content = argument.get("content", "").lower()
        sender = argument.get("sender_role")
        
        # Get previous arguments from same sender
        previous_args = [
            arg for arg in case.arguments 
            if arg.get("sender_role") == sender
        ]
        
        if not previous_args:
            return False
        
        # Simple check: if >70% of words are the same, it's repetitive
        current_words = set(content.split())
        
        for prev in previous_args[-2:]:  # Check last 2 arguments
            prev_words = set(prev.get("content", "").lower().split())
            
            if not prev_words:
                continue
            
            overlap = len(current_words & prev_words)
            similarity = overlap / len(prev_words)
            
            if similarity > 0.7:  # 70% same words = repetitive
                return True
        
        return False
    
    @staticmethod
    def check_turn_order(case, argument: dict) -> bool:
        """Check if it's the sender's turn"""
        sender = argument.get("sender_role")
        last_sender = case.get_last_sender()
        
        # Plaintiff goes first, then alternate
        if not last_sender:
            return sender == "plaintiff"
        
        return sender != last_sender
    
    @staticmethod
    def score_argument_quality(argument: dict) -> dict:
        """MoltCourt-inspired: Score argument on multiple criteria"""
        content = argument.get("content", "")
        
        scores = {
            "logic_reasoning": 0.0,      # 0-10
            "evidence_specificity": 0.0,  # 0-10
            "rebuttal_quality": 0.0,      # 0-10
            "clarity_persuasion": 0.0,    # 0-10
        }
        
        # Logic: Check for logical connectors
        logic_markers = ["because", "therefore", "thus", "consequently", "as a result"]
        logic_score = sum(1 for marker in logic_markers if marker in content.lower())
        scores["logic_reasoning"] = min(10, logic_score * 2 + 5)
        
        # Evidence: Check for specific data/references
        evidence_markers = ["exhibit", "data shows", "according to", "metric", "%", "TPS", "number"]
        evidence_score = sum(1 for marker in evidence_markers if marker in content.lower())
        scores["evidence_specificity"] = min(10, evidence_score * 2 + 3)
        
        # Rebuttal: Check for direct engagement
        rebuttal_markers = ["however", "contrary", "opponent", "defendant", "plaintiff", "claim"]
        rebuttal_score = sum(1 for marker in rebuttal_markers if marker in content.lower())
        scores["rebuttal_quality"] = min(10, rebuttal_score * 1.5 + 4)
        
        # Clarity: Length-based (not too short, not too long)
        length = len(content)
        if 200 <= length <= 1000:
            scores["clarity_persuasion"] = 8.0
        elif 100 <= length < 200:
            scores["clarity_persuasion"] = 6.0
        elif 1000 < length <= 2000:
            scores["clarity_persuasion"] = 7.0
        else:
            scores["clarity_persuasion"] = 5.0
        
        # Calculate total
        total = sum(scores.values()) / 4  # Average
        
        return {
            "criteria": scores,
            "total": round(total, 2),
            "feedback": ArgumentEngine.get_feedback(scores)
        }
    
    @staticmethod
    def get_feedback(scores: dict) -> str:
        """Generate feedback based on scores"""
        lowest = min(scores, key=scores.get)
        
        feedback_map = {
            "logic_reasoning": "Strengthen logical connectors",
            "evidence_specificity": "Add specific data or citations",
            "rebuttal_quality": "Address opponent's points more directly",
            "clarity_persuasion": "Improve structure and conciseness"
        }
        
        return feedback_map.get(lowest, "Good argument overall")
