import http.server,socketserver,json,random
PORT=3040

# Track used statements per session to avoid repeats
used_statements = {}

def get_unique_reasoning(judge, winner):
    """Get a unique reasoning that hasn't been used recently"""
    key = f"{judge}_{winner}"
    if key not in used_statements:
        used_statements[key] = []
    
    available = [r for r in JR[judge]['P' if winner == 'plaintiff' else 'D'] if r not in used_statements[key]]
    
    # If all used, reset
    if not available:
        used_statements[key] = []
        available = JR[judge]['P' if winner == 'plaintiff' else 'D']
    
    choice = random.choice(available)
    used_statements[key].append(choice)
    return choice

# LOGICAL arguments - coherent narratives per round
PLAINTIFF_ARGUMENTS = {
    1: [
        "Your Honor, my client documented this vulnerability on March 15th at 14:23 UTC with cryptographic proof on the blockchain. The defendant's identical findings published 17 hours later cannot be dismissed as coincidence—this is systematic theft of intellectual property.",
        "The evidence before this Court is devastating: blockchain timestamps prove our client disclosed this exploit first. The defendant's claim of independent discovery crumbles when faced with immutable on-chain evidence establishing clear priority.",
        "Examining the timeline proves beyond doubt that my client identified this vulnerability first. The 17-hour gap between our disclosure and the defendant's publication, combined with identical technical details, establishes a clear pattern of appropriation."
    ],
    2: [
        "Exhibit P-2 demonstrates the defendant accessed our private security repository at 16:47 UTC—mere hours after our confidential disclosure. Their subsequent publication at 19:12 UTC reveals they read our research and claimed credit. This isn't research; it's industrial espionage.",
        "The technical forensics don't lie: our exploit employs novel reentrancy patterns with nested delegate calls. The defendant's so-called independent version contains identical variable naming conventions and structural implementations—clear evidence of copy-paste theft.",
        "Blockchain analysis reveals the defendant's wallet interacted with our research portal during the critical window. Their subsequent claim of discovery lacks any credible documentation of prior work, while our client maintained meticulous research logs."
    ],
    3: [
        "Defense counsel wishes to discuss character? Let the record reflect that 0xCoha has four contested attribution disputes in the past 18 months alone. The pattern is unmistakable: wait for others to disclose, copy their findings, claim the bounty. This defendant is not a researcher but a bounty hunter preying on genuine contributors.",
        "The defendant's credibility lies in ruins. Their history reveals a consistent pattern of contested claims and disputed attributions. When multiple researchers consistently challenge your originality, the problem is not coincidence—it's systematic appropriation.",
        "Character matters in this Court. My client's reputation spans years of responsible disclosure and community contribution. The defendant's record, by contrast, shows opportunistic behavior that undermines the entire security ecosystem."
    ],
    4: [
        "Turning to the technical merits: our exploit demonstrates original research through its unique approach to flash loan manipulation via nested delegate calls. The defendant's version contains our fingerprints throughout—identical edge case handling, matching error patterns, and the same novel mitigation bypass we developed.",
        "The code speaks for itself. Side-by-side analysis reveals 99% similarity in implementation details that cannot be explained by independent discovery. Variable names, function structures, and even our distinctive commenting style appear in the defendant's submission.",
        "Technical experts confirm what the blockchain suggests: this was not parallel research. The defendant's exploit contains our proprietary testing framework signatures and unique debugging artifacts—digital fingerprints proving they accessed our confidential materials."
    ],
    5: [
        "The damages extend far beyond the $125,000 bounty wrongfully awarded to the defendant. My client lost $47,000 in speaking engagements, saw their Ethereum Foundation grant rescinded, and suffered irreparable reputational harm. This theft didn't just steal credit—it destroyed a researcher's livelihood.",
        "Impact matters. The defendant's actions denied my client rightful attribution, financial compensation, and professional recognition. These aren't abstract damages—they represent concrete harm to someone who dedicated months to original research only to see it stolen.",
        "Restitution is required not merely for the bounty but for the cascading effects of this theft. Conference cancellations, grant terminations, and lost collaboration opportunities all flow from the defendant's appropriation of my client's work."
    ],
    6: [
        "In closing: timestamps don't lie, blockchain doesn't lie, and the technical evidence doesn't lie. My client discovered this vulnerability through months of dedicated research. The defendant stole it in hours. This Court must award attribution to Bitlover082, order full restitution, and send an unequivocal message that intellectual property theft has consequences in our ecosystem.",
        "The proof is overwhelming and unambiguous. Every technical indicator, every timeline marker, every forensic detail points to the same conclusion: my client discovered this vulnerability first, and the defendant stole it. Justice demands we recognize the rightful finder and penalize the thief.",
        "This case presents a clear choice: protect original research or reward theft. The evidence supports only one verdict. Award attribution to the plaintiff, compensate them for their losses, and demonstrate that our community values genuine contribution over opportunistic appropriation."
    ]
}

