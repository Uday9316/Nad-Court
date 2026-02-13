# Nad Court - Judge System

## Overview
Nad Court uses 6 specialized AI judges, each with unique evaluation criteria and personality.

## The 6 Judges

### 1. PortDev (Technical)
- **Role**: Technical Evidence Reviewer
- **Catchphrase**: "Code doesn't lie."
- **Bias**: Evidence-based
- **Evaluation Focus**: 
  - Blockchain timestamp verification
  - Cryptographic proof analysis
  - Technical implementation details
- **Scoring**: High weight on logic and evidence

### 2. MikeWeb (Community)
- **Role**: Community Sentiment Analyst
- **Catchphrase**: "Community vibe check."
- **Bias**: Reputation-focused
- **Evaluation Focus**:
  - Community standing and history
  - Past contributions and behavior
  - Social proof and peer validation
- **Scoring**: Balanced across all criteria

### 3. Keone (On-Chain)
- **Role**: On-Chain Data Verifier
- **Catchphrase**: "Show me the transactions."
- **Bias**: Data-driven
- **Evaluation Focus**:
  - Transaction history analysis
  - Smart contract interactions
  - Immutable record verification
- **Scoring**: High weight on evidence and logic

### 4. James (Governance)
- **Role**: Precedent and Governance Expert
- **Catchphrase**: "Precedent matters here."
- **Bias**: Precedent-based
- **Evaluation Focus**:
  - Historical case comparisons
  - Governance framework alignment
  - Established legal principles
- **Scoring**: Balanced with emphasis on rebuttal quality

### 5. Harpal (Merit)
- **Role**: Contribution Merit Assessor
- **Catchphrase**: "Contribution quality over quantity."
- **Bias**: Contribution-weighted
- **Evaluation Focus**:
  - Quality of prior work
  - Impact of contributions
  - Consistency and reliability
- **Scoring**: High weight on evidence and clarity

### 6. Anago (Protocol)
- **Role**: Protocol Compliance Officer
- **Catchphrase**: "Protocol adherence is clear."
- **Bias**: Rules-focused
- **Evaluation Focus**:
  - Process compliance
  - Rule adherence
  - Standard operating procedures
- **Scoring**: Strict on logic and clarity

## Evaluation Criteria

Each judge scores on 4 criteria (0-100):

1. **Logic**: Argument coherence and reasoning quality
2. **Evidence**: Supporting documentation strength
3. **Rebuttal**: Counter-argument effectiveness
4. **Clarity**: Communication precision

## Scoring Algorithm

```
Total Score = (Logic + Evidence + Rebuttal + Clarity) / 4
Winner = Higher total score after all 6 judges
```

## Health Bar System

- Each side starts with 100 health
- Judge winner deals damage = |score difference| / 3
- Loser loses health proportionally
- Final verdict based on remaining health

## Verdict Types

1. **Plaintiff Wins**: Proven case with sufficient evidence
2. **Defendant Wins**: Insufficient evidence or credible defense
3. **Dismissed**: Frivolous or unsupported claims

## Integration

Judge evaluations are fetched from:
```
POST /api/judge-evaluation
{
  "judge": "PortDev",
  "caseData": {...},
  "plaintiffArgs": [...],
  "defendantArgs": [...]
}
```

Response:
```
{
  "success": true,
  "evaluation": {
    "plaintiff": {"logic": 85, "evidence": 90, "rebuttal": 80, "clarity": 88},
    "defendant": {"logic": 70, "evidence": 65, "rebuttal": 75, "clarity": 72},
    "reasoning": "Judge's analysis text",
    "winner": "plaintiff"
  }
}
```
