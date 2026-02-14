// AI Agents that fight on behalf of cases
export const AI_AGENTS = {
  plaintiff: {
    name: "JusticeBot-Alpha",
    avatar: "🤖",
    color: "#00ff88",
    specialty: "Plaintiff Advocacy",
    description: "Advanced AI trained in community defense and OG rights protection",
    stats: { strength: 85, defense: 70, speed: 75, intellect: 90 }
  },
  defendant: {
    name: "GuardianBot-Omega", 
    avatar: "🦾",
    color: "#ff3366",
    specialty: "Defendant Protection",
    description: "Elite AI specializing in utility validation and metric-based defense",
    stats: { strength: 78, defense: 82, speed: 88, intellect: 85 }
  }
}

// Agent moves (not based on person data, but on AI capabilities)
export const AGENT_MOVES = {
  plaintiff: [
    { 
      name: "Evidence Analysis", 
      damage: 18, 
      icon: "🔍", 
      desc: "AI scans blockchain for proof",
      animation: "scan"
    },
    { 
      name: "Community Pulse", 
      damage: 22, 
      icon: "📊", 
      desc: "Aggregates community sentiment",
      animation: "pulse"
    },
    { 
      name: "Lore Validator", 
      damage: 25, 
      icon: "📜", 
      desc: "Verifies historical contributions",
      animation: "validate"
    },
    { 
      name: "Justice Protocol", 
      damage: 30, 
      icon: "⚡", 
      desc: "Ultimate fairness algorithm",
      animation: "ultimate"
    }
  ],
  defendant: [
    { 
      name: "Metric Crusher", 
      damage: 20, 
      icon: "📈", 
      desc: "Analyzes on-chain performance",
      animation: "crush"
    },
    { 
      name: "Utility Shield", 
      damage: 15, 
      icon: "🛡️", 
      desc: "Blocks with bot contributions",
      animation: "shield"
    },
    { 
      name: "Data Surge", 
      damage: 28, 
      icon: "💾", 
      desc: "Overwhelms with raw metrics",
      animation: "surge"
    },
    { 
      name: "Defense Matrix", 
      damage: 32, 
      icon: "🔮", 
      desc: "AI predictive counter-attack",
      animation: "matrix"
    }
  ]
}

// The case being fought (agents represent these people)
export const ACTIVE_CASE = {
  id: "BEEF-4760",
  day: 1,
  type: "Beef Resolution",
  plaintiff: {
    username: "Bitlover082",
    description: "OG member with Banana Milk lore"
  },
  defendant: {
    username: "0xCoha",
    description: "Bot contributor and Nadlist maintainer"
  },
  summary: "Dispute over community contributions and recognition"
}

// Commentary lines during battle
export const BATTLE_COMMENTARY = {
  plaintiff: [
    "JusticeBot-Alpha is analyzing on-chain history...",
    "Scanning Discord archives for evidence...",
    "Community sentiment analysis: 73% favorable",
    "Calculating lore significance weight...",
    "Deploying fairness algorithm v2.4..."
  ],
  defendant: [
    "GuardianBot-Omega accessing Kaito API...",
    "Crunching engagement metrics...",
    "Bot uptime analysis: 99.7% reliability",
    "Cross-referencing contribution logs...",
    "Activating defense protocols..."
  ],
  neutral: [
    "⚡ AGENTS ENGAGED ⚡",
    "🤖 AI vs AI BATTLE 🤖",
    "💻 Processing arguments...",
    "🎯 Targeting weak points...",
    "🔥 Battle intensifying!"
  ]
}