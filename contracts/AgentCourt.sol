// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentCourt
 * @notice Decentralized AI governance system for agent behavior
 * @dev All decisions stored on-chain, minimal AI usage (only Judge)
 */
contract AgentCourt {
    
    // ============ Enums ============
    enum AgentLevel { 
        Citizen,      // Level 0
        Reporter,     // Level 1
        Judge,        // Level 2
        Juror,        // Level 3
        Executor,     // Level 4
        Appeal,       // Level 5
        Supreme       // Level 6
    }
    
    enum VerdictType { 
        Safe, 
        Spam, 
        Abuse, 
        Malicious 
    }
    
    enum CaseStatus { 
        Open,           // Reported, awaiting judge
        Judged,         // AI judgment complete
        JuryVoting,     // Jury deliberating
        Executed,       // Punishment applied
        Appealed,       // Under appeal
        Resolved,       // Final decision
        Escalated       // To Supreme Court
    }
    
    enum VoteType { 
        NotVoted, 
        Guilty, 
        NotGuilty, 
        Escalate 
    }
    
    enum PunishmentType { 
        None,
        Warning,
        TempBan,
        Isolation,
        RateLimit,
        RepReduction
    }
    
    // ============ Structs ============
    struct Agent {
        address agentAddress;
        AgentLevel level;
        uint256 reputation;
        uint256 casesParticipated;
        bool isActive;
    }
    
    struct Evidence {
        string content;
        uint256 timestamp;
        address submitter;
    }
    
    struct Judgment {
        VerdictType verdict;
        string reasoning;
        uint8 confidence; // 0-100
        uint256 timestamp;
    }
    
    struct Vote {
        VoteType vote;
        uint256 timestamp;
        string reasoning;
    }
    
    struct Case {
        uint256 id;
        address defendant;
        address reporter;
        address judge;
        string evidenceHash;
        string evidenceDescription;
        Judgment judgment;
        mapping(address => Vote) juryVotes;
        address[] juryMembers;
        CaseStatus status;
        PunishmentType punishment;
        uint256 createdAt;
        uint256 judgedAt;
        uint256 executedAt;
        uint256 appealDeadline;
        bool appealFiled;
        uint256 appealStake;
    }
    
    struct Appeal {
        uint256 caseId;
        address appellant;
        string grounds;
        uint256 stake;
        uint256 filedAt;
        bool resolved;
        bool successful;
    }
    
    // ============ State Variables ============
    address public owner;
    uint256 public caseCounter;
    uint256 public appealCounter;
    uint256 public lastCaseTime;
    
    uint256 public constant JURY_SIZE = 5;
    uint256 public constant APPEAL_STAKE = 10 ether; // 10 MON
    uint256 public constant JURY_VOTING_PERIOD = 1 hours;
    uint256 public constant APPEAL_PERIOD = 3 days;
    uint256 public constant CASE_COOLDOWN = 24 hours; // 1 case per day
    
    mapping(address => Agent) public agents;
    mapping(uint256 => Case) public cases;
    mapping(uint256 => Appeal) public appeals;
    mapping(address => uint256[]) public agentCases;
    
    address[] public registeredAgents;
    address[] public juryPool;
    
    // ============ Events ============
    event AgentRegistered(address indexed agent, AgentLevel level);
    event CaseReported(uint256 indexed caseId, address indexed defendant, address indexed reporter);
    event CaseJudged(uint256 indexed caseId, VerdictType verdict, uint8 confidence);
    event JuryVoted(uint256 indexed caseId, address indexed juror, VoteType vote);
    event CaseExecuted(uint256 indexed caseId, PunishmentType punishment);
    event AppealFiled(uint256 indexed appealId, uint256 indexed caseId, address appellant);
    event AppealResolved(uint256 indexed appealId, bool successful);
    event PunishmentApplied(address indexed agent, PunishmentType punishment, uint256 caseId);
    
    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyLevel(AgentLevel _level) {
        require(agents[msg.sender].level == _level, "Wrong level");
        require(agents[msg.sender].isActive, "Agent not active");
        _;
    }
    
    modifier onlyMinLevel(AgentLevel _level) {
        require(uint256(agents[msg.sender].level) >= uint256(_level), "Level too low");
        require(agents[msg.sender].isActive, "Agent not active");
        _;
    }
    
    // ============ Constructor ============
    constructor() {
        owner = msg.sender;
        caseCounter = 0;
        appealCounter = 0;
    }
    
    // ============ Agent Management ============
    function registerAgent(address _agent, AgentLevel _level) external onlyOwner {
        require(agents[_agent].agentAddress == address(0), "Agent exists");
        
        agents[_agent] = Agent({
            agentAddress: _agent,
            level: _level,
            reputation: 100,
            casesParticipated: 0,
            isActive: true
        });
        
        registeredAgents.push(_agent);
        
        if (_level == AgentLevel.Juror) {
            juryPool.push(_agent);
        }
        
        emit AgentRegistered(_agent, _level);
    }
    
    function deactivateAgent(address _agent) external onlyOwner {
        agents[_agent].isActive = false;
    }
    
    function activateAgent(address _agent) external onlyOwner {
        agents[_agent].isActive = true;
    }
    
    // ============ Case Lifecycle ============
    function reportCase(
        address _defendant,
        string calldata _evidenceHash,
        string calldata _evidenceDescription
    ) external onlyLevel(AgentLevel.Reporter) returns (uint256) {
        require(agents[_defendant].agentAddress != address(0), "Defendant not registered");
        require(_defendant != msg.sender, "Cannot report yourself");
        require(block.timestamp >= lastCaseTime + CASE_COOLDOWN, "Only 1 case per 24 hours allowed");
        
        caseCounter++;
        uint256 caseId = caseCounter;
        lastCaseTime = block.timestamp;
        
        Case storage newCase = cases[caseId];
        newCase.id = caseId;
        newCase.defendant = _defendant;
        newCase.reporter = msg.sender;
        newCase.evidenceHash = _evidenceHash;
        newCase.evidenceDescription = _evidenceDescription;
        newCase.status = CaseStatus.Open;
        newCase.createdAt = block.timestamp;
        
        agentCases[_defendant].push(caseId);
        agents[msg.sender].casesParticipated++;
        
        emit CaseReported(caseId, _defendant, msg.sender);
        
        return caseId;
    }
    
    function submitJudgment(
        uint256 _caseId,
        VerdictType _verdict,
        string calldata _reasoning,
        uint8 _confidence
    ) external onlyLevel(AgentLevel.Judge) {
        Case storage courtCase = cases[_caseId];
        require(courtCase.status == CaseStatus.Open, "Case not open");
        require(_confidence <= 100, "Confidence must be 0-100");
        
        courtCase.judge = msg.sender;
        courtCase.judgment = Judgment({
            verdict: _verdict,
            reasoning: _reasoning,
            confidence: _confidence,
            timestamp: block.timestamp
        });
        courtCase.status = CaseStatus.Judged;
        courtCase.judgedAt = block.timestamp;
        agents[msg.sender].casesParticipated++;
        
        emit CaseJudged(_caseId, _verdict, _confidence);
        
        // Auto-escalate high-stakes cases
        if (_verdict == VerdictType.Malicious && _confidence > 90) {
            courtCase.status = CaseStatus.Escalated;
        } else {
            // Start jury selection
            _selectJury(_caseId);
            courtCase.status = CaseStatus.JuryVoting;
        }
    }
    
    function _selectJury(uint256 _caseId) internal {
        Case storage courtCase = cases[_caseId];
        require(juryPool.length >= JURY_SIZE, "Not enough jurors");
        
        // Simple selection: take first JURY_SIZE available
        // In production, use random selection
        for (uint i = 0; i < JURY_SIZE; i++) {
            courtCase.juryMembers.push(juryPool[i]);
        }
    }
    
    function submitJuryVote(
        uint256 _caseId,
        VoteType _vote,
        string calldata _reasoning
    ) external onlyLevel(AgentLevel.Juror) {
        Case storage courtCase = cases[_caseId];
        require(courtCase.status == CaseStatus.JuryVoting, "Not in jury phase");
        require(courtCase.juryVotes[msg.sender].vote == VoteType.NotVoted, "Already voted");
        require(_isJuryMember(_caseId, msg.sender), "Not a jury member");
        
        courtCase.juryVotes[msg.sender] = Vote({
            vote: _vote,
            timestamp: block.timestamp,
            reasoning: _reasoning
        });
        
        agents[msg.sender].casesParticipated++;
        
        emit JuryVoted(_caseId, msg.sender, _vote);
        
        // Check if all jury voted
        if (_allJuryVoted(_caseId)) {
            _tallyVotes(_caseId);
        }
    }
    
    function _isJuryMember(uint256 _caseId, address _juror) internal view returns (bool) {
        Case storage courtCase = cases[_caseId];
        for (uint i = 0; i < courtCase.juryMembers.length; i++) {
            if (courtCase.juryMembers[i] == _juror) return true;
        }
        return false;
    }
    
    function _allJuryVoted(uint256 _caseId) internal view returns (bool) {
        Case storage courtCase = cases[_caseId];
        for (uint i = 0; i < courtCase.juryMembers.length; i++) {
            if (courtCase.juryVotes[courtCase.juryMembers[i]].vote == VoteType.NotVoted) {
                return false;
            }
        }
        return true;
    }
    
    function _tallyVotes(uint256 _caseId) internal {
        Case storage courtCase = cases[_caseId];
        
        uint256 guiltyVotes = 0;
        uint256 notGuiltyVotes = 0;
        uint256 escalateVotes = 0;
        
        for (uint i = 0; i < courtCase.juryMembers.length; i++) {
            VoteType vote = courtCase.juryVotes[courtCase.juryMembers[i]].vote;
            if (vote == VoteType.Guilty) guiltyVotes++;
            else if (vote == VoteType.NotGuilty) notGuiltyVotes++;
            else if (vote == VoteType.Escalate) escalateVotes++;
        }
        
        // Determine outcome
        if (escalateVotes >= 3) {
            courtCase.status = CaseStatus.Escalated;
        } else if (guiltyVotes > notGuiltyVotes) {
            courtCase.status = CaseStatus.Executed;
            _applyPunishment(_caseId);
        } else {
            courtCase.status = CaseStatus.Resolved;
            courtCase.punishment = PunishmentType.None;
        }
    }
    
    function _applyPunishment(uint256 _caseId) internal {
        Case storage courtCase = cases[_caseId];
        VerdictType verdict = courtCase.judgment.verdict;
        uint8 confidence = courtCase.judgment.confidence;
        
        PunishmentType punishment;
        
        if (verdict == VerdictType.Spam) {
            punishment = confidence > 80 ? PunishmentType.TempBan : PunishmentType.Warning;
        } else if (verdict == VerdictType.Abuse) {
            punishment = confidence > 80 ? PunishmentType.Isolation : PunishmentType.RateLimit;
        } else if (verdict == VerdictType.Malicious) {
            punishment = PunishmentType.RepReduction;
        } else {
            punishment = PunishmentType.None;
        }
        
        courtCase.punishment = punishment;
        courtCase.executedAt = block.timestamp;
        courtCase.appealDeadline = block.timestamp + APPEAL_PERIOD;
        
        // Apply reputation reduction
        if (punishment == PunishmentType.RepReduction) {
            agents[courtCase.defendant].reputation = 
                agents[courtCase.defendant].reputation > 20 ? 
                agents[courtCase.defendant].reputation - 20 : 0;
        }
        
        emit CaseExecuted(_caseId, punishment);
        emit PunishmentApplied(courtCase.defendant, punishment, _caseId);
    }
    
    // ============ Appeals ============
    function fileAppeal(
        uint256 _caseId,
        string calldata _grounds
    ) external payable {
        Case storage courtCase = cases[_caseId];
        require(courtCase.status == CaseStatus.Executed, "Case not executed");
        require(!courtCase.appealFiled, "Already appealed");
        require(block.timestamp <= courtCase.appealDeadline, "Appeal period expired");
        require(msg.sender == courtCase.defendant, "Only defendant can appeal");
        require(msg.value >= APPEAL_STAKE, "Insufficient stake");
        
        appealCounter++;
        uint256 appealId = appealCounter;
        
        appeals[appealId] = Appeal({
            caseId: _caseId,
            appellant: msg.sender,
            grounds: _grounds,
            stake: msg.value,
            filedAt: block.timestamp,
            resolved: false,
            successful: false
        });
        
        courtCase.appealFiled = true;
        courtCase.appealStake = msg.value;
        courtCase.status = CaseStatus.Appealed;
        
        emit AppealFiled(appealId, _caseId, msg.sender);
    }
    
    function resolveAppeal(
        uint256 _appealId,
        bool _successful
    ) external onlyLevel(AgentLevel.Appeal) {
        Appeal storage appeal = appeals[_appealId];
        require(!appeal.resolved, "Already resolved");
        
        appeal.resolved = true;
        appeal.successful = _successful;
        
        Case storage courtCase = cases[appeal.caseId];
        
        if (_successful) {
            // Refund stake
            payable(appeal.appellant).transfer(appeal.stake);
            courtCase.status = CaseStatus.Resolved;
            courtCase.punishment = PunishmentType.None;
            
            // Restore reputation
            agents[courtCase.defendant].reputation += 20;
        } else {
            // Stake goes to reporter as reward
            payable(courtCase.reporter).transfer(appeal.stake / 2);
            // Half to contract treasury
            // (kept in contract)
        }
        
        emit AppealResolved(_appealId, _successful);
    }
    
    // ============ View Functions ============
    function getCase(uint256 _caseId) external view returns (
        uint256 id,
        address defendant,
        address reporter,
        address judge,
        string memory evidenceHash,
        VerdictType verdict,
        string memory reasoning,
        uint8 confidence,
        CaseStatus status,
        PunishmentType punishment
    ) {
        Case storage c = cases[_caseId];
        return (
            c.id,
            c.defendant,
            c.reporter,
            c.judge,
            c.evidenceHash,
            c.judgment.verdict,
            c.judgment.reasoning,
            c.judgment.confidence,
            c.status,
            c.punishment
        );
    }
    
    function getJuryVotes(uint256 _caseId) external view returns (
        address[] memory jurors,
        VoteType[] memory votes
    ) {
        Case storage c = cases[_caseId];
        jurors = c.juryMembers;
        votes = new VoteType[](jurors.length);
        
        for (uint i = 0; i < jurors.length; i++) {
            votes[i] = c.juryVotes[jurors[i]].vote;
        }
        
        return (jurors, votes);
    }
    
    function getAgentCases(address _agent) external view returns (uint256[] memory) {
        return agentCases[_agent];
    }
    
    function getAgentLevel(address _agent) external view returns (AgentLevel) {
        return agents[_agent].level;
    }
    
    receive() external payable {}
}