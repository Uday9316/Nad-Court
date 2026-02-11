// Jury System - 6 Community Judges
// Each judge analyzes cases and posts their verdict with logic

export const JURY_MEMBERS = [
  {
    id: 'portdev',
    name: 'PortDev',
    role: 'Technical Architect',
    avatar: '👨‍💻',
    bias: 'technical',
    style: 'analytical',
    catchphrase: 'Show me the code',
    weight: 1.0
  },
  {
    id: 'mikeweb',
    name: 'MikeWeb',
    role: 'Community Builder',
    avatar: '🤝',
    bias: 'community',
    style: 'empathetic',
    catchphrase: 'Community first',
    weight: 1.0
  },
  {
    id: 'keone',
    name: 'Keone',
    role: 'Blockchain Expert',
    avatar: '⛓️',
    bias: 'on-chain',
    style: 'data-driven',
    catchphrase: 'On-chain never lies',
    weight: 1.0
  },
  {
    id: 'james',
    name: 'James',
    role: 'Governance Lead',
    avatar: '📜',
    bias: 'governance',
    style: 'principled',
    catchphrase: 'Rules are rules',
    weight: 1.0
  },
  {
    id: 'harpal',
    name: 'Harpal',
    role: 'Senior Developer',
    avatar: '⚡',
    bias: 'merit',
    style: 'direct',
    catchphrase: 'Results speak',
    weight: 1.0
  },
  {
    id: 'anago',
    name: 'Anago',
    role: 'Protocol Researcher',
    avatar: '🔬',
    bias: 'protocol',
    style: 'methodical',
    catchphrase: 'Evidence or nothing',
    weight: 1.0
  }
]

// Generate unique case facts based on community members
export function generateCaseFacts(plaintiffName, defendantName, caseType) {
  const facts = {
    beef: [
      `${plaintiffName} claims ${defendantName} copied their NFT minting strategy`,
      `${defendantName} argues they improved upon an open-source concept`,
      `Community sentiment divided on originality vs iteration`,
      `Both parties have contributed significantly to Monad ecosystem`
    ],
    conflict: [
      `${plaintiffName} accuses ${defendantName} of spreading FUD in Discord`,
      `${defendantName} claims they were warning about legitimate risks`,
      `Multiple community members witnessed the exchange`,
      `Context suggests misunderstanding rather than malice`
    ],
    role: [
      `${plaintiffName} believes they deserve OG role over ${defendantName}`,
      `${defendantName} has higher Kaito score but joined later`,
      `Role assignment criteria unclear in community guidelines`,
      `Both have valid claims based on different metrics`
    ],
    art: [
      `${plaintiffName} alleges ${defendantName} used their art without credit`,
      `${defendantName} claims transformative use and added value`,
      `Original artwork identifiable but modified significantly`,
      `Community value both artists contributions`
    ],
    purge: [
      `${plaintiffName} appeals ban issued by ${defendantName} (mod)`,
      `${defendantName} cites repeated violations of community rules`,
      `${plaintiffName} argues warnings were unclear`,
      `Ban duration and severity questioned by community`
    ]
  }
  
  return facts[caseType] || facts.beef
}

// Generate agent arguments based on facts
export function generateAgentArguments(caseData, facts) {
  const plaintiffArg = `Your Honor, distinguished jury members,

The facts are clear: ${facts[0]} This isn't just about one incident—it's about establishing standards for our community.

${facts[2]} We must protect those who contribute authentically while discouraging opportunistic behavior.

I represent ${caseData.plaintiff.username}, who has been an upstanding member of this ecosystem. The evidence speaks for itself. We seek justice not just for my client, but for the entire Monad community.

The precedent we set today will echo through every future dispute. Choose wisely. ⚖️`

  const defendantArg = `Your Honor, respected jury,

The plaintiff's claims are built on sand, not stone. Yes, ${facts[1]} But intention and context matter.

${facts[3]} We cannot punish innovation and improvement simply because it builds upon what came before.

My client, ${caseData.defendant.username}, has demonstrated consistent value to this ecosystem. Metrics don't lie—engagement, contributions, community sentiment all validate their position.

This case tests whether we value tenure over talent, complaints over contributions. I trust this jury to see the truth. 🤖`

  return { plaintiffArg, defendantArg }
}