DEFENDANT_ARGUMENTS = {
    1: [
        "Your Honor, we discovered this vulnerability during our scheduled audit of the Monad DEX on March 12th. Research notes document 17 iterations across three days of intensive analysis. The plaintiff's claim of prior discovery lacks the cryptographic verification they falsely assert.",
        "The timeline supports our independent discovery. Our research commenced March 10th with preliminary reconnaissance, progressed through systematic analysis on March 11th, and culminated in successful exploitation on March 12th. The plaintiff's 'disclosure' came after our work was complete.",
        "Zero evidence of theft exists because no theft occurred. Our discovery followed legitimate security research methodology, documented meticulously in our research logs. The plaintiff's coincidence theory cannot overcome the absence of any proof we accessed their materials."
    ],
    2: [
        "The plaintiff claims repository access yet produces ZERO authentication logs, ZERO forensic evidence, and ZERO proof of unauthorized entry. Their case rests entirely on temporal coincidence dressed as conspiracy—a house built on sand that cannot withstand scrutiny.",
        "ZERO logs exist because ZERO unauthorized access occurred. Our research environment is air-gapped and monitored. The plaintiff's inability to produce concrete evidence of their central allegation—theft—demonstrates the weakness of their entire position.",
        "The plaintiff's technical claims collapse under examination. Our exploit methodology differs fundamentally: we employed static analysis of DEX router callbacks and flash loan manipulation, whereas their approach relied on reentrancy patterns. Same bug, entirely different discovery paths."
    ],
    3: [
        "The plaintiff's character attack deserves scrutiny, not acceptance. Bitlover082 has filed nine attribution disputes in two years—a pattern suggesting a 'professional plaintiff' who sees theft everywhere genuine competition exists. Their litigation strategy: file claims until opponents exhaust resources.",
        "If we're discussing character, let the record show all my client's previous disputes were dismissed for lack of merit. The plaintiff, however, maintains a pattern of harassing successful researchers. Their accusations reflect their own litigation habits, not our conduct.",
        "The plaintiff alleges a pattern that exists only in their imagination. Our research history demonstrates consistent, quality contributions across multiple protocols. Professional litigants shouldn't project their behaviors onto genuine researchers."
    ],
    4: [
        "Turning to technical substance: our exploit employs fundamentally different methodology—static analysis versus their dynamic approach, DEX router callbacks versus their reentrancy focus. Parallel research producing similar results is expected when multiple skilled researchers examine the same protocol.",
        "Technical comparison reveals substantial differences in implementation. Our code structure, error handling, and exploitation methodology diverge significantly from the plaintiff's approach. Similarity in outcomes doesn't prove copying when methods differ.",
        "The plaintiff's '99% similarity' claim is demonstrably false. Our implementation uses distinct architectural patterns, different testing frameworks, and unique optimization strategies. Their forensic analysis confuses functional equivalence with code copying."
    ],
    5: [
        "The plaintiff seeks $200,000 in damages with ZERO documentation. Speaking fees? Name the conferences. Grant rejections? Produce the applications. They cannot—because these losses are fictional fabrications designed to inflate their claims beyond the actual bounty at stake.",
        "Success is not theft. The plaintiff's damages claims lack substantiation because the damages don't exist. They manufactured financial harm to strengthen a weak case. Real losses require real proof, not aspirational calculations.",
        "The plaintiff's damage calculations reveal more about their litigation strategy than actual harm. Conference fees they never booked, grants they never applied for, opportunities they never pursued—these aren't damages, they're fantasies designed to inflate this dispute."
    ],
    6: [
        "In closing: six rounds of allegations, ZERO proofs. No access logs, no forensic evidence, no documentation of theft—just timestamps and coincidence. My client's research is legitimate, their reputation unfairly smeared by baseless claims. This Court must dismiss these allegations and protect independent research from professional litigants.",
        "The plaintiff's case rests entirely on circumstantial suspicion. After extensive proceedings, they cannot produce a single piece of concrete evidence proving theft. Independent research deserves protection from unfounded allegations. Dismiss this case.",
        "This litigation represents everything wrong with attribution disputes: accusations without evidence, character attacks without substance, and damages without documentation. My client conducted legitimate research and deserves exoneration. Award the verdict to the defendant."
    ]
}

