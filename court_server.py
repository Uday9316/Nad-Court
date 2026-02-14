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

P={'openings':["Your Honor, my client documented","The evidence is devastating:","Examining the timeline proves","Our investigation reveals","This is not research—this is theft."],'evidence':["blockchain proof from March 15th","private repo access at 16:47 UTC","cryptographic verification exists","17-hour gap proves copying","timestamp evidence is irrefutable"],'character':["defendant has FOUR attribution disputes","pattern of wait, copy, claim bounty","bounty hunter preying on others","not a researcher—an opportunist","history of contested claims"],'technical':["identical variable names","copy-paste with serial numbers off","novel reentrancy stolen wholesale","code similarity is 99%","nested delegate calls replicated"]}
D={'openings':["Your Honor, we discovered this","March 12th during audit proves","Our research is legitimate","Timeline supports independence","Zero evidence of theft"],'evidence':["17 iterations over 3 days","research notes documented","lacks cryptographic verification","ZERO logs, ZERO forensics","no access records exist"],'character':["plaintiff filed NINE disputes","professional litigant","pattern: litigate until win","sees theft everywhere","all my disputes dismissed"],'technical':["fundamentally different methods","static analysis of DEX router","parallel research happens","flash loan vs reentrancy","same bug, different paths"]}

# Longer, detailed judge reasonings (3 options each for variety)
JR={'PortDev':{'P':["Having examined the technical evidence presented, I find the plaintiff's case compelling. The blockchain timestamps are immutable and clearly establish priority. The code analysis reveals striking similarities that cannot be dismissed as coincidence. The defendant's claim of independent discovery lacks the technical substantiation required in this Court.","After reviewing the technical documentation, the evidence overwhelmingly favors the plaintiff. The commit history, variable naming patterns, and exploit methodology all point to a clear timeline of theft. The probability of independent discovery producing such identical results is statistically negligible.","The technical forensics don't lie. On-chain data provides an immutable record that definitively proves the plaintiff's prior discovery. The defendant's timeline simply doesn't align with the cryptographic evidence presented."],'D':["Upon technical review, I find the defendant's methods differ significantly from the plaintiff's approach. The code similarity, while present, falls within acceptable parameters for independent discovery of the same vulnerability. Without concrete forensic evidence of unauthorized access, I cannot support the theft allegation.","The technical evidence presented by the plaintiff is insufficient to prove theft beyond reasonable doubt. While similarities exist, the defendant's approach demonstrates fundamental methodological differences. The blockchain records alone cannot establish intent or copying.","A thorough technical analysis reveals the defendant's research methodology was sound and independent. The absence of suspicious on-chain transactions or access logs undermines the plaintiff's central claim. Similar code patterns are expected when multiple researchers target the same vulnerability."]},'MikeWeb':{'P':["The community has spoken, and the consensus is clear. Multiple witnesses have corroborated the plaintiff's timeline of discovery. The defendant's reputation in security circles has been questioned before, and this pattern of behavior concerns me. The social proof overwhelmingly validates the plaintiff's original contribution.","Having consulted with respected members of our security community, I find the plaintiff's account credible and consistent. The network effects of early discovery should naturally favor the original finder. The defendant's sudden emergence with identical findings raises serious questions about attribution.","Community sentiment strongly supports the plaintiff. Their track record of responsible disclosure and contribution to ecosystem security speaks volumes. The defendant's history of contested claims cannot be ignored in my evaluation."],'D':["The community feedback I've received paints a different picture than the plaintiff suggests. Multiple peers have vouched for the defendant's integrity and technical capability. Their reputation metrics show consistent, quality research over an extended period. I cannot discount this social validation.","After reaching out to mutual connections in the security space, I find the defendant's account credible. The community trusts their work, and there's no pattern suggesting copycat behavior. The plaintiff's allegations appear isolated and lacking broader community support.","Social proof actually favors the defendant here. Their contribution history demonstrates independent research capability. The community vouches for their character, and I see no evidence of the pattern the plaintiff alleges."]},'Keone':{'P':["The blockchain never lies, and the data here is unequivocal. Transaction timestamps on the Monad network definitively prove the plaintiff's prior discovery. The immutable record shows disclosure timing that predates the defendant's claims by significant margins. This on-chain evidence is the bedrock of my decision.","I've verified the on-chain proofs myself. The transaction hashes confirm the plaintiff's timeline beyond any doubt. Smart contract interactions demonstrate their early engagement with this vulnerability. The defendant's timeline simply cannot compete with cryptographic truth.","Block explorer data provides irrefutable evidence of the plaintiff's priority. Every transaction, every interaction, every commitment is recorded immutably. The on-chain footprint tells a story that contradicts the defendant's narrative completely."],'D':["My analysis of the blockchain data tells a different story. While timestamps exist, they don't conclusively prove theft. The defendant's wallet history shows consistent research activity predating this dispute. On-chain evidence actually supports their claimed timeline.","I've examined the transaction records carefully. The blockchain shows no suspicious transfers or unauthorized access patterns. The defendant's on-chain behavior is consistent with legitimate independent research. The plaintiff's interpretation of the data is selective and misleading.","Block explorer analysis reveals nothing incriminating about the defendant's transactions. Their wallet history demonstrates ongoing security research activity. The on-chain evidence, properly understood, actually supports the defense's position."]},'James':{'P':["This Court has established clear precedent in attribution disputes. Case BEEF-2023-001 explicitly favored the original finder under similar circumstances. The historical record of rulings consistently protects prior discovery claims. I see no reason to deviate from this established legal framework.","Precedent is paramount in maintaining consistency within our judicial system. Previous cases involving vulnerability discovery have uniformly supported the original researcher. The defendant's arguments fail to distinguish this case from prior rulings that favored attribution protection.","The legal framework governing intellectual contribution in our ecosystem is clear. Historical rulings consistently reward genuine discovery and penalize appropriation. This case follows a familiar pattern where the original finder has prevailed."],'D':["While precedent is important, case DEF-2022-015 established that proof beyond reasonable doubt is required for theft claims. The plaintiff has failed to meet this burden. Historical dismissals of similar weak-evidence cases guide my decision here.","The precedent actually favors the defendant in this instance. Previous rulings have consistently required concrete evidence of access or copying. The plaintiff's circumstantial claims don't meet the threshold established by this Court's history.","Legal precedent requires more than temporal coincidence to prove theft. Case law consistently demands substantive evidence of wrongdoing. The defendant is entitled to the benefit of reasonable doubt that our precedents guarantee."]},'Harpal':{'P':["Quality of research must be protected to maintain the integrity of our ecosystem. The plaintiff's contribution history demonstrates consistent, high-quality security work. Their track record of responsible disclosures speaks to their character. Genuine effort deserves recognition and protection from appropriation.","I've reviewed both parties' contribution histories extensively. The plaintiff shows a pattern of meaningful, original research that advances our collective security. The defendant's record, by contrast, reveals opportunistic behavior inconsistent with genuine discovery.","Meritocracy demands that we reward authentic contribution. The plaintiff's body of work establishes them as a serious researcher whose efforts benefit the entire ecosystem. Their discovery claim aligns with their demonstrated capabilities and ethical standards."],'D':["Both parties present valid contribution histories that deserve consideration. The defendant's track record demonstrates consistent quality and originality in their security research. Creating reasonable doubt about theft allegations requires acknowledging their legitimate capabilities and past contributions.","A merit-based evaluation must recognize the defendant's established research pedigree. Their history shows independent discovery capability that predates this dispute. The plaintiff's attempt to discredit their entire body of work is both unfair and inaccurate.","The defendant's contribution history is equally worthy of protection. They have consistently produced quality security research that benefits our ecosystem. Both parties show merit, but the defense evidence creates sufficient reasonable doubt about the theft claim."]},'Anago':{'P':["The protocol disclosure rules are clear and were violated in this case. Standard procedures for responsible vulnerability reporting were not followed by the defendant. The timeline shows disregard for established ethical norms governing security research. These violations undermine their credibility significantly.","Established protocols exist to prevent exactly this type of dispute. The defendant's failure to follow standard disclosure procedures suggests opportunistic rather than legitimate behavior. Ethical guidelines were clearly breached in their handling of this vulnerability.","Protocol adherence is fundamental to maintaining trust in our security ecosystem. The defendant's actions demonstrate a pattern of cutting corners and ignoring established norms. These ethical violations cannot be overlooked in my evaluation of this case."],'D':["The defendant has demonstrably followed all protocol requirements. Their disclosure timeline adhered to established responsible disclosure procedures. Reviewing their documentation shows full compliance with ethical guidelines governing security research.","All standard protocols were properly observed by the defendant. Their research methodology followed accepted practices for independent discovery. The claim of ethical violations is unsubstantiated by the actual record of their conduct.","Protocol compliance review shows the defendant met all requirements. Their disclosure followed industry-standard procedures precisely. No violations of ethical guidelines are evident in their documented behavior."]}}

