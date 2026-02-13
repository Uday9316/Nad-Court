module.exports = {
  apps: [{
    name: 'agent-court-backend',
    script: 'simple_openclaw_server.py',
    interpreter: 'python3',
    cwd: '/home/ubuntu/.openclaw/workspace/AGENT_COURT_COMPLETE',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: '/home/ubuntu/.openclaw/workspace/AGENT_COURT_COMPLETE/server.log',
    out_file: '/home/ubuntu/.openclaw/workspace/AGENT_COURT_COMPLETE/server.out.log',
    error_file: '/home/ubuntu/.openclaw/workspace/AGENT_COURT_COMPLETE/server.err.log',
    time: true
  }]
};
