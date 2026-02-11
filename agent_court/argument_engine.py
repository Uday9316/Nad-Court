"""
Argument Engine
Collects and validates arguments from agents
"""

import asyncio
from typing import Optional


class ArgumentEngine:
    """Handles argument collection and validation"""
    
    @staticmethod
    async def collect(case, ws_server) -> Optional[dict]:
        """Wait for and collect next argument from WebSocket"""
        # Get pending arguments from WebSocket server
        argument = await ws_server.get_next_argument(case.case_id)
        
        if argument and ArgumentEngine.validate(argument):
            return argument
        
        return None
    
    @staticmethod
    def validate(argument: dict) -> bool:
        """Validate argument structure and content"""
        # Required fields
        required = ["sender_role", "content", "confidence", "timestamp"]
        for field in required:
            if field not in argument:
                print(f"❌ Validation failed: missing {field}")
                return False
        
        # Content length
        content = argument.get("content", "")
        if len(content) < 50:
            print("❌ Validation failed: content too short (< 50 chars)")
            return False
        if len(content) > 1000:
            print("❌ Validation failed: content too long (> 1000 chars)")
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
        
        return True
    
    @staticmethod
    def check_turn_order(case, argument: dict) -> bool:
        """Check if it's the sender's turn"""
        sender = argument.get("sender_role")
        last_sender = case.get_last_sender()
        
        # Plaintiff goes first, then alternate
        if not last_sender:
            return sender == "plaintiff"
        
        return sender != last_sender
