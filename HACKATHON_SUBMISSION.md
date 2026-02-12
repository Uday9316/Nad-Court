# Agent Court - Hackathon Submission

## Project Overview

**Agent Court** is a decentralized AI justice system for the Monad blockchain where AI agents argue cases and render verdicts.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  Python Backend  │────▶│   AI Providers  │
│  (React/Vercel) │     │  (FastAPI/Flask) │     │ (OpenAI/Moonshot│
└─────────────────┘     └──────────────────┘     │  /OpenClaw)     │
                                                  └─────────────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │  LLM Inference  │
                                                  │  (GPT-4/Kimi)   │
                                                  └─────────────────┘
```

## AI Agent System

### 1. Argument Agents (Legal Advocates)

**JusticeBot-Alpha** (Plaintiff Agent)
- Role: Represents parties filing disputes
- System Prompt: Professional legal advocate persona
- Generates: Opening arguments, rebuttals, closing statements

**GuardianBot-Omega** (Defendant Agent)  
- Role: Represents parties responding to allegations
- System Prompt: Defense attorney persona
- Generates: Counter-arguments, evidence challenges, defenses

### 2. Judge Agents (Evaluators)

6 AI judges with unique personalities:

| Judge | Focus | Catchphrase |
|-------|-------|-------------|
| **PortDev** | Technical evidence | "Code doesn't lie" |
| **MikeWeb** | Community impact | "Community vibe check" |
| **Keone** | On-chain data | "Show me the transactions" |
| **James** | Governance precedent | "Precedent matters here" |
| **Harpal** | Merit-based | "Contribution quality over quantity" |
| **Anago** | Protocol adherence | "Protocol adherence is clear" |

### 3. 4-Criteria Scoring System

Each judge evaluates on:
1. **Logic** (25%) - Soundness of reasoning
2. **Evidence** (25%) - Quality of proof
3. **Rebuttal** (25%) - Addressing opponent
4. **Clarity** (25%) - Communication

## API Integration

### Configuration (.env)

```bash
# Choose AI Provider
AI_PROVIDER=openai  # or moonshot, nvidia, openclaw

# API Keys
OPENAI_API_KEY=sk-...
MOONSHOT_API_KEY=sk-...
NVIDIA_API_KEY=nvapi-...
OPENCLAW_API_KEY=sk-...
```

### LLM Call Structure

```python
# agents/ai_agents.py

def generate_argument(case_data, role):
    """Generate legal argument using LLM"""
    
    messages = [
        {"role": "system", "content": get_system_prompt(role)},
        {"role": "user", "content": build_context(case_data)}
    ]
    
    # Call LLM provider
    if AI_PROVIDER == "openai":
        return call_openai_api(messages)
    elif AI_PROVIDER == "moonshot":
        return call_moonshot_api(messages)
    # ... etc
```

## Smart Contract Integration

**Contract**: `0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458`
**Chain**: Monad Mainnet (Chain ID 143)

### Contract Functions

```solidity
// Submit case with stake
function submitCase(
    string calldata _caseType,
    address _defendant,
    string calldata _summary
) external payable;

// Submit AI-generated argument
function submitArgument(
    uint256 _caseId,
    bool _isPlaintiff,
    string calldata _content
) external;

// Submit judge evaluation
function submitJudgment(
    uint256 _caseId,
    address _judge,
    uint8[4] calldata _plaintiffScores,
    uint8[4] calldata _defendantScores,
    string calldata _reasoning
) external;

// Calculate verdict
function resolveCase(uint256 _caseId) external;
```

## Demo Mode

For hackathon presentation without live API costs:

```python
# Fallback to pre-generated AI content
if not API_KEY_CONFIGURED:
    return load_pre_generated_case(case_id)
```

Pre-generated cases include:
- ✅ AI-generated arguments (JusticeBot vs GuardianBot)
- ✅ AI-generated judge evaluations
- ✅ Realistic case scenarios
- ✅ Proper verdict calculations

## Running the Demo

```bash
# Install dependencies
pip install -r requirements.txt

# Run demo (uses fallback mode)
python demo_ai_court.py

# Run with live AI (requires API key)
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-...
python demo_ai_court.py
```

## Project Structure

```
AGENT_COURT_COMPLETE/
├── agents/
│   ├── ai_agents.py          # AI agent system
│   ├── judge_kimi.py         # Judge implementations
│   └── openclaw_bridge.py    # OpenClaw integration
├── contracts/
│   └── AgentCourt.sol        # Solidity smart contract
├── frontend/
│   └── src/                  # React frontend
├── bot/
│   ├── moltbook.js           # Social integration
│   └── twitter-oauth2.js
├── demo_ai_court.py          # Main demo
├── generate_cases.py         # AI content generator
├── SKILL.md                  # Project documentation
└── README.md                 # Setup instructions
```

## Hackathon Judging Criteria

✅ **AI Integration**: Real LLM calls (OpenAI/Moonshot/OpenClaw)
✅ **Blockchain**: Smart contract on Monad Mainnet
✅ **Innovation**: Novel AI-as-legal-advocate concept
✅ **Functionality**: Working demo at https://nad-court.vercel.app
✅ **Code Quality**: Clean, documented, extensible

## Future Enhancements

- Live AI integration with streaming arguments
- Appeal system to higher courts
- Token-gated jury participation
- Moltbook social integration
- Twitter/X auto-posting

## Credits

- **AI Model**: Moonshot Kimi K2.5 / OpenAI GPT-4
- **Blockchain**: Monad
- **Community Judges**: portdev, mikeweb, keone, james, harpal, anago
- **Built for**: Monad Hackathon

---

⚖️ *Real AI. Real Arguments. Real Justice.* ⚖️
