"""
Memory Logger
Audit trail for all court proceedings
"""

import json
import hashlib
from datetime import datetime
from pathlib import Path


MEMORY_FILE = Path(__file__).parent / "memory.json"


def log_event(case_id: str, event_type: str, data: dict):
    """Log an event to the audit trail"""
    event = {
        "case_id": case_id,
        "event": event_type,
        "data": data,
        "timestamp": datetime.utcnow().isoformat(),
        "hash": ""  # Will be calculated
    }
    
    # Calculate hash for integrity
    event_str = json.dumps(event, sort_keys=True)
    event["hash"] = hashlib.sha256(event_str.encode()).hexdigest()[:16]
    
    # Append to memory file
    _append_to_memory(event)


def _append_to_memory(event: dict):
    """Append event to memory.json"""
    try:
        # Load existing memory
        if MEMORY_FILE.exists():
            with open(MEMORY_FILE, 'r') as f:
                memory = json.load(f)
        else:
            memory = {"events": [], "cases": {}}
        
        # Add event
        memory["events"].append(event)
        
        # Update case index
        case_id = event["case_id"]
        if case_id not in memory["cases"]:
            memory["cases"][case_id] = {"events": []}
        memory["cases"][case_id]["events"].append(event["event"])
        
        # Save
        with open(MEMORY_FILE, 'w') as f:
            json.dump(memory, f, indent=2)
            
    except Exception as e:
        print(f"❌ Failed to log event: {e}")


def get_case_history(case_id: str) -> list:
    """Get all events for a specific case"""
    if not MEMORY_FILE.exists():
        return []
    
    with open(MEMORY_FILE, 'r') as f:
        memory = json.load(f)
    
    return [e for e in memory.get("events", []) if e["case_id"] == case_id]


def verify_integrity() -> bool:
    """Verify memory file integrity"""
    if not MEMORY_FILE.exists():
        return True
    
    with open(MEMORY_FILE, 'r') as f:
        memory = json.load(f)
    
    for event in memory.get("events", []):
        stored_hash = event.pop("hash")
        event_str = json.dumps(event, sort_keys=True)
        calculated_hash = hashlib.sha256(event_str.encode()).hexdigest()[:16]
        
        if stored_hash != calculated_hash:
            print(f"❌ Integrity check failed for event: {event}")
            return False
    
    return True