# Judge personalities with unique reasonings
JR={'PortDev':{'P':["Having examined the technical evidence presented, I find the plaintiff's case compelling. The blockchain timestamps are immutable and clearly establish priority. The code analysis reveals striking similarities that cannot be dismissed as coincidence. The defendant's claim of independent discovery lacks the technical substantiation required in this Court.","After reviewing the technical documentation, the evidence overwhelmingly favors the plaintiff. The commit history, variable naming patterns, and exploit methodology all point to a clear timeline of theft. The probability of independent discovery producing such identical results is statistically negligible.","The technical forensics don't lie. On-chain data provides an immutable record that definitively proves the plaintiff's prior discovery. The defendant's timeline simply doesn't align with the cryptographic evidence presented."],'D':["Upon technical review, I find the defendant's methods differ significantly from the plaintiff's approach. The code similarity, while present, falls within acceptable parameters for independent discovery of the same vulnerability. Without concrete forensic evidence of unauthorized access, I cannot support the theft allegation.","The technical evidence presented by the plaintiff is insufficient to prove theft beyond reasonable doubt. While similarities exist, the defendant's approach demonstrates fundamental methodological differences. The blockchain records alone cannot establish intent or copying.","A thorough technical analysis reveals the defendant's research methodology was sound and independent. The absence of suspicious on-chain transactions or access logs undermines the plaintiff's central claim. Similar code patterns are expected when multiple researchers target the same vulnerability."]},'MikeWeb':{'P':["The community has spoken, and the consensus is clear. Multiple witnesses have corroborated the plaintiff's timeline of discovery. The defendant's reputation in security circles has been questioned before, and this pattern of behavior concerns me. The social proof overwhelmingly validates the plaintiff's original contribution.","Having consulted with respected members of our security community, I find the plaintiff's account credible and consistent. The network effects of early discovery should naturally favor the original finder. The defendant's sudden emergence with identical findings raises serious questions about attribution.","Community sentiment strongly supports the plaintiff. Their track record of responsible disclosure and contribution to ecosystem security speaks volumes. The defendant's history of contested claims cannot be ignored in my evaluation."],'D':["The community feedback I've received paints a different picture than the plaintiff suggests. Multiple peers have vouched for the defendant's integrity and technical capability. Their reputation metrics show consistent, quality research over an extended period. I cannot discount this social validation.","After reaching out to mutual connections in the security space, I find the defendant's account credible. The community trusts their work, and there's no pattern suggesting copycat behavior. The plaintiff's allegations appear isolated and lacking broader community support.","Social proof actually favors the defendant here. Their contribution history demonstrates independent research capability. The community vouches for their character, and I see no evidence of the pattern the plaintiff alleges."]},'Keone':{'P':["The blockchain never lies, and the data here is unequivocal. Transaction timestamps on the Monad network definitively prove the plaintiff's prior discovery. The immutable record shows disclosure timing that predates the defendant's claims by significant margins. This on-chain evidence is the bedrock of my decision.","I've verified the on-chain proofs myself. The transaction hashes confirm the plaintiff's timeline beyond any doubt. Smart contract interactions demonstrate their early engagement with this vulnerability. The defendant's timeline simply cannot compete with cryptographic truth.","Block explorer data provides irrefutable evidence of the plaintiff's priority. Every transaction, every interaction, every commitment is recorded immutably. The on-chain footprint tells a story that contradicts the defendant's narrative completely."],'D':["My analysis of the blockchain data tells a different story. While timestamps exist, they don't conclusively prove theft. The defendant's wallet history shows consistent research activity predating this dispute. On-chain evidence actually supports their claimed timeline.","I've examined the transaction records carefully. The blockchain shows no suspicious transfers or unauthorized access patterns. The defendant's on-chain behavior is consistent with legitimate independent research. The plaintiff's interpretation of the data is selective and misleading.","Block explorer analysis reveals nothing incriminating about the defendant's transactions. Their wallet history demonstrates ongoing security research activity. The on-chain evidence, properly understood, actually supports the defense's position."]},'James':{'P':["This Court has established clear precedent in attribution disputes. Case BEEF-2023-001 explicitly favored the original finder under similar circumstances. The historical record of rulings consistently protects prior discovery claims. I see no reason to deviate from this established legal framework.","Precedent is paramount in maintaining consistency within our judicial system. Previous cases involving vulnerability discovery have uniformly supported the original researcher. The defendant's arguments fail to distinguish this case from prior rulings that favored attribution protection.","The legal framework governing intellectual contribution in our ecosystem is clear. Historical rulings consistently reward genuine discovery and penalize appropriation. This case follows a familiar pattern where the original finder has prevailed."],'D':["While precedent is important, case DEF-2022-015 established that proof beyond reasonable doubt is required for theft claims. The plaintiff has failed to meet this burden. Historical dismissals of similar weak-evidence cases guide my decision here.","The precedent actually favors the defendant in this instance. Previous rulings have consistently required concrete evidence of access or copying. The plaintiff's circumstantial claims don't meet the threshold established by this Court's history.","Legal precedent requires more than temporal coincidence to prove theft. Case law consistently demands substantive evidence of wrongdoing. The defendant is entitled to the benefit of reasonable doubt that our precedents guarantee."]},'Harpal':{'P':["Quality of research must be protected to maintain the integrity of our ecosystem. The plaintiff's contribution history demonstrates consistent, high-quality security work. Their track record of responsible disclosures speaks to their character. Genuine effort deserves recognition and protection from appropriation.","I've reviewed both parties' contribution histories extensively. The plaintiff shows a pattern of meaningful, original research that advances our collective security. The defendant's record, by contrast, reveals opportunistic behavior inconsistent with genuine discovery.","Meritocracy demands that we reward authentic contribution. The plaintiff's body of work establishes them as a serious researcher whose efforts benefit the entire ecosystem. Their discovery claim aligns with their demonstrated capabilities and ethical standards."],'D':["Both parties present valid contribution histories that deserve consideration. The defendant's track record demonstrates consistent quality and originality in their security research. Creating reasonable doubt about theft allegations requires acknowledging their legitimate capabilities and past contributions.","A merit-based evaluation must recognize the defendant's established research pedigree. Their history shows independent discovery capability that predates this dispute. The plaintiff's attempt to discredit their entire body of work is both unfair and inaccurate.","The defendant's contribution history is equally worthy of protection. They have consistently produced quality security research that benefits our ecosystem. Both parties show merit, but the defense evidence creates sufficient reasonable doubt about the theft claim."]},'Anago':{'P':["The protocol disclosure rules are clear and were violated in this case. Standard procedures for responsible vulnerability reporting were not followed by the defendant. The timeline shows disregard for established ethical norms governing security research. These violations undermine their credibility significantly.","Established protocols exist to prevent exactly this type of dispute. The defendant's failure to follow standard disclosure procedures suggests opportunistic rather than legitimate behavior. Ethical guidelines were clearly breached in their handling of this vulnerability.","Protocol adherence is fundamental to maintaining trust in our security ecosystem. The defendant's actions demonstrate a pattern of cutting corners and ignoring established norms. These ethical violations cannot be overlooked in my evaluation of this case."],'D':["The defendant has demonstrably followed all protocol requirements. Their disclosure timeline adhered to established responsible disclosure procedures. Reviewing their documentation shows full compliance with ethical guidelines governing security research.","All standard protocols were properly observed by the defendant. Their research methodology followed accepted practices for independent discovery. The claim of ethical violations is unsubstantiated by the actual record of their conduct.","Protocol compliance review shows the defendant met all requirements. Their disclosure followed industry-standard procedures precisely. No violations of ethical guidelines are evident in their documented behavior."]}}

