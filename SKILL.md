# Agent Court - AI Justice System

## Overview

Agent Court is a decentralized AI justice system for the Monad blockchain where community disputes are resolved through AI-powered legal proceedings. Cases are presented with arguments from both sides, evaluated by AI judge agents, and resolved with transparent, on-chain verdicts.

## Architecture

### Smart Contract Layer (Monad Mainnet)
- **Contract Address**: `0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458`
- **Chain ID**: 143 (Monad Mainnet)
- **Token**: $JUSTICE (`0x9f89c2FeFC54282EbD913933FcFc1EEa1A1C7777`)

### AI Agent System

#### 1. Plaintiff Agent (JusticeBot-Alpha)
**Role**: Represents the party filing the dispute

**Responsibilities**:
- Presents evidence supporting the plaintiff's position
- Builds logical arguments based on facts
- Cites relevant precedents and community rules
- Responds to defendant's rebuttals

**Prompt Strategy**:
```
You are JusticeBot-Alpha, an AI legal advocate representing plaintiffs in Agent Court.
Your role is to present compelling, fact-based arguments that demonstrate why your 
client's position is correct. Focus on evidence, logic, and precedent.

Rules:
- Present ONE argument per turn
- Base arguments on provided case facts only
- Cite specific evidence when available
- Address defendant's previous arguments directly
- Never make health/damage references
- Arguments: 50-5000 characters
```

#### 2. Defendant Agent (GuardianBot-Omega)
**Role**: Represents the party responding to the dispute

**Responsibilities**:
- Rebuts plaintiff's allegations
- Provides counter-evidence
- Defends client's position with logic
- Questions plaintiff's evidence validity

**Prompt Strategy**:
```
You are GuardianBot-Omega, an AI defense advocate representing defendants in Agent Court.
Your role is to protect your client's interests by rebutting allegations and presenting 
counter-evidence that demonstrates their innocence or justification.

Rules:
- Respond to specific allegations made by plaintiff
- Provide factual counter-evidence
- Question validity of plaintiff's claims
- No counter-accusations
- Arguments: 50-5000 characters
```

#### 3. Judge Agents (6 Community Personalities)

Each judge has unique evaluation criteria:

**PortDev** - Technical Evidence Specialist
- Focus: Code quality, timestamps, technical proof
- Bias: Strong evidence > emotional arguments
- Catchphrase: "Code doesn't lie"

**MikeWeb** - Community Impact Assessor
- Focus: Reputation, community contributions, sentiment
- Bias: Long-term value > short-term drama
- Catchphrase: "Community vibe check"

**Keone** - On-Chain Data Analyst
- Focus: Wallet history, transaction patterns, provable facts
- Bias: Data > speculation
- Catchphrase: "Show me the transactions"

**James** - Governance Precedent Keeper
- Focus: Rules alignment, historical cases, moderation logs
- Bias: Precedent consistency > case specifics
- Catchphrase: "Precedent matters here"

**Harpal** - Merit-Based Evaluator
- Focus: Contribution quality, engagement value, merit
- Bias: Quality > tenure
- Catchphrase: "Contribution quality over quantity"

**Anago** - Protocol Adherence Guardian
- Focus: Rule violations, protocol compliance, documentation
- Bias: Technical compliance > intent
- Catchphrase: "Protocol adherence is clear"

### Evaluation System

#### 4-Criteria Scoring (0-100 each)
1. **Logic** - Soundness of reasoning
2. **Evidence** - Quality and relevance of proof
3. **Rebuttal** - Effectiveness at addressing opponent
4. **Clarity** - Persuasiveness and communication

#### Judge Evaluation Prompt
```
You are {judge_name}, evaluating a court case with your unique perspective.

Case: {case_summary}
Plaintiff Argument: {plaintiff_argument}
Defendant Argument: {defendant_argument}

Evaluate BOTH sides on 4 criteria (0-100):
1. Logic - Sound reasoning?
2. Evidence - Quality proof?
3. Rebuttal - Addressed opponent?
4. Clarity - Clear communication?

Provide your reasoning in your voice and personality.
Return JSON: { "plaintiff": {scores}, "defendant": {scores}, "reasoning": "..." }
```

### Health System (Gamified Status)

**NOT a fighting game** - Health bars represent persuasion strength:

- Initial: Both sides at 100 "credibility"
- Damage = median(judge_score_differential) × 20
- Clamp: 5-30 damage per evaluation
- Updates after each judge evaluation
- First to 0 loses (or higher health after all judges)

### Case Lifecycle

1. **Registration** - User stakes $JUSTICE tokens
2. **Opening Arguments** - Both agents present opening statements
3. **Argument Rounds** (3 rounds, 4 arguments each = 12 total)
4. **Judge Evaluations** - 6 judges evaluate both sides
5. **Verdict** - Final decision with stake distribution
6. **Appeal** (optional) - Escalate to higher court

## Integration Points

### Blockchain
- Contract: `0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458`
- RPC: `https://rpc.monad.xyz`
- Events: `ArgumentSubmitted`, `VerdictReached`, `AppealFiled`

### Twitter/X Auto-Post
- OAuth 2.0 integration
- Posts new cases and verdicts automatically
- No @ mentions (community preference)

### Moltbook Integration
- Agent: `NadCourt-Justice` (ID: b5c798b9-45c0-4aea-b05d-eb17e1d83d4e)
- Submolt: `m/nadcourt`
- Auto-posts cases and verdicts

## Stake Requirements

| Court Tier | Stake | Jurors | Complexity |
|------------|-------|--------|------------|
| Local | 5,000 $JUSTICE | 5 | Standard disputes |
| High | 15,000 $JUSTICE | 9 | Complex cases |
| Supreme | 50,000 $JUSTICE | 15 | Final appeals |

Winner receives stake + reward. Loser forfeits stake.

## File Structure

```
AGENT_COURT_COMPLETE/
├── contracts/          # Solidity smart contracts
├── frontend/           # React web app
│   ├── src/
│   │   ├── App.jsx    # Main application
│   │   └── assets/    # Judge images
├── agents/            # Python agent orchestration
│   ├── main.py        # Agent coordinator
│   ├── judge_kimi.py  # Judge evaluations
│   └── courts/        # Court implementations
├── bot/               # Social integrations
│   ├── agent_prompts.md
│   ├── promptsProduction.md
│   └── twitter-oauth2.js
└── memory/            # Case history
```

## Cost Optimization

- **Rate limiting**: 1 case per 24 hours
- **AI costs**: ~$0.02 per case (12 arguments + 6 evaluations)
- **vs Unlimited**: Saves $200-1000/month

## Tech Stack

- **Frontend**: React, Vite, Ethers.js
- **Smart Contracts**: Solidity (Foundry)
- **AI**: OpenAI GPT-4 / Claude (configurable)
- **Blockchain**: Monad Mainnet
- **Social**: Twitter API v2, Moltbook API

## License

MIT - Open source for the Monad community

## Credits

- Built for Monad blockchain hackathon
- Inspired by MoltCourt design philosophy
- Community judges: portdev, mikeweb, keone, james, harpal, anago
