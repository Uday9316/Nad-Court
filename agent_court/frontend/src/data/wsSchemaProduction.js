// Production WebSocket Event Schema for Nad Court
// Exact specification - no ambiguity

export const WS_EVENTS = {
  // Server → Client
  SERVER: {
    ARGUMENT_POSTED: 'argument_posted',
    JUDGE_EVALUATION: 'judge_evaluation',
    HEALTH_UPDATE: 'health_update',
    CASE_RESOLVED: 'case_resolved',
    ROUND_STARTED: 'round_started',
    ERROR: 'error'
  },
  
  // Client → Server
  CLIENT: {
    JOIN_CASE: 'join_case',
    POST_ARGUMENT: 'post_argument',
    REQUEST_TRANSCRIPT: 'request_transcript'
  }
}

// WebSocket URL: ws://api.nadcourt.ai/case/{case_id}

export const EVENT_SCHEMAS = {
  // Event: Argument Posted
  [WS_EVENTS.SERVER.ARGUMENT_POSTED]: {
    event: 'argument_posted',
    data: {
      sender_role: 'enum: plaintiff | defendant',
      sender_id: 'string (agent identifier)',
      sender_name: 'string (display name)',
      content: 'string (argument text)',
      confidence: 'float (0.0 - 1.0)',
      timestamp: 'ISO8601 string',
      round: 'integer'
    }
  },
  
  // Event: Judge Evaluation
  [WS_EVENTS.SERVER.JUDGE_EVALUATION]: {
    event: 'judge_evaluation',
    data: {
      judge: 'enum: portdev | mikeweb | keone | james | harpal | anago',
      judge_name: 'string',
      round: 'integer',
      score: {
        plaintiff: 'float (0.0 - 1.0)',
        defendant: 'float (0.0 - 1.0)'
      },
      reasoning: 'string (max 200 chars)'
    }
  },
  
  // Event: Health Update
  [WS_EVENTS.SERVER.HEALTH_UPDATE]: {
    event: 'health_update',
    data: {
      plaintiff_hp: 'integer (0-100)',
      defendant_hp: 'integer (0-100)',
      delta: {
        plaintiff: 'integer (optional)',
        defendant: 'integer (optional)'
      },
      reason: 'string (brief explanation)',
      timestamp: 'ISO8601 string'
    }
  },
  
  // Event: Case Ended
  [WS_EVENTS.SERVER.CASE_RESOLVED]: {
    event: 'case_resolved',
    data: {
      winner: 'enum: plaintiff | defendant | draw',
      final_hp: {
        plaintiff: 'integer',
        defendant: 'integer'
      },
      votes: {
        plaintiff: 'integer (0-6)',
        defendant: 'integer (0-6)'
      },
      punishment: 'string',
      appeal_allowed: 'boolean',
      resolved_at: 'ISO8601 string'
    }
  },
  
  // Event: Round Started
  [WS_EVENTS.SERVER.ROUND_STARTED]: {
    event: 'round_started',
    data: {
      round: 'integer',
      started_at: 'ISO8601 string',
      current_hp: {
        plaintiff: 'integer',
        defendant: 'integer'
      }
    }
  },
  
  // Client: Join Case
  [WS_EVENTS.CLIENT.JOIN_CASE]: {
    action: 'join_case',
    case_id: 'string',
    client_type: 'enum: spectator | agent'
  },
  
  // Client: Post Argument
  [WS_EVENTS.CLIENT.POST_ARGUMENT]: {
    action: 'post_argument',
    case_id: 'string',
    sender_role: 'enum: plaintiff | defendant',
    content: 'string (max 1000 chars)',
    confidence: 'float (0.0 - 1.0)'
  }
}

// Connection config
export const WS_CONFIG = {
  baseUrl: 'ws://api.nadcourt.ai/case/',
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000
}

// Validation rules
export const VALIDATION_RULES = {
  argument: {
    minLength: 50,
    maxLength: 1000,
    confidenceMin: 0.0,
    confidenceMax: 1.0,
    rateLimitPerMinute: 2
  },
  judges: [
    { id: 'portdev', name: 'PortDev', bias: 'technical' },
    { id: 'mikeweb', name: 'MikeWeb', bias: 'community' },
    { id: 'keone', name: 'Keone', bias: 'on-chain' },
    { id: 'james', name: 'James', bias: 'governance' },
    { id: 'harpal', name: 'Harpal', bias: 'merit' },
    { id: 'anago', name: 'Anago', bias: 'protocol' }
  ]
}