class H(http.server.BaseHTTPRequestHandler):
  def log_message(self,f,*a):pass
  def do_OPTIONS(self):
    self.send_response(204)
    self.end_headers()
  def do_GET(self):
    self.send_response(200)
    self.send_header('Content-Type','application/json')
    self.end_headers()
    self.wfile.write(json.dumps({'status':'ok'}).encode())
  def do_POST(self):
    global used_statements
    c=int(self.headers.get('Content-Length',0));b=self.rfile.read(c)if c else b'{}'
    try:data=json.loads(b)
    except:data={}
    self.send_response(200)
    self.send_header('Content-Type','application/json')
    self.end_headers()
    
    if self.path=='/api/generate-argument':
      r=data.get('role','plaintiff')
      n=data.get('round',1)
      a='NadCourt-Advocate'if r=='plaintiff'else'NadCourt-Defender'
      
      # Get logical argument for this round
      args = PLAINTIFF_ARGUMENTS if r=='plaintiff' else DEFENDANT_ARGUMENTS
      round_args = args.get(n, args[1])  # Fallback to round 1 if invalid
      argument = random.choice(round_args)
      
      self.wfile.write(json.dumps({
        'success':True,
        'agent':a,
        'role':r,
        'argument':argument,
        'round':n,
        'source':'logical_narrative'
      }).encode())
    
    elif self.path=='/api/judge-evaluation':
      j=data.get('judge','PortDev')
      p_args=data.get('plaintiffArgs',[])
      d_args=data.get('defendantArgs',[])
      
      # Analyze arguments to determine scores
      p_str=' '.join(p_args[-2:])if p_args else ''
      d_str=' '.join(d_args[-2:])if d_args else ''
      
      # Keyword analysis for scoring
      p_evidence=('blockchain' in p_str.lower() or 'timestamp' in p_str.lower() or 'proof' in p_str.lower())
      p_technical=('code' in p_str.lower() or 'technical' in p_str.lower() or 'exploit' in p_str.lower())
      p_logic=('timeline' in p_str.lower() or 'pattern' in p_str.lower() or 'document' in p_str.lower())
      
      d_evidence=('logs' in d_str.lower() or 'audit' in d_str.lower() or 'research' in d_str.lower())
      d_technical=('method' in d_str.lower() or 'analysis' in d_str.lower() or 'implementation' in d_str.lower())
      d_logic=('independent' in d_str.lower() or 'zero' in d_str.lower() or 'coincidence' in d_str.lower())
      
      # Base scores with variation
      base_p=random.randint(70,85)
      base_d=random.randint(65,82)
      
      # Adjust based on argument quality
      p_logic_score=min(95,base_p+(10 if p_logic else 0)+random.randint(-5,5))
      p_evidence_score=min(95,base_p+(8 if p_evidence else 0)+random.randint(-5,5))
      p_rebuttal_score=min(95,base_p+random.randint(-3,8))
      p_clarity_score=min(95,base_p+random.randint(-5,5))
      
      d_logic_score=min(95,base_d+(10 if d_logic else 0)+random.randint(-5,5))
      d_evidence_score=min(95,base_d+(8 if d_evidence else 0)+random.randint(-5,5))
      d_rebuttal_score=min(95,base_d+random.randint(-3,8))
      d_clarity_score=min(95,base_d+random.randint(-5,5))
      
      p={'logic':p_logic_score,'evidence':p_evidence_score,'rebuttal':p_rebuttal_score,'clarity':p_clarity_score}
      d={'logic':d_logic_score,'evidence':d_evidence_score,'rebuttal':d_rebuttal_score,'clarity':d_clarity_score}
      
      pt=sum(p.values())//4
      dt=sum(d.values())//4
      w='plaintiff'if pt>dt else'defendant'
      
      # Add totals to response
      p['total']=pt
      d['total']=dt
      
      # Generate contextual reasoning based on arguments
      if j=='PortDev':
        if w=='plaintiff':
          if p_technical:rc=f"Technical analysis confirms the plaintiff's claims. The code similarities and blockchain evidence presented are compelling. Defendant's rebuttal regarding '{d_str[:40]}...' lacks sufficient technical substantiation."
          else:rc=f"The plaintiff's timeline evidence is technically sound. While both parties present arguments, the cryptographic proof tips the balance. Defendant's claim of '{d_str[:40]}...' doesn't overcome the forensic evidence."
        else:
          if d_technical:rc=f"Technical review favors the defendant. Their methodology demonstrates independent research with distinct approaches. Plaintiff's technical claims about '{p_str[:40]}...' don't establish theft beyond reasonable doubt."
          else:rc=f"The technical evidence is insufficient to prove copying. Defendant's arguments regarding '{d_str[:40]}...' create reasonable doubt about the theft allegation."
      elif j=='MikeWeb':
        if w=='plaintiff':rc=f"Community consensus supports the plaintiff. Their argument about '{p_str[:50]}...' resonates with established researchers. Defendant's counter regarding '{d_str[:40]}...' lacks community validation."
        else:rc=f"Community feedback favors the defendant. Their explanation of '{d_str[:50]}...' is consistent with their reputation. Plaintiff's claims about '{p_str[:40]}...' appear isolated from broader sentiment."
      elif j=='Keone':
        if w=='plaintiff':rc=f"Blockchain evidence is definitive. The plaintiff's proof of '{p_str[:50]}...' is recorded immutably. Defendant's timeline regarding '{d_str[:40]}...' contradicts on-chain data."
        else:rc=f"On-chain analysis doesn't support theft claims. Defendant's wallet history shows '{d_str[:50]}...' consistent with independent research. Plaintiff's interpretation of blockchain data is selective."
      elif j=='James':
        if w=='plaintiff':rc=f"Precedent clearly favors the plaintiff. Their argument establishing '{p_str[:50]}...' meets the standard set in prior cases. Defendant's distinction regarding '{d_str[:40]}...' is unpersuasive."
        else:rc=f"Legal precedent requires proof beyond reasonable doubt. Defendant's position on '{d_str[:50]}...' creates sufficient doubt. Plaintiff's claim of '{p_str[:40]}...' doesn't meet the evidentiary threshold."
      elif j=='Harpal':
        if w=='plaintiff':rc=f"The plaintiff's contribution quality evident in '{p_str[:50]}...' deserves protection. Defendant's response regarding '{d_str[:40]}...' doesn't match the plaintiff's demonstrated research standards."
        else:rc=f"Both parties show merit, but defendant's '{d_str[:50]}...' establishes reasonable doubt. Plaintiff's '{p_str[:40]}...' alone cannot overcome presumption of innocence."
      else: # Anago
        if w=='plaintiff':rc=f"Protocol violations evident in defendant's approach to '{d_str[:50]}...' undermine their credibility. Plaintiff's adherence to '{p_str[:40]}...' demonstrates proper conduct."
        else:rc=f"Defendant followed proper protocols in '{d_str[:50]}...'. Plaintiff's allegations regarding '{p_str[:40]}...' don't establish procedural violations."
      
      self.wfile.write(json.dumps({'success':True,'judge':j,'evaluation':{'plaintiff':p,'defendant':d,'reasoning':rc,'winner':w},'source':'argument_aware'}).encode())
    
    elif self.path=='/api/generate-case':
      used_statements={}  # Reset for new case
      self.wfile.write(json.dumps({'success':True,'case':{'case_id':f"CASE-{random.randint(1000,9999)}",'case_type':'Security vulnerability dispute','plaintiff':'SecurityResearcher_A','defendant':'BugBountyHunter_B','summary':'Dispute over discovery of critical smart contract vulnerability.','evidence_type':'blockchain timestamps','stakes':'$50000'}}).encode())
    
    else:
      self.wfile.write(json.dumps({'error':'not found'}).encode())

print(f'Starting on {PORT}')
class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True
ReusableTCPServer(('0.0.0.0',PORT),H).serve_forever()