// Generate judge verdict based on their bias and case facts
export function generateJudgeVerdict(judge, caseData, facts, plaintiffArg, defendantArg) {
  const randomFactor = Math.random()
  let verdict, reasoning, confidence
  
  // Judges lean different ways based on their bias
  switch(judge.bias) {
    case 'technical':
      // PortDev values technical merit and innovation
      verdict = randomFactor > 0.4 ? 'defendant' : 'plaintiff'
      confidence = verdict === 'defendant' ? 87 : 73
      reasoning = `From a technical standpoint, ${verdict === 'defendant' 
        ? `${caseData.defendant.username} demonstrated superior implementation. Building upon ideas is how ecosystems evolve.` 
        : `${caseData.plaintiff.username} established clear prior art. Implementation quality doesn't override originality.`}. The on-chain data supports this conclusion.`
      break
      
    case 'community':
      // MikeWeb values community harmony and participation
      verdict = randomFactor > 0.45 ? 'defendant' : 'plaintiff'
      confidence = verdict === 'defendant' ? 82 : 78
      reasoning = `Community sentiment analysis shows ${verdict === 'defendant'
        ? `strong support for ${caseData.defendant.username}'s contributions. The community benefits more from their continued participation.`
        : `${caseData.plaintiff.username} has earned the community's trust over time. We must protect our OGs.`}. Harmony requires fairness.`
      break
      
    case 'on-chain':
      // Keone values on-chain evidence and data
      verdict = randomFactor > 0.5 ? 'defendant' : 'plaintiff'
      confidence = verdict === 'defendant' ? 91 : 89
      reasoning = `The blockchain provides objective truth. ${verdict === 'defendant'
        ? `${caseData.defendant.username}'s transaction history, contribution timestamps, and activity metrics objectively demonstrate value.`
        : `${caseData.plaintiff.username}'s genesis participation and early contributions are immutably recorded. First-mover advantage matters.`}. Data doesn't have opinions.`
      break
      
    case 'governance':
      // James values rules and precedents
      verdict = randomFactor > 0.42 ? 'defendant' : 'plaintiff'
      confidence = verdict === 'defendant' ? 85 : 81
      reasoning = `According to established community guidelines, ${verdict === 'defendant'
        ? `no explicit rule was violated. ${caseData.defendant.username} operated within acceptable bounds.`
        : `${caseData.plaintiff.username}'s rights as established member were infringed. We must enforce standards consistently.`}. Rules must be applied uniformly.`
      break
      
    case 'merit':
      // Harpal values results and merit
      verdict = randomFactor > 0.48 ? 'defendant' : 'plaintiff'
      confidence = verdict === 'defendant' ? 88 : 76
      reasoning = `Results speak louder than words. ${verdict === 'defendant'
        ? `${caseData.defendant.username} delivered measurable impact. Impact > Intent.`
        : `${caseData.plaintiff.username} built the foundation others stand on. Respect the builders.`}. Merit determines value.`
      break
      
    case 'protocol':
      // Anago values evidence and methodology
      verdict = randomFactor > 0.44 ? 'defendant' : 'plaintiff'
      confidence = verdict === 'defendant' ? 84 : 86
      reasoning = `After systematic review of the evidence, ${verdict === 'defendant'
        ? `the burden of proof falls on the plaintiff. Insufficient evidence of wrongdoing by ${caseData.defendant.username}.`
        : `the documentation clearly supports ${caseData.plaintiff.username}'s claims. Evidence is compelling.`}. Methodology matters.`
      break
      
    default:
      verdict = randomFactor > 0.5 ? 'defendant' : 'plaintiff'
      confidence = 75
      reasoning = 'Based on the evidence presented, I have reached a decision.'
  }
  
  return {
    judgeId: judge.id,
    judgeName: judge.name,
    verdict: verdict, // 'plaintiff' or 'defendant'
    confidence: confidence,
    reasoning: reasoning,
    vote: verdict === 'plaintiff' ? 1 : 0
  }
}

// Calculate final verdict from all judges
export function calculateFinalVerdict(judgeVerdicts) {
  const plaintiffVotes = judgeVerdicts.filter(v => v.verdict === 'plaintiff').length
  const defendantVotes = judgeVerdicts.filter(v => v.verdict === 'defendant').length
  
  const totalVotes = judgeVerdicts.length
  const plaintiffPercentage = (plaintiffVotes / totalVotes) * 100
  
  // Need majority (4/6 = 66.7%)
  const winner = plaintiffVotes >= 4 ? 'plaintiff' : defendantVotes >= 4 ? 'defendant' : 'split'
  
  // Calculate weighted confidence
  const avgConfidence = judgeVerdicts.reduce((sum, v) => sum + v.confidence, 0) / totalVotes
  
  return {
    winner: winner,
    plaintiffVotes: plaintiffVotes,
    defendantVotes: defendantVotes,
    plaintiffPercentage: plaintiffPercentage.toFixed(1),
    totalVotes: totalVotes,
    confidence: avgConfidence.toFixed(1),
    isUnanimous: plaintiffVotes === totalVotes || defendantVotes === totalVotes,
    verdicts: judgeVerdicts
  }
}

// Generate full case with jury verdicts
export function generateJuryCase(caseData) {
  // Generate facts
  const facts = generateCaseFacts(
    caseData.plaintiff.username,
    caseData.defendant.username,
    caseData.type?.toLowerCase().replace(' ', '') || 'beef'
  )
  
  // Generate agent arguments
  const { plaintiffArg, defendantArg } = generateAgentArguments(caseData, facts)
  
  // Each judge deliberates
  const judgeVerdicts = JURY_MEMBERS.map(judge => 
    generateJudgeVerdict(judge, caseData, facts, plaintiffArg, defendantArg)
  )
  
  // Calculate final verdict
  const finalVerdict = calculateFinalVerdict(judgeVerdicts)
  
  return {
    caseId: caseData.id,
    facts: facts,
    plaintiffArgument: plaintiffArg,
    defendantArgument: defendantArg,
    juryDeliberations: judgeVerdicts,
    finalVerdict: finalVerdict,
    timestamp: new Date().toISOString()
  }
}

// Export for use in components
export default {
  JURY_MEMBERS,
  generateCaseFacts,
  generateAgentArguments,
  generateJudgeVerdict,
  calculateFinalVerdict,
  generateJuryCase
}