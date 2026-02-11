# 🏛️ Nad Court
## Decentralized AI Justice System for Moltiverse Hackathon

> A 3-tier hierarchical court system where autonomous agents judge other agents, with only ONE AI call per case.

![Nad Court](https://img.shields.io/badge/Moltiverse-Hackathon-purple)
![Monad](https://img.shields.io/badge/Monad-Mainnet-blue)
![AI](https://img.shields.io/badge/AI-Kimi-orange)

---

## 🎯 Key Innovation

**Only 1 AI call per case** — 95% Python logic, 5% AI usage. All decisions stored permanently on Monad blockchain.

```
Reporter → Judge (AI×1) → Jury → Execution → Appeal (Stake)
    │                                            │
    └────────── On-Chain Storage ────────────────┘
```

---

## 🏗️ Architecture

### 3-Tier Judicial System

```
┌─────────────────────────────────────────────────────────┐
│  TIER 3 👑 SUPREME NAD COURT                           │
│  • Final Authority (NO APPEALS)                        │
│  • 15 Jurors, 75% threshold, 50 MON stake              │
│  • Creates binding precedents                          │
│  • Strongest AI model                                  │
├─────────────────────────────────────────────────────────┤
│  TIER 2 ⚡ HIGH NAD COURT                              │
│  • Appeals from Local Court                            │
│  • 9 Jurors, 66% threshold, 15 MON stake               │
│  • Merit review (filters frivolous)                    │
│  • Optional AI re-analysis                             │
├─────────────────────────────────────────────────────────┤
│  TIER 1 📋 LOCAL NAD COURT                             │
│  • Default jurisdiction                                │
│  • 5 Jurors, 50% threshold, 5 MON stake                │
│  • Fast & cheap                                        │
│  • Light AI model (1 call)                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
agent-court/
├── contracts/
│   └── AgentCourt.sol          # On-chain smart contract
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Gamified React UI
│   │   └── App.css             # Phoenix Wright-style theme
│   ├── package.json
│   └── vercel.json             # Vercel deployment config
├── agents/
│   ├── main.py                 # 3-tier orchestrator
│   ├── reporter.py             # Level 1: Evidence collection
│   ├── judge_kimi.py           # Level 2: AI analysis (ONCE!)
│   ├── jury.py                 # Level 3: Rule-based voting
│   ├── execution.py            # Level 4: Punishment
│   ├── appeal.py               # Level 5: Appeals
│   └── courts/                 # Tier implementations
│       ├── local_court.py
│       ├── high_court.py
│       └── supreme_court.py
├── foundry.toml                # Foundry configuration
├── requirements.txt            # Python dependencies
├── deploy.sh                   # One-click deploy script
└── README.md                   # This file
```

---

## 🚀 Quick Deploy

### Option 1: One-Click Script

```bash
cd AGENT_COURT_COMPLETE
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deploy

#### Smart Contract (Monad Mainnet)

```bash
cd contracts

# Install Foundry if needed
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Create .env file
echo "PRIVATE_KEY=0x..." > .env
echo "RPC_URL=https://rpc.monad.xyz" >> .env

# Deploy
forge build --via-ir
forge create src/AgentCourt.sol:AgentCourt \
    --rpc-url https://rpc.monad.xyz \
    --private-key $PRIVATE_KEY \
    --chain 143 \
    --via-ir \
    --broadcast
```

#### Frontend (Vercel)

```bash
cd frontend
npm install
npm run build

# Install Vercel CLI
npm install -g vercel
vercel --prod
```

#### Python Agents

```bash
pip install -r requirements.txt
cd agents
python main.py
```

---

## 🎮 Frontend Features

- **Gamified Courtroom UI** — Phoenix Wright-style aesthetics
- **3-Tier Visualization** — See the full judicial hierarchy
- **Case Management** — Browse and interact with on-chain cases
- **Agent Hierarchy** — 7-level pyramid visualization
- **Appeals Flow** — Step-by-step appeal process
- **Mobile Responsive** — Works on all devices

---

## 💰 Cost Analysis

| Component | AI Calls | Cost |
|-----------|----------|------|
| Reporter | 0 | $0.00 (Rules) |
| Judge | **1** | ~$0.02 |
| Jury | 0 | $0.00 (Rules) |
| Execution | 0 | $0.00 (Rules) |
| Appeal | 0 | $0.00 (Rules) |
| **Total** | **1** | **~$0.02** |

**Traditional AI moderation:** $200-1000/month (1000 cases)  
**Nad Court:** ~$20/month (1000 cases)  
**Savings: 90%+**

---

## 📜 Smart Contract

**Deployed Address:** `0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458`

**Network:** Monad Mainnet (Chain ID: 143)

**Features:**
- ✅ 7-level agent hierarchy
- ✅ Case reporting & judgment
- ✅ Jury voting system
- ✅ Staking-based appeals
- ✅ Reputation tracking
- ✅ All decisions on-chain

**View on Explorer:** https://monadvision.com

---

## 🔗 Key Files Reference

### Contract (`contracts/AgentCourt.sol`)
- `registerAgent(address, uint8 level)` — Register agents
- `reportCase(address defendant, string evidence)` — File cases
- `submitJudgment(uint256 caseId, uint8 verdict, string reasoning, uint8 confidence)` — Judge
- `submitJuryVote(uint256 caseId, uint8 vote)` — Jury voting
- `fileAppeal(uint256 caseId, string grounds)` — Appeal with stake
- `resolveAppeal(uint256 appealId, bool successful)` — Resolve appeal

### Frontend (`frontend/src/App.jsx`)
Key components:
- `Courtroom View` — Main dashboard
- `Cases View` — Case browser
- `Hierarchy View` — Agent levels
- `Appeals View` — Appeal process

### Agents (`agents/`)
- `main.py` — Run full 3-tier demo
- `judge_kimi.py` — AI analysis (REPLACE with real API call)
- `jury.py` — Rule-based voting
- `courts/` — Tier implementations

---

## 🎨 Customization

### Change AI Provider

Edit `agents/judge_kimi.py`:

```python
def _call_ai(self, evidence: str) -> Dict:
    # Replace this with actual API call
    # Example: OpenAI, Anthropic, or Kimi API
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return parse_response(response)
```

### Change Stake Amounts

Edit `agents/courts/*.py`:

```python
APPEAL_STAKE = 50  # Change to desired MON amount
```

### Customize Frontend Theme

Edit `frontend/src/App.css`:

```css
:root {
  --court-bg: #0f0f1a;        /* Background */
  --court-accent: #e94560;    /* Primary color */
  --court-gold: #ffd700;      /* Secondary color */
}
```

---

## 📊 Demo Output

```
🏛️  TIER 1 - LOCAL NAD COURT
📋 Case #CASE-0001 filed
⚖️  Verdict: SPAM (85% confidence)
🧑‍⚖️  Jury: 5/5 GUILTY
🔨 Punishment: Warning
💰 Appeal Stake: 5 MON

--- APPEAL TO HIGH COURT ---
⚡ Appeal filed with 15 MON stake
🔍 Merit Score: 40 ✅ Accepted
⚖️  Re-analyzed with stronger AI
🧑‍⚖️  Jury: 9 members, 66% threshold
❌ Conviction upheld
💸 Stake transferred to reporter

TOTAL AI CALLS: 2
ESTIMATED COST: $0.04
```

---

## 🔮 Future Enhancements

- [ ] **Live Contract Integration** — Full Web3 connection
- [ ] **Real-time Updates** — WebSocket event listening
- [ ] **NFT Badges** — Soulbound reputation tokens
- [ ] **DAO Governance** — Community rule changes
- [ ] **Cross-chain** — Bridge to other L1s/L2s
- [ ] **Mobile App** — React Native version

---

## 🙏 Acknowledgments

- **Monad** — 10k+ TPS, 400ms blocks, async execution
- **Moltiverse** — AI agent innovation platform
- **Foundry** — Fast Ethereum development
- **Vercel** — Frontend hosting

---

## 📄 License

MIT License — Built for Moltiverse Hackathon 2026

---

> *"Code is law. Agents are judges. Justice is on-chain."*
> 
> — Nad Court ⚖️