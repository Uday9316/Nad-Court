"""
Tier 3 - Supreme NAD Court
Final authority, creates precedents, no appeals
"""

import json
from datetime import datetime
from typing import Dict, List, Optional

class SupremeNADCourt:
    """
    TIER 3: Supreme NAD Court
    - Final authority - NO APPEALS
    - Largest jury (15 members)
    - Highest stake requirement
    - Stronger AI model available
    - Sets binding precedents
    - Creates case law for lower courts
    """
    
    TIER = 3
    JURY_SIZE = 15
    APPEAL_STAKE = 50  # 50 MON (highest)
    CONVICTION_THRESHOLD = 0.75  # 75% required to convict
    MIN_PRECEDENT_CONFIDENCE = 90  # Only high-confidence rulings become precedent
    
    def __init__(self, court_system):
        self.system = court_system
        self.cases = {}
        self.precedents = self._load_precedents()
        self.decisions_made = 0
    
    def _load_precedents(self) -> List[Dict]:
        """Load existing precedents"""
        try:
            with open("precedent.json", "r") as f:
                data = json.load(f)
                return data.get("precedents", [])
        except:
            return []
    
    def _save_precedents(self):
        """Save precedents to file"""
        with open("precedent.json", "w") as f:
            json.dump({"precedents": self.precedents}, f, indent=2)
    
    def get_precedents(self, verdict_type: str = None) -> List[Dict]:
        """Get precedents, optionally filtered by verdict type"""
        if verdict_type:
            return [p for p in self.precedents if p["verdict"] == verdict_type]
        return self.precedents
    
    def find_applicable_precedent(self, evidence: str) -> Optional[Dict]:
        """
        Find precedent that applies to this case
        Lower courts use this to avoid AI calls!
        """
        evidence_lower = evidence.lower()
        
        for precedent in sorted(self.precedents, key=lambda x: x.get("weight", 0), reverse=True):
            # Simple keyword matching for demo
            # In production: use embeddings/semantic search
            keywords = precedent.get("keywords", [])
            matches = sum(1 for kw in keywords if kw in evidence_lower)
            
            if matches >= len(keywords) * 0.5:  # 50% keyword match
                return precedent
        
        return None
    
    def file_appeal(self, high_court_case_id: str, grounds: str, 
                   appellant: str, stake: float) -> Dict:
        """File appeal to Supreme Court (final appeal)"""
        high_case = self.system.memory["cases"].get(high_court_case_id)
        if not high_case:
            return {"error": "High Court case not found"}
        
        if high_case.get("tier") != 2:
            return {"error": "Can only appeal from High Court (Tier 2)"}
        
        if stake < self.APPEAL_STAKE:
            return {"error": f"Stake must be at least {self.APPEAL_STAKE} MON"}
        
        case_id = self.system.generate_case_id()
        
        case = {
            "id": case_id,
            "tier": self.TIER,
            "high_court_case_id": high_court_case_id,
            "original_case_id": high_case.get("original_case_id"),
            "defendant": high_case["defendant"],
            "appellant": appellant,
            "grounds": grounds,
            "stake": stake,
            "evidence": high_case["evidence"],
            "high_court_judgment": high_case.get("judgment"),
            "status": "supreme_appeal_filed",
            "created_at": datetime.now().isoformat(),
            "court_type": "supreme"
        }
        
        self.cases[case_id] = case
        self.system.memory["cases"][case_id] = case
        
        print(f"\n{'='*70}")
        print(f"👑 SUPREME COURT: FINAL APPEAL FILED")
        print(f"{'='*70}")
        print(f"📋 Supreme Case #{case_id}")
        print(f"   From High Court: {high_court_case_id}")
        print(f"   Original Case: {case.get('original_case_id', 'N/A')}")
        print(f"   Appellant: {appellant}")
        print(f"   Stake: {stake} MON (⚠️  HIGHEST RISK)")
        print(f"   ⚠️  WARNING: Supreme Court decisions are FINAL")
        print(f"   ⚠️  No further appeals possible")
        
        return case
    
    def judge(self, case_id: str) -> Dict:
        """
        Supreme Court judgment
        Can use strongest AI model (still only 1 call)
        """
        case = self.cases.get(case_id)
        if not case:
            return {"error": "Case not found"}
        
        print(f"\n{'='*70}")
        print(f"👑 SUPREME COURT: FINAL JUDGMENT")
        print(f"{'='*70}")
        print(f"⚖️  Case #{case_id}")
        print(f"   Using strongest AI model (single call)")
        print(f"   All precedents considered")
        
        # Check precedents first
        precedent = self.find_applicable_precedent(case["evidence"])
        if precedent:
            print(f"   📚 Binding precedent found: {precedent['case_id']}")
            print(f"      Rule: {precedent['rule'][:60]}...")
        
        # Single strongest AI call
        judgment = self.system.ai_judge_supreme(
            evidence=case["evidence"],
            precedent=precedent,
            high_court_judgment=case.get("high_court_judgment")
        )
        
        case["judgment"] = judgment
        case["precedent_considered"] = precedent["case_id"] if precedent else None
        case["status"] = "judged"
        
        print(f"\n   🏛️  FINAL VERDICT: {judgment['verdict'].upper()}")
        print(f"   Confidence: {judgment['confidence']}%")
        print(f"   Reasoning: {judgment['reasoning'][:100]}...")
        
        return judgment
    
    def jury_vote(self, case_id: str) -> Dict:
        """Full jury (15) with highest threshold (75%)"""
        case = self.cases.get(case_id)
        if not case:
            return {"error": "Case not found"}
        
        print(f"\n🧑‍⚖️  SUPREME COURT: {self.JURY_SIZE} jurors voting (75% threshold)")
        
        votes = self.system.jury_vote(
            case_id=case_id,
            jury_size=self.JURY_SIZE,
            tier="supreme",
            conviction_threshold=self.CONVICTION_THRESHOLD
        )
        
        case["jury_votes"] = votes
        case["status"] = "jury_complete"
        
        return votes
    
    def create_precedent(self, case: Dict) -> Optional[Dict]:
        """
        Create precedent from Supreme Court ruling
        Only high-confidence rulings become precedent
        """
        judgment = case["judgment"]
        
        if judgment["confidence"] < self.MIN_PRECEDENT_CONFIDENCE:
            print(f"   ⚠️  Confidence ({judgment['confidence']}%) too low for precedent")
            return None
        
        # Extract keywords from evidence
        evidence_lower = case["evidence"].lower()
        keywords = []
        
        # Simple keyword extraction
        important_terms = ["spam", "abuse", "malicious", "harassment", 
                          "threat", "doxxing", "repeated", "targeted"]
        for term in important_terms:
            if term in evidence_lower:
                keywords.append(term)
        
        precedent = {
            "case_id": case["id"],
            "verdict": judgment["verdict"],
            "rule": judgment["reasoning"],
            "weight": judgment["confidence"] / 100,
            "keywords": keywords,
            "created_at": datetime.now().isoformat(),
            "tier": 3,
            "court": "supreme"
        }
        
        self.precedents.append(precedent)
        self._save_precedents()
        
        print(f"\n📚 PRECEDENT CREATED")
        print(f"   Case: {precedent['case_id']}")
        print(f"   Rule: {precedent['rule'][:80]}...")
        print(f"   Weight: {precedent['weight']:.2f}")
        print(f"   Keywords: {', '.join(keywords)}")
        print(f"   ✅ Lower courts can now reference this instead of calling AI!")
        
        return precedent
    
    def execute(self, case_id: str) -> Dict:
        """Final execution - irreversible"""
        case = self.cases.get(case_id)
        if not case:
            return {"error": "Case not found"}
        
        print(f"\n{'='*70}")
        print(f"🔨 SUPREME COURT: FINAL EXECUTION")
        print(f"{'='*70}")
        
        jury_result = case["jury_votes"]
        guilty_ratio = jury_result["tally"]["guilty"] / self.JURY_SIZE
        
        if guilty_ratio < self.CONVICTION_THRESHOLD:
            case["status"] = "acquitted"
            case["punishment"] = {"type": "none"}
            case["final_verdict"] = "ACQUITTED"
            
            print(f"✅ SUPREME COURT: Defendant ACQUITTED")
            print(f"   Guilty votes: {guilty_ratio:.0%} (threshold: {self.CONVICTION_THRESHOLD:.0%})")
            print(f"   💰 Stake ({case['stake']} MON) returned")
            
            # Still create precedent for acquittal
            if case["judgment"]["confidence"] >= self.MIN_PRECEDENT_CONFIDENCE:
                self.create_precedent(case)
        else:
            # Determine final punishment
            punishment = self.system.calculate_punishment(
                verdict=case["judgment"]["verdict"],
                confidence=case["judgment"]["confidence"],
                tier="supreme"
            )
            
            case["punishment"] = punishment
            case["status"] = "executed"
            case["final_verdict"] = "CONVICTED"
            
            print(f"🔨 SUPREME COURT: Defendant CONVICTED")
            print(f"   Guilty votes: {guilty_ratio:.0%} (threshold: {self.CONVICTION_THRESHOLD:.0%})")
            print(f"   Punishment: {punishment['type']}")
            print(f"   💸 Stake ({case['stake']} MON) forfeited")
            print(f"   🔒 DECISION IS FINAL AND IRREVERSIBLE")
            
            # Create precedent
            precedent = self.create_precedent(case)
        
        case["executed_at"] = datetime.now().isoformat()
        self.decisions_made += 1
        
        return case
    
    def full_supreme_process(self, high_court_case_id: str, grounds: str,
                            appellant: str, stake: float) -> Dict:
        """Complete Supreme Court process"""
        print(f"\n{'='*70}")
        print(f"👑 TIER 3 - SUPREME NAD COURT (FINAL AUTHORITY)")
        print(f"{'='*70}")
        
        # 1. File appeal
        case = self.file_appeal(high_court_case_id, grounds, appellant, stake)
        if "error" in case:
            return case
        
        # 2. Judge (strongest model)
        judgment = self.judge(case["id"])
        
        # 3. Full jury vote
        votes = self.jury_vote(case["id"])
        
        # 4. Final execution
        result = self.execute(case["id"])
        
        print(f"\n{'='*70}")
        print(f"⚖️  SUPREME COURT: CASE CLOSED")
        print(f"{'='*70}")
        print(f"   Case: {case['id']}")
        print(f"   Final Verdict: {result.get('final_verdict', 'UNKNOWN')}")
        print(f"   Precedent: {'Created' if result.get('precedent_created') else 'N/A'}")
        print(f"   🚫 NO APPEALS POSSIBLE")
        
        return {
            "case_id": case["id"],
            "tier": 3,
            "high_court_case_id": high_court_case_id,
            "judgment": judgment,
            "jury_votes": votes,
            "result": result,
            "can_appeal": False,  # FINAL
            "final": True
        }