class H(http.server.BaseHTTPRequestHandler):
  def log_message(self,f,*a):pass
  def do_OPTIONS(self):self.send_response(200);self.send_header('Access-Control-Allow-Origin','*');self.send_header('Access-Control-Allow-Methods','GET, POST, OPTIONS');self.send_header('Access-Control-Allow-Headers','Content-Type');self.end_headers()
  def do_GET(self):self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Access-Control-Allow-Origin','*');self.end_headers();self.wfile.write(json.dumps({'status':'ok'}).encode())
  def do_POST(self):
    global used_statements
    c=int(self.headers.get('Content-Length',0));b=self.rfile.read(c)if c else b'{}'
    try:data=json.loads(b)
    except:data={}
    self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Access-Control-Allow-Origin','*');self.end_headers()
    
    if self.path=='/api/generate-argument':
      r=data.get('role','plaintiff');n=data.get('round',1);a='NadCourt-Advocate'if r=='plaintiff'else'NadCourt-Defender';s=P if r=='plaintiff'else D;o=random.choice(s['openings']);e=random.choice(s['evidence']);c=random.choice(s['character'])
      if n in[1,2]:arg=f"{o} {e}. {c}."
      elif n in[3,4]:arg=f"{o} {random.choice(s['technical'])}. {e}."
      else:arg=f"{o} {c}. {e}. Proof is clear."
      self.wfile.write(json.dumps({'success':True,'agent':a,'role':r,'argument':arg,'round':n,'source':'unique'}).encode())
    
    elif self.path=='/api/judge-evaluation':
      j=data.get('judge','PortDev')
      # Balanced scoring - bias affects but doesn't guarantee outcome
      biases={'PortDev':8,'MikeWeb':5,'Keone':12,'James':6,'Harpal':10,'Anago':5}
      bias=biases.get(j,5)
      
      # More balanced random scoring (40-95 range)
      base_p=random.randint(60,85)
      base_d=random.randint(55,80)
      
      # Add some randomness so outcomes vary
      p={'logic':min(95,base_p+random.randint(-5,10)),'evidence':min(95,base_p+bias+random.randint(-8,8)),'rebuttal':min(95,base_p+random.randint(-5,5)),'clarity':min(95,base_p+random.randint(-5,8))}
      d={'logic':min(95,base_d+random.randint(-5,10)),'evidence':min(95,base_d-bias+random.randint(-5,10)),'rebuttal':min(95,base_d+random.randint(-5,8)),'clarity':min(95,base_d+random.randint(-5,5))}
      
      pt=sum(p.values())//4
      dt=sum(d.values())//4
      
      # Higher score wins
      w='plaintiff'if pt>dt else'defendant'
      
      # Get unique reasoning
      rc=get_unique_reasoning(j,w)
      
      self.wfile.write(json.dumps({'success':True,'judge':j,'evaluation':{'plaintiff':{**p,'total':pt},'defendant':{**d,'total':dt},'reasoning':rc,'winner':w},'source':'unique_judge'}).encode())
    
    elif self.path=='/api/generate-case':
      # Reset used statements for new case
      used_statements={}
      self.wfile.write(json.dumps({'success':True,'case':{'case_id':f"CASE-{random.randint(1000,9999)}",'case_type':'Security vulnerability dispute','plaintiff':'SecurityResearcher_A','defendant':'BugBountyHunter_B','summary':'Dispute over discovery of critical smart contract vulnerability.','evidence_type':'blockchain timestamps','stakes':'$50000'}}).encode())
    
    else:
      self.wfile.write(json.dumps({'error':'not found'}).encode())

print(f'Starting on {PORT}')
class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True
ReusableTCPServer(('0.0.0.0',PORT),H).serve_forever()
