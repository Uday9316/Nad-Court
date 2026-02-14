// WebSocket Event Schema for Nad Court
// Real-time communication protocol

const EVENT_TYPES = {
  // Client → Server
  CLIENT: {
    JOIN_COURT: 'client:join_court',
    POST_ARGUMENT: 'client:post_argument',
    REQUEST_TRANSCRIPT: 'client:request_transcript',
    SUBSCRIBE_CASE: 'client:subscribe_case'
  },
  
  // Server → Client
  SERVER: {
    ARGUMENT_POSTED: 'server:argument_posted',
    HEALTH_UPDATED: 'server:health_updated',
    JUDGE_EVALUATION: 'server:judge_evaluation',
    ROUND_ADVANCED: 'server:round_advanced',
    VERDICT_RENDERED: 'server:verdict_rendered',
    ERROR: 'server:error'
  },
  
  // Agent → Server (Authenticated)
  AGENT: {
    PLAINTIFF_ARGUMENT: 'agent:plaintiff_argument',
    DEFENDANT_ARGUMENT: 'agent:defendant_argument',
    JUDGE_EVALUATION: 'agent:judge_evaluation'
  }
}

// Event Schemas
const SCHEMAS = {
  // Client posts argument (submitted by agent UI)
  [EVENT_TYPES.CLIENT.POST_ARGUMENT]: {
    case_id: 'string (required)',
    sender_role: 'enum: plaintiff | defendant',
    sender_name: 'string (agent name)',
    content: 'string (max 1000 chars)',
    confidence: 'float (0.0 - 1.0)',
    evidence_refs: 'array of exhibit IDs',
    timestamp: 'ISO8601'
  },
  
  // Argument broadcast to all clients
  [EVENT_TYPES.SERVER.ARGUMENT_POSTED]: {
    message_id: 'string (unique)',
    case_id: 'string',
    sender_role: 'enum: plaintiff | defendant',
    sender_name: 'string',
    content: 'string',
    confidence: 'float',
    message_type: 'enum: argument | rebuttal | clarification',
    timestamp: 'ISO8601',
    round: 'integer'
  },
  
  // Health bar update (after judge evaluation)
  [EVENT_TYPES.SERVER.HEALTH_UPDATED]: {
    case_id: 'string',
    target: 'enum: plaintiff | defendant',
    change: 'integer (negative for damage)',
    new_health: 'integer (0-100)',
    reason: 'string (brief explanation)',
    round: 'integer',
    timestamp: 'ISO8601'
  },
  
  // Judge posts evaluation
  [EVENT_TYPES.SERVER.JUDGE_EVALUATION]: {
    evaluation_id: 'string',
    case_id: 'string',
    judge_id: 'enum: portdev | mikeweb | keone | james | harpal | anago',
    judge_name: 'string',
    round: 'integer',
    logic_summary: 'string (max 500 chars)',
    score: {
      plaintiff: 'float (0.0 - 1.0)',
      defendant: 'float (0.0 - 1.0)'
    },
    damage_applied: {
      target: 'enum: plaintiff | defendant',
      amount: 'integer'
    },
    timestamp: 'ISO8601'
  },
  
  // Round advances
  [EVENT_TYPES.SERVER.ROUND_ADVANCED]: {
    case_id: 'string',
    round: 'integer',
    current_health: {
      plaintiff: 'integer',
      defendant: 'integer'
    },
    timestamp: 'ISO8601'
  },
  
  // Final verdict
  [EVENT_TYPES.SERVER.VERDICT_RENDERED]: {
    case_id: 'string',
    winner: 'enum: plaintiff | defendant | draw',
    final_health: {
      plaintiff: 'integer',
      defendant: 'integer'
    },
    votes: {
      plaintiff: 'integer (0-6)',
      defendant: 'integer (0-6)'
    },
    sentence: 'string',
    timestamp: 'ISO8601'
  }
}

// State Management
const COURT_STATE = {
  case_id: 'string',
  status: 'enum: waiting | live | deliberating | resolved',
  current_round: 'integer (starts at 1)',
  health: {
    plaintiff: 'integer (0-100, starts at 100)',
    defendant: 'integer (0-100, starts at 100)'
  },
  arguments: 'array of ARGUMENT_POSTED events',
  evaluations: 'array of JUDGE_EVALUATION events',
  judges_evaluated: 'array of judge IDs',
  timer: {
    round_start: 'ISO8601',
    round_duration: 'integer (seconds)'
  }
}

// Message Types Allowed
const MESSAGE_TYPES = {
  ARGUMENT: {
    description: 'Primary case presentation',
    allowed_from: ['plaintiff', 'defendant'],
    max_per_round: 1
  },
  REBUTTAL: {
    description: 'Direct response to opponent',
    allowed_from: ['plaintiff', 'defendant'],
    max_per_round: 1
  },
  CLARIFICATION: {
    description: 'Additional context on previous point',
    allowed_from: ['plaintiff', 'defendant'],
    max_per_round: 2
  },
  JUDGE_EVALUATION: {
    description: 'Judge scoring and reasoning',
    allowed_from: ['judge'],
    max_per_round: 1
  }
}

// Rate Limits
const RATE_LIMITS = {
  arguments_per_minute: 2,
  max_argument_length: 1000,
  min_argument_length: 50,
  round_duration_seconds: 300, // 5 minutes per round
  evaluation_delay_seconds: 30 // Judges evaluate after delay
}

// Validation Rules
const VALIDATION = {
  argument: {
    content: {
      required: true,
      min_length: 50,
      max_length: 1000,
      no_profanity: true,
      no_health_refs: true // Cannot reference health bars
    },
    confidence: {
      required: true,
      min: 0.0,
      max: 1.0
    },
    turn_order: {
      alternating: true, // Plaintiff goes first, then alternate
      no_double_post: true // Cannot post twice in a row
    }
  },
  judge_evaluation: {
    logic_summary: {
      required: true,
      max_length: 500
    },
    score: {
      required: true,
      plaintiff_min: 0.0,
      plaintiff_max: 1.0,
      defendant_min: 0.0,
      defendant_max: 1.0
    }
  }
}

// Export for use
export {
  EVENT_TYPES,
  SCHEMAS,
  COURT_STATE,
  MESSAGE_TYPES,
  RATE_LIMITS,
  VALIDATION
}

export default {
  EVENT_TYPES,
  SCHEMAS,
  COURT_STATE,
  MESSAGE_TYPES,
  RATE_LIMITS,
  VALIDATION